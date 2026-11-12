// S1: the public snapshot never carries private columns or private values, in any section.
// Each section gets rows padded with private fields an upstream bug might let through.
import { expect, test } from 'vitest'
import { buildSnapshot, TICKER_LENGTH } from '../lib/snapshot.ts'

const PRIVATE = /error_detail|private_payload|report_email|notes|raw_report|broken_links|run_id|Seeded Private Bakery|private-lead\.example|owner@/

const poisoned = {
  agents: [
    {
      agent_id: 'site-doctor', name: 'Site Doctor', schedule_label: 'Several times a day', last_status: 'succeeded',
      last_run_at: '2026-11-05T04:17:00Z', public_summary: 'Checked 1 site: up',
      error_detail: 'Timed out fetching https://private-lead.example for Seeded Private Bakery',
    },
  ],
  sites: [
    {
      site_id: 'memory-matters', name: 'Memory Matters', uptime_30d: '99.5', checks_30d: 120n, last_checked_at: new Date('2026-11-11T07:00:00Z'),
      perf_score: 41, perf_checked_at: '2026-11-11T22:41:00Z', is_up: null,
      report_email: 'owner@private-lead.example', notes: 'Seeded Private Bakery', raw_report: { url: 'https://private-lead.example' },
      broken_links: ['https://private-lead.example/x'],
    },
  ],
  stats: { runs_this_week: '28', sites_monitored: 5n, uptime_30d: '99.8', private_payload: { business: 'Seeded Private Bakery' } },
  events: Array.from({ length: 15 }, (_, i) => ({
    id: `run-${i}:1`, run_id: `run-${i}`, agent_id: 'site-doctor', kind: 'uptime', created_at: '2026-11-11T07:00:00Z',
    public_text: 'Checked 5 sites: all up', private_payload: { site: 'Seeded Private Bakery' },
  })),
}

test('snapshot drops private columns and values in every section', () => {
  expect(JSON.stringify(buildSnapshot(poisoned, new Date()))).not.toMatch(PRIVATE)
})

test('numbers arrive as plain JSON numbers, and the ticker is capped', () => {
  const snap = buildSnapshot(poisoned, new Date('2026-11-11T08:00:00Z'))
  expect(snap.stats).toEqual({ runs_this_week: 28, sites_monitored: 5, uptime_30d: 99.8 })
  expect(snap.sites[0]).toMatchObject({ name: 'Memory Matters', uptime_30d: 99.5, checks_30d: 120, perf_score: 41, is_up: null, last_checked_at: '2026-11-11T07:00:00.000Z' })
  expect(snap.events).toHaveLength(TICKER_LENGTH)
})

test('a state with only agents still builds (empty board, no stats)', () => {
  const snap = buildSnapshot({ agents: [] }, new Date())
  expect(snap).toMatchObject({ agents: [], sites: [], stats: null, events: [] })
})
