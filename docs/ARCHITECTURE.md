# Architecture (C4 model)

The C4 model draws a system at different zoom levels. **Level 1, context:** the system as one box, and the people and outside systems it talks to. **Level 2, containers:** the separately running pieces inside it (apps, scripts, databases). Levels 3 and 4 (components and code) are left to the phase diagrams in `docs/diagrams/`.

These use Mermaid's C4 syntax, which GitHub renders. Mermaid marks C4 support as experimental, so if a diagram doesn't render, the tables below each one say the same thing.

Decisions behind each piece are in `docs/adr/`. Threats and trust boundaries are in [THREAT_MODEL.md](THREAT_MODEL.md).

## Level 1 · System context

```mermaid
C4Context
  title Agent Lab: system context
  Person(henry, "Henry", "Builds and runs Agent Lab. Approves every output")
  Person(visitor, "Visitor", "Recruiter or potential client viewing /lab")
  System(lab, "Agent Lab", "Two AI workers plus a public page that shows them working")
  System_Ext(leads, "Lead websites", "Public small-business sites. Untrusted content")
  System_Ext(clients, "Client sites", "Memory Matters, Big T's, Grass Roots")
  System_Ext(gemini, "Google Gemini API", "Free tier. Picks Lead Scout's tools, writes drafts")
  System_Ext(psi, "PageSpeed Insights API", "Performance and accessibility scores")
  System_Ext(gh, "GitHub", "Repo, Actions schedules, failure emails")
  System_Ext(hc, "Healthchecks.io", "Emails Henry if runs stop")
  System_Ext(clerk, "Clerk", "Sign-in for the admin page")

  Rel(henry, lab, "Approves, edits, rejects; reads summaries", "HTTPS, Clerk")
  Rel(visitor, lab, "Watches status and replays", "HTTPS")
  Rel(lab, leads, "Audits", "HTTPS, robots.txt respected")
  Rel(lab, clients, "Monitors", "HTTPS")
  Rel(lab, gemini, "Scrubbed page text, tool results", "HTTPS")
  Rel(lab, psi, "URLs to score", "HTTPS")
  Rel(lab, hc, "Heartbeat ping", "HTTPS")
  Rel(gh, henry, "Failure emails")
  Rel(hc, henry, "Missed-ping emails")
```

| Actor or system | Relationship |
| --- | --- |
| Henry | Approves every output in /lab/admin; receives failure alerts |
| Visitor | Reads /lab: status, replays, quality numbers |
| Lead websites | Audited by Lead Scout. Untrusted |
| Client sites | Monitored by Site Doctor |
| Gemini | Receives scrubbed public page text; returns tool calls and drafts |
| PageSpeed Insights | Scores pages |
| GitHub | Hosts the code and runs the schedules; emails on failure |
| Healthchecks.io | Emails if heartbeats stop |
| Clerk | Signs Henry in to admin |

## Level 2 · Containers

```mermaid
C4Container
  title Agent Lab: containers
  Person(henry, "Henry")
  Person(visitor, "Visitor")
  System_Boundary(gh, "GitHub Actions (public repo hju-dev/agent-lab)") {
    Container(sd, "Site Doctor", "Node 24, TypeScript, tsx", "Scheduled script: uptime, PageSpeed, links, SSL")
    Container(ls, "Lead Scout", "Node 24, TypeScript, tsx", "Hand-written agent loop, 6-tool allowlist, max 8 steps")
  }
  System_Boundary(vc, "Vercel (hju-dev site repo)") {
    Container(page, "/lab and /lab/how-it-works", "React + TypeScript (Vite)", "Floor, ticker, replay, quality stat")
    Container(api, "Public API", "Vercel functions", "/api/lab/state, /events, /replays; reads the snapshot, 60s cache, never Neon")
    Container(admin, "Admin API and /lab/admin", "Vercel functions + Clerk", "Queue, decisions, reports")
  }
  ContainerDb(db, "Neon Postgres, Agent Lab project", "lab schema", "Private tables + 4 public views, 3 roles, RLS")
  ContainerDb(redis, "Upstash Redis", "Rate-limit counters and the public /lab snapshot. Shared with the chatbot; Agent Lab uses lab: keys only")
  System_Ext(gemini, "Gemini API")
  System_Ext(psi, "PageSpeed API")
  System_Ext(hc, "Healthchecks.io")

  Rel(visitor, page, "Views")
  Rel(page, api, "Fetches JSON")
  Rel(api, redis, "Reads the public snapshot")
  Rel(sd, redis, "Publishes snapshot after each run", "built as lab_public")
  Rel(ls, redis, "Publishes snapshot after each run", "built as lab_public")
  Rel(api, redis, "Checks rate limit")
  Rel(henry, admin, "Signs in, decides")
  Rel(admin, db, "Reads and writes", "lab_admin")
  Rel(sd, db, "Writes runs and checks", "lab_agent")
  Rel(ls, db, "Writes runs, steps, drafts", "lab_agent")
  Rel(ls, gemini, "Tool loop")
  Rel(sd, psi, "Scores")
  Rel(ls, psi, "Scores")
  Rel(sd, hc, "Ping")
  Rel(ls, hc, "Ping")
```

| Container | Technology | Talks to | As role | ADR |
| --- | --- | --- | --- | --- |
| Site Doctor | Node 24 + TS on Actions | Neon, PageSpeed, Healthchecks, (Gemini only to word findings) | `lab_agent` | 0003, 0004 |
| Lead Scout | Node 24 + TS on Actions | Neon, Gemini, PageSpeed, lead sites, Healthchecks | `lab_agent` | 0001, 0002, 0003 |
| /lab pages | React + TypeScript (Vite) | Public API | — | 0006, 0013 |
| Public API | Vercel functions | Upstash snapshot only (never Neon) | — | 0006, 0011 |
| Admin API + page | Vercel functions, Clerk | Neon | `lab_admin` | 0005, 0008 |
| Neon | Postgres, separate project | — | — | 0005 |
| Upstash | Redis, one database shared with the chatbot; Agent Lab uses `lab:` keys only | — | — | 0006, 0011 |
| Alerts | GitHub emails + Healthchecks | Henry | — | 0007 |

Studio (phases 11–14) is not a container of Agent Lab: it runs locally in Claude Code on Henry's computer (ADR-0010) and only writes a public log line to /lab in Phase 14.
