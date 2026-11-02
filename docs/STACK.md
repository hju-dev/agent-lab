# Stack

**For agents:** use only what's listed under "In the stack". Don't add a tool from "Not in the stack" without Henry's OK. Budget is $0, so no tool may have a payment card on file (Neon, Gemini/Google Cloud, Vercel, Upstash, GitHub, Clerk). Without a card, hitting a free limit stops the service instead of billing.

Reviewed 29 October 2026 against Henry's tech-stack notes. Limits are in `docs/SOURCES.md`.

## In the stack: Agent Lab

| Layer | Tool | Why this one | Decision |
| --- | --- | --- | --- |
| Builder | Claude Code on Henry's Pro plan | Already paid for. Never set `ANTHROPIC_API_KEY` | ADR-0010 |
| Runtime | **Node 24 LTS** + TypeScript, run with `tsx` | Node 20 reached end of life on 30 April 2026. Node 24 is supported until 30 April 2028 | — |
| Code and checks | GitHub (public repo) + Actions | Free for public repos; runs schedules and CI | ADR-0003 |
| Agent loop | Hand-written, Gemini function calling | Explainable in interviews; no framework | ADR-0001 |
| LLM | Gemini free tier, personal details removed first. Lead Scout: 3.5 Flash Lite, with 3.1 Flash Lite as the fallback. Eval grader: a different model, probably Gemma 4 31B (SP1 tests it) | $0 | ADR-0002 |
| Database | Neon free, its own project, three roles + RLS. Direct connection for migrations and agents, pooled for admin functions | Visitors never wake it (snapshot) | ADR-0005, ADR-0011 |
| Public data | Upstash Redis: snapshot + rate limits, in the database shared with the chatbot. Every Agent Lab key starts with `lab:` | Keeps visitor traffic off Neon | ADR-0011 |
| /lab frontend | React + TypeScript, built with Vite in the site repo's `lab/` folder | Shows React to recruiters; one framework with Studio's demos | ADR-0013 |
| Hosting | Vercel Hobby: the site, /lab's Vite build, and `/api/lab` | Already the hju-dev host; non-commercial use only | ADR-0006 |
| Admin login | Clerk, locked to `ADMIN_USER_ID` | Already used on client sites | — |
| Alerts | GitHub failure emails + Healthchecks.io | $0, no domain needed | ADR-0007 |
| Uptime of client sites | Site Doctor itself (static URLs for database-backed sites) | It *is* the monitoring product | ADR-0004, ADR-0011 |
| Traces of what the AI did | `run_steps` + run replay (F9) | Built ourselves: that's the portfolio evidence | F4, F9 |
| Analytics | GA4 (already set up) | $0 | — |
| Search data | Google Search Console on hju-dev.vercel.app | Free. Real search terms, indexed pages and errors for a site Henry owns | — |
| Tests | Vitest (+ React Testing Library for /lab), Playwright, axe-core, Lighthouse CI, promptfoo (free grader model) | All free | DONE_CHECKS, EVALS |

## Studio client builds: defaults, chosen per client

Demos are static Next.js with no database. For real client builds:

| Need | Default | Notes |
| --- | --- | --- |
| Framework | Next.js + TypeScript + Tailwind | Same as demos |
| Hosting | Vercel, **on the client's own account/plan if the site sells or advertises** | Vercel Hobby is non-commercial only (ADR-0009) |
| Database | **Neon** for low-traffic sites; consider **Supabase free** for sites with steady database traffic or that need auth and file storage in one place | Supabase free projects pause after 7 days of low activity (verified). Its other free limits are only from secondary sources, so check its pricing page first. Either way, follow `docs/playbooks/neon-free-tier.md` if it's Neon |
| Payments | Stripe, **in the client's account** | The client pays the fees, not Henry |
| Errors | Sentry free, with rate limits on repeating errors | Free plan reported at 5,000 errors a month (secondary source). One error looping can use the quota up (playbook lesson) |
| Email | Resend, on the client's verified domain | Needs a domain the client owns |

## SEO toolbelt (added 1 Nov 2026)

All free. Agents never hold Google credentials: Henry signs in and exports, and agents work from the exported files, which stay in `private/` or the client's private folder and are never committed.

| Tool | What it's for | Who uses it | How |
| --- | --- | --- | --- |
| **Google Search Console** (GSC) | Real search terms, clicks, rankings, indexed pages and errors for a site you own or were given access to | Strategist (current site's search terms, for the brief), Auditor (after launch: indexing, errors, sitemap accepted) | On hju-dev now. For clients: the client adds Henry as a user in their own GSC property. Henry exports the Performance and Pages reports as CSV |
| **Lighthouse SEO** | Technical basics: title, meta description, crawlable links, `robots.txt`, valid structured data, tap targets, readable font sizes | Builder (while building), Auditor (gate 3) | Already in CI (Lighthouse CI, SEO ≥ 0.9). Covers technical SEO only, not content or rankings |
| **Google Keyword Planner** | Search-volume ranges and related terms, to choose the words pages and gig titles use | Strategist (keywords for the brief), Copywriter (headings, page titles and meta descriptions) | Inside a Google Ads account. **Never enter a payment card** (STACK rule). If Google won't open Keyword Planner without billing details, skip it and use GSC plus Semrush's free 10 searches a day by hand. Henry runs the searches and exports CSV; volumes are ranges, so treat them as rough |

**Rules for agents:**
- Write for people first, keywords second: one main search phrase per page, used naturally in the title, the `h1` and the first paragraph. No keyword stuffing, no pages made only to rank.
- Every keyword claim in `brief.md` or `copy.md` names its source file and date (`[GSC 2026-11-01]`, `[KP 2026-11-01]`). Never invent a search volume.
- The Builder ships, on every client build: a unique `<title>` and meta description per page, one `h1`, a `sitemap.xml`, a `robots.txt`, canonical URLs, alt text, Open Graph tags, and LocalBusiness structured data for local businesses. Demo previews stay `noindex`.
- At client launch, Henry (or the client) submits the sitemap in GSC. The client's monthly report can include GSC's clicks and top search terms.
- Semrush free (10 searches a day, manual only, no API) is allowed for a quick check. Ubersuggest is not used (no permanent free plan).

## Not in the stack (and why)

| Tool from the notes | Verdict | Reason |
| --- | --- | --- |
| Codex, Cursor | Skip | Claude Code is the builder, already paid for. A second paid AI tool breaks the $0 rule |
| Supabase (for Agent Lab) | Fallback only | Neon is set up and planned. If Spike SP4 still projects over 40 CU-hours after the ADR-0011 fixes, switch to Supabase free (pausing isn't a risk with hourly writes) |
| Railway | Skip | Its free plan is $1 of credit a month, and its pricing page mentions a post-paid card requirement (wording unclear). Agent Lab has nothing long-running; Actions covers scheduled work |
| Stripe | Skip for Agent Lab | Agent Lab takes no payments, and Fiverr handles payment for platform work (ADR-0012) |
| Cloudflare | Later | Its DNS and proxy need a domain Henry owns |
| Better Stack | Skip | Site Doctor + Healthchecks already cover uptime. Pinging every minute can keep a Neon database awake |
| PostHog | Skip | GA4 is already set up. Session replays record visitors, which is a privacy cost for no need yet |
| Sentry (for Agent Lab) | Later, optional | Agent failures already email Henry. Add it to the Vercel functions after Phase 4 if errors are hard to trace, with rate limits |
| Langfuse | Skip for now | Free tier exists (50k units a month), but `run_steps` + replay already do this. Building it ourselves is the interview evidence, and Langfuse would send lead page text to another service |
| n8n, Zapier, trigger.dev | Skip | GitHub Actions runs the jobs. No-code workflows would hide the agent logic the project exists to show |
| Resend | Later | Needs a verified domain (ADR-0007) |
| Semrush paid, Ubersuggest, Semrush API | Skip | Paid. Semrush's free account (10 searches a day) is allowed by hand only; see the SEO toolbelt |
| beehiiv, Intercom, WordPress/GraphQL, IndexNow | Skip | No audience, live chat or blog in scope |
| Anthropic programmatic tool calling | Skip | A Claude API feature: needs an API key and billing, which breaks the $0 rule and ADR-0010. Claude Code gets the same effect by writing scripts (ADR-0014) |
| Cloudflare Code Mode / model-written code in Lead Scout | Skip | Lead Scout reads untrusted pages, so running code the model writes would let page text become code execution (ADR-0014) |

## Ways of working taken from the notes

- **CLAUDE.md stays under 200 lines.** Anthropic's docs say longer files "consume more context and may reduce adherence". Detail lives in `docs/` and is read when a phase needs it.
- **`.claudeignore` does nothing in Claude Code.** Block files with `Read` deny rules in `.claude/settings.json` instead (see that file).
- **CI on every pull request:** typecheck, lint, tests and `npm audit`, plus the checks in `docs/DONE_CHECKS.md`. Pushes don't go straight to production: changes go branch → preview → merge.
- **Code-first tool use (ADR-0014):** a CLI or script before an MCP server, bulk work in a script that returns a summary, MCP servers per project only. Full rules are in CLAUDE.md under "Tools and MCP".
- **Standard prompts** are in the Operator manual: build to the repo's pattern, tests first, debug from the trace, and review the diff as if you didn't write it.
