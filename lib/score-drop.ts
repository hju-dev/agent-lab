// S7: Site Doctor flags a PageSpeed drop only when it lasts, not after one noisy reading.
// Rule (PRD, Site Doctor): the 3-day median drops by 10 or more. "Drops" here means the median of
// the last 3 daily scores against the median of the 3 days before them.
// Each site's threshold is the larger of 10 and its own measured range from SP2 (ADR-0015),
// so a noisy site (SP2's Client A varied by 14) can't be flagged by noise alone.

export const DROP_THRESHOLD = 10
const WINDOW_DAYS = 3

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2
}

// measuredRange: how far the site's score varied between back-to-back runs (SP2). Unknown means 10.
export function dropThreshold(measuredRange?: number): number {
  return Math.max(DROP_THRESHOLD, measuredRange ?? 0)
}

// dailyScores: one score per day, oldest first. Returns null until there are 6 days to compare.
export function sustainedDrop(dailyScores: number[], threshold = DROP_THRESHOLD) {
  if (dailyScores.length < WINDOW_DAYS * 2) return null
  const recent = dailyScores.slice(-WINDOW_DAYS)
  const before = dailyScores.slice(-WINDOW_DAYS * 2, -WINDOW_DAYS)
  const drop = median(before) - median(recent)
  return { before: median(before), recent: median(recent), drop, flagged: drop >= threshold }
}
