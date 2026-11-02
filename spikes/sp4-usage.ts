// SP4: reads Neon's usage numbers. The first run saves a baseline; later runs print the change since then.
// Run: node --env-file=.env spikes/sp4-usage.ts
// This calls Neon's management API, which doesn't wake the database.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const BASELINE_FILE = 'private/sp4-baseline.json' // private/ is git-ignored
const HOURS_IN_MONTH = 730

const { NEON_API_KEY, NEON_PROJECT_ID } = process.env
if (!NEON_API_KEY || !NEON_PROJECT_ID) {
  console.error('Add NEON_API_KEY and NEON_PROJECT_ID to .env, then run this again.')
  process.exit(1)
}

async function neon(path: string) {
  const res = await fetch(`https://console.neon.tech/api/v2/projects/${NEON_PROJECT_ID}${path}`, {
    headers: { Authorization: `Bearer ${NEON_API_KEY}` },
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) {
    console.error(`Neon API returned ${res.status} for ${path || '/'}. Check the key and project ID.`)
    process.exit(1)
  }
  return res.json()
}

const { project } = await neon('')
const { branches } = await neon('/branches')
const { endpoints } = await neon('/endpoints')

const reading = {
  at: new Date().toISOString(),
  compute_time_seconds: project.compute_time_seconds as number,
  active_time_seconds: project.active_time_seconds as number,
}

console.log(`Reading at ${reading.at}`)
console.log(`  compute_time_seconds: ${reading.compute_time_seconds}`)
console.log(`  active_time_seconds:  ${reading.active_time_seconds}`)
console.log(`  period: ${project.consumption_period_start} to ${project.consumption_period_end}`)
console.log(`Branches (${branches.length}): ${branches.map((b: { name: string }) => b.name).join(', ')}`)
console.log(`Computes (${endpoints.length}): ${endpoints.map((e: { current_state: string }) => e.current_state).join(', ')}`)

if (!existsSync(BASELINE_FILE)) {
  writeFileSync(BASELINE_FILE, JSON.stringify(reading, null, 2))
  console.log(`Baseline saved to ${BASELINE_FILE}.`)
} else {
  const base = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'))
  const hours = (Date.parse(reading.at) - Date.parse(base.at)) / 3_600_000
  const cuHours = (reading.compute_time_seconds - base.compute_time_seconds) / 3600
  const awakeHours = (reading.active_time_seconds - base.active_time_seconds) / 3600
  console.log(`Since the baseline (${hours.toFixed(1)} hours):`)
  console.log(`  CU-hours used: ${cuHours.toFixed(2)}`)
  console.log(`  awake ratio:   ${((awakeHours / hours) * 100).toFixed(1)}% (pass: 15% or less)`)
  console.log(`  projected month: ${((cuHours / hours) * HOURS_IN_MONTH).toFixed(1)} CU-hours (pass: 40 or less)`)
}
