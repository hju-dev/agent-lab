# Handoff: where the last session stopped

**Read this first in every new session**, before the rest of the "Read these first" list in `CLAUDE.md`. At the end of a session, Claude rewrites this file: what's done, what's next, and what the next session must not forget. Keep it to one screen; detail belongs in the build journal and the other docs.

Last updated: Nov 5, 2026, about 00:15 ICT.

## State

- **`main` is green.** Everything below is merged: [#1](https://github.com/hju-dev/agent-lab/pull/1) Day 0, [#3](https://github.com/hju-dev/agent-lab/pull/3) Phase 2 reliability rules, [#4](https://github.com/hju-dev/agent-lab/pull/4) SP6 test workflow, [#5](https://github.com/hju-dev/agent-lab/pull/5) Phase 1 database core, [#6](https://github.com/hju-dev/agent-lab/pull/6)–[#8](https://github.com/hju-dev/agent-lab/pull/8) Phase 2 Site Doctor, [#9](https://github.com/hju-dev/agent-lab/pull/9) role-test timeout, [#10](https://github.com/hju-dev/agent-lab/pull/10)–[#11](https://github.com/hju-dev/agent-lab/pull/11) American English, [#12](https://github.com/hju-dev/agent-lab/pull/12) claude.ai doc archived.
- **Phase 1: done.** The done check passed on the Neon dev branch (Nov 4). Journal entry and `docs/diagrams/phase-1.md` are written.
- **Phase 2: code done and live on production.** Manual runs on Nov 4 all passed:
  - `site-doctor`: 5 sites checked, 5 up.
  - `site-audit`: 5 audited, 0 skipped, 0 PageSpeed failures.
  - `neon-usage`: 0.4 CU-hours used, 3.0 projected for the month. With allowance 1 it failed, as intended.
  - `db-check`: passed (`lab_public` can't read any table on production).
- **Schedules are on** (`SITE_DOCTOR_ENABLED=true`): hourly uptime at :37, daily audit at 05:41 ICT, Neon usage on Mondays at 09:29 ICT.
- **Production database:** migrations 001–004 applied and 5 sites seeded. Memory Matters is public with live status, `has_database: false` (Wix) and `perf_range: 14`. Big T's Bakery and Grass Roots Sports are public. hju-dev and RAEng are private.

## Next, in order

1. **Check that the first scheduled runs started and passed** (Actions → site-doctor, site-audit).
2. **SP3 and SP4** (their 48 hours end Nov 5): record the results in `docs/SPIKES.md`, update `docs/EVIDENCE_LEDGER.md`, then delete `.github/workflows/spike-schedule.yml`. Record next to SP3 that GitHub Actions was degraded on the evening of Nov 4 (githubstatus.com), and that no scheduled run started between 15:00 ICT and the end of the outage.
3. **SP6 part 1:** `sp6-fail.yml` (cron :23) had never run as of Nov 5, 00:15 ICT. If it still hasn't, apply the fallback in `docs/SPIKES.md` (GitHub mobile push notifications), then delete the workflow and record SP6.
4. **Phase 2's remaining done checks:** 3 days of runs in `lab.runs`; a deliberately broken test URL shows as down and triggers a failure email (needs SP6).
5. **Then** the Phase 2 journal entry and `docs/diagrams/phase-2.md`. The quiz and "In my own words" wait for the interview-prep sessions.

## Decisions in force

- **Build fast, learn at the end** (Henry, Nov 4): Claude drives and Henry merges. Quizzes and "In my own words" move to 2–3 interview-prep sessions before Nov 30.
- **American English everywhere.** `tests/american-english.test.ts` fails CI on British spellings and day-first dates.
- **`docs/` is the only source of truth.** The claude.ai doc is archived.
- **ADR-0015:** PageSpeed and the Gemma grader may wait up to 60 seconds. A score drop counts at `max(10, the site's perf_range)`.
- **Findings** ("down twice in a row", "sustained score drop") are private events until Phase 5's approval queue exists.

## Gotchas

- **The cloud session can't reach Neon or the client sites:** it can only make HTTPS requests through a proxy. Database checks run in Actions (`db-check`) or on Henry's Windows machine.
- **Role passwords must be letters and digits only;** `migrate.ts` checks this before applying 001.
- **psql on Windows ends lines with `\r\n`.** Split its output on `/\r?\n/`.
- **`lab_agent` inserts use `on conflict do nothing` with no named columns.** Naming the columns needs read access the agent doesn't always have.
- **Henry's machine:** Windows, PowerShell, repo at `C:\Users\h\agent-lab`. Dev settings are in `.env` and production settings in `.env.prod`; both are git-ignored.
