// Builds the public /lab snapshot from the public views (ADR-0011), read as lab_public.
// Only the fields named here are copied, so a column added to a view later can't leak by accident.

const AGENT_FIELDS = ['agent_id', 'name', 'schedule_label', 'last_status', 'last_run_at', 'public_summary'] as const
const SITE_FIELDS = ['site_id', 'name', 'uptime_30d', 'checks_30d', 'last_checked_at', 'perf_score', 'perf_checked_at', 'is_up'] as const
const STAT_FIELDS = ['runs_this_week', 'sites_monitored', 'uptime_30d'] as const
const EVENT_FIELDS = ['agent_id', 'kind', 'created_at', 'public_text'] as const

// The ticker shows the latest few; the view already holds only events with public text.
export const TICKER_LENGTH = 10

type Row = Record<string, unknown>
export type PublicState = { agents: Row[]; sites?: Row[]; stats?: Row | null; events?: Row[] }

const pick = <F extends readonly string[]>(row: Row, fields: F) =>
  Object.fromEntries(fields.map((field) => [field, normalize(row[field])])) as Record<F[number], unknown>

// Postgres counts and rounded numbers can arrive as strings or bigints; the snapshot carries plain JSON.
function normalize(value: unknown) {
  if (value === undefined || value === null) return null
  if (typeof value === 'bigint') return Number(value)
  if (value instanceof Date) return value.toISOString()
  return value
}

const toNumber = (value: unknown) => (value === null || value === '' || Number.isNaN(Number(value)) ? null : Number(value))

export function buildSnapshot(state: PublicState, generatedAt: Date) {
  const stats = state.stats ? pick(state.stats, STAT_FIELDS) : null
  return {
    generated_at: generatedAt.toISOString(),
    agents: state.agents.map((row) => pick(row, AGENT_FIELDS)),
    sites: (state.sites ?? []).map((row) => {
      const site = pick(row, SITE_FIELDS)
      return { ...site, uptime_30d: toNumber(site.uptime_30d), checks_30d: toNumber(site.checks_30d), perf_score: toNumber(site.perf_score) }
    }),
    stats: stats && {
      runs_this_week: toNumber(stats.runs_this_week),
      sites_monitored: toNumber(stats.sites_monitored),
      uptime_30d: toNumber(stats.uptime_30d),
    },
    events: (state.events ?? []).slice(0, TICKER_LENGTH).map((row) => pick(row, EVENT_FIELDS)),
  }
}
