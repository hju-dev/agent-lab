# 16. The private admin lives in Henry's existing dashboard, not a new /lab/admin

Date: 2026-11-05

## Status

Accepted (Henry, Nov 5, 2026). Changes where the PRD's private admin ("/lab/admin", F8 and phase 5) is built. Everything the PRD says the admin does, and every safeguard on it, is unchanged.

## Decision

Henry already runs a private dashboard in the site repo (`dashboard/`: Next.js, Clerk, served at `hju-dev.vercel.app/dashboard`). It monitors his sites (Uptime Robot, Sentry, Neon usage) and is locked to him with Clerk plus an owner check that fails closed. Phase 5 builds Agent Lab's approval queue, quality data, leads and sites screens as new pages in that dashboard instead of a second private app at /lab/admin.

- **Same security rules:** every admin page and action checks the Clerk session and the owner on the server (the dashboard's `requireOwner()`, which matches CLAUDE.md's `ADMIN_USER_ID` rule in intent; phase 5 adds the user-id check alongside the email check). It connects to the Agent Lab database as `lab_admin` only, through a new server-only `DATABASE_URL_ADMIN`.
- **Neon:** admin pages wake the Agent Lab database only when Henry opens them. No polling (ADR-0011 rules apply).
- **Two uptime monitors, on purpose:** Uptime Robot stays Henry's operational alert. Site Doctor is the portfolio piece and the source of /lab's public data. Neither replaces the other.
- **The dashboard links to /lab;** no public page links to the dashboard (site rule).

## Consequences

- One private app to secure and maintain instead of two, and phase 5 starts with sign-in already working.
- The dashboard's own rules (`dashboard/CLAUDE.md`) apply to that code. Agent Lab's rules still apply to anything touching its data.
- The PRD, DONE_CHECKS and threat model still say "/lab/admin"; read that as "the Agent Lab pages in the dashboard" until phase 5 updates them.
