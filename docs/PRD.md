# Agent Lab — PRD & Build Plan

Oct 15, 2026 · @Henry

**Source of truth:** the agent-lab repo's `docs/` folder. The claude.ai copy of this plan was archived on Nov 4, 2026 and is no longer updated. Every external fact is cited in `docs/SOURCES.md`, and every claim's evidence status is in `docs/EVIDENCE_LEDGER.md`.

Setting up and using it, step by step: `docs/OPERATOR_MANUAL.md`.

## Overview

Agent Lab is a small team of AI agents that do real freelance groundwork, plus a public **/lab** page on hju-dev.vercel.app where visitors can watch them work or replay a recent run. It has two jobs, in order: help you win and keep freelance clients now, to build paid experience, then serve as proof in your applications for a Bangkok job offer. It shows three things hiring teams look for: a real tool-using agent, a measured improvement in AI output quality, and a system that runs safely with a human in charge.

- **Problem:** A static portfolio shows finished work. It doesn't show a system running, or how you work with AI day to day. A plain script with one API call wouldn't convince a technical interviewer either.
- **The two agents differ on purpose:** Site Doctor is a plain scheduled script, because monitoring needs no judgment. Lead Scout is a real agent that chooses its own tools, because audits do. Explaining that choice is part of the pitch.
- **v1 ships:** both agents, a human approval step, quality tracking, run replays, alerts for you, monthly client health reports, the public /lab page and a private admin page.
- **First launch comes early:** Site Doctor plus the /lab page goes live after phase 4, so something is on your résumé within the first few weeks. Everything else is added on top.
- **Budget:** $0 a month, all on free tiers. Their limits are listed under Open questions and need checking before you build.
- **Success (proposed):** /lab shows activity every day for 30 days in a row. The share of drafts approved without edits rises month over month, and that number is shown publicly. Site Doctor catches at least one real client issue. One client receives a monthly health report as part of a paid care plan.
- **Out of scope for v1:** sending pitches automatically, scraping freelance platforms, agents changing client sites, true real-time (websockets), more than two agents.

## Product requirements

v1 has twelve features: two agents, the plumbing behind them, the public views, and the parts that make it hireable and sellable. Each one lists what it must do and how you'll know it's done.

### F1 · Site Doctor agent

Watches every site you're responsible for and flags problems before the client notices. It's deliberately a plain scheduled script with no agent loop, because monitoring follows fixed rules.

- Hourly: checks each active site is up (HTTP status and response time). For sites with a database, it checks a static URL such as /robots.txt, never a page or API that queries the database, because frequent uptime checks can keep a client's Neon database awake (Neon playbook).
- Daily: runs a full check. That means SSL days left, Google PageSpeed scores (performance, accessibility, SEO, on mobile), and broken links on the homepage (capped at 50 links).
- When the 3-day median score drops by 10 or more (or by the site's own measured range, if that's bigger; ADR-0015), or a site is down twice in a row, it writes a short plain-English finding with Gemini. The finding goes to your approval queue as a suggested fix.
- **Done when:** a deliberately broken test URL shows as down within one hourly run, and a suggestion appears in the queue.

### F2 · Lead Scout agent

A real tool-using agent. Gemini decides which checks to run on each site, reads the results, and stops when it has enough evidence to score the site and draft a pitch. It never sends anything.

**Pitches are on hold until legal sign-off.** A `pitches_enabled` setting is off by default. While it's off, Lead Scout runs fully and you can still approve, edit and reject drafts, so quality tracking keeps working, but nothing can be marked "ready to send". You switch it on only after a Thai immigration lawyer confirms your position on freelance work.

- **Input:** URLs you add on the admin page. For now these come from freelance platforms: when a buyer's request or message links their own site, you paste it in. Lead Scout never scrapes the platforms, and automatic discovery waits until v2, because every good discovery source either costs money or breaks a site's terms.
- **Tools the agent can call:** `fetch_page` (text only, capped), `run_pagespeed`, `check_links`, `check_ssl`, `detect_platform` (Wix, WordPress, Shopify and so on) and `finish` (score plus draft). Page fetches obey robots.txt and use a user agent that links to /lab, so site owners can see who visited.
- **The loop:** the model picks a tool, your code runs it and returns the result, and this repeats until `finish` or 8 steps, whichever comes first. The loop is hand-written (about 150 lines) rather than a framework, so you can explain every line in an interview.
- **Every step is logged** with the tool used, a one-line public summary and private inputs and outputs. That log is what Run replay (F9) plays back.
- **Output:** a 0 to 100 "needs help" score with the 3 reasons behind it, and a 120-word pitch draft sent to your queue, written to the problem-first structure in Pitching rules below. Before queuing, code checks that every number and platform name in the draft appears in the tool results, and flags the draft if anything doesn't.
- **Markets:** any kind of business or organization, tested in segments. Run 2 or 3 segments at a time, for example nonprofits (warm, through Memory Matters referrals), local service businesses and small product brands, and compare approval, reply and win rates per segment before choosing where to focus. **No cold email (decided Oct 29, 2026).** Leads come from freelance platforms such as Fiverr: buyer requests, messages and orders. Every reply and proposal goes through the platform's own messaging, never by email or off-platform, and follows the platform's rules (check its terms on outside contact). Overseas buyers only, because of the work permit (ADR-0012). No Thai clients or buyers, paid or unpaid, until the lawyer confirms what your status allows.
- **Done when:** 5 URLs give 5 scored audits and 5 drafts, the step counts differ between sites (proof the agent is choosing), and no business name appears on /lab or in the Actions logs.

### F3 · Approval queue

Anything an agent wants to do goes through you first.

- Item types: pitch draft and follow-up draft (Lead Scout), suggested fix and monthly client report (Site Doctor).
- You can approve, edit then approve, or reject, each with an optional private note.
- Approving a pitch marks it ready to send and gives you a copy button. You send it yourself. The queue holds at most 20 pending items. When it's full, agents pause new work instead of piling up, and anything pending for 14 days expires.
- **Done when:** nothing an agent produces can reach anyone outside without your click.

### How the freelance business is organized

Three moves, from advice by Jamie Bridle that you've adopted (your summary of it, not his exact words). They decide how Lead Scout, Studio and the admin page are used for finding and keeping clients. Like the pitching rules, they're treated as working rules and tested against your own numbers.

**Move 1 · Design the offer around the buying decision, not your skills.** Before writing an offer for a segment, work out how a business in that segment actually says yes: who decides, who else has to agree (a nonprofit board, a business partner), what makes the decision feel safe, and what risk they're trying to avoid (wasting money, a broken site, looking foolish to their boss). Then shape the offer to remove friction at that moment. Typical friction removers to test: a fixed price and fixed scope, a short timeline, proof before they pay (the audit and a demo), a small first step, and something they can show whoever else has to approve it. Each segment gets a one-page offer sheet in `docs/OFFERS.md`, filled in from the small-business conversations in `docs/VALIDATION_PLAN.md`, not from guesses. The Studio Strategist's brief records who decides and what risk they're avoiding, and the pitch ends with a next step that feels small and safe.

**Move 2 · Organize by the customer journey.** Ask "what should I move forward today?" instead of "what should I work on today?" Every working day, do at least one thing for each of the three transformations:

| Transformation | What moves it forward | Where Agent Lab helps |
| --- | --- | --- |
| Stranger → lead | Make the problem visible: a post showing a real problem and fix, an audit, a demo | Lead Scout audits, Studio demos, /lab and devlog posts |
| Lead → client | Follow up with something new, answer questions, make the next step safe | Pitch and follow-up drafts in the approval queue |
| Client → lifetime client | Look after current clients, report on results, offer the next useful thing (a recurring care plan, a next project) | Site Doctor monitoring, the monthly client report, "next offer" ideas in the report |

The admin summary lists the oldest waiting item for each transformation, so the day's three moves are obvious. Five to ten minutes each is enough.

**Move 3 · Track the constraint, not effort.** Hours worked, posts made and tasks done don't predict income. Track one thing: where progress slows down. The admin page's pipeline view (see F8) shows, for each transformation, how many businesses entered, how many moved on, and the median days they waited. The slowest stage is the constraint, and that's where the next week's effort goes:

| Where it stalls | Likely cause | What to change |
| --- | --- | --- |
| Strangers don't become leads | The problem isn't visible enough, or the niche isn't specific enough | Sharper segment, clearer before-and-after proof |
| Leads don't become clients | The offer doesn't feel safe enough | Smaller first step, fixed price, more proof (Move 1) |
| Revenue doesn't grow from clients | Value isn't being captured clearly | A recurring offer, results shown in the monthly report, pricing by outcome |

Only one constraint at a time. Fix it, let a few weeks of data come in, then look again.

**Until the lawyer confirms your status,** the moves stay inside what's allowed now. Stranger → lead means posts about the project and Lead Scout in learning mode. Lead → client means the business conversations and drafting offer sheets, with no pitching. Client → lifetime means looking after the clients you already have (your lawyer questions already cover that existing work).

### Pitching rules

These shape every proposal, reply and follow-up Lead Scout drafts for a platform buyer. They come from freelancing advice you've adopted. They're working rules, not proven facts, so each one is measured (see `docs/EVIDENCE_LEDGER.md`).

- **Lead with their problem, not with you.** Open with one specific, verified thing that's wrong on their site. Say what it likely costs them in plain words (visitors leaving a slow page, a broken booking link), then how it gets fixed, and that you can fix it. No "Hi, I'm Henry, a web developer" opener, and no portfolio link in the first lines. Every claim must come from the tool results (the evidence check).
- **Follow up with something new, never "just following up".** If a sent pitch gets no reply, Lead Scout can draft a follow-up with a fresh, useful reason to write: a re-check that found something new or changed, a small fix they can make themselves, or a short before-and-after from a similar site. Code rejects any draft containing "just following up", "checking in", "circling back", "touching base" or "bumping this" before it reaches your queue.
- **Starting limits, to be tested:** the first follow-up about a week after the pitch, at most 2 follow-ups, and none after a reply or an opt-out. Follow-ups are messages inside the platform, never emails, and follow that platform's limits on messaging buyers.
- **How it's tracked:** when you send a pitch yourself, you mark it sent with the date. Drafts carry a kind (pitch or follow-up) and a touch number, and the admin quality page shows reply rate per touch and per segment. Keep what gets replies; drop what doesn't.
- **Held like pitches:** follow-ups sit behind `pitches_enabled`, so nothing goes out before legal sign-off.

### F4 · Activity log

Every agent action is written as an event with two layers: a public one-liner (140 characters max) and private details.

- Event kinds: run started, run finished, finding, approval requested, approval decided, error.
- The public line is written by the agent's code from a template, not by the LLM, so private data can't leak into it.
- **Done when:** an automated test confirms the public API never returns a private field.

### F5 · /lab orientation

A 20 to 30 second guided intro for first-time visitors, in the style of your hero terminal.

- Five steps: scout → check → draft → Henry approves → delivered. Each step lights up the matching station on the floor behind it.
- Skip button from the first second. Plays once per browser session.
- **Done when:** a first-time visitor understands the pipeline without reading a paragraph.

### F6 · Lab floor and station detail

The main view: one station per agent, plus your desk and the client site board. Each metric can be shown or hidden per site. Wix sites can score low on mobile performance partly because of the platform itself, so the board shows a trend and a short note rather than a bare red number.

- **Each station shows:** name, role, a status light (running, idle, waiting on Henry, error) with a text label, what it's doing now in one line, last run and next run.
- **Clicking a station** opens a detail panel with its last 10 runs, this week's counts and one sample output with private details removed.
- **Approval Desk** (renamed from "Henry's desk", Nov 6, 2026) shows the counts only: waiting, approved this week, rejected this week.
- **The client site board** shows each client by name with 30-day uptime percentage, performance score and last check time. Names are fine to show, since you've confirmed that. Live up/down status stays private unless a client agrees to it, so a two-minute outage never sits on your portfolio as "DOWN".
- **Done when:** a visitor can answer "what is it doing right now?" in under 5 seconds.

### F7 · Activity ticker

A live feed of the latest 20 public events, newest first, with relative times ("3 min ago").

- Updates every 60 seconds while the tab is visible, and pauses when it's hidden. It reads the public snapshot, so the ticker never wakes the database (ADR-0011).
- A "last updated" stamp makes it obvious the page is live.
- **Done when:** a new event shows on /lab within 2 minutes of an agent run finishing.

### F8 · Quality tracking

Measures whether the AI's drafts are any good, and shows the trend publicly. This is the strongest interview story in the project.

- Each decision records the outcome (approved as-is, approved with edits, rejected), how much of the draft you changed (a 0 to 100% edit size, computed automatically), and a rejection reason from a fixed list: wrong tone, wrong facts, weak hook, bad fit, other.
- Every run records which prompt version it used, so a change in quality can be traced to a prompt change.
- /lab shows one headline figure, such as "62% approved without edits, up from 40% last month" (example numbers), with a small monthly trend. The figure always shows its sample size ("62% of 34 drafts") and stays hidden until there are at least 20 decisions, so a lucky first week can't overstate it. The admin page also breaks approval and reply rates down by segment (the lead's industry), so you can see which kinds of business respond best. A private **pipeline view** shows each customer-journey stage (stranger → lead → client → lifetime client): how many entered, how many moved on, and the median days waiting. The slowest stage is highlighted as the current constraint, with the likely cause from the table in "How the freelance business is organized". It needs only a few private fields: when a lead was contacted, replied and won, and an `engagements` table (client, start date, one-off or recurring, value) for repeat work.
- **Done when:** after 20 decisions, the admin page shows approval rate and average edit size per prompt version.

### F9 · Run replay

Solves the empty-room problem: there's always something to watch, even when every agent is idle.

- Visitors pick one of the last 10 completed runs and watch it play back step by step: each tool call, its public one-liner, the score and the hand-off to your desk.
- The latest Lead Scout replay is featured at the top of /lab. Live status becomes the second thing visitors see.
- Playback runs at about 1.5 seconds per step, with pause, step forward and restart controls.
- **Done when:** a visitor arriving at 3am with every agent idle still sees a full run play out.

### F10 · Alerts for you

You find out when something breaks or needs you, without checking /lab.

- **Daily digest email at 08:00 ICT:** queue count, runs, failures and site issues. Deferred until you own a domain, because Resend needs one. Until then the /lab/admin page shows the same summary.
- **Immediate email** when an agent fails twice in a row or a client site is down for 2 checks in a row. These come from GitHub's own failure notifications and from Healthchecks.io, not Resend.
- **Done when:** a forced failure sends an alert within one run.

### F11 · Monthly client health report

Turns Site Doctor into part of a product you sell, the care plan.

- On the 1st of each month it drafts a short report per client: uptime, scores and their trend, issues found, and what you fixed.
- The report goes to your approval queue. You add notes and approve it, and you download it from /lab/admin to send from your own email. There's no automatic email until you own a domain.
- **Done when:** Memory Matters receives one report you approved, and you can quote it in a care-plan pitch.

### F12 · Explainer and hire link

Most hiring managers will spend under a minute on /lab, and won't read code.

- A "What am I looking at?" panel, open by default on the first visit, with 3 sentences and a 60-second video walkthrough you record.
- A persistent "Hire me / Work with me" button linking to your contact section. Until a lawyer confirms your work status, it reads "Get in touch" and points to job inquiries rather than freelance work, because /lab is public and your employer and school can see it.
- A "How it's built" link to /lab/how-it-works, which has Archify diagrams of the architecture, the agent loop and the approval flow, plus the agent-versus-script reasoning. The repo README links there too.
- **Done when:** a non-technical friend can explain what the page shows after 60 seconds on it.

## Technical requirements

The agents run as scheduled TypeScript scripts in a public GitHub repo, write to Neon, and at the end of each run publish a public-only snapshot of that data to Upstash Redis. The /lab page reads the snapshot, so visitors never wake the database (ADR-0011). Nothing new to pay for. Nothing here is a tool you haven't used, except GitHub Actions, the PageSpeed API and Gemini function calling.

*Architecture (diagram in the planning doc):* GitHub Actions runs Site Doctor and Lead Scout → they call PageSpeed, Gemini and websites → they write to tables in Neon's `lab` schema → public views expose public columns only → `/lab` reads them through `/api/lab/state` (reads the snapshot from Upstash, 60s cache, rate limit; never queries Neon). `/lab/admin` (Clerk, Henry only) reads and decides on the private tables.

The agents write to every table. Visitors reach only the public snapshot, which is built from the public views at the end of each run. You're the only one who can get to the private tables, and only through the admin page.

| Layer | Choice | Why |
| --- | --- | --- |
| Agent code | Node 24 LTS + TypeScript, run with `tsx` | Same language as your Next.js client work |
| Agent loop | Hand-written, about 150 lines, no framework | You can explain every line. Frameworks hide exactly what interviewers ask about |
| Agent repo | New public repo `hju-dev/agent-lab` | The code is part of the portfolio |
| Scheduler | GitHub Actions scheduled workflows: hourly uptime, daily audits, monthly reports | Free for public repos on standard runners (verified Oct 17, 2026). Vercel Hobby cron runs at most once a day (verified), too limited for hourly checks |
| LLM | Gemini API free tier with function calling (tool use) for Lead Scout, plain calls for findings and reports | Already in use for the chatbot. Check that function calling is on the free tier |
| Site checks | PageSpeed Insights API v5, plain `fetch` for status and links, Node `tls` for SSL | Free with an API key |
| Email | GitHub's built-in failure emails plus Healthchecks.io for now (ADR-0007). Resend later | Resend requires a verified domain you own to send email (checked Oct 17, 2026). Revisit when you buy one |
| Database | Neon Postgres, new `lab` schema in a new Neon project | Already in use. A separate Neon project from the chatbot, because the free plan's 100 compute-hours are per project (ADR-0005) |
| Public API | Vercel functions under `/api/lab`, reading a public snapshot from Upstash, CDN-cached for 60 seconds. They never query Neon | Neon's free compute only lasts if the database can sleep: it bills while awake and sleeps after 5 minutes idle. Visitors never wake it (ADR-0011, Neon playbook) |
| Rate limiting | Upstash Redis, already set up for the chatbot. Also holds the public /lab snapshot | Public endpoint has no login |
| /lab page | React + TypeScript built with Vite, in a `lab/` folder of the site repo, using the site's `style.css` tokens (ADR-0013) | Shows React, the main skill entry-level front-end roles ask for, on the page recruiters open. You already know it from Raeng |
| Admin login | Clerk, locked to your user ID only | You've used it on Big T's and Grass Roots |
| Tests | Vitest | The public-data leak test and the URL safety test are required |

### Environment variables

- **Agent repo (GitHub Actions secrets):** `DATABASE_URL_AGENT`, `DATABASE_URL_PUBLIC` (read-only, to build the snapshot), `GEMINI_API_KEY`, `PAGESPEED_API_KEY`, `HEALTHCHECK_URL`, `UPSTASH_SNAPSHOT_URL` and `UPSTASH_SNAPSHOT_TOKEN` (write the snapshot), `NEON_API_KEY` and `NEON_PROJECT_ID` (weekly usage check)
- **Site (Vercel):** `DATABASE_URL_ADMIN`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `ADMIN_USER_ID`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. There's no public database URL, because the public API never connects to Neon. Resend keys wait for a domain (ADR-0007).

### Security non-negotiables

These carry over from your `security_protocol.md`, plus two risks specific to agents.

- **Three database roles, least privilege.** Agents can insert and update but never delete. The public role can only read public views. The admin role is the only one that touches approvals.
- **Admin checks on the server, every call.** Each admin API route verifies the Clerk session and that the user ID matches `ADMIN_USER_ID`.
- **Public endpoints are GET-only.** They're rate limited to 60 requests a minute per IP, same-origin only, and accept no parameters except a run ID for replays. Their rate limit uses its own key prefix in Upstash, so traffic to /lab can't use up the chatbot's limit.
- **GitHub Actions logs are public in a public repo.** Agent scripts must never print business names, emails, page content or drafts to the console. Log counts and IDs only. Before any public\_text is saved, a check rejects it if it contains a URL, an email address or a lead's business name.
- **Website content is untrusted input.** A page can contain instructions aimed at the AI. Strip the HTML, cap it at 4,000 characters, and wrap it as data in the prompt. Remove email addresses and phone numbers first: on Gemini's free tier, Google may use inputs to improve its products and human reviewers may read them, and the terms say not to send personal information. The agent can only call the six tools on its allowlist. Its output only ever goes to your approval queue, and nothing it writes is executed or sent.
- **The agent can't be steered to internal addresses.** Because the model chooses which URLs to fetch, `fetch_page` only allows http and https, blocks private and local IP ranges, follows at most 3 redirects, and only fetches pages on the lead's own domain. A Vitest test covers each rule.
- **Cost guardrails.** At most 8 steps per lead, 10 leads a day and 40 Gemini calls per run. A run stops after 5 consecutive API errors. Every LLM call goes through one wrapper file with a pinned model version, and tool arguments are validated with zod before anything runs. That makes swapping Gemini for another provider a one-file change.
- **Client emails go through you.** The system never emails clients. Approved reports come to you, and you forward them yourself.
- **Keep secrets and dependencies clean.** Turn on GitHub secret scanning and Dependabot in both repos.

### Reliability safeguards

**Keep Neon asleep.** The free plan's compute bills while the database is awake, and it only sleeps after 5 minutes idle, so anything that touches it every few minutes uses up the month by about day 16. The rules, from `docs/playbooks/neon-free-tier.md` and ADR-0011:
- Visitors read a snapshot, never Neon.
- Monitors check static URLs.
- Admin pages don't poll.
- Scheduled jobs run no more often than hourly.
- Previews use the development branch, and idle branches are deleted.
- A weekly check fails if the month's projected use passes 70% of the allowance.
- A 402 "quota exceeded" error is caught, shown plainly and reported once.

These are standard fixes for problems that hit almost every scheduled system. Each one is tracked in the build journal's safeguards register, with where it lives in the code and how it's tested.

- **No overlapping runs:** each workflow has a GitHub Actions `concurrency` group, so a slow run and the next scheduled one never write at the same time. Schedules run at odd minutes such as :17 and :43, because GitHub says runs can be delayed under load, especially at the start of each hour, and queued jobs can even be dropped.
- **Safe to retry:** unique keys and insert-or-ignore writes, so a retried run never creates duplicate rows.
- **Nothing hangs:** a 10-second timeout per request (named slow APIs such as PageSpeed get up to 60; ADR-0015) and a 10-minute cap per run.
- **Flaky APIs don't fail a run:** up to 3 retries, waiting longer each time.
- **Fail fast on bad setup:** a zod check of every environment variable at startup, with a plain error message if one is missing.
- **Tracked database changes:** numbered SQL migration files only, never hand edits. The dev branch can be rebuilt from them at any time.
- **One clock:** times are stored in UTC and shown in ICT.
- **Same install everywhere:** a committed lockfile, `npm ci` in Actions and a pinned Node version.
- **Test prompts before they go live:** a saved set of tool results from 10 sites lets you compare prompt versions offline before switching. This doesn't spend PageSpeed quota, though it still uses Gemini calls.
- **Know whether /lab works for recruiters:** GA4, which you've already set up for Grass Roots, tracks visits, replay plays and Hire me clicks.
- **Third-party skills:** read Archify's files before installing it, install it per project rather than globally, and note the version in the README.

## App flow

Visitors get one public page with an orientation, a floor and two detail panels. You get one private admin page. Every view also needs a loading state and a broken state, so the page never shows up blank.

### Public pages

1. **Homepage entry.** A new card in `// 03 — projects` ("Agent Lab · live") and a `lab` link in the nav. Both go to /lab.
2. **/lab, first visit.** The header loads first: section tag `// lab`, the title, a one-line explainer, a pulsing "live" dot and the "Hire me" button. The "What am I looking at?" panel is open, with 3 sentences, the 60-second video and a "Start the tour" button. The orientation plays when they click it or close the panel.
3. **/lab, the floor.** This is where return visits land. From top to bottom:
   - **featured replay:** the latest Lead Scout run, ready to play
   - **stats strip:** runs this week, sites monitored, 30-day uptime, drafts approved without edits
   - **station grid:** Site Doctor, Lead Scout, Approval Desk
   - **client site board**
   - **activity ticker**
   - **footer:** "How this is built", linking to the repo README
4. **Replay player.** Pick any of the last 10 runs from a station's panel or the featured slot. Steps play one at a time beside a progress rail, with pause, step and restart. The URL changes to `/lab#replay-<id>` so a run can be shared in a job application.
5. **Station detail.** Click a station and a panel slides in from the right on desktop, or up from the bottom on mobile. It shows the role, the schedule, the last 10 runs (each with a Replay button), this week's counts and one sample output. Esc or Close returns focus to the station.
6. **Site detail.** Click a row on the client site board for a small panel: 30-day uptime, latest scores and their trend, last check time.
7. **Quality detail.** Click the "approved without edits" stat for the monthly trend, the share of each rejection reason, and one line on what changed in each prompt version.

### States every public view handles

- **Loading:** gray outline stations, no spinners.
- **API unreachable:** keep showing the last data and add a "reconnecting" badge. Never a blank page.
- **Agent not run yet:** "First run scheduled for 14:00 ICT."
- **Agent error:** red light plus a public message ("Run failed. Retrying next hour."). No error details or stack traces.

### Private admin (/lab/admin)

1. **Sign in** with Clerk. Anyone who isn't you gets a 403 from the server, not just a hidden page.
2. **Queue.** Pending items, oldest first, filterable by type (pitch, fix or client report).
3. **Item view.** The draft, its context (audit summary, the agent's steps, or the site check) and three actions: approve, edit and approve, or reject. Rejecting requires a reason from the fixed list. The edit size is recorded automatically.
4. **After approving a pitch.** A copy button, then "Mark as sent" once you've sent it yourself. Later you can log the outcome: replied, call booked, won or lost.
5. **After approving a client report.** It's ready to download from the admin page, formatted for you to send from your own email.
6. **Add leads.** Paste up to 10 URLs with a country and industry each. Lead Scout picks them up on its next run.
7. **Quality.** Approval rate, average edit size and rejection reasons per prompt version, plus a box to log a new prompt version with a one-line note.
8. **Sites.** Switch monitored sites on or off, set each one's public visibility, decide whether live up/down status shows, and save the client's report email.

*Approval flow (diagram in the planning doc):* Agent drafts → Waiting in queue → Henry decides → (approve or edit) Approved → copy button → You send it → you mark it → Marked sent; or (reject + reason) Rejected.

Every pitch and suggested fix follows this path. Agents can only add to the queue, and only you can move anything out of it.

## Design brief

/lab is a control room laid out as a floor plan on the grid your site already draws behind every page. Stations sit on that grid like workbenches, so it feels like part of hju-dev, not a separate app. Everything uses your existing tokens from `style.css`. The only new things are four status states and a few components.

### Concept

- **Open floor:** the visitor looks down on a working room. Each agent has a bench, and you have a desk at the end of the line where work stops for approval.
- **Orientation:** reuses your hero terminal. Five lines type out, and each one lights up the bench it describes.
- **Avoid:** film references, robot or brain imagery, 3D, emoji, and the words "autonomous" and "AI-powered" in headlines.

### Tokens

| Token | Value | Use on /lab |
| --- | --- | --- |
| `--bg` | #0a0e0a | Page |
| `--bg2` | #0f140f | Station cards, site board |
| `--bg3` | #141a14 | Detail panel, orientation overlay |
| `--green` | #00ff88 | Running, live dot, primary buttons |
| amber | #fbbe32 | Waiting on Henry (same as your "learning" tag) |
| blue | #7baeff | Idle or scheduled (same as your "exploring" tag) |
| red | #ff5f57 | Error, site down (same as the terminal's red dot) |
| `--text` / `--text-dim` | #c8d8c8 / #6a8a6a | Body / timestamps and labels |
| `--border` / `--border-hover` | green at 15% / 40% | Card edges, hover |

Type stays as it is: JetBrains Mono for names, numbers, statuses and the ticker, and Inter for explanatory sentences.

### Status is never color alone

Each state has its own shape and a text label, so it reads in grayscale and for color-blind visitors.

| State | Light | Label |
| --- | --- | --- |
| Running | Solid green dot, slow pulse | RUNNING |
| Idle | Hollow blue ring | IDLE · next 14:00 |
| Waiting | Solid amber dot | WAITING FOR APPROVAL |
| Error | Red square | ERROR · retrying |

### Components

- **Reuse:** `.stat-card` (stats strip), `.tag`, `.btn` (Hire me is `.btn-primary`), `.terminal` (orientation and replay steps), `.section-tag`.
- **New:** `.station`, `.status-light`, `.panel` (detail drawer), `.ticker-row`, `.site-row`, `.replay` (player), `.replay-step`, `.explainer`.

### Replay player

The featured replay is the first thing on the floor, so it gets the most design care.

- **Layout:** a terminal-style window on the left where each step types in as a line (`> run_pagespeed → mobile score 41`). A vertical progress rail on the right lists every step as a dot, with the current one in green.
- **The final step** shows the score in large mono type and an amber "Sent to the Approval Desk" line, so every replay visibly ends with you in charge.
- **Controls** are mono text buttons, not icons alone: `pause`, `step`, `restart`.
- **Run info** sits above the window: agent, relative date, step count and the anonymized lead label ("bakery, US").

### Explainer panel

- A `--bg3` card with 3 short sentences, a 16:9 video thumbnail and two buttons: "Start the tour" and "Skip".
- It closes into a small `?` button in the header so visitors can reopen it.
- The video is hosted on YouTube (unlisted) or Loom and only loads when clicked, so it doesn't slow the page.

### Layout and motion

- **Width:** /lab goes up to 1100px wide, compared with 860px elsewhere. Stations sit 3 across on desktop, 2 on tablet and 1 on phones (360px minimum).
- **Detail panel:** 420px from the right on desktop, a bottom sheet at 85% height on mobile.
- **Motion:** a 2-second pulse on running lights only. New ticker rows fade in over 0.4 seconds, and the panel slides in over 0.25 seconds.
- **Reduced motion:** with `prefers-reduced-motion` on, nothing pulses or types. The orientation becomes a static 5-step list.

### Copy voice

Short, factual, present tense, with the agent as the subject: "Site Doctor checked 4 sites. All up." Show times as relative ("3 min ago") with the exact ICT time on hover.

### Accessibility

- Every station and site row is a real `<button>`.
- The detail panel is a dialog that traps focus and closes on Esc.
- The ticker uses `aria-live="polite"` and announces at most once a minute.
- All text colors pass WCAG AA (4.5:1) on both backgrounds. The weakest is `--text-dim` on `--bg2` at 4.84:1, so never put it on anything lighter.

## Backend schema

Everything lives in a new `lab` schema in its own Neon project. Each table splits public columns from private ones, and visitors only ever reach the public columns, through four views. Client data such as site check details, lead names, URLs and drafts never leaves the admin role.

### Tables

| Table | Public columns | Private columns |
| --- | --- | --- |
| `agents` | id (slug), name, role, schedule\_label, enabled | none |
| `prompt_versions` | id, agent\_id, label (v1, v2…), created\_at, note (one line on what changed) | prompt\_text |
| `runs` | id, agent\_id, prompt\_version\_id, status (running / succeeded / failed / waiting), started\_at, finished\_at, public\_summary (140 characters max), metrics (counts only, JSON) | error\_detail, tokens\_used |
| `run_steps` | run\_id, step\_no, tool, public\_text (one line), duration\_ms | input (JSON), output (JSON) |
| `events` | id, agent\_id, run\_id, kind, created\_at, public\_text (null means hidden) | private\_payload (JSON) |
| `sites` | id, name, url, is\_public, show\_live\_status, active | report\_email, notes |
| `site_checks` | site\_id, checked\_at, is\_up, response\_ms, perf\_score, a11y\_score, seo\_score | ssl\_days\_left, broken\_links (list), raw\_report (JSON) |
| `leads` | public\_label ("bakery, US"), score, status, created\_at | business\_name, url, country, industry, audit (JSON), reasons, outcome (replied / call booked / won / lost), contacted\_at, replied\_at, won\_at |
| `approvals` | kind (pitch / fix / report), status (pending / approved / rejected / sent), created\_at, decided\_at | subject\_id, draft, edited\_draft, decision\_note |
| `evaluations` | approval\_id, prompt\_version\_id, outcome (as-is / edited / rejected), edit\_size (0–100), reject\_reason, decided\_at | none |
| `client_reports` | site\_id, month, status | body, sent\_to, sent\_at |

`sites` rows with `is_public = false` are dropped from the public views entirely.

### Public views

- **`lab.public_state`:** agents with their latest run, the stats strip (including the "approved without edits" headline), the approval counts for the Approval Desk and the site board. Live up/down is included only for sites with `show_live_status = true`.
- **`lab.public_events`:** the latest 50 events where `public_text` is not null.
- **`lab.public_replays`:** the last 10 completed runs per agent, with each step's tool, public\_text and duration, and the lead's public\_label. Nothing else.
- **`lab.public_quality`:** monthly approval rate, average edit size, the share of each rejection reason, and each prompt version's label and note.

### Who can do what

| Data | Visitors (`lab_public`) | Agents (`lab_agent`) | Henry (`lab_admin`) |
| --- | --- | --- | --- |
| Public views | Read | Read | Read |
| runs, run\_steps, events, site\_checks | No access | Insert, update own rows | Read |
| leads | No access | Insert, update | Read, update, add URLs, log outcomes |
| approvals | No access | Insert only | Read, decide |
| evaluations | No access | No access | Written automatically when you decide |
| client\_reports | No access | Insert drafts | Read, approve, send |
| prompt\_versions | No access | Read | Read, add |
| sites | No access | Read | Read, update |
| Delete anything | No | No | Yes, by hand only |

RLS is on for every table, in line with your habit. Each role gets its own connection string, so a leaked public key can't read private data.

### Retention

- **Events, runs and run steps:** 90 days. Replays only use the last 10 runs, so nothing visible is lost.
- **Site checks:** 180 days, enough for uptime and score trends.
- **Evaluations and prompt versions:** kept indefinitely. They're small, and they are the quality history.
- **Client reports:** 2 years, as a record of what you told each client.
- **Rejected leads:** deleted after 30 days. Leads with no outcome after 6 months are deleted too. These are real businesses that never agreed to be in your database, so keep the minimum.
- A daily cleanup job handles this, running as the admin role inside the Site Doctor workflow.

## Implementation plan

The build runs in ten phases across three stages, and each phase ends with a check that has to pass before the next starts. The first public launch comes after phase 4, so a working /lab with real data is on your résumé early. The agent, replays and quality tracking come next. They handle the most private data, so the leak test has to exist first.

*Roadmap (diagram in the planning doc):* Stage A · Launch the lab (phases 1–4) → gate: First launch → Stage B · Add the agent (phases 5–7) → gate: Agent live → Stage C · Prove it, sell it (phases 8–10) → gate: Full launch after 30 days.

### Two-week sprint

**Revised Oct 29, 2026: about 3 hours a week until the November 30 job-search review.** The two-week break is over, so the table below is the original full-time plan, kept for reference. Until Nov 30, Agent Lab gets about 3 hours a week so it doesn't crowd out job applications. The Nov 30 target is a small but real first launch, not all of Stage A:

1. Day 0: the 48-hour spikes (SP3 schedules, SP4 Neon) plus SP1 (Gemini tool calling), and the walking skeleton.
2. Phase 1 (database core) and the Site Doctor half of Phase 2.
3. A minimal /lab showing Site Doctor's live status for Memory Matters, read from the snapshot.
4. A 2-minute demo video and a short write-up: what it does, what you decide versus what the agent does, and that it costs $0.

Every phase goes through a pull request with a written description (`.github/pull_request_template.md`) and passing CI, because tests, PRs and CI are the top skill gap in the job search. Lead Scout, replay, quality tracking and Studio wait until after the review. About 13 hours may not fit all four steps; that's a guess until your past build dates are in. If it doesn't fit, ship steps 1–2 with a screenshot instead of a live page.

**Decided Nov 4, 2026:** past builds ran about 2× their estimates (`docs/PREMORTEM.md`, Part 2), so the committed Nov 30 target is steps 1–2, shown with a screenshot and a short write-up. Steps 3–4 (the live /lab and the 2-minute video) are a stretch.

You have about 2 weeks off, so the plan runs day by day. Stage A is the must-finish. Stage B is a stretch goal. Stage C mostly waits on real data (4+ weeks of decisions, 30 days of activity), so it runs after you're back at work, at about 3 hours a week.

| Days | Phase | Done when |
| --- | --- | --- |
| Before day 1 | Pre-flight checklist | Keys, repos and the Neon development branch are ready |
| 1 | 1 · Database core | The public role can't read private tables |
| 2–3 | 2 · Site Doctor and alerts | Runs are logging and a test alert arrives. Data keeps building while you work on later phases |
| 4 | 3 · Public API | The leak test passes |
| 5–6 | 4 · /lab v1 | **First launch,** plus your first LinkedIn post |
| 7 | Buffer, rest | Catch-up only, no new work |
| 8–9 | 5 · Admin and approvals | A non-admin account gets a 403 |
| 10–11 | 6 · Lead Scout agent | The eval gate, the 5-URL test and the URL safety tests pass |
| 12 | 7 · Replay and orientation | The 3am test passes |
| 13–14 | Buffer, How it works page, second LinkedIn post | Diagrams are live on /lab |
| After the break | 8–10 | Quality numbers after 4+ weeks, full launch after 30 days |

If day 7 arrives without the first launch, week 2 goes to finishing Stage A. A finished Stage A beats a half-built Stage B.

**Stage 0: prove the risky parts (day 0)**

Before Phase 1, run the six throwaway spikes in `docs/SPIKES.md`: Gemini tool calling on the free tier, PageSpeed score variance, GitHub schedule reliability, Neon compute use, tokens per Lead Scout run, and alert delivery. Then build the walking skeleton: one Site Doctor run writes one row, and /lab shows it. Each spike has a pass or fail threshold and says what changes if it fails. Start hand-labeling the eval golden set (`docs/EVALS.md`) this day too, because Lead Scout can't go live until it passes. Sprint durations are provisional until they're recalibrated from your past builds.

**Stage A: launch the lab**

1. **Database core.** Create the schema, three roles, RLS, and the agents, runs, events, sites and site\_checks tables, plus the two state and event views. Seed the 2 agents and your sites, with Memory Matters' live status switched on. Create a Neon development branch for local work and preview deploys, so testing never touches live data.
   - **Check:** connected as `lab_public`, `SELECT * FROM lab.runs` fails and `lab.public_state` returns rows.
2. **Site Doctor and alerts (F1, F10).** Hourly uptime and the daily audit run as GitHub Actions workflows, with failure emails from GitHub and Healthchecks. Each run also pings a free heartbeat monitor (Healthchecks.io is one option; check its free tier), which emails you if runs stop arriving. That catches GitHub quietly pausing the schedule.
   - **Check:** 3 days of runs logged, and a fake broken URL triggers an alert email within an hour.
3. **Public API.** Build `GET /api/lab/state` and `GET /api/lab/events` reading the public snapshot from Upstash (never Neon), with 60-second caching and rate limiting. Each agent run publishes the snapshot as its last step.
   - **Check:** the Vitest leak test passes (no private column name appears in any response), and the response headers show the cache.
4. **/lab page v1 (F6, F7, F12).** First, set up the React + Vite app in `lab/` and the Vercel build that serves it at `/lab`, and check on a preview deploy that the rest of the site and `/api` still work (ADR-0013). Then: stats strip, floor, site board, ticker, detail panels, all four states, the explainer panel and the Hire me button. Use a placeholder in the replay slot.
   - **Check:** works on a 360px phone, works with the keyboard only, Lighthouse accessibility scores 95 or higher, and a non-technical friend passes the 60-second test.
   - **First launch:** homepage card, nav link, a résumé line, and a 2-minute demo video with a short write-up. The video moves up from phase 10, so recruiters see it sooner.

**Stage B: add the agent**

5. **Admin, approvals and evaluation capture (F3, F8).** Clerk sign-in, the queue and decisions with rejection reasons and edit size, and the prompt\_versions and evaluations tables. Site Doctor findings now go through Gemini into the queue.
   - **Check:** a second Clerk account gets a 403 from the API, and every decision writes an evaluation row.
6. **Lead Scout agent (F2).** The tool allowlist, the hand-written loop, step logging and the URL safety rules.
   - **Check:** the eval gate in docs/EVALS.md passes, the 5-URL test passes, the URL safety tests pass (private IPs and other domains are blocked), and no business name appears in the Actions logs.
7. **Run replay and orientation (F9, F5).** The `public_replays` view, the replay API, the player and the featured slot, then the orientation, light pulses and the reduced-motion version. Save one strong run as a static demo file, so the replay still works if the database or API is down, for example during an interview.
   - **Check:** the 3am test passes (a full run plays when every agent is idle), and nothing animates with reduced motion turned on.

**Stage C: prove it and sell it**

8. **Quality on show (F8).** The `public_quality` view, the headline stat and its detail panel. Then improve the Lead Scout prompt for at least 4 weeks, logging each version.
   - **Check:** at least one prompt change has before and after numbers you can quote.
9. **Client health reports (F11).** The monthly draft, approval and sending.
   - **Check:** Memory Matters receives one report you approved.
10. **Full launch.** A security pass against your protocol, a README with the architecture and the agent-versus-script reasoning, the 60-second video, and a written case study.
    - **Check:** 30 days of daily activity, then the quality numbers and client result go on your résumé.

### Pre-flight checklist

- [ ] Get a PageSpeed Insights API key from Google Cloud Console
- [ ] Create the public `hju-dev/agent-lab` repo and turn on secret scanning and Dependabot
- [ ] Confirm your site repo layout (see Open questions)
- [ ] Memory Matters has approved showing their name and live status. Still to confirm: who should receive the monthly reports you forward
- [ ] Create a Healthchecks.io account and one check per workflow. Skip Resend until you own a domain
- [ ] Run the six Day 0 spikes in docs/SPIKES.md and record pass or fail
- [ ] Check the three limits only you can see: AI Studio rate limits, PageSpeed quota in Cloud Console, and Healthchecks email on free
- [ ] Create a feature branch in the site repo. No commits straight to main.

* [ ] Read through Archify's files, then install it per project in the agent-lab repo (`./.claude/skills/`) and note the version in the README. **On hold (Nov 4, 2026):** its SkillSpector scan couldn't complete, so phase diagrams use Mermaid until Henry decides, before /lab/how-it-works
* [ ] Copy the starter `BUILD_JOURNAL.md` into `docs/` in the agent-lab repo
* [ ] Set up a GA4 property or data stream for /lab

- [ ] Book a Thai immigration lawyer about freelancing on your current work permit. Pitches stay on hold until they confirm

### Build journal and diagrams

- **Build journal:** `docs/BUILD_JOURNAL.md` in the agent-lab repo, written for you as a beginner. A starter file comes with this plan, with the glossary, a 24-item safeguards register and an entry template. At the end of every phase, Claude Code adds an entry: what was built, file by file with the key lines and why they're written that way, the alternatives rejected, what broke and how it was fixed, the safeguards added and a 3-question quiz. You write the "In my own words" part and Claude Code checks it.
- **Phase diagrams:** each phase, Claude Code draws what was built as a Mermaid diagram in `docs/diagrams/phase-N.md`, which GitHub renders. (Changed Nov 4, 2026 from Archify, whose SkillSpector scan couldn't complete. Archify can still be used for the /lab diagrams if Henry approves it before then.)
- **Diagrams on /lab:** three of them (architecture, the agent loop and the approval flow) go public on a /lab/how-it-works page and are regenerated at each gate. They're snapshots of how the system is built, not live views. The floor and the replay player stay the live part.
- **Style check:** before relying on Archify publicly, check whether its output can match your dark theme and green accent. If it can't, show the diagrams in a frame styled to match.

### Kickoff prompt for Claude Code

Paste this at the start of each phase, with the phase number filled in and this doc attached.

```
Read CLAUDE.md, docs/README.md, docs/STACK.md, docs/PRD.md and docs/BUILD_JOURNAL.md.
We're starting Phase [N] (budget: [X] days). Confirm the goal and its check in
docs/DONE_CHECKS.md before writing any code.
```

The full instructions live in `CLAUDE.md` in the repo, which Claude Code loads by itself every session. The kickoff prompt only says which phase to start. It used to repeat all the rules here, but that copy kept going out of date.

## Studio: the site-building team

Studio is a team of five Claude Code subagents that turns a Lead Scout audit into a pitch-ready demo website on Next.js, following a fixed workflow with three approval gates. It runs on your laptop when you trigger it, on your Claude subscription, at no extra cost. It's packaged as a Claude Code plugin called `hju-studio`, so the workflow is the same every time and can be shown in interviews. The scope freeze is lifted for Studio, but it still starts only after the first launch, so it never puts Stage A at risk.

Which skills each role uses, how to install them safely and what to skip: see `docs/SKILLS_GUIDE.md`.

*Studio pipeline (diagram in the planning doc):* Lead audit → Strategist → Gate 1 (brief) → Copywriter → Designer → Gate 2 (direction) → Builder → Auditor (fails a check → back to Builder) → Gate 3 (final) → Preview link.

The Auditor sends failed checks back to the Builder until they pass. Only then does the demo reach gate 3.

### The team

| Role | Job | Skills and tools it uses | Output |
| --- | --- | --- | --- |
| Strategist | Turns the Lead Scout audit and a crawl of the current site into a brief | playwright-cli or Firecrawl (crawl), Lead Scout audit, SEO toolbelt exports (Search Console, Keyword Planner; STACK.md) | `brief.md`: business, audience, goal, problems found, who decides and what risk they're avoiding, content inventory, sitemap |
| Copywriter | Writes the page copy from facts in the brief only | marketingskills (copywriting, CRO), the brief's keywords (one main phrase per page, with source and date) | `copy.md`, with every invented detail marked `[CONFIRM]` |
| Designer | Proposes 2 or 3 visual directions | Taste, Impeccable, Anthropic's frontend-design, playwright-cli, the DESIGN.md format, and img2threejs only for an approved 3D moment. Starts every task with a skill check (below) | A DESIGN.md and a hero mockup (screenshotted at 3 widths) for each direction |
| Builder | Builds the chosen direction | Next.js + Tailwind, web-asset-generator (favicons, social images); the Neon playbook on any build with a database | A deployed Vercel preview |
| Auditor | Checks the build before you see it | Impeccable audit, the Neon playbook's read-only audit on any build with a database, Vercel web-design-guidelines, playwright-cli screenshots at 3 widths, Lighthouse, `/security-review`, your audit prompts | `audit.md` with pass/fail and fixes made |

You're the sixth member, with three gates: **approve the brief, pick the direction, approve the final preview.** Nothing goes to a business until you've passed all three, and pitches stay on hold until legal sign-off anyway.

**Designer skill check.** At the start of every design task, before drafting anything, the Designer tells you which of its five design skills it plans to use and why, and which it's skipping. Then it waits for your OK. If something comes up mid-task that one of them handles better, such as a direction that needs a 3D object, it stops and suggests adding it rather than improvising. The five, and when each earns its place:

| Skill | What it is | The Designer suggests it when |
| --- | --- | --- |
| Taste | Layout, type, spacing and motion variants with adjustable dials | Every task, to set each direction's style |
| Impeccable | Commands that catch common AI design flaws | Every task, to critique and polish each direction before gate 2 |
| playwright-cli | Browser screenshots from the command line | Every task, to show each hero mockup at 375, 768 and 1280 px wide, and to capture the lead's current site for comparison |
| DESIGN.md format (from Awesome Design.md) | A plain-text file describing a design system, plus a collection of such files written about real brands | Every task for the format: each direction is written as its own DESIGN.md. The brand files (Apple, Stripe and others) are for studying principles only, never copied into a demo, because those identities belong to those companies |
| img2threejs | Turns one reference image into a code-built Three.js 3D model | Only when you've approved a 3D signature moment, and mainly for Showpieces. It's heavy for small-business sites, and the demo still has to meet the mobile performance and reduced-motion rules |

**Motion sources.** As part of the same skill check, the Designer names where each direction's motion should come from and prompts you to browse for it. It asks for links, rather than browsing these sites by itself, because you choose what fits:

| Source | What it is (checked Oct 18, 2026) | The Designer suggests it when | Rules |
| --- | --- | --- | --- |
| [transitions.dev](https://transitions.dev/) | A library of 43+ UI transitions for web apps in HTML/CSS and React, copy-and-paste, plus a Motion Skill for coding agents. Some transitions are free, some "Pro only" (paid) | A direction needs page, menu, modal or list transitions. It names the moment ("the services list could stagger in") and asks you to pick a transition and paste its link or code | Free transitions only ($0 budget). Check its Terms page for client use before the first client build. Its Motion Skill gets a SkillSpector scan like any skill. Every transition must respect `prefers-reduced-motion` |
| [animos](https://animos.app/) | Browser-based motion templates (25 listed) that turn your screenshots or videos into MP4 or WebM showcase videos. Not code for websites | Presenting a finished demo: a short showcase video for the pitch, a portfolio post or LinkedIn. It fits the screenshots-and-recording default while preview hosting is undecided (ADR-0009) | Pricing and commercial terms aren't on its homepage; check before using exports in a pitch. Never put a client's unreleased work in a public post |

Two more sources (added Nov 1, 2026). **SiteReel.ai** is a library of website designs with copyable AI prompts; the Designer may suggest you browse it for layout ideas, the same way as Awesome Design.md: borrow structure, never copy a design, and check its terms first (pricing and terms weren't visible). **Anime.js** (MIT, v4) is a lightweight animation library with timelines, scroll-linked animation and SVG effects; the Builder may use it instead of GSAP when a direction's motion is simple, but only one animation library per demo. **React Bits** (reactbits.dev) is a library of animated React components (text effects, backgrounds, cards, micro-interactions) installed as source you own, through the shadcn CLI or by copying; the Designer may suggest one for a direction's signature moment, and the Builder installs it into Next.js demos. Pick the TypeScript + Tailwind variant, check what each component pulls in (some use WebGL), and keep it within the mobile performance and reduced-motion rules. Its license is MIT + Commons Clause: free for commercial use, but read its LICENSE.md before the first client build. It also fits /lab, which is built in React (ADR-0013). If none of these has what a direction needs, the Designer says so and builds the motion itself within the signature-moment rule.

**Neon rule for client builds.** Demos are static and have no database. Any client build that uses Neon follows `docs/playbooks/neon-free-tier.md`. It was written after a client site on the free plan ran out of compute in the middle of the month and stopped taking orders. The Builder follows it while writing code:
- Public pages rebuild on demand when content changes, with a 1-day safety-net timer, never every few minutes.
- Data a page needs is embedded in the page, not fetched on every view.
- Any public endpoint backed by the database gets a long cache (an hour or more).
- No polling, and no database calls in middleware.
- Uptime monitors hit a static file.
- Idle connections close quickly.
- Previews and local work use a separate branch.
- A "quota exceeded" (402) error shows a friendly message and is reported once.

**Fast-startup rule for app builds** (any client app with a login). The Builder follows `docs/playbooks/fast-app-startup.md`, so apps open fast on slow connections, not just on office wifi: show the last signed-in state straight away and check the session with the server in the background, signing out if it's no longer valid; save the home screen's data on the device and show it instantly on the next open while fresh data loads; and run independent network requests in parallel instead of one after another. The server still checks the session on every request for private data, so cached state never authorizes anything. The Auditor checks this with a throttled "Slow 4G" network trace and a repeat-open test before gate 3.

The Auditor runs the playbook's read-only audit before gate 3 and lists every wake source in `audit.md`. At launch, the client's repo gets the weekly Neon usage check and a runbook entry.

### Digital Home foundation (added Nov 12, 2026)

Every site ("Digital Home") starts from one working foundation: a Next.js starter with the back end, SEO and core functionality already built and tested. Henry hands the Designer a mood board of visual references, and Studio molds the foundation's design layer into a premium look: the speed of a template with the look of a bespoke build. The foundation's own tests run on every build. Details and what stays fixed: ADR-0018. Building the foundation is Studio's first task.

### Blueprints

Every demo starts from a page blueprint on top of the foundation, so the Designer and Builder never start blank. Each blueprint is one file, so being versatile costs one file per type of site, not a rebuild. Start with these two, then add one at a time as Lead Scout finds demand: restaurant and hospitality, small online shop, personal or professional brand, and app or SaaS landing page.

- **Service site** (local or professional service, nonprofit): hero with one promise and one call to action, services, proof (testimonials, numbers, logos), how it works in 3 steps, about, FAQ, contact or booking, location and hours.
- **Product site** (a product or app): hero with the product shown, 3 key benefits, feature detail, social proof, pricing or "how to buy", FAQ, final call to action.

### Hero layouts (added Nov 1, 2026)

The Designer picks each direction's hero from this menu, chosen for the client's industry and what a visitor needs to see first, not because a layout is popular. Across a demo's 2–3 directions, try at least two different layouts. Each `DESIGN.md` names the layout and gives one line on why it fits.

| Layout | What it is | Fits | Watch for |
| --- | --- | --- | --- |
| **Split** | The headline breaks around the product | Fintech, SaaS, single-product brands | Needs a strong product image or screenshot. On phones it stacks: headline first, then the product |
| **Full-Bleed** | Giant type over one edge-to-edge photo | Hardware and physical products, also restaurants and venues | Text must stay readable over every part of the photo (contrast of at least 4.5:1, using an overlay if needed). The photo is usually the page's largest element, so size and preload it for speed |
| **Orbit** | Headline in the middle, photos floating around it | Agencies, salons, clinics, real estate | Busy on phones: show 2–4 photos at most, or switch to a simple stack. Any floating motion respects reduced motion |
| **Gallery** | A wall of work framing the headline | AI tools, creative studios, portfolios | Many images can slow the first load: lazy-load the ones off-screen and keep the headline as text, not inside an image |
| **Wordmark** | The brand name huge, with the product layered on top | Fashion, events, creator brands | Needs a short, strong name. The name must still be real text with a proper heading, and fit at 375 px wide |

Ten concrete wireframes for these styles, plus two more styles (Bento and Centered with a shape), are in `docs/playbooks/hero-wireframes.md`, with phone order and rules for each.

These industry fits are a starting point from design advice Henry collected, not tested rules. The Blueprints still apply: one promise and one call to action in every hero. Any of these can be the demo's signature moment, but it then counts as the one moment and has to keep Lighthouse mobile performance at 90 or above. The Auditor checks the hero at 375, 768 and 1280 px, plus its contrast, and its speed using the page's largest element.

### UX laws (added Nov 1, 2026)

Every build follows `docs/playbooks/ux-laws.md`: twenty laws such as Hick's, Fitts's, Jakob's and the Doherty Threshold, each turned into a rule and a check. Each DESIGN.md names the 3–5 laws that shaped it most, and the Auditor runs every check before gate 3.

### Color (added Nov 1, 2026)

Every direction uses two base colors and one surprise accent, from `docs/playbooks/accent-palettes.md`. It holds Henry's thirteen approved palettes (an interactive library shows each on a sample page), why they work (an accent on the other side of the color wheel, opposite in temperature, the brightest color on the page, used sparingly), the contrast results, and the rules the Designer, Builder and Auditor follow.

### Design references

Your five references set the bar: [Apple](https://www.apple.com), [Stripe](https://stripe.com/en-th), [Bruno Simon (2019)](https://2019.bruno-simon.com/), [Lusion](https://lusion.co/) and [Maná Yerba Mate](https://en.manayerbamate.com/). They split into two groups, and Studio uses them differently.

- **Apple and Stripe: the default for every demo.** Confident type, generous spacing, real product imagery and restrained, purposeful motion. This suits almost any client, from a nonprofit to a product brand.
- **Bruno Simon, Lusion and Maná: the "signature moment".** Playful, interactive, 3D or game-like. Bruno Simon's and Lusion's sites are built on WebGL, which is heavy to load, hard to make accessible and slow to build. Used across a whole small-business site, it would fail your own performance and accessibility audits.
- **The rule:** each demo gets at most one signature moment, such as an interactive hero, a scroll-linked product reveal or a playful detail like Maná's. Everything else stays at Apple/Stripe restraint. The moment must respect `prefers-reduced-motion` and can't push Lighthouse performance below 90 on mobile.
- **Full WebGL work belongs in the Showpiece track below,** for example /lab's orientation, not on client demos.

Part A of your UI/UX audit (the "AI slop" list) doubles as the Designer's banned list, so the Designer avoids those patterns instead of the Auditor catching them later.

### Showpiece track: creative portfolio pieces

Showpieces are a third track alongside demos and client builds. These are ambitious, creative sites built for your portfolio, not for a client, in the spirit of Bruno Simon's drivable car, Lusion's 3D studio site and Maná's playful product world. Demos win specific clients. Showpieces make people remember you, and show range that a nonprofit site can't.

- **Original concepts, not copies.** Use a fictional brand or one of your own products, never a recreation of the reference sites. That avoids copyright problems and keeps every idea yours. Starting ideas: a 3D landing page for Raeng (your own app), an interactive Ayutthaya heritage map, and a fictional Thai tea or coffee brand with a playful product world.
- **No Lead Scout, no client gates.** You're the client. The brief is yours, and the only gate is the final review before it goes public.
- **Its own quality bar.** Showpieces can be heavy, but they still need a loading screen, a simple fallback for phones and for `prefers-reduced-motion`, keyboard access to the main content, and a page that works if WebGL fails. Your UI/UX and performance audits run with a relaxed performance target.
- **The stack:** Three.js with React Three Fiber (and its helper library drei) for 3D, GSAP for animation, and Blender for 3D models. GSAP is free for commercial use, including all plugins (checked Oct 17, 2026). Three.js, React Three Fiber and drei are open source and Blender is free; confirm each license in its repo before a client build. Bruno Simon teaches his methods in a paid course, Three.js Journey. The free Three.js and React Three Fiber docs are enough to start.
- **Expect AI to help less here.** Claude Code is weaker at 3D scenes than at standard pages, so showpieces mean more hands-on learning. That makes them a stronger interview story.
- **Each showpiece ships with a write-up:** the idea, how it's built, one problem you solved and a short screen recording. These become portfolio entries, LinkedIn posts and devlog entries.
- **Where they live:** a Showpieces section on hju.dev, linked from the homepage. The /lab orientation can be your first small showpiece.

### The build workflow

You asked for an industry-standard process. This is the usual agency sequence, compressed for demos. The client track is the same list with nothing skipped, plus your existing `project_workflow.md` phases for anything with a database or logins.

| Step | Standard practice | Demo track | Client track |
| --- | --- | --- | --- |
| 1. Discovery | Goals, audience, competitors, current site problems | From the Lead Scout audit | Call or form with the client |
| 2. Brief | One page everyone signs off | `brief.md` → **gate 1** | Same, signed by the client |
| 3. Sitemap | Which pages, and what each must achieve | 1 page, or up to 3 | Full sitemap |
| 4. Content | Copy before design, so design fits real words | AI draft with `[CONFIRM]` marks | Client-supplied, edited |
| 5. Design system | Colors, type, spacing as tokens | 2–3 directions → **gate 2** | Same, plus client review |
| 6. Build | Components, responsive, real content | The foundation, restyled (ADR-0018), static, no database | The foundation plus the back end the client needs |
| 7. QA | Cross-browser, mobile, accessibility (WCAG 2.2 AA), performance (Core Web Vitals), SEO basics, broken links | Automated Auditor pass | Automated plus manual |
| 8. Legal and compliance | Privacy policy, cookie consent, accessibility statement, contact details | Placeholder notice only | Your audit prompts, all must pass |
| 9. Review | A staging link the client checks | Preview → **gate 3** | Staging, then client sign-off |
| 10. Launch and handoff | Domain, analytics, monitoring, training | Not launched | Site Doctor monitoring from day one |

### The Auditor's checklist: your seven audits

Your seven audit prompts become the Auditor's checklist, saved as separate files in `docs/audits/` (`01-security.md` to `07-business.md`). Demos are static, unlaunched pages, so they run a subset of each audit. Client builds run all of it.

| Your audit | Demo track | Client track |
| --- | --- | --- |
| 1. Security | Secrets & Configuration, security headers, HTTPS, no source maps | All sections, plus the Additions |
| 2. UI/UX & Design | Part A in full, Part B where it applies, plus contrast, touch targets, focus states and reduced motion | Parts A–D and the Additions |
| 3. Performance & Reliability | Speed & Loading and Core Web Vitals | All sections |
| 4. SEO & Marketing | On-Page items 8–13, one H1 per page, clean headings | All, including keyword research and content |
| 5. Compliance & Legal | Alt text, contrast, licenses for every font and image, a "demo only" notice | Full baseline, plus US rules for US clients (ADA, CAN-SPAM, state privacy laws) |
| 6. Deployment & Launch | Preview is `noindex`, no secrets, HTTPS | All sections and the launch-day checklist |
| 7. Business & Product | Not run | Not run per site. Run it quarterly on your own freelance business instead |

Each audit outputs Pass / Fail / Needs Verification. Any Fail sends the build back to the Builder, and any Needs Verification goes into `audit.md` for you at gate 3.

### Rules for demos

- Previews are unlisted and hidden from search engines (a `noindex` tag plus a robots header), and deleted after 30 days without a reply. Vercel's free Hobby plan is for non-commercial personal use only, so demo previews for business pitches can't be hosted there. Where they go is an open decision (ADR-0009).
- Decided: demos use the business's real text and photos, taken from its own public site and social accounts, because real content convinces. The demo is for a private pitch only. It never appears on /lab or in your portfolio without their written permission, and the footer says "Demo prepared for \<business> — not affiliated".
- The Copywriter never invents prices, awards, testimonials or numbers. Anything it can't source is marked `[CONFIRM]`, and the Auditor fails the build if a `[CONFIRM]` mark reaches gate 3 without your review.

### Working within Claude Pro

Studio runs on your Pro plan. Pro has a five-hour session limit and a weekly limit, and Claude Code and the Claude app share them, so long planning chats eat into build time.

- **One page per demo by default.** Three pages only once you've measured what one costs.
- **One role at a time,** never all five in parallel. Run `/compact` between roles and check `/status` before starting a build.
- **Measure the first demo:** note how much of the five-hour window it used, in the build journal.
- **Never set `ANTHROPIC_API_KEY`** on your laptop. If it's set, Claude Code bills the API instead of your plan.
- **If you keep hitting limits,** slow down rather than buying API credits. Max 5x is the upgrade path, but it isn't $0.

### Studio on /lab

Yes, Studio gets a station on the floor, like the other agents, with the same public/private split.

- **Public:** current stage ("Designer: 3 directions ready"), a public label ("service site, US nonprofit") and a before-and-after scorecard: the old site's Lighthouse and accessibility scores next to the demo's. That scorecard is the strongest visual proof on the page.
- **Private:** the demo link, screenshots, the business name and the brief.
- Studio runs on your laptop, so each stage sends one event to the same Neon tables through a small `lab-log` command. That keeps /lab live even though Studio isn't a cloud job.

### When it's built

Stage D, after the first launch, as phases 11 to 14:

1. **Phase 11 · Toolkit:** screen and install the skills in the Skills and tools guide tab, split your audit prompts into 7 files in \`docs/audits/\`, then write the first two blueprints and the design references file. **Check:** every installed skill passes the SkillSpector scan, and `/doctor` shows no problems.
2. **Phase 12 · The team:** the five subagent files, the `/build-demo` command and the three gates. **Check:** one demo built end to end from a real audit.
3. **Phase 13 · Auditor depth:** add your audit prompts and the Lighthouse before-and-after scorecard. **Check:** a deliberately broken demo fails the Auditor for the right reasons.
4. **Phase 14 · Studio on /lab:** the `lab-log` command, the station and the scorecard. **Check:** a demo run shows on /lab with no private data in the public view.

**Stage E · Showpieces,** after Stage D: one showpiece about every 4–6 weeks, alongside client work. Start small with the /lab orientation, then the Raeng landing page. **Check:** each one passes the showpiece quality bar and has its write-up published.

One cost to watch: a full five-role build uses a lot of your Claude plan's usage. Measure the first demo, and use Graphify or `/compact` if long sessions run out.

## Risks and prevention

The likeliest way this project fails isn't technical. It's running out of time, or ending up with something you can't explain in an interview. The table lists the main risks, most serious first, with the prevention now built into the plan and the early warning to watch for.

| Risk | Prevention built into the plan | Early warning |
| --- | --- | --- |
| The 2-week break ends before the build does | A day-by-day sprint: Stage A by day 6 is the must-finish, Stage B by day 12 is the stretch goal. An overrun means cutting scope, never extending. No new agents before full launch | Day 7 arrives without the first launch |
| You can't explain what Claude Code built | Every phase ends with "explain it back": a build journal entry, a phase diagram and your own summary. You rebuild the agent loop once by hand, without help | You can't answer "why this way?" about a file |
| /lab looks dead or breaks during an interview | Replay with a static demo-run fallback, a heartbeat monitor and a stale-data badge | Heartbeat email, or a last run more than 12 hours old (ADR-0017) |
| False alarms from noisy PageSpeed scores | Flags use a 3-day median and a sustained-drop rule | You reject fixes as "not a real issue" |
| A pitch states something false about a business | An evidence check before queuing, plus your review of every draft | Rejections tagged "wrong facts" |
| Private data reaches /lab or the Actions logs | Public views only, the leak test, a public\_text scanner and quiet logs | The leak test fails |
| A free tier changes or runs out | A one-file LLM wrapper, usage counted per run, a monthly limit check, and /lab keeps showing the last good data | Usage above 80% of any limit |
| Gemini changes its model or tool-call format | A pinned model version, zod validation of tool arguments, and an alert on parse failures | Parse-failure alert |
| A client's site looks bad on your portfolio | Visibility per metric, plus trends and a platform note instead of bare red numbers | A client asks about a score |
| The approval queue piles up during a busy teaching week | A 20-item cap, agents pause when it's full, items expire after 14 days, and the admin summary | The admin page shows 10 or more pending |
| Testing corrupts live data | A Neon development branch, which preview deploys also use | A test row appears on /lab |
| The project never reaches recruiters | A post at each gate, and /lab on your résumé at first launch | A gate passes without a post |

**Pre-mortem additions.** Imagine it's the end of the break and Agent Lab failed. These are the stories that explain it, added to the risks above. The full table, with likelihood, impact and owner, is in `docs/PREMORTEM.md`.

| Risk | Prevention built into the plan | Early warning |
| --- | --- | --- |
| Gemini's free tier can't run the tool loop, or its limits are too low | Spikes SP1 and SP5 on Day 0, before any agent code. Fallback: structured JSON output with the code picking the tool, and 5 leads a day | SP1 fails, or AI Studio shows fewer daily requests than a run needs |
| "Quality" stays anecdotal because the golden set never gets labeled | Labeling starts on Day 0, and the eval gate blocks Lead Scout from going live | Fewer than 20 sites labeled by day 8 |
| The sprint estimate was optimistic | The estimate is recalibrated from your past builds, and the plan uses the pessimistic (P80) figure | Two or more days behind by day 3 |
| Recruiters don't value what you built | Three recruiter conversations in the first two weeks (`docs/VALIDATION_PLAN.md`), and features ranked by real job postings (`docs/ROLES_MATRIX.md`) | Recruiters ask about years and degrees, never about projects |
| Your work status is never settled, so the freelance half stalls | Book the lawyer in week 1. The job-hunting half works either way | No lawyer appointment by day 5 |
| Personal details from a lead's site reach Gemini's free tier | Emails and phone numbers are removed before every call, with a test | The scrub test fails |
| /lab traffic uses up Neon's compute hours | Visitors read a snapshot and never wake Neon (ADR-0011). A weekly Neon usage check alerts when the month's projection passes 70%, and Spike SP4 measures real use | The weekly usage check fails |

### Working rules

- **Day plan:** until Nov 30, about 3 hours a week toward the Nov 30 target (see the revised plan under the sprint). At the end of each day, ship what works and move the rest to a "later" list in the README.
- **Explain it back:** no phase is done until its build journal entry exists and you've written "In my own words". Those entries become your devlog posts and your interview answers.
- **Picture it:** every phase gets a phase diagram. If you can't explain the diagram out loud, don't move on.
- **Scope freeze:** no third agent, no new framework, and no paid tool until the full-launch gate.
- **Build in public:** post at each gate on LinkedIn (linkedin.com/in/hju-dev) with a replay or diagram link, and mirror it on your site's devlog. Until the lawyer confirms your work status, frame posts as a project you're building and learning from, not as an offer of freelance services.
- **After the break:** about 3 hours a week. On the first Sunday of each month, spend 30 minutes on free-tier usage, quality numbers, queue size and Dependabot updates.

**Keeping yourself employed comes first.** Once freelancing is cleared, your first job isn't client work, it's keeping work coming in. That's measured by the pipeline, not by hours: every working day moves each of the three customer-journey stages forward, and each Friday you check which stage is the constraint (see "How the freelance business is organized" above). Hours are still logged for the build sprint, because that's how the estimate gets corrected, but not for the business.

**Scope until November 30.** Agent Lab is a portfolio piece for the job search first, so it must not crowd out applications. Studio (Stage D) and Showpieces (Stage E) don't start before the Nov 30 review. Ideas for job-search agents (a weekly posting refresh, a tracker summary, a recruiter-email digest) go on the README's "later" list and need your OK first.

## Open questions

None of these block the plan, but each can change a phase. The limits below were checked against the providers' own pages on October 17, 2026. Anything a provider doesn't publish is marked and has a spike to measure it.

### Decisions for you

- **Site repo layout.** This plan assumes hju-dev.vercel.app is your static HTML/CSS/JS site with the chatbot's functions under `/api` in the same repo. If the chatbot backend is a separate Vercel project, the /lab API goes there instead.
- **Sending domain.** Decided: no custom domain for now, only hju-dev.vercel.app. Reports come to you and you forward them. Buying a domain later would turn on Resend for the digest and reports, and give your portfolio a more professional address. Check registrar prices when you get there; this plan doesn't assume a cost.
- **Grass Roots Sports.** Its site hasn't launched. Should Site Doctor watch the staging URL, or wait for launch?
- **Lead Scout markets.** This plan tests 2 or 3 segments at a time across any industry, with nonprofits via Memory Matters referrals as one of them. It holds all pitches until a lawyer confirms your work status. Decided Oct 29: no cold email for now. Leads come from freelance platforms such as Fiverr, and replies go through the platform (ADR-0012). If cold email is ever turned on, US law (CAN-SPAM) needs your real postal address and an opt-out line, and Canada and much of the EU require consent first.
- **Raeng and hju-dev itself.** Should they be on the site board too? They're yours, so no permission is needed, and they guarantee the board is never empty.
- **The video.** A YouTube unlisted upload or Loom (check Loom's current free limits when you record). Record it at phase 10, once replays exist to show.

### Limits to check before building

- **GitHub Actions (verified Oct 17, 2026):** free for public repos on standard runners. Schedules can start late under load, especially at the top of the hour, and queued runs can be dropped. Scheduled workflows in a public repo switch off after 60 days with no repo activity, so a commit or manual run each month keeps them alive.
- **Vercel Hobby (verified):** cron runs at most once a day, which is why this plan uses GitHub Actions. Hobby is for non-commercial personal use only.
- **Neon free (verified):** 100 compute-hours and 1 GB per project, scale to zero after 5 minutes. Actual use is measured in Spike SP4.
- **Gemini free tier (partly unpublished):** Google doesn't publish the free-tier request limits in its docs; they're shown per project in AI Studio. Whether function calling works on the free models is tested in Spike SP1, and tokens per run in SP5. Free-tier inputs may be used to improve Google's products and read by human reviewers, so personal details are stripped before any call.
- **PageSpeed Insights:** a key is optional. The 25,000-a-day quota comes from a third-party page, so confirm it in Cloud Console.
- **Resend (verified):** needs a verified domain you own, so it's deferred (ADR-0007).
- **Healthchecks.io (verified, one gap):** 20 free checks. Whether free accounts get email alerts is tested in Spike SP6.
- **Upstash Redis (verified):** 500K commands a month on the free plan, shared with the chatbot if it uses the same database. Check usage monthly.

Every figure, with its source link and check date, is in `docs/SOURCES.md`.
