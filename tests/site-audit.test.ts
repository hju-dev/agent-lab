// Site Doctor's daily audit and its finding rules, with fakes (Phase 2 done checks).
import { afterEach, describe, expect, test, vi } from 'vitest'
import { LINK_CAP, brokenLinks, daysUntil, extractLinks, pageSpeed, parsePageSpeed } from '../agents/site-doctor/audit-checks.ts'
import { AUDIT_DEADLINE_MS, type AuditDeps, type AuditSite, runAudit } from '../agents/site-doctor/audit-run.ts'
import { downTwice, scoreDrop } from '../agents/site-doctor/findings.ts'

const noWait = async () => {}
const psi = (perf: number, a11y = 0.9, seo = 0.8) => ({
  lighthouseResult: { categories: { performance: { score: perf / 100 }, accessibility: { score: a11y }, seo: { score: seo } } },
})

describe('PageSpeed', () => {
  afterEach(() => vi.unstubAllGlobals())

  test('reads the three mobile scores as 0–100', () => {
    expect(parsePageSpeed(psi(49))).toEqual({ perf_score: 49, a11y_score: 90, seo_score: 80 })
  })
  test('a result without a score is an error, not a zero', () => {
    expect(() => parsePageSpeed({ lighthouseResult: { categories: {} } })).toThrow('no performance score')
  })
  test('a rate limit (429) is retried; the key goes in a header, never the URL', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response('', { status: 429 })).mockResolvedValueOnce(Response.json(psi(70)))
    vi.stubGlobal('fetch', fetch)
    await expect(pageSpeed('https://a.example/', 'secret-key', noWait)).resolves.toMatchObject({ perf_score: 70 })
    expect(fetch).toHaveBeenCalledTimes(2)
    const [url, init] = fetch.mock.calls[0]!
    expect(String(url)).not.toContain('secret-key')
    expect(init.headers['x-goog-api-key']).toBe('secret-key')
  })
  test('a bad request (400) is not retried', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('', { status: 400 }))
    vi.stubGlobal('fetch', fetch)
    await expect(pageSpeed('https://a.example/', 'k', noWait)).rejects.toThrow('PageSpeed returned 400')
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe('links', () => {
  test('resolves relative links, drops mailto, fragments and duplicates', () => {
    const html = `<a href="/about">x</a><a href='/about#team'>y</a><a href="mailto:a@b.c">m</a><a href="https://other.example/p">o</a>`
    expect(extractLinks(html, 'https://site.example/')).toEqual(['https://site.example/about', 'https://other.example/p'])
  })
  test(`checks at most ${LINK_CAP} links`, () => {
    const html = Array.from({ length: 80 }, (_, i) => `<a href="/p${i}">`).join('')
    expect(extractLinks(html, 'https://site.example/')).toHaveLength(LINK_CAP)
  })
  test('404s and dead links are broken; a server that refuses HEAD gets a GET', async () => {
    const fetch = vi.fn(async (url: string, method: 'HEAD' | 'GET') => {
      if (url.endsWith('/missing')) return { status: 404 }
      if (url.endsWith('/dead')) throw new Error('ECONNREFUSED')
      if (url.endsWith('/no-head')) return { status: method === 'HEAD' ? 405 : 200 }
      return { status: 200 }
    })
    const links = ['https://s.example/ok', 'https://s.example/missing', 'https://s.example/dead', 'https://s.example/no-head']
    expect(await brokenLinks(links, fetch)).toEqual(['https://s.example/missing', 'https://s.example/dead'])
  })
})

test('SSL days left', () => {
  expect(daysUntil('Dec 15 00:00:00 2026 GMT', new Date('2026-11-05T00:00:00Z'))).toBe(40)
})

describe('finding rules', () => {
  test('down twice in a row is a finding; down once, or with no earlier check, is not', () => {
    expect(downTwice('s', false, false)).toEqual({ site_id: 's', rule: 'down_twice', detail: {} })
    expect(downTwice('s', true, false)).toBeNull()
    expect(downTwice('s', undefined, false)).toBeNull()
  })
  test('a 12-point drop flags a quiet site but not one whose SP2 range is 14 (S7, ADR-0015)', () => {
    const daily = [49, 50, 47, 37, 38, 36]
    expect(scoreDrop('quiet', daily, null)?.rule).toBe('score_drop')
    expect(scoreDrop('noisy', daily, 14)).toBeNull()
  })
})

const site = (id: string): AuditSite => ({ id, url: `https://${id}.example/`, has_database: true, check_url: null, perf_range: null })

function fakeAudit(overrides: Partial<AuditDeps> = {}) {
  const lines: string[] = []
  const saved: Parameters<AuditDeps['save']>[] = []
  const deps: AuditDeps = {
    runId: 'gh-9-1',
    now: () => new Date('2026-11-05T22:41:00Z'),
    loadSites: async () => [site('seeded-private-bakery'), site('second')],
    loadPerfHistory: async () => ({}),
    fetchHome: async () => ({ ok: true, html: '<a href="/menu">menu</a>' }),
    certificateValidTo: async () => 'Dec 15 00:00:00 2026 GMT',
    pageSpeed: async () => ({ perf_score: 80, a11y_score: 90, seo_score: 85 }),
    brokenLinks: async () => [],
    save: async (...args) => void saved.push(args),
    loadPublicState: async () => ({ agents: [] }),
    publishSnapshot: async () => {},
    log: (line) => void lines.push(line),
    ...overrides,
  }
  return { deps, lines, saved }
}

describe('an audit run', () => {
  test('saves one row per site with scores, SSL days and broken links', async () => {
    const { deps, saved } = fakeAudit({ brokenLinks: async () => ['https://seeded-private-bakery.example/menu'] })
    await runAudit(deps)
    const [run, rows] = saved[0]!
    expect(run.public_summary).toBe('Audited 2 sites')
    expect(rows[0]).toMatchObject({ is_up: true, perf_score: 80, ssl_days_left: 39, broken_links: ['https://seeded-private-bakery.example/menu'] })
  })

  test('a site that is down gets no link check, and a PageSpeed failure is counted, not fatal', async () => {
    const links = vi.fn(async () => [])
    const { deps, saved } = fakeAudit({
      fetchHome: async () => ({ ok: false, html: '' }),
      pageSpeed: async () => Promise.reject(new Error('PageSpeed returned 500')),
      brokenLinks: links,
    })
    await runAudit(deps)
    const [run, rows] = saved[0]!
    expect(links).not.toHaveBeenCalled()
    expect(rows[0]).toMatchObject({ is_up: false, perf_score: null })
    expect(run.metrics.pagespeed_failed).toBe(2)
  })

  test('stops starting new sites after the deadline, so the run ends inside 10 minutes (ADR-0015)', async () => {
    let t = Date.parse('2026-11-05T22:41:00Z')
    const { deps, saved } = fakeAudit({
      now: () => new Date(t),
      pageSpeed: async () => ((t += AUDIT_DEADLINE_MS + 1), { perf_score: 80, a11y_score: 90, seo_score: 85 }),
    })
    await runAudit(deps)
    const [run, rows] = saved[0]!
    expect(rows).toHaveLength(1)
    expect(run.public_summary).toBe('Audited 1 site, 1 skipped for time')
  })

  test('a sustained drop against earlier days is a private finding', async () => {
    const { deps, saved } = fakeAudit({
      loadPerfHistory: async () => ({ 'seeded-private-bakery': [90, 91, 89, 70, 71] }),
      pageSpeed: async () => ({ perf_score: 70, a11y_score: 90, seo_score: 85 }),
    })
    await runAudit(deps)
    const findings = saved[0]![2]
    expect(findings.map((f) => [f.site_id, f.rule])).toEqual([['seeded-private-bakery', 'score_drop']])
  })

  test('never prints a site name or address to the public log (S3)', async () => {
    const { deps, lines, saved } = fakeAudit({ brokenLinks: async () => ['https://seeded-private-bakery.example/menu'] })
    await runAudit(deps)
    expect(lines.join('\n')).not.toMatch(/seeded-private-bakery|second/)
    expect(saved[0]![0].public_summary).not.toMatch(/seeded-private-bakery|second/)
    expect(lines).toEqual(['Run gh-9-1: 2 sites audited, 0 skipped, 0 PageSpeed failures, 0 findings'])
  })
})
