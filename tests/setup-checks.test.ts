// S42 (Neon usage projection) and the role-password check in scripts/migrate.ts.
import { spawnSync } from 'node:child_process'
import { describe, expect, test } from 'vitest'
import { projectUsage } from '../lib/neon-usage.ts'
import { rolePasswordProblems } from '../lib/role-passwords.ts'

describe('Neon usage projection (S42)', () => {
  const period = { consumption_period_start: '2026-11-01T00:00:00Z', consumption_period_end: '2026-12-01T00:00:00Z' }
  const now = new Date('2026-11-11T00:00:00Z') // 10 of 30 days gone

  test('projects the month from the days so far', () => {
    const u = projectUsage({ ...period, compute_time_seconds: 10 * 3600 }, 100, now)
    expect(u.usedCuHours).toBe(10)
    expect(u.projectedCuHours).toBeCloseTo(30)
    expect(u.tooHigh).toBe(false)
  })

  test('fails above 70% of the allowance', () => {
    expect(projectUsage({ ...period, compute_time_seconds: 24 * 3600 }, 100, now).tooHigh).toBe(true) // 72 projected
    expect(projectUsage({ ...period, compute_time_seconds: 23 * 3600 }, 100, now).tooHigh).toBe(false) // 69 projected
  })

  test('fails with a fake allowance of 1 CU-hour (the Phase 2 done check)', () => {
    expect(projectUsage({ ...period, compute_time_seconds: 3600 }, 1, now).tooHigh).toBe(true)
  })

  test('a response without the usage fields is an error, not a pass', () => {
    expect(() => projectUsage({}, 100, now)).toThrow('missing compute_time_seconds')
  })
})

describe('role passwords for migration 001', () => {
  const ok = { LAB_PUBLIC_PASSWORD: 'abc123XYZ', LAB_AGENT_PASSWORD: 'def456', LAB_ADMIN_PASSWORD: 'Ghi789' }

  test('letters and digits pass', () => {
    expect(rolePasswordProblems(ok)).toEqual([])
  })

  test('symbols, spaces, accents and missing values are named, never shown', () => {
    const problems = rolePasswordProblems({ LAB_PUBLIC_PASSWORD: 'pä55word', LAB_AGENT_PASSWORD: 'has space', LAB_ADMIN_PASSWORD: undefined })
    expect(problems).toEqual([
      'LAB_PUBLIC_PASSWORD may only contain letters A–Z, a–z and digits 0–9 (no spaces or symbols)',
      'LAB_AGENT_PASSWORD may only contain letters A–Z, a–z and digits 0–9 (no spaces or symbols)',
      'LAB_ADMIN_PASSWORD is missing',
    ])
    expect(problems.join(' ')).not.toMatch(/pä55word|has space/)
  })
})

test('the Neon usage check stops with a plain message when its settings are missing', () => {
  const r = spawnSync(process.execPath, ['scripts/neon-usage.ts'], { env: { PATH: process.env.PATH ?? '' }, encoding: 'utf8' })
  expect(r.status).toBe(1)
  expect(r.stderr).toContain('NEON_API_KEY is missing')
})
