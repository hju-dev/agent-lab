// The two rules that turn checks into findings (PRD F1). Findings are saved as private events for now;
// in Phase 5 they go through Gemini into Henry's approval queue.
import { dropThreshold, sustainedDrop } from '../../lib/score-drop.ts'

export type Finding = { site_id: string; rule: 'down_twice' | 'score_drop'; detail: Record<string, number> }

// Down now and down at the previous check. One failed check alone is often a blip.
export function downTwice(siteId: string, previousUp: boolean | undefined, nowUp: boolean): Finding | null {
  return previousUp === false && !nowUp ? { site_id: siteId, rule: 'down_twice', detail: {} } : null
}

// S7: the 3-day median of the daily performance score fell by at least max(10, the site's SP2 range).
export function scoreDrop(siteId: string, dailyPerf: number[], perfRange: number | null): Finding | null {
  const result = sustainedDrop(dailyPerf, dropThreshold(perfRange ?? undefined))
  if (!result?.flagged) return null
  return { site_id: siteId, rule: 'score_drop', detail: { before: result.before, recent: result.recent, drop: result.drop } }
}
