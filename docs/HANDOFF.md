# Handoff: where the last session stopped

**Read this first in every new session**, before the rest of the "Read these first" list in `CLAUDE.md`. At the end of a session, Claude rewrites this file: what's done, what's next, and what the next session must not forget. Keep it to one screen; detail belongs in the build journal and the other docs.

Last updated: Nov 11, 2026, about 15:30 ICT.

## State

- **Phases 1–2: done and live.** Site Doctor runs on production, but GitHub starts only about 1 in 6 hourly slots (SP3 failed). Per ADR-0017 that's now described as "several times a day, best effort". Phase 2's "3 days of runs" check passes (daily successful runs since Nov 5).
- **Phase 3 (public API): live.** `GET /api/lab/state` in the site repo ([hju-dev/portfolio#1](https://github.com/hju-dev/portfolio/pull/1)): reads `lab:snapshot` from Upstash with the `lab_api` user (`get`/`incr`/`expire` on `lab:*` only, Vercel env `LAB_UPSTASH_REDIS_REST_TOKEN`), never Neon; 60 s CDN cache, 30 requests/min per hashed IP.
- **Phase 4 v1 (/lab): live, confirmed by Henry on Nov 11** (/lab and the projects card work). Source in `lab-app/`, built into the git-ignored `lab/`. Third station renamed "Approval Desk" ([hju-dev/portfolio#3](https://github.com/hju-dev/portfolio/pull/3)).
- **Spikes all recorded (Nov 11):** SP3 fail (15 of 96), SP4 pass (5.8 CU-h projected), SP6 pass (emails in about a minute). Spike workflows deleted (#17).
- **ADR-0016:** private admin = pages in Henry's dashboard. **ADR-0017:** "several times a day", stale after 12 h.

## Next, in order

1. **Henry, on his machine:**
   - Apply migration 005 to production the same way as 001–004: `node --env-file=.env.prod scripts/migrate.ts <owner-URL variable>` in `C:\Users\h\agent-lab` (take a `pg_dump` first, per S21). It changes Site Doctor's label to "Several times a day".
   - Run `npm run ingest` in the **site** repo (`C:\Users\h\HJU.dev`, not agent-lab).
   - Set Healthchecks `agent-lab heartbeat` to period 1 hour, grace 11 hours.
   - Check that `https://hju-dev.vercel.app/node_modules/react/package.json` is a **404**. If it serves the file, fix it at once with a `vercel.json` redirect.
2. **ADR-0017's site-repo half:** the stale badge at 12 h, plus the "several times a day" copy on /lab, the projects card and in `content/site-content.md`.
3. **Phase 3/4 leftovers:**
   - the one-hour `/api/lab/state` no-wake test
   - Lighthouse CI on /lab
   - DONE_CHECKS' header check greps `s-maxage=60`, which Vercel strips from what the browser sees, so propose the `MISS`→`HIT` test instead (dated note)
   - the safeguards register (S1, S31, S41, P3)
4. **Phase 4 v2:** new snapshot fields (sites monitored, 30-day uptime, runs this week), plus the site board and ticker.
5. **Batched paperwork** before interview prep: journal entries and diagrams for phases 2–4.

## Decisions in force

- **Speed overrides (Henry, Nov 5):** no confirmation at session start, defaults over questions, paperwork batched, Claude merges its own PRs once CI passes. Safety, privacy, cost and legal rules unchanged. See `CLAUDE.md`.
- **ADR-0016:** Phase 5's admin screens are pages in Henry's existing dashboard, not a new /lab/admin.
- **ADR-0017:** Site Doctor is "several times a day, best effort"; /lab's stale badge and the Healthchecks alert both fire after 12 hours.
- **American English everywhere** (a CI test enforces it). `docs/` is the only source of truth.

## Gotchas

- **This cloud session can't reach `*.vercel.app`, vercel.com, upstash.com, Neon or client sites.** Henry checks previews in his browser (previews need his Vercel login, so curl gets a 302). Database checks run in Actions or on his machine.
- **Vercel serves real files before rewrites.** Never put a source folder at a path you want to rewrite (that's why /lab's source is `lab-app/`). With a `buildCommand`, `outputDirectory: "."` keeps the site served from the repo root.
- **Upstash ACL:** `ACL GENTOKEN <user>` takes a user name on this database.
- **The portfolio clone is shallow:** set the upstream for a new branch, or hooks report "unpushed" commits that are already on GitHub. Pushes there sometimes fail with a bare "(failure)"; retry with waits.
- Role passwords are letters and digits only; psql on Windows ends lines with `\r\n`; `lab_agent` inserts use `on conflict do nothing` with no named columns.
- **Henry's machine:** Windows, PowerShell, repos at `C:\Users\h\agent-lab` and `C:\Users\h\HJU.dev`. `.env` / `.env.prod` are git-ignored.
