// S42: is Neon on track to run out of free compute this month? (docs/playbooks/neon-free-tier.md, 3.1 and 6)
// Pure arithmetic on the project fields Neon's API returns, so it can be tested offline.

export const WARN_SHARE = 0.7 // fail when the month is projected to use more than 70% of the allowance

export type NeonProject = {
  compute_time_seconds?: unknown // CU-weighted seconds used this billing period
  consumption_period_start?: unknown
  consumption_period_end?: unknown
}

export function projectUsage(project: NeonProject, allowanceCuHours: number, now: Date) {
  const seconds = project.compute_time_seconds
  const start = Date.parse(String(project.consumption_period_start))
  if (typeof seconds !== 'number' || Number.isNaN(start)) {
    throw new Error("Neon's project response is missing compute_time_seconds or consumption_period_start")
  }
  const end = Date.parse(String(project.consumption_period_end))
  const periodDays = Number.isNaN(end) ? 30 : (end - start) / 86_400_000
  // At least one hour elapsed, so a check just after the 1st can't divide by almost nothing.
  const elapsedDays = Math.max((now.getTime() - start) / 86_400_000, 1 / 24)
  const usedCuHours = seconds / 3600
  const projectedCuHours = (usedCuHours / elapsedDays) * periodDays
  return {
    usedCuHours,
    projectedCuHours,
    limitCuHours: allowanceCuHours * WARN_SHARE,
    tooHigh: projectedCuHours > allowanceCuHours * WARN_SHARE,
  }
}
