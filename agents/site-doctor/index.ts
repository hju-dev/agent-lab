// Site Doctor's hourly uptime check (PRD F1). Run locally: node --env-file=.env agents/site-doctor/index.ts
// Actions logs are public, so this prints the run id and counts only (S3).
import { runSiteDoctor } from './run.ts'
import { connect, finish, loadConfig } from './services.ts'
import type { Site } from './uptime.ts'

const config = loadConfig({})
const { runId, agentDb, runInsert, findingInserts, loadPublicState, publishSnapshot } = connect(config)

const run = runSiteDoctor({
  runId,
  now: () => new Date(),
  loadSites: async () => (await agentDb`select id, name, url, has_database, check_url from lab.sites where active order by id`) as Site[],
  loadLastStatus: async () => {
    const rows = (await agentDb`
      select distinct on (site_id) site_id, is_up from lab.site_checks order by site_id, checked_at desc`) as { site_id: string; is_up: boolean }[]
    return Object.fromEntries(rows.map((r) => [r.site_id, r.is_up]))
  },
  // One transaction, so a run wakes Neon once (SP4) and a repeated save adds nothing (S10).
  save: async (record, checks, findings) => {
    await agentDb.transaction([
      runInsert(record),
      agentDb`
        insert into lab.site_checks (site_id, checked_at, is_up, response_ms)
        select site_id, checked_at, is_up, response_ms
        from jsonb_to_recordset(${JSON.stringify(checks)}::jsonb)
          as c(site_id text, checked_at timestamptz, is_up boolean, response_ms integer)
        on conflict do nothing`,
      agentDb`
        insert into lab.events (id, agent_id, run_id, kind, public_text)
        values (${`${record.id}:1`}, 'site-doctor', ${record.id}, 'uptime', ${record.public_summary})
        on conflict do nothing`,
      ...findingInserts(record.id, findings),
    ])
  },
  loadPublicState,
  publishSnapshot,
  log: console.log,
})

finish(run, runId, config.HEALTHCHECK_URL)
