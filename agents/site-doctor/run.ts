// One Site Doctor run: load sites, check them, save everything in one transaction, publish the snapshot.
// The database, network and log are passed in, so tests can run it with fakes (tests/site-doctor.test.ts).
// Actions logs are public: only the run id and counts are ever printed (S3).
import { buildSnapshot } from '../../lib/snapshot.ts'
import { type CheckResult, type Site, checkSites, publicSummary } from './uptime.ts'

export type RunRecord = { id: string; started_at: string; finished_at: string; public_summary: string; metrics: Record<string, number> }

export type Deps = {
  runId: string
  now: () => Date
  loadSites: () => Promise<Site[]>
  // Writes the run, its checks and its event together, so a run wakes Neon once (SP4) and a retry adds nothing (S10).
  save: (run: RunRecord, checks: CheckResult[]) => Promise<void>
  loadPublicState: () => Promise<Record<string, unknown>[]>
  publishSnapshot: (json: string) => Promise<void>
  fetch?: (url: string) => Promise<{ ok: boolean }>
  sleep?: (ms: number) => Promise<void>
  log: (line: string) => void
}

export async function runSiteDoctor(deps: Deps) {
  const startedAt = deps.now()
  const sites = await deps.loadSites()
  const checks = await checkSites(sites, deps.now, deps.fetch, deps.sleep)
  const up = checks.filter((c) => c.is_up).length

  await deps.save(
    {
      id: deps.runId,
      started_at: startedAt.toISOString(),
      finished_at: deps.now().toISOString(),
      public_summary: publicSummary(checks),
      metrics: { sites_checked: checks.length, sites_up: up, sites_down: checks.length - up },
    },
    checks,
  )

  // Built as lab_public from the public view, so only public columns can leave the database (S1, ADR-0011).
  const snapshot = buildSnapshot(await deps.loadPublicState(), deps.now())
  await deps.publishSnapshot(JSON.stringify(snapshot))

  deps.log(`Run ${deps.runId}: ${checks.length} sites checked, ${up} up, ${checks.length - up} down, snapshot published`)
  return { checked: checks.length, up }
}
