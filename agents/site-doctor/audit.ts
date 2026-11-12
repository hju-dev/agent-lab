// Site Doctor's daily audit (PRD F1): SSL days left, PageSpeed scores and broken homepage links.
// Run locally: node --env-file=.env agents/site-doctor/audit.ts. Prints the run id and counts only (S3).
import { z } from 'zod'
import { fetchWithTimeout } from '../../lib/reliability.ts'
import { certificateValidTo, pageSpeed } from './audit-checks.ts'
import { type AuditSite, runAudit } from './audit-run.ts'
import { connect, finish, loadConfig } from './services.ts'

const config = loadConfig({
  PAGESPEED_API_KEY: z.string({ error: 'PAGESPEED_API_KEY is missing' }).min(1, 'PAGESPEED_API_KEY is missing'),
})
const { runId, agentDb, runInsert, findingInserts, loadPublicState, publishSnapshot } = connect(config)

const run = runAudit({
  runId,
  now: () => new Date(),
  loadSites: async () =>
    (await agentDb`select id, name, url, has_database, check_url, perf_range from lab.sites where active order by id`) as AuditSite[],
  loadPerfHistory: async () => {
    // Each site's last 5 daily performance scores, oldest first. Only audit rows have a score.
    const rows = (await agentDb`
      select site_id, array_agg(perf_score order by checked_at) as scores
      from (
        select site_id, perf_score, checked_at,
               row_number() over (partition by site_id order by checked_at desc) as n
        from lab.site_checks where perf_score is not null
      ) recent
      where n <= 5
      group by site_id`) as { site_id: string; scores: number[] }[]
    return Object.fromEntries(rows.map((r) => [r.site_id, r.scores]))
  },
  fetchHome: async (url) => {
    const res = await fetchWithTimeout(url, { redirect: 'follow' })
    return { ok: res.ok, html: res.ok ? (await res.text()).slice(0, 500_000) : '' }
  },
  certificateValidTo,
  pageSpeed: (url) => pageSpeed(url, config.PAGESPEED_API_KEY),
  save: async (record, rows, findings) => {
    await agentDb.transaction([
      runInsert(record),
      agentDb`
        insert into lab.site_checks (site_id, checked_at, is_up, perf_score, a11y_score, seo_score, ssl_days_left, broken_links)
        select site_id, checked_at, is_up, perf_score, a11y_score, seo_score, ssl_days_left,
               array(select jsonb_array_elements_text(broken_links))
        from jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
          as c(site_id text, checked_at timestamptz, is_up boolean, perf_score smallint, a11y_score smallint,
               seo_score smallint, ssl_days_left integer, broken_links jsonb)
        on conflict do nothing`,
      agentDb`
        insert into lab.events (id, agent_id, run_id, kind, public_text)
        values (${`${record.id}:1`}, 'site-doctor', ${record.id}, 'audit', ${record.public_summary})
        on conflict do nothing`,
      ...findingInserts(record.id, findings),
    ])
  },
  loadPublicState,
  publishSnapshot,
  log: console.log,
})

finish(run, runId, config.HEALTHCHECK_URL)
