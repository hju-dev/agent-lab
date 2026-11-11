// One Site Doctor run: load sites, check them, save everything in one transaction, publish the snapshot.
// The database, network and log are passed in, so tests can run it with fakes (tests/site-doctor.test.ts).
// Actions logs are public: only the run id and counts are ever printed (S3).
import { identifyingWords, safePublicText } from '../../lib/public-text.ts'
import { type PublicState, buildSnapshot } from '../../lib/snapshot.ts'
import { type Finding, downTwice } from './findings.ts'
import { type CheckResult, type Site, checkSites, publicSummary } from './uptime.ts'

export type RunRecord = { id: string; started_at: string; finished_at: string; public_summary: string; metrics: Record<string, number> }

export type Deps = {
  runId: string
  now: () => Date
  loadSites: () => Promise<Site[]>
  // Each site's most recent check before this run: true for up, false for down.
  loadLastStatus: () => Promise<Record<string, boolean>>
  // Writes the run, its checks and its event together, so a run wakes Neon once (SP4) and a retry adds nothing (S10).
  save: (run: RunRecord, checks: CheckResult[], findings: Finding[]) => Promise<void>
  loadPublicState: () => Promise<PublicState>
  publishSnapshot: (json: string) => Promise<void>
  fetch?: (url: string) => Promise<{ ok: boolean }>
  sleep?: (ms: number) => Promise<void>
  log: (line: string) => void
}

export async function runSiteDoctor(deps: Deps) {
  const startedAt = deps.now()
  const sites = await deps.loadSites()
  const lastStatus = await deps.loadLastStatus()
  const checks = await checkSites(sites, deps.now, deps.fetch, deps.sleep)
  const up = checks.filter((c) => c.is_up).length
  const findings = checks.flatMap((c) => downTwice(c.site_id, lastStatus[c.site_id], c.is_up) ?? [])

  await deps.save(
    {
      id: deps.runId,
      started_at: startedAt.toISOString(),
      finished_at: deps.now().toISOString(),
      // S2: never save public text that names a site or holds an address.
      public_summary: safePublicText(publicSummary(checks), identifyingWords(sites)) ?? 'Run finished',
      metrics: { sites_checked: checks.length, sites_up: up, sites_down: checks.length - up, findings: findings.length },
    },
    checks,
    findings,
  )

  // Built as lab_public from the public view, so only public columns can leave the database (S1, ADR-0011).
  const snapshot = buildSnapshot(await deps.loadPublicState(), deps.now())
  await deps.publishSnapshot(JSON.stringify(snapshot))

  deps.log(`Run ${deps.runId}: ${checks.length} sites checked, ${up} up, ${checks.length - up} down, ${findings.length} findings, snapshot published`)
  return { checked: checks.length, up }
}
