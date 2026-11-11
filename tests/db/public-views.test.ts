// Phase 4 v2: what lab_public can see through the site board and stats views (S1, PRD F6).
// Runs on CI's throwaway Postgres only (it needs a superuser to seed rows and switch roles), and
// everything happens inside a transaction that is rolled back, so it leaves no rows.
import { spawnSync } from 'node:child_process'
import { describe, expect, test } from 'vitest'

const url = process.env.CI_OWNER_URL
if (process.env.CI && !url) throw new Error('CI_OWNER_URL is not set, so the public view tests cannot run in CI')

// Seeds three sites and their checks as the owner, then runs `sql` as lab_public. Rolled back.
function asPublic(sql: string) {
  const script = `begin;
insert into lab.sites (id, name, url, is_public, show_live_status) values
  ('public-live', 'Public Live', 'https://live.example/', true, true),
  ('public-quiet', 'Public Quiet', 'https://quiet.example/', true, false),
  ('private-one', 'Seeded Private Bakery', 'https://private-lead.example/', false, false);
insert into lab.site_checks (site_id, checked_at, is_up, perf_score) values
  ('public-live', now() - interval '2 hours', true, null),
  ('public-live', now() - interval '1 hour', false, null),
  ('public-quiet', now() - interval '3 hours', true, 88),
  ('public-quiet', now() - interval '1 hour', false, null),
  ('private-one', now() - interval '1 hour', false, null),
  ('public-live', now() - interval '40 days', false, null);
set local role lab_public;
${sql}
rollback;`
  const r = spawnSync('psql', [url!, '-X', '-t', '-A', '-F', '|', '-v', 'ON_ERROR_STOP=1'], { input: script, encoding: 'utf8' })
  if (r.error) throw new Error(`Couldn't start psql: ${r.error.message}`)
  return { ok: r.status === 0, lines: r.stdout.split(/\r?\n/).filter((l) => l && !/^(BEGIN|INSERT|SET|ROLLBACK)/.test(l)), err: r.stderr }
}

describe.skipIf(!url)('public views for the site board (Phase 4 v2)', () => {
  test('only public sites appear, and live status only where the client agreed', () => {
    const r = asPublic('select site_id, uptime_30d, checks_30d, perf_score, is_up from lab.public_sites order by site_id;')
    expect(r.ok, r.err).toBe(true)
    expect(r.lines).toEqual([
      // 2 checks in the last 30 days (the 40-day-old one is left out), 1 up: 50.0%. Live status shown: down.
      'public-live|50.0|2||f',
      // Live status hidden (null), latest PageSpeed score shown.
      'public-quiet|50.0|2|88|',
    ])
    expect(r.lines.join()).not.toMatch(/private-one|Seeded Private Bakery|private-lead/)
  })

  test('the stats strip counts every active site but names none', () => {
    const r = asPublic('select runs_this_week, sites_monitored, uptime_30d from lab.public_stats;')
    expect(r.ok, r.err).toBe(true)
    // 3 sites; 5 checks in the last 30 days across all of them, 2 up: 40.0%.
    expect(r.lines).toEqual(['0|3|40.0'])
  })

  test('lab_public still cannot read the sites table itself', () => {
    const r = asPublic('select name from lab.sites;')
    expect(r.ok).toBe(false)
    expect(r.err).toMatch(/permission denied/)
  })
})
