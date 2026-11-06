# Handoff: where the last session stopped

**Read this first in every new session**, before the rest of the "Read these first" list in `CLAUDE.md`. At the end of a session, Claude rewrites this file: what's done, what's next, and what the next session must not forget. Keep it to one screen; detail belongs in the build journal and the other docs.

Last updated: Nov 5, 2026, about 23:15 ICT.

## State

- **Phases 1–2: done and live.** Site Doctor runs on production (hourly at :37, audit 05:41 ICT, Neon usage Mondays). Scheduled runs are often skipped or late (see SP3 below).
- **Phase 3 (public API): merged and live.** `GET /api/lab/state` in the site repo ([hju-dev/portfolio#1](https://github.com/hju-dev/portfolio/pull/1)): reads `lab:snapshot` from Upstash with the `lab_api` user (`get`/`incr`/`expire` on `lab:*` only, Vercel env `LAB_UPSTASH_REDIS_REST_TOKEN`), never Neon; 60 s CDN cache (a repeat request is a `HIT`), 30 requests/min per hashed IP. Checked on the preview: real snapshot, 100 requests → 429s.
- **Phase 4 v1 (/lab): merged at about 23:10 ICT, Nov 5** ([hju-dev/portfolio#2](https://github.com/hju-dev/portfolio/pull/2)). Source in `lab-app/` (React + TS + Vite), built into the git-ignored `lab/` and served at `hju-dev.vercel.app/lab`. Also: an Agent Lab card on `projects.html`, an "agent lab" link in the dashboard nav, and the chat's knowledge updated. Checked on the preview with real data; **production not yet confirmed.** On Nov 6 the third station was renamed "Approval Desk" (status "WAITING FOR APPROVAL"), [hju-dev/portfolio#3](https://github.com/hju-dev/portfolio/pull/3).
- **Agent-lab `main`:** speed overrides in `CLAUDE.md` (#14), `neon-usage` prints "Last active" (#14), ADR-0016 (#15).

## Next, in order

1. **Henry confirms production:** `/lab` loads, the projects card works, home and chat work, `/node_modules/react/package.json` is a **404** (if it serves the file, fix at once with a `vercel.json` redirect), and the dashboard shows "agent lab". Then Henry runs `npm run ingest` in the site repo.
2. **Record SP3, SP4, SP6** (their 48 hours are over) in `docs/SPIKES.md` and `docs/EVIDENCE_LEDGER.md`, then delete `spike-schedule.yml` and `sp6-fail.yml`.
   - **SP3 fails:** about 15 of 96 runs started, with gaps of 6+ hours. Apply its fallback: "about hourly, best effort" (already in /lab's copy and stale badge at 3 h), Healthchecks grace to match. Note the GitHub Actions outage on Nov 4.
   - **SP6 part 1:** GitHub sent no failure email (only an in-app notification). Henry turned on email notifications for Actions on Nov 5; check whether a later sp6-fail run emailed him, else apply the fallback (GitHub mobile push).
   - **SP4:** run `neon-usage` for the 48-hour numbers; the 30-minute "Neon stays asleep" check was started by Henry on Nov 5 but its result wasn't reported.
3. **Phase 3/4 leftovers:** the 30-minute Neon check result; Lighthouse CI on /lab; DONE_CHECKS' header check greps `s-maxage=60`, which Vercel strips from what the browser sees, so propose the `MISS`→`HIT` test instead (dated note); safeguards register (S1, S31, S41, P3).
4. **Phase 4 v2:** new snapshot fields (sites monitored, 30-day uptime, runs this week) and the site board and ticker.
5. **Batched paperwork** before interview prep: journal entries and diagrams for phases 2–4.

## Decisions in force

- **Speed overrides (Henry, Nov 5):** no confirmation at session start, defaults over questions, paperwork batched, Claude merges its own PRs once CI passes. Safety, privacy, cost and legal rules unchanged. See `CLAUDE.md`.
- **ADR-0016:** Phase 5's admin screens are pages in Henry's existing dashboard, not a new /lab/admin.
- **American English everywhere** (a CI test enforces it). `docs/` is the only source of truth.

## Gotchas

- **This cloud session can't reach `*.vercel.app`, vercel.com, upstash.com, Neon or client sites.** Henry checks previews in his browser (previews need his Vercel login, so curl gets a 302). Database checks run in Actions or on his machine.
- **Vercel serves real files before rewrites.** Never put a source folder at a path you want to rewrite (that's why /lab's source is `lab-app/`). With a `buildCommand`, `outputDirectory: "."` keeps the site served from the repo root.
- **Upstash ACL:** `ACL GENTOKEN <user>` takes a user name on this database.
- **The portfolio clone is shallow:** set the upstream for a new branch, or hooks report "unpushed" commits that are already on GitHub. Pushes there sometimes fail with a bare "(failure)"; retry with waits.
- Role passwords are letters and digits only; psql on Windows ends lines with `\r\n`; `lab_agent` inserts use `on conflict do nothing` with no named columns.
- **Henry's machine:** Windows, PowerShell, repos at `C:\Users\h\agent-lab` and `C:\Users\h\HJU.dev`. `.env` / `.env.prod` are git-ignored.
