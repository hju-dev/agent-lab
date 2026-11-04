// S1, first assertion: the public snapshot never carries private columns or private values.
// Later phases extend this to every public endpoint (docs/DONE_CHECKS.md, Phase 3).
import { expect, test } from 'vitest'
import { buildSnapshot } from '../lib/snapshot.ts'

test('snapshot drops private columns and values', () => {
  const row = {
    agent_id: 'site-doctor',
    name: 'Site Doctor',
    schedule_label: 'About hourly',
    last_status: 'succeeded',
    last_run_at: '2026-11-05T04:17:00Z',
    public_summary: 'Checked 1 site: up',
    error_detail: 'Timed out fetching https://private-lead.example for Seeded Private Bakery',
  }
  expect(JSON.stringify(buildSnapshot([row], new Date()))).not.toMatch(/error_detail|Seeded Private Bakery|private-lead\.example/)
})
