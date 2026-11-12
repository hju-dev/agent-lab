// One daily audit run: SSL, PageSpeed and broken links for each active site, then the score-drop rule.
// Unlike the hourly check, this loads each home page once a day (as PageSpeed does), which PRD F1 accepts.
// Dependencies are passed in, so tests run it with fakes (tests/site-audit.test.ts). Logs print counts only (S3).
import { identifyingWords, safePublicText } from '../../lib/public-text.ts'
import { type PublicState, buildSnapshot } from '../../lib/snapshot.ts'
import { type Scores, brokenLinks as checkLinks, daysUntil, extractLinks } from './audit-checks.ts'
import { type Finding, scoreDrop } from './findings.ts'
import type { RunRecord } from './run.ts'
import type { Site } from './uptime.ts'

// Stop starting new sites after 7 minutes: one PageSpeed call can take a minute and retry,
// and the workflow is cut off at 10 (ADR-0015).
export const AUDIT_DEADLINE_MS = 7 * 60_000

export type AuditSite = Site & { perf_range: number | null }

export type AuditRow = {
  site_id: string
  checked_at: string
  is_up: boolean
  perf_score: number | null
  a11y_score: number | null
  seo_score: number | null
  ssl_days_left: number | null
  broken_links: string[]
}

export type AuditDeps = {
  runId: string
  now: () => Date
  loadSites: () => Promise<AuditSite[]>
  // Earlier daily performance scores per site, oldest first (up to 5 days).
  loadPerfHistory: () => Promise<Record<string, number[]>>
  fetchHome: (url: string) => Promise<{ ok: boolean; html: string }>
  certificateValidTo: (host: string) => Promise<string>
  pageSpeed: (url: string) => Promise<Scores>
  brokenLinks?: (links: string[]) => Promise<string[]>
  save: (run: RunRecord, rows: AuditRow[], findings: Finding[]) => Promise<void>
  loadPublicState: () => Promise<PublicState>
  publishSnapshot: (json: string) => Promise<void>
  log: (line: string) => void
}

async function orNull<T>(work: () => Promise<T>): Promise<T | null> {
  try {
    return await work()
  } catch {
    return null
  }
}

export async function runAudit(deps: AuditDeps) {
  const startedAt = deps.now()
  const sites = await deps.loadSites()
  const history = await deps.loadPerfHistory()
  const rows: AuditRow[] = []
  const findings: Finding[] = []
  let skipped = 0
  let pageSpeedFailed = 0

  for (const site of sites) {
    if (deps.now().getTime() - startedAt.getTime() > AUDIT_DEADLINE_MS) {
      skipped++
      continue
    }
    const checkedAt = deps.now()
    const home = (await orNull(() => deps.fetchHome(site.url))) ?? { ok: false, html: '' }
    const validTo = await orNull(() => deps.certificateValidTo(new URL(site.url).hostname))
    const scores = await orNull(() => deps.pageSpeed(site.url))
    if (!scores) pageSpeedFailed++
    const broken = home.ok ? ((await orNull(() => (deps.brokenLinks ?? checkLinks)(extractLinks(home.html, site.url)))) ?? []) : []

    rows.push({
      site_id: site.id,
      checked_at: checkedAt.toISOString(),
      is_up: home.ok,
      perf_score: scores?.perf_score ?? null,
      a11y_score: scores?.a11y_score ?? null,
      seo_score: scores?.seo_score ?? null,
      ssl_days_left: validTo ? daysUntil(validTo, checkedAt) : null,
      broken_links: broken,
    })
    if (scores) {
      const drop = scoreDrop(site.id, [...(history[site.id] ?? []), scores.perf_score], site.perf_range)
      if (drop) findings.push(drop)
    }
  }

  const audited = rows.length
  await deps.save(
    {
      id: deps.runId,
      started_at: startedAt.toISOString(),
      finished_at: deps.now().toISOString(),
      // S2: never save public text that names a site or holds an address.
      public_summary:
        safePublicText(`Audited ${audited} site${audited === 1 ? '' : 's'}${skipped ? `, ${skipped} skipped for time` : ''}`, identifyingWords(sites)) ??
        'Run finished',
      metrics: { sites_audited: audited, sites_skipped: skipped, pagespeed_failed: pageSpeedFailed, findings: findings.length },
    },
    rows,
    findings,
  )
  await deps.publishSnapshot(JSON.stringify(buildSnapshot(await deps.loadPublicState(), deps.now())))
  deps.log(`Run ${deps.runId}: ${audited} sites audited, ${skipped} skipped, ${pageSpeedFailed} PageSpeed failures, ${findings.length} findings`)
  return { audited, skipped, findings: findings.length }
}
