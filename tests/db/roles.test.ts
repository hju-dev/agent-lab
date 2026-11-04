// Phase 1 done check (docs/DONE_CHECKS.md): connected as lab_public, every table in lab is
// refused and has RLS on, and the public views answer. New tables are covered automatically.
// Read-only, so it's safe to point at the Neon dev branch: LAB_PUBLIC_URL=... npx vitest run tests/db/roles.test.ts
// In CI it runs against a throwaway Postgres (.github/workflows/ci.yml).
import { spawnSync } from 'node:child_process'
import { describe, expect, test } from 'vitest'

const url = process.env.LAB_PUBLIC_URL
// CI must never skip this silently; locally it's skipped when no database is set.
if (process.env.CI && !url) throw new Error('LAB_PUBLIC_URL is not set, so the database role tests cannot run in CI')

const PUBLIC_VIEWS = ['public_state', 'public_events']

function psql(sql: string) {
  const r = spawnSync('psql', [url!, '-X', '-q', '-t', '-A', '-v', 'ON_ERROR_STOP=1', '-c', sql], { encoding: 'utf8' })
  if (r.error) throw new Error(`Couldn't start psql: ${r.error.message}`)
  return { ok: r.status === 0, out: r.stdout.trim(), err: r.stderr }
}

// 30 seconds per test, not Vitest's default 5: against Neon each psql call opens a new connection over
// the internet, and the first may wait for the database to wake. Only the time limit changes; every
// assertion is the same (db-check on Nov 4 timed out at 5 s while checking 6 tables).
describe.skipIf(!url)('lab_public role (Phase 1, S1)', { timeout: 30_000 }, () => {
  // pg_class is readable by every role, so lab_public can list the tables it can't read.
  const tables = () => {
    const r = psql("select c.relname || ':' || c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'lab' and c.relkind in ('r', 'p') order by 1")
    expect(r.ok, r.err).toBe(true)
    return r.out.split(/\r?\n/).map((line) => { // psql on Windows ends lines with \r\n
      const [name, rls] = line.split(':')
      return { name: name!, rls: rls === 'true' } // a boolean joined onto text reads 'true', not 't'
    })
  }

  test('is connected as lab_public', () => {
    expect(psql('select current_user').out).toBe('lab_public')
  })

  test('finds the tables, so the loops below are not empty', () => {
    expect(tables().map((t) => t.name)).toEqual(expect.arrayContaining(['agents', 'runs', 'events', 'sites', 'site_checks']))
  })

  test('every table has RLS on', () => {
    expect(tables().filter((t) => !t.rls).map((t) => t.name)).toEqual([])
  })

  test('every table refuses lab_public', () => {
    const readable = tables().filter((t) => {
      const r = psql(`select 1 from lab.${t.name} limit 1`)
      if (!r.ok) expect(r.err).toMatch(/permission denied/)
      return r.ok
    })
    expect(readable.map((t) => t.name)).toEqual([])
  })

  test.each(PUBLIC_VIEWS)('the public view %s answers', (view) => {
    const r = psql(`select count(*) from lab.${view}`)
    expect(r.ok, r.err).toBe(true)
  })
})
