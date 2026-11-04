// S42: weekly check of Neon's compute use. Fails (and GitHub emails Henry) when the month is projected
// to use more than 70% of the free allowance. Uses Neon's management API, which doesn't wake the database.
// Run: node --env-file=.env scripts/neon-usage.ts. Prints only the used and projected CU-hours.
import { z } from 'zod'
import { projectUsage } from '../lib/neon-usage.ts'
import { fetchWithTimeout } from '../lib/reliability.ts'

const env = z
  .object({
    NEON_API_KEY: z.string({ error: 'NEON_API_KEY is missing' }).min(1, 'NEON_API_KEY is missing'),
    NEON_PROJECT_ID: z.string({ error: 'NEON_PROJECT_ID is missing' }).min(1, 'NEON_PROJECT_ID is missing'),
    // Neon Free: 100 CU-hours per project per month (docs/SOURCES.md, checked against Neon's pricing page).
    ALLOWANCE_CU_HOURS: z.coerce.number().positive().default(100),
  })
  .safeParse(process.env)
if (!env.success) {
  console.error(`The Neon usage check can't start:\n${env.error.issues.map((i) => `- ${i.message}`).join('\n')}`)
  process.exit(1)
}
const { NEON_API_KEY, NEON_PROJECT_ID, ALLOWANCE_CU_HOURS } = env.data

const res = await fetchWithTimeout(`https://console.neon.tech/api/v2/projects/${encodeURIComponent(NEON_PROJECT_ID)}`, {
  headers: { Authorization: `Bearer ${NEON_API_KEY}`, Accept: 'application/json' },
})
if (!res.ok) {
  console.error(`Neon's API returned ${res.status}. Check the NEON_API_KEY and NEON_PROJECT_ID secrets.`)
  process.exit(1)
}
const { project } = (await res.json()) as { project: Record<string, unknown> }
const usage = projectUsage(project, ALLOWANCE_CU_HOURS, new Date())

console.log(`Used ${usage.usedCuHours.toFixed(1)} CU-hours so far; projected ${usage.projectedCuHours.toFixed(1)} for the month`)
if (usage.tooHigh) {
  console.error(
    `::error::Neon is projected to use ${usage.projectedCuHours.toFixed(1)} CU-hours, over 70% of the ${ALLOWANCE_CU_HOURS} allowed. ` +
      'Look for what keeps it awake (docs/playbooks/neon-free-tier.md, section 3.2).',
  )
  process.exit(1)
}
