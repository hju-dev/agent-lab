# Agent Lab docs

**This folder is the only source of truth.** The "Agent Lab — PRD & Build Plan" doc on claude.ai was archived on Nov 4, 2026: it stopped being updated on Oct 15, 2026 and is kept for reference only.

Every doc here follows one rule: **replace judgment with evidence, and assumptions with tests.** An outside fact has a source and a date. A claim we can't source yet has a spike, a test or a conversation that will settle it, and it's tracked in the evidence ledger.

## Start here

| File | What it's for | Who reads it |
| --- | --- | --- |
| [HANDOFF.md](HANDOFF.md) | Where the last session stopped, what's next, and the gotchas. Read first; rewritten at the end of every session | Claude Code, Henry |
| [OPERATOR_MANUAL.md](OPERATOR_MANUAL.md) | Setup, daily build routine, running it once live | Henry |
| [PRD.md](PRD.md) | The plan: features, tech, schema, design, sprint, risks | Henry, Claude Code |
| [BUILD_JOURNAL.md](BUILD_JOURNAL.md) | Glossary, safeguards register, a learning entry per phase | Henry, Claude Code |
| [STACK.md](STACK.md) | The tools in use, the tools deliberately not used and why, and client-build defaults. Agents read this before adding any tool |
| [EVIDENCE_LEDGER.md](EVIDENCE_LEDGER.md) | One page: every claim, its evidence, and whether it's verified, being tested, or still an assumption | Anyone checking the plan |

## Evidence and tests

| File | What it's for |
| --- | --- |
| [SOURCES.md](SOURCES.md) | Every outside fact (free tiers, terms, law, standards), with primary-source links and check dates |
| [ROLES_MATRIX.md](ROLES_MATRIX.md) | 10 real job postings, quoted exactly, mapped to the features that prove each requirement, with the gaps |
| [SPIKES.md](SPIKES.md) | Six Day 0 experiments with pass/fail thresholds and plan changes, plus the walking skeleton |
| [EVALS.md](EVALS.md) | Lead Scout's golden set, labeling rubric, metrics, harness, grader calibration and the eval gate |
| [DONE_CHECKS.md](DONE_CHECKS.md) | Each phase gate as commands (Vitest, Playwright, axe-core, Lighthouse CI, psql), plus the manual list |

## Design and risk

| File | What it's for |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | C4 context and container diagrams |
| [adr/](adr/) | Fourteen decision records: what was chosen, why, and what it costs |
| [THREAT_MODEL.md](THREAT_MODEL.md) | Data-flow diagram, STRIDE threats mapped to OWASP LLM Top 10 (2025) and ASVS 5.0, each traced to a safeguard; unmitigated threats flagged |
| [PREMORTEM.md](PREMORTEM.md) | How this could fail, and the method for re-estimating the sprint from Henry's past builds |
| [VALIDATION_PLAN.md](VALIDATION_PLAN.md) | Mom Test scripts for recruiters and small businesses; questions for the lawyer and a senior developer |
| [OFFERS.md](OFFERS.md) | One offer sheet per segment, built around how that segment decides to buy |
| [FREELANCE_PRINCIPLES.md](FREELANCE_PRINCIPLES.md) | Henry's freelance rules in one page: the three moves, outreach rules, platform-only leads |

## Studio and tools

| File | What it's for |
| --- | --- |
| [SKILLS_GUIDE.md](SKILLS_GUIDE.md) | Which Claude skills and test tools to install, and how to install them safely |
| [audits/](audits/) | Henry's seven audit prompts, used by Studio's Auditor |
| [playbooks/neon-free-tier.md](playbooks/neon-free-tier.md) | How to keep a Neon free-plan database asleep: audit, fixes, verification and monitoring. Used by Agent Lab (ADR-0011) and by Studio's Builder and Auditor on any build with a database |
| [playbooks/fast-app-startup.md](playbooks/fast-app-startup.md) | Making apps with a login open fast on slow connections: trust the last session and verify in the background, cache the home screen, parallel requests. Used by Studio's Builder and Auditor |
| [playbooks/legal-checks.md](playbooks/legal-checks.md) | Seventeen common legal mistakes in quickly built apps (age checks, Google Fonts, session replay, unsubscribe, renewal terms, biometrics, cookie consent and more), with the Builder's defaults and the Auditor's checks. Not legal advice |
| [playbooks/ux-laws.md](playbooks/ux-laws.md) | Twenty UX laws (Hick, Fitts, Jakob, Doherty, Gestalt and more) as rules for our builds, each with a check. Used by Studio's Designer, Builder and Auditor, and by /lab |
| [playbooks/hero-wireframes.md](playbooks/hero-wireframes.md) | Ten hero wireframes (W1–W10) as text sketches, with what each fits, its phone order and the rules. Used by Studio's Designer and Builder |
| [playbooks/accent-palettes.md](playbooks/accent-palettes.md) | Henry's nine approved palettes (two base colors + one surprise accent), why they work, contrast results, and the three-color rules. Used by Studio's Designer, Builder and Auditor |
| `diagrams/` | Mermaid diagrams, one per phase (created during the build) |

## Later list (ideas parked until after the Nov 30 review)

- **To do: client process templates** (from `claude/client-process.md` in the hju.dev project): contract and statement-of-work template (lawyer-reviewed), welcome pack with access checklist, package menu first; then Notion portal, kickoff agenda, brief, change order, delivery guide, thank-you note, feedback questions

- Job-search agents (need Henry's OK): a weekly posting refresh against the shortlist criteria; a tracker summary before the Nov 30 review; a recruiter-email digest (better as a scheduled task than inside Agent Lab, which runs in a public repo)
- Studio (Stage D) and Showpieces (Stage E)
- Netlify for Studio demo previews (ADR-0009), after checking its terms on commercial use and its credit limit
- Sentry on the Vercel functions
- hju-dev legal fixes (legal-checks.md): self-host Inter and JetBrains Mono instead of loading them from Google (about 30 minutes); before /lab launches, decide GA4 consent (a banner with Consent Mode denied by default, or cookieless analytics)
- Lead Scout `audit_site` step (ADR-0014): run the fixed audit steps (fetch, PageSpeed, links, SSL, platform) as one step in code, so Gemini only decides what matters and writes the draft. Fewer Gemini calls. It changes the tool allowlist, so it needs its own ADR and must pass the eval gate
- [agency-agents](https://github.com/msitarzewski/agency-agents) (MIT, persona prompts for Claude Code subagents): when writing Studio's five agent files in Phase 12, read 3–4 of its files (UI designer, frontend developer, code reviewer, content creator) for structure ideas. Don't bulk-install it. Treat any copied file like a third-party skill: read it fully and scan it first
- everything-claude-code (use the original, [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code), not small forks): a Claude Code config pack, not a builder. If test-first work feels slow after Phase 1, try only its `/tdd` command and `tdd-guide` agent, installed per project after reading and scanning them. Don't install its hooks (they run shell commands automatically) or its MCP configs (Railway and Supabase aren't in the stack)

## ADR index

| # | Decision | Status |
| --- | --- | --- |
| [0001](adr/0001-hand-written-agent-loop.md) | Hand-write the agent loop, no framework | Accepted (SP1) |
| [0002](adr/0002-gemini-free-tier.md) | Gemini free tier, with personal details removed first | Accepted (SP1, SP5) |
| [0003](adr/0003-github-actions-scheduling.md) | GitHub Actions schedules in a public repo | Accepted (SP3) |
| [0004](adr/0004-site-doctor-is-a-script.md) | Site Doctor is a script, not an agent | Accepted |
| [0005](adr/0005-neon-separate-project-roles-views.md) | Separate Neon project, three roles, RLS, public views | Accepted (SP4) |
| [0006](adr/0006-vanilla-lab-page-and-vercel-functions.md) | /lab on the existing site with cached Vercel functions | Partly superseded (frontend → ADR-0013) |
| [0007](adr/0007-alerts-without-resend.md) | Alerts via GitHub and Healthchecks; Resend waits for a domain | Accepted (SP6) |
| [0008](adr/0008-human-approval-and-pitch-hold.md) | Human approval for everything; pitches held behind a flag | Accepted |
| [0009](adr/0009-demo-preview-hosting.md) | Where demo previews are hosted | **Proposed** |
| [0010](adr/0010-studio-on-claude-pro.md) | Studio runs on Claude Pro, never the API | Accepted |
| [0011](adr/0011-public-lab-reads-a-snapshot.md) | Visitors read a snapshot and never wake the database | Accepted (SP4) |
| [0012](adr/0012-platform-leads-no-cold-email.md) | Find clients through platforms like Fiverr; no cold email | Accepted |
| [0013](adr/0013-lab-built-in-react.md) | /lab is built in React + TypeScript with Vite | Accepted (replaces ADR-0006's frontend choice) |
| [0014](adr/0014-code-first-tool-use.md) | Code-first tool use; no programmatic tool calling on $0 | Accepted |
| [0015](adr/0015-slow-api-timeouts-and-per-site-drop-threshold.md) | Longer timeouts for named slow APIs; per-site drop threshold | Accepted |
| [0016](adr/0016-admin-lives-in-the-dashboard.md) | The private admin lives in Henry's existing dashboard, not a new /lab/admin | Accepted |
| [0017](adr/0017-checks-several-times-a-day.md) | Site Doctor's checks are "several times a day, best effort"; stale after 12 hours | Accepted |
