# 15. Longer timeouts for named slow APIs, and a per-site drop threshold

Date: 2026-11-04

## Status

Accepted. Narrows the 10-second request timeout (PRD, "Reliability"; CLAUDE.md, "Reliability") and the 10-point drop rule (PRD, Site Doctor) without replacing them.

## Context

Two Day 0 spikes left open questions for Henry (`docs/SPIKES.md`, results table):

- **SP1 and SP2:** PageSpeed calls, and the Gemma 4 grader's replies (about 35 seconds), take longer than the 10-second timeout. Both spikes used 60 seconds instead, and every call finished within it.
- **SP2:** one client site's mobile score varied by 14 points across 5 back-to-back runs. A fixed 10-point drop rule could flag that site on noise alone. The evidence ledger (row 9) already says to use each site's own range for S7.

## Decision

- **Timeouts (S11):** every request keeps the 10-second limit, except APIs named in `SLOW_API_TIMEOUT_MS` in `lib/reliability.ts`. Today that's PageSpeed and the Gemma grader, at 60 seconds each. Adding a name needs a measured reason in a code comment. A test fails if any entry goes over 60 seconds.
- **Drop threshold (S7):** a site is flagged when its 3-day median drops by at least `max(10, the site's measured range)`. A site with no measured range uses 10. See `dropThreshold` in `lib/score-drop.ts`.

## Alternatives rejected

- **A higher timeout for every request:** a hung request on a fast API would then hold the run for up to a minute.
- **One higher threshold for every site** (for example, 15): quiet sites would need a bigger drop than necessary before a real problem was caught.
- **A threshold equal to the range, even below 10:** a very steady site (range 0 or 1) would be flagged by tiny changes, contrary to the PRD's 10-point rule.

## Consequences

- **The 10-minute run cap gets tighter.** One PageSpeed call can now wait up to 60 seconds, so with 3 retries one site could take about 4 minutes. When Site Doctor's daily audit is built, it needs a run-level deadline: stop starting new PageSpeed calls well before the 10-minute cap, and report the sites it skipped.
- **Each site needs a stored range.** Until the `sites` table has a column for it, the measured ranges stay in SP2's results and `dropThreshold` defaults to 10.
- **Ranges can go stale.** A range from 5 runs on one day is a starting point. Re-measure a site if Henry rejects its flags as "not a real issue" (PRD, risk table).
