# 11. Visitors to /lab read a snapshot and never wake the database

Date: 2026-10-28

## Status

Accepted. Amends ADR-0006 (the 30-second API cache). Depends on Spike SP4.

## Context

Neon's free plan bills compute while the database is awake, and the database only sleeps after about 5 minutes with no activity. An always-awake compute at the minimum size uses roughly 182 CU-hours a month against an allowance of about 100, so it runs out around the middle of the month and then refuses every query until the 1st (`docs/playbooks/neon-free-tier.md`).

This happened to one of Henry's client sites in October 2026. Three things kept its database awake: pages rebuilt every 5 minutes, browser code fetching database-backed endpoints with 10–30 second caches, and an uptime monitor hitting the home page every 5 minutes.

Agent Lab's plan had the same pattern:
- `/api/lab/state` and `/events` read Neon behind a 30-second CDN cache.
- The /lab ticker refreshed every 30 seconds while a tab was open.

With steady visitors, that means a database read every 30 seconds, which keeps Neon awake permanently.

## Decision

- **Snapshot.** At the end of every agent run, while the database is already awake, the agent connects as `lab_public`, reads the four public views and writes one JSON snapshot to Upstash Redis. Reading as `lab_public` keeps the guarantee that only public columns can leave the database.
- **The public API reads only the snapshot.** `/api/lab/*` reads from Upstash, never from Neon, with `Cache-Control: public, s-maxage=60, stale-while-revalidate=600`. A code rule and a test stop any public route from importing the database client.
- **Refresh.** /lab refreshes every 60 seconds while the tab is visible and pauses when it's hidden. That only touches Upstash and the CDN.
- **Old replays never change,** so a replay older than the snapshot is served with a 1-day cache. The featured replay is part of the snapshot.
- **Admin pages read Neon directly.** That's a person doing something, which is an acceptable reason to wake it. Admin pages never poll.
- **Weekly Neon usage check.** A GitHub Actions job runs every Monday at an odd minute and fails, which emails Henry, if projected use is over 70% of the allowance. It never prints the project ID or the key.
- **Site Doctor checks static URLs.** For sites with a database, the hourly uptime check hits a static URL such as `/robots.txt`, never a page or API that queries the database.

## Consequences

- **Neon wakes only for agent runs and Henry's admin use.** Visitors never wake it. Hourly Site Doctor writes are the biggest remaining cost: one wake an hour is roughly 5–8 minutes awake, so about 10% of the month. SP4 measures this. If SP4's projection is over 40 CU-hours, uptime results are buffered in Upstash and written to Neon once a day.
- **/lab data is up to one run plus 60 seconds old.** That's honest, because nothing changes between runs.
- **One more secret** (an Upstash write token in GitHub Actions), and a new rule for the leak test: it now checks the snapshot.
- **One more key** for the weekly check (`NEON_API_KEY`). Use the narrowest-scoped key Neon offers, and check Neon's docs for project-scoped keys before creating it.
- **Rate-limit traffic grows a little in Upstash.** It's checked monthly with the other free-tier usage.
