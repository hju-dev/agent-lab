// What Site Doctor's two entry points share: the settings check, the real database and Upstash,
// and how a run ends. Actions logs are public, so nothing here prints a site name or a URL (S3).
import { type PublicState, TICKER_LENGTH } from '../../lib/snapshot.ts'
import { neon } from '@neondatabase/serverless'
import { z } from 'zod'
import { QUOTA_MESSAGE, fetchWithTimeout, isQuotaError } from '../../lib/reliability.ts'
import type { Finding } from './findings.ts'

const baseEnv = {
  DATABASE_URL_AGENT: z.url({ message: 'DATABASE_URL_AGENT must be the lab_agent connection string' }),
  DATABASE_URL_PUBLIC: z.url({ message: 'DATABASE_URL_PUBLIC must be the lab_public connection string' }),
  UPSTASH_REDIS_REST_URL: z.url({ message: 'UPSTASH_REDIS_REST_URL must be the Upstash REST URL' }),
  UPSTASH_REDIS_REST_TOKEN: z.string({ error: 'UPSTASH_REDIS_REST_TOKEN is missing' }).min(1, 'UPSTASH_REDIS_REST_TOKEN is missing'),
  HEALTHCHECK_URL: z.url().optional(),
  GITHUB_RUN_ID: z.string().optional(),
  GITHUB_RUN_ATTEMPT: z.string().optional(),
}

// S13: every setting is checked before anything runs, with a plain-English message.
export function loadConfig<T extends z.ZodRawShape>(extra: T) {
  const parsed = z.object({ ...baseEnv, ...extra }).safeParse(process.env)
  if (!parsed.success) {
    console.error(`Site Doctor can't start. Fix these environment variables:\n${parsed.error.issues.map((i) => `- ${i.message}`).join('\n')}`)
    process.exit(1)
  }
  return parsed.data
}

const baseSchema = z.object(baseEnv)
type BaseConfig = z.infer<typeof baseSchema>

export function connect(config: BaseConfig) {
  // GitHub's run id plus attempt, so each attempt is its own run row and a repeated save adds nothing (S10).
  const runId = config.GITHUB_RUN_ID ? `gh-${config.GITHUB_RUN_ID}-${config.GITHUB_RUN_ATTEMPT ?? '1'}` : `local-${Date.now()}`
  const agentDb = neon(config.DATABASE_URL_AGENT)
  const publicDb = neon(config.DATABASE_URL_PUBLIC)

  // Inserts name no conflict columns on purpose: naming them needs read access lab_agent may not have (S10).
  const runInsert = (run: { id: string; started_at: string; finished_at: string; public_summary: string; metrics: Record<string, number> }) => agentDb`
    insert into lab.runs (id, agent_id, status, started_at, finished_at, public_summary, metrics)
    values (${run.id}, 'site-doctor', 'succeeded', ${run.started_at}, ${run.finished_at}, ${run.public_summary}, ${JSON.stringify(run.metrics)})
    on conflict do nothing`

  // Findings name a site, so they're private: public_text stays null and the details go in private_payload.
  const findingInserts = (runId: string, findings: Finding[]) =>
    findings.map(
      (f) => agentDb`
        insert into lab.events (id, agent_id, run_id, kind, public_text, private_payload)
        values (${`${runId}:finding:${f.rule}:${f.site_id}`}, 'site-doctor', ${runId}, 'finding', null, ${JSON.stringify(f)})
        on conflict do nothing`,
    )

  return {
    runId,
    agentDb,
    runInsert,
    findingInserts,
    // Read as lab_public, from the public views only (S1, ADR-0011). Each query wakes nothing new:
    // the database is already awake from this run's save.
    loadPublicState: async (): Promise<PublicState> => {
      const [agents, sites, stats, events] = await Promise.all([
        publicDb`select * from lab.public_state order by agent_id`,
        publicDb`select * from lab.public_sites order by name`,
        publicDb`select * from lab.public_stats`,
        publicDb`select * from lab.public_events limit ${TICKER_LENGTH}`,
      ])
      return { agents, sites, stats: stats[0] ?? null, events } as PublicState
    },
    publishSnapshot: async (json: string) => {
      const res = await fetchWithTimeout(config.UPSTASH_REDIS_REST_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.UPSTASH_REDIS_REST_TOKEN}` },
        body: JSON.stringify(['SET', 'lab:snapshot', json]),
      })
      if (!res.ok) throw new Error(`Upstash returned ${res.status}`)
    },
  }
}

// After a run: ping the heartbeat on success (S16); on failure, say so plainly without leaking data.
export function finish(run: Promise<unknown>, runId: string, healthcheckUrl: string | undefined) {
  return run
    .then(async () => {
      if (!healthcheckUrl) return console.log('HEALTHCHECK_URL not set, so no heartbeat (fine for a local run)')
      await fetchWithTimeout(healthcheckUrl).catch(() => console.log('Heartbeat ping failed'))
    })
    .catch((err: Error) => {
      // S44: once Neon's monthly compute runs out it refuses every query. Say so once, plainly; never retried.
      // Other errors print their type and Postgres code only: a database message can quote a site id (S3).
      const code = (err as { code?: string }).code
      console.error(isQuotaError(err) ? `Run ${runId}: ${QUOTA_MESSAGE}` : `Run ${runId} failed: ${err.name}${code ? ` (code ${code})` : ''}`)
      if (!process.env.CI) console.error(err.message)
      process.exitCode = 1
    })
}
