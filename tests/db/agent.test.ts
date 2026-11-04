// lab_agent's rights, and that a repeated save adds no rows (S10). Runs on CI's throwaway Postgres only:
// it needs a superuser (CI_OWNER_URL) to switch roles, and it rolls everything back, so it leaves no rows.
import { spawnSync } from 'node:child_process'
import { describe, expect, test } from 'vitest'

const url = process.env.CI_OWNER_URL
if (process.env.CI && !url) throw new Error('CI_OWNER_URL is not set, so the lab_agent tests cannot run in CI')

// Runs the statements as lab_agent inside a transaction that is always rolled back.
// Returns psql's output, which includes command tags such as "INSERT 0 1".
function asAgent(sql: string) {
  const script = `begin;
insert into lab.sites (id, name, url) values ('test-site', 'Test Site', 'https://test.example/');
set local role lab_agent;
${sql}
rollback;`
  const r = spawnSync('psql', [url!, '-X', '-t', '-A', '-v', 'ON_ERROR_STOP=1'], { input: script, encoding: 'utf8' })
  if (r.error) throw new Error(`Couldn't start psql: ${r.error.message}`)
  return { ok: r.status === 0, out: r.stdout, err: r.stderr }
}

describe.skipIf(!url)('lab_agent (Phase 2)', () => {
  // Same statements as agents/site-doctor/index.ts. "on conflict do nothing" names no columns on purpose:
  // naming them makes Postgres demand read access, which lab_agent doesn't have.
  test('saving the same run, check and event twice adds each once (S10)', () => {
    const save = `insert into lab.runs (id, agent_id, status, started_at) values ('gh-1-1', 'site-doctor', 'succeeded', now()) on conflict do nothing;
insert into lab.site_checks (site_id, checked_at, is_up, response_ms) values ('test-site', '2026-11-05T04:37:00Z', true, 120) on conflict do nothing;
insert into lab.events (id, agent_id, run_id, kind) values ('gh-1-1:1', 'site-doctor', 'gh-1-1', 'uptime') on conflict do nothing;`
    const r = asAgent(`${save}\n${save}`)
    expect(r.ok, r.err).toBe(true)
    // The first INSERT is the test's own site, added as the owner.
    expect(r.out.match(/INSERT 0 \d/g)).toEqual(['INSERT 0 1', 'INSERT 0 1', 'INSERT 0 1', 'INSERT 0 1', 'INSERT 0 0', 'INSERT 0 0', 'INSERT 0 0'])
  })

  test('can read the sites it checks', () => {
    const r = asAgent('select count(*) from lab.sites;')
    expect(r.ok, r.err).toBe(true)
  })

  test('cannot read check results or change sites', () => {
    expect(asAgent('select 1 from lab.site_checks limit 1;').err).toMatch(/permission denied/)
    expect(asAgent("update lab.sites set name = 'x';").err).toMatch(/permission denied/)
  })
})
