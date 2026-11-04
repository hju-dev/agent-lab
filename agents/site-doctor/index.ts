// Site Doctor's entry point: check the settings, connect the real database and Upstash, run once, ping the heartbeat.
// Run locally: node --env-file=.env agents/site-doctor/index.ts
// Actions logs are public, so this prints the run id and counts only (S3).
import { neon } from '@neondatabase/serverless'
import { z } from 'zod'
import { QUOTA_MESSAGE, fetchWithTimeout, isQuotaError } from '../../lib/reliability.ts'
import { runSiteDoctor } from './run.ts'
import type { Site } from './uptime.ts'

// S13: every setting is checked before anything runs, with a plain-English message.
const env = z
  .object({
    DATABASE_URL_AGENT: z.url({ message: 'DATABASE_URL_AGENT must be the lab_agent connection string' }),
    DATABASE_URL_PUBLIC: z.url({ message: 'DATABASE_URL_PUBLIC must be the lab_public connection string' }),
    UPSTASH_REDIS_REST_URL: z.url({ message: 'UPSTASH_REDIS_REST_URL must be the Upstash REST URL' }),
    UPSTASH_REDIS_REST_TOKEN: z.string({ error: 'UPSTASH_REDIS_REST_TOKEN is missing' }).min(1, 'UPSTASH_REDIS_REST_TOKEN is missing'),
    HEALTHCHECK_URL: z.url().optional(),
    GITHUB_RUN_ID: z.string().optional(),
    GITHUB_RUN_ATTEMPT: z.string().optional(),
  })
  .safeParse(process.env)
if (!env.success) {
  console.error(`Site Doctor can't start. Fix these environment variables:\n${env.error.issues.map((i) => `- ${i.message}`).join('\n')}`)
  process.exit(1)
}
const config = env.data

// GitHub's run id plus attempt, so each attempt is its own run row and a repeated save adds nothing (S10).
const runId = config.GITHUB_RUN_ID ? `gh-${config.GITHUB_RUN_ID}-${config.GITHUB_RUN_ATTEMPT ?? '1'}` : `local-${Date.now()}`

const agentDb = neon(config.DATABASE_URL_AGENT)
const publicDb = neon(config.DATABASE_URL_PUBLIC)

runSiteDoctor({
  runId,
  now: () => new Date(),
  loadSites: async () =>
    (await agentDb`select id, url, has_database, check_url from lab.sites where active order by id`) as Site[],
  save: async (run, checks) => {
    await agentDb.transaction([
      agentDb`
        insert into lab.runs (id, agent_id, status, started_at, finished_at, public_summary, metrics)
        values (${run.id}, 'site-doctor', 'succeeded', ${run.started_at}, ${run.finished_at}, ${run.public_summary}, ${JSON.stringify(run.metrics)})
        on conflict do nothing`,
      agentDb`
        insert into lab.site_checks (site_id, checked_at, is_up, response_ms)
        select site_id, checked_at, is_up, response_ms
        from jsonb_to_recordset(${JSON.stringify(checks)}::jsonb)
          as c(site_id text, checked_at timestamptz, is_up boolean, response_ms integer)
        on conflict do nothing`,
      agentDb`
        insert into lab.events (id, agent_id, run_id, kind, public_text)
        values (${`${run.id}:1`}, 'site-doctor', ${run.id}, 'uptime', ${run.public_summary})
        on conflict do nothing`,
    ])
  },
  loadPublicState: async () => (await publicDb`select * from lab.public_state order by agent_id`) as Record<string, unknown>[],
  publishSnapshot: async (json) => {
    const res = await fetchWithTimeout(config.UPSTASH_REDIS_REST_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.UPSTASH_REDIS_REST_TOKEN}` },
      body: JSON.stringify(['SET', 'lab:snapshot', json]),
    })
    if (!res.ok) throw new Error(`Upstash returned ${res.status}`)
  },
  log: console.log,
})
  .then(async () => {
    // S16: the heartbeat tells Healthchecks the run happened. If pings stop, it emails Henry.
    if (!config.HEALTHCHECK_URL) return console.log('HEALTHCHECK_URL not set, so no heartbeat (fine for a local run)')
    await fetchWithTimeout(config.HEALTHCHECK_URL).catch(() => console.log('Heartbeat ping failed'))
  })
  .catch((err: Error) => {
    // S44: Neon refuses every query once the month's compute runs out. Say so once, plainly; never retried.
    // Other errors print their type and Postgres code only: a database message can quote row values,
    // such as a site id, and Actions logs are public (S3). Run locally to see the full message.
    const code = (err as { code?: string }).code
    console.error(isQuotaError(err) ? `Run ${runId}: ${QUOTA_MESSAGE}` : `Run ${runId} failed: ${err.name}${code ? ` (code ${code})` : ''}`)
    if (!process.env.CI) console.error(err.message)
    process.exitCode = 1
  })
