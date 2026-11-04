// The daily audit's checks: SSL days left, PageSpeed scores and broken homepage links (PRD F1).
// Network calls are passed in, so the parsing and rules can be tested offline.
import { connect } from 'node:tls'
import { SLOW_API_TIMEOUT_MS, fetchWithTimeout, withRetry } from '../../lib/reliability.ts'

export const LINK_CAP = 50
const DAY_MS = 86_400_000

export function daysUntil(validTo: string, now: Date): number {
  return Math.floor((new Date(validTo).getTime() - now.getTime()) / DAY_MS)
}

// Reads the certificate's expiry date from a TLS handshake. It never loads a page, so no database wakes.
export function certificateValidTo(host: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = connect({ host, port: 443, servername: host, timeout: 10_000 }, () => {
      const validTo = socket.getPeerCertificate().valid_to
      socket.end()
      validTo ? resolve(validTo) : reject(new Error('no certificate'))
    })
    socket.on('timeout', () => socket.destroy(new Error('TLS timeout')))
    socket.on('error', reject)
  })
}

export type Scores = { perf_score: number; a11y_score: number; seo_score: number }

export function parsePageSpeed(json: unknown): Scores {
  const c = (json as { lighthouseResult?: { categories?: Record<string, { score?: number | null }> } }).lighthouseResult?.categories
  const pick = (name: string) => {
    const score = c?.[name]?.score
    if (typeof score !== 'number') throw new Error(`PageSpeed result has no ${name} score`)
    return Math.round(score * 100)
  }
  return { perf_score: pick('performance'), a11y_score: pick('accessibility'), seo_score: pick('seo') }
}

class PageSpeedError extends Error {
  status: number
  constructor(status: number) {
    super(`PageSpeed returned ${status}`)
    this.status = status
  }
}

// Mobile scores, up to 60 seconds per call (ADR-0015). Rate limits (429) and server errors are retried;
// other errors (a bad key, a bad URL) are not. The key goes in a header, never the URL, so it can't be logged.
export async function pageSpeed(url: string, key: string, sleep?: (ms: number) => Promise<void>): Promise<Scores> {
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance&category=accessibility&category=seo&url=${encodeURIComponent(url)}`
  return withRetry(
    async () => {
      const res = await fetchWithTimeout(endpoint, { headers: { 'x-goog-api-key': key } }, SLOW_API_TIMEOUT_MS.pagespeed)
      if (!res.ok) throw new PageSpeedError(res.status)
      return parsePageSpeed(await res.json())
    },
    { baseDelayMs: 5_000, ...(sleep ? { sleep } : {}), shouldRetry: (err) => !(err instanceof PageSpeedError) || err.status === 429 || err.status >= 500 },
  )
}

// The page's links, as absolute http(s) URLs without duplicates or #fragments, capped at 50.
// The page is untrusted: only href values are read, and nothing from it is run or sent to a model.
export function extractLinks(html: string, pageUrl: string): string[] {
  const links = new Set<string>()
  for (const match of html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)) {
    try {
      const link = new URL(match[1]!, pageUrl)
      if (link.protocol !== 'http:' && link.protocol !== 'https:') continue
      link.hash = ''
      links.add(link.toString())
    } catch {
      // not a valid URL: skip it
    }
    if (links.size >= LINK_CAP) break
  }
  return [...links]
}

type LinkFetch = (url: string, method: 'HEAD' | 'GET') => Promise<{ status: number }>
const defaultLinkFetch: LinkFetch = (url, method) => fetchWithTimeout(url, { method, redirect: 'follow' })

// A link is broken when it answers 400 or above, or not at all. Some servers refuse HEAD, so those get a GET.
// Five at a time, so a page full of links doesn't flood anyone.
export async function brokenLinks(links: string[], fetch: LinkFetch = defaultLinkFetch): Promise<string[]> {
  const isBroken = async (url: string) => {
    try {
      let { status } = await fetch(url, 'HEAD')
      if (status === 405 || status === 501) ({ status } = await fetch(url, 'GET'))
      return status >= 400
    } catch {
      return true
    }
  }
  const broken: string[] = []
  for (let i = 0; i < links.length; i += 5) {
    const batch = links.slice(i, i + 5)
    const results = await Promise.all(batch.map(isBroken))
    batch.forEach((url, j) => results[j] && broken.push(url))
  }
  return broken
}
