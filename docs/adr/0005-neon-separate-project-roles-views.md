# 5. A separate Neon project, with three roles, RLS and public views

Date: 2026-10-17

## Status

Accepted. Depends on Spike SP4.

## Context

Henry already uses Neon for his chatbot. Neon's free plan gives 100 compute-hours and 1 GB **per project**, and scales to zero after 5 minutes idle ([SOURCES.md](../SOURCES.md#neon-database)). Agent Lab writes on every scheduled run and serves public reads, so sharing a project would mean the chatbot and Agent Lab compete for the same hours.

Agent Lab holds private data (lead names, URLs, drafts) next to data that's safe to show. The public API must never be able to read the private part, even if the API code has a bug.

## Decision

Create a new Neon project for Agent Lab (S28) with a `lab` schema and three roles:

- `lab_public`: can read only the four public views.
- `lab_agent`: can write run data.
- `lab_admin`: full access, used only by the admin API.

Row-level security on every table. The public API connects as `lab_public`, so a bug in the API still can't read private tables. A development branch for local work and previews (S18). Numbered migrations only (S21).

## Consequences

- Each project gets its own 100 compute-hours.
- The leak protection is enforced by the database, not just by code, which is testable with one SQL check.
- Three connection strings to manage as secrets.
- The free plan's restore window is 6 hours, so take a `pg_dump` before each production migration.
- **Fallback (29 Oct 2026):** if Spike SP4 still projects over 40 CU-hours after ADR-0011's fixes, move to Supabase's free plan. It's Postgres, so the roles, RLS and views carry over. Its free projects pause after 7 days of low activity, which hourly agent writes prevent. Check its free limits on its pricing page before switching (see `docs/STACK.md`).
