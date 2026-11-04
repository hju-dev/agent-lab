// Site Doctor, walking-skeleton version: check one URL, record the run, publish the public snapshot, ping the heartbeat.
// Run locally: node --env-file=.env agents/site-doctor/index.ts
// Actions logs are public, so this prints the run id and counts only.
import { neon } from '@neondatabase/serverless'
import { z } from 'zod'
import { buildSnapshot } from '../../lib/snapshot.ts'

const CHECK_URL = 'https://hju-dev.vercel.app'
const TIMEOUT_MS = 10_000

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

// GitHub's run id plus attempt, so a retried run is recognised as the same run (S10).
const runId = config.GITHUB_RUN_ID ? `gh-${config.GITHUB_RUN_ID}-${config.GITHUB_RUN_ATTEMPT ?? '1'}` : `local-${Date.now()}`

async function main() {
  const startedAt = new Date()
  let up = false
  try {
    const res = await fetch(CHECK_URL, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) })
    up = res.ok
  } catch {
    up = false
  }
  const finishedAt = new Date()

  const agentDb = neon(config.DATABASE_URL_AGENT)
  await agentDb`
    insert into lab.runs (id, agent_id, status, started_at, finished_at, public_summary, metrics)
    values (${runId}, 'site-doctor', 'succeeded', ${startedAt}, ${finishedAt},
            ${up ? 'Checked 1 site: up' : 'Checked 1 site: down'}, ${JSON.stringify({ sites_checked: 1, sites_up: up ? 1 : 0 })})
    on conflict (id) do nothing`

  // Built as lab_public from the public view, so only public columns can leave the database.
  const publicDb = neon(config.DATABASE_URL_PUBLIC)
  const rows = await publicDb`select * from lab.public_state order by agent_id`
  const snapshot = buildSnapshot(rows, new Date())
  const publish = await fetch(config.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.UPSTASH_REDIS_REST_TOKEN}` },
    body: JSON.stringify(['SET', 'lab:snapshot', JSON.stringify(snapshot)]),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!publish.ok) throw new Error(`Upstash returned ${publish.status}`)

  if (config.HEALTHCHECK_URL) {
    await fetch(config.HEALTHCHECK_URL, { signal: AbortSignal.timeout(TIMEOUT_MS) }).catch(() => console.log('Heartbeat ping failed'))
  } else {
    console.log('HEALTHCHECK_URL not set, so no heartbeat (fine for a local run)')
  }

  console.log(`Run ${runId}: 1 site checked, ${up ? 1 : 0} up, snapshot published with ${snapshot.agents.length} agents`)
}

main().catch((err: Error) => {
  // Neon refuses every query once the month's compute runs out. Say so once, plainly, and don't retry.
  if (/exceeded the quota/i.test(err.message)) {
    console.error(`Run ${runId}: Neon's free compute for this month has run out. Nothing was written. It resets on the 1st.`)
  } else {
    console.error(`Run ${runId} failed: ${err.message}`)
  }
  process.exitCode = 1
})
