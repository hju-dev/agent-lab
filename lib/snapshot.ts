// Builds the public /lab snapshot from lab.public_state rows (ADR-0011).
// Only the fields named here are copied, so a column added to the view later can't leak by accident.

const PUBLIC_FIELDS = ['agent_id', 'name', 'schedule_label', 'last_status', 'last_run_at', 'public_summary'] as const

export type PublicAgent = Record<(typeof PUBLIC_FIELDS)[number], unknown>

export function buildSnapshot(rows: Record<string, unknown>[], generatedAt: Date) {
  return {
    generated_at: generatedAt.toISOString(),
    agents: rows.map((row) => Object.fromEntries(PUBLIC_FIELDS.map((field) => [field, row[field] ?? null])) as PublicAgent),
  }
}
