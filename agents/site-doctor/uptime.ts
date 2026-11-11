// Site Doctor's hourly uptime logic, with no database or network of its own, so it can be tested offline.
import { fetchWithTimeout, withRetry } from '../../lib/reliability.ts'

export type Site = { id: string; name?: string | null; url: string; has_database: boolean; check_url: string | null }

export type CheckResult = { site_id: string; checked_at: string; is_up: boolean; response_ms: number | null }

// S43: a site with a database is checked on a static URL (its own check_url, or /robots.txt),
// never its home page, so hourly checks can't keep the client's Neon database awake.
export function checkTarget(site: Site): string {
  if (!site.has_database) return site.url
  return site.check_url ?? new URL('/robots.txt', site.url).toString()
}

type Fetch = (url: string) => Promise<{ ok: boolean }>
type Sleep = (ms: number) => Promise<void>

const defaultFetch: Fetch = (url) => fetchWithTimeout(url, { redirect: 'follow' })

// Up means the check URL answered with a 2xx after redirects. A failure is retried up to 3 times
// with increasing waits (S12), so one dropped connection doesn't report a site as down.
export async function checkSite(site: Site, now: () => Date, fetch: Fetch = defaultFetch, sleep?: Sleep): Promise<CheckResult> {
  const checkedAt = now()
  const started = Date.now()
  let isUp = false
  try {
    isUp = await withRetry(
      async () => {
        const res = await fetch(checkTarget(site))
        if (!res.ok) throw new Error('not ok')
        return true
      },
      sleep ? { sleep } : {},
    )
  } catch {
    isUp = false
  }
  return { site_id: site.id, checked_at: checkedAt.toISOString(), is_up: isUp, response_ms: isUp ? Date.now() - started : null }
}

// Sites are checked at the same time, so one slow site doesn't hold up the rest.
export function checkSites(sites: Site[], now: () => Date, fetch?: Fetch, sleep?: Sleep) {
  return Promise.all(sites.map((site) => checkSite(site, now, fetch, sleep)))
}

// The one-line public summary: counts only, never a site name (S2, S3).
export function publicSummary(results: CheckResult[]): string {
  const down = results.filter((r) => !r.is_up).length
  if (results.length === 0) return 'No active sites to check'
  const sites = `${results.length} site${results.length === 1 ? '' : 's'}`
  return down === 0 ? `Checked ${sites}: all up` : `Checked ${sites}: ${down} down`
}
