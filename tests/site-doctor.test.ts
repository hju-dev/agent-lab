// Site Doctor's hourly run with a fake database and network (Phase 2 done checks).
import { spawnSync } from 'node:child_process'
import { describe, expect, test, vi } from 'vitest'
import { type Deps, runSiteDoctor } from '../agents/site-doctor/run.ts'
import { type Site, checkSite, checkTarget, publicSummary } from '../agents/site-doctor/uptime.ts'

const noWait = async () => {}
const now = () => new Date('2026-11-05T04:37:00Z')

// A private site whose name and address must never reach the public log (S3).
const privateSite: Site = { id: 'seeded-private-bakery', url: 'https://private-lead.example/', has_database: true, check_url: null }
const plainSite: Site = { id: 'plain-site', url: 'https://plain.example/', has_database: false, check_url: null }

function fakeDeps(overrides: Partial<Deps> = {}) {
  const lines: string[] = []
  const saved: Parameters<Deps['save']>[] = []
  const published: string[] = []
  const deps: Deps = {
    runId: 'gh-1-1',
    now,
    loadSites: async () => [privateSite, plainSite],
    loadLastStatus: async () => ({}),
    save: async (...args) => void saved.push(args),
    loadPublicState: async () => ({ agents: [{ agent_id: 'site-doctor', name: 'Site Doctor', public_summary: 'Checked 2 sites: all up' }] }),
    publishSnapshot: async (json) => void published.push(json),
    fetch: async () => ({ ok: true }),
    sleep: noWait,
    log: (line) => void lines.push(line),
    ...overrides,
  }
  return { deps, lines, saved, published }
}

describe('check target (S43)', () => {
  test('a site with a database is checked on /robots.txt, never its home page', () => {
    expect(checkTarget(privateSite)).toBe('https://private-lead.example/robots.txt')
  })
  test('its own check_url wins when set', () => {
    expect(checkTarget({ ...privateSite, check_url: 'https://private-lead.example/health.txt' })).toBe('https://private-lead.example/health.txt')
  })
  test('a site without a database is checked on its home page', () => {
    expect(checkTarget(plainSite)).toBe('https://plain.example/')
  })
  test('a full run only ever requests the static URL for a database site', async () => {
    const requested: string[] = []
    const { deps } = fakeDeps({ fetch: async (url) => (requested.push(url), { ok: true }) })
    await runSiteDoctor(deps)
    expect(requested).toContain('https://private-lead.example/robots.txt')
    expect(requested).not.toContain('https://private-lead.example/')
  })
})

describe('uptime', () => {
  test('a site that answers 2xx is up', async () => {
    expect((await checkSite(plainSite, now, async () => ({ ok: true }), noWait)).is_up).toBe(true)
  })
  test('a site that keeps failing is down after 4 tries (S12), with no response time', async () => {
    const fetch = vi.fn(async () => ({ ok: false }))
    const result = await checkSite(plainSite, now, fetch, noWait)
    expect(result).toMatchObject({ is_up: false, response_ms: null })
    expect(fetch).toHaveBeenCalledTimes(4)
  })
  test('a network error counts as down', async () => {
    const result = await checkSite(plainSite, now, async () => Promise.reject(new Error('ECONNREFUSED')), noWait)
    expect(result.is_up).toBe(false)
  })
  test('one dropped connection, then success, is up', async () => {
    let calls = 0
    const result = await checkSite(plainSite, now, async () => ({ ok: ++calls > 1 }), noWait)
    expect(result.is_up).toBe(true)
  })
})

describe('a run', () => {
  test('a site down now and at the previous check is a private finding', async () => {
    const { deps, saved } = fakeDeps({
      loadLastStatus: async () => ({ 'seeded-private-bakery': false, 'plain-site': true }),
      fetch: async () => ({ ok: false }),
    })
    await runSiteDoctor(deps)
    const [run, , findings] = saved[0]!
    expect(findings).toEqual([{ site_id: 'seeded-private-bakery', rule: 'down_twice', detail: {} }])
    expect(run.metrics.findings).toBe(1)
  })

  test('saves the run and every check together, once (S10, SP4)', async () => {
    const { deps, saved } = fakeDeps({ fetch: async (url) => ({ ok: !url.includes('plain') }) })
    await runSiteDoctor(deps)
    expect(saved).toHaveLength(1)
    const [run, checks] = saved[0]!
    expect(run).toMatchObject({ id: 'gh-1-1', public_summary: 'Checked 2 sites: 1 down', metrics: { sites_checked: 2, sites_up: 1, sites_down: 1 } })
    expect(checks.map((c) => [c.site_id, c.is_up])).toEqual([['seeded-private-bakery', true], ['plain-site', false]])
  })

  test('never prints a site name or address to the public log (S3)', async () => {
    const consoleLines: string[] = []
    const spies = (['log', 'error', 'warn', 'info'] as const).map((m) => vi.spyOn(console, m).mockImplementation((...a) => void consoleLines.push(a.join(' '))))
    const { deps, lines, published } = fakeDeps()
    await runSiteDoctor(deps)
    spies.forEach((s) => s.mockRestore())
    const everything = [...lines, ...consoleLines, ...published].join('\n')
    expect(everything).not.toMatch(/seeded-private-bakery|private-lead\.example|plain-site|plain\.example/)
    expect(lines).toEqual(['Run gh-1-1: 2 sites checked, 2 up, 0 down, 0 findings, snapshot published'])
  })

  test('a quota error from the database fails the run once and is not retried (S44)', async () => {
    const save = vi.fn(async () => Promise.reject(Object.assign(new Error('Your project has exceeded the quota'), { status: 402 })))
    const { deps, published } = fakeDeps({ save })
    await expect(runSiteDoctor(deps)).rejects.toThrow('exceeded the quota')
    expect(save).toHaveBeenCalledTimes(1)
    expect(published).toEqual([])
  })
})

test('the public summary has counts only', () => {
  expect(publicSummary([])).toBe('No active sites to check')
  expect(publicSummary([{ site_id: 'x', checked_at: '', is_up: true, response_ms: 5 }])).toBe('Checked 1 site: all up')
})

test('a missing setting stops Site Doctor with a plain message (S13)', () => {
  const env = { PATH: process.env.PATH ?? '', CI: 'true' }
  const r = spawnSync(process.execPath, ['agents/site-doctor/index.ts'], { env, encoding: 'utf8' })
  expect(r.status).toBe(1)
  expect(r.stderr).toContain("Site Doctor can't start")
  expect(r.stderr).toContain('DATABASE_URL_AGENT must be the lab_agent connection string')
  expect(r.stderr).not.toMatch(/at .*\.ts:\d+/) // no stack trace
})
