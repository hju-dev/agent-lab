# Agent Lab — Build Journal

**Who this is for:** Henry, a beginner coder who wants to understand every line well enough to explain it in a job interview.
**Who updates it:** Claude Code adds a new phase entry at the end of every phase. Henry writes the "In my own words" part himself, and Claude Code then checks it for mistakes.
**Where it lives:** `docs/BUILD_JOURNAL.md` in the `hju-dev/agent-lab` repo. Diagrams live in `docs/diagrams/`. Every other doc is listed in `docs/README.md`.

---

## How to read this

Each phase entry answers the same questions in the same order:

1. **What we built:** plain English, no jargon.
2. **The picture:** a Mermaid diagram of what changed.
3. **File by file:** what each file does, the important lines, and *why* it's written that way.
4. **Decisions:** what we chose, what we rejected, and why.
5. **What broke:** errors we hit and how we fixed them. This section is the most useful one in interviews.
6. **The check:** did the phase gate pass?
7. **Quiz:** 3 questions to test yourself.
8. **In my own words:** written by Henry.

If a word confuses you, look in the Glossary. If it isn't there, ask Claude Code to add it.

---

## Glossary

Claude Code adds new terms as they come up. Each definition is one or two plain sentences.

| Term | What it means |
| --- | --- |
| Agent | A program where an AI model decides what to do next, such as which tool to use, instead of following fixed steps. Lead Scout is an agent; Site Doctor is not. |
| Tool calling (function calling) | The AI model replies with "please run this function with these inputs" instead of plain text. Our code runs the function and sends the result back. |
| Agent loop | The repeat cycle: ask the model, run the tool it picked, give it the result, and ask again, until it says it's finished or hits the step limit. |
| Script | A program that runs the same fixed steps every time. Site Doctor is a script. |
| GitHub Actions | GitHub's free computers that run our code on a schedule, like an alarm clock for programs. |
| Cron / schedule | A short code such as `0 * * * *` that tells GitHub Actions *when* to run (this one means "every hour, on the hour"). |
| Environment variable | A secret value, such as an API key, kept outside the code and read when the program runs, so it never appears in GitHub. |
| API key | A password that lets our code use a service (Gemini, PageSpeed). Anyone holding it can spend our quota, so it stays secret. |
| Database role | A database login with limited permissions. We use three: public (read safe views only), agent (write results) and admin (Henry). |
| View | A saved database query that looks like a table. Our public views show only the safe columns. |
| RLS (Row-Level Security) | Database rules that decide which rows each role is allowed to see or change. |
| Migration | A numbered SQL file that changes the database structure. Running them in order rebuilds the same database anywhere. |
| CDN cache | A copy of a response stored close to visitors. Ours keeps /lab data for 30 seconds, so 1,000 visitors don't mean 1,000 database reads. |
| Rate limit | A cap on how many requests one visitor can make per minute, to stop abuse. |
| Prompt injection | Text hidden on a web page that tries to give the AI new instructions ("ignore your rules and…"). We treat all page text as data, never as instructions. |
| SSRF | Tricking a server into fetching a URL it shouldn't, such as an internal address. Our URL safety rules block this. |
| Idempotent | Safe to run twice. If GitHub retries a run, we don't end up with duplicate rows. |
| zod | A library that checks data has the shape we expect *before* we use it, and fails loudly if not. |
| Heartbeat | A "still alive" ping sent after every run. If the pings stop, an outside service emails Henry. |
| Evaluation (eval) | Measuring how good the AI's output is. Ours: how often Henry approves a draft without edits. |
| Prompt version | A saved, numbered copy of the instructions we give the AI, so quality changes can be traced to prompt changes. |
| Spike | A small throwaway experiment that answers one risky question before we build on it. Ours are in `docs/SPIKES.md`. |
| Walking skeleton | The thinnest version of the whole system that runs end to end. Every part exists; each does almost nothing yet. |
| Golden set | A fixed list of test inputs where Henry has written down the right answer by hand, so every prompt version is scored on the same questions. |
| Eval gate | A rule that blocks a release until the eval scores pass. Lead Scout can't go live without passing ours. |
| Fixture | A saved copy of a tool's real output, replayed in tests so results don't change when a website changes. |
| Precision and recall | Precision: of the problems the agent reported, how many were real. Recall: of the real problems, how many it found. |
| Cohen's kappa | A number from about 0 to 1 for how much two graders agree beyond what luck would give. We use it to check whether the AI grader agrees with Henry. |
| ADR (Architecture Decision Record) | A short file recording one decision: the situation, what we chose, and what that costs us. Ours are in `docs/adr/`. |
| C4 diagram | A way of drawing a system at different zoom levels: context (the whole system and who uses it), then containers (the separately running parts). |
| Threat model | A list of how the system could be attacked or leak data, each matched to the safeguard that stops it. |
| STRIDE | A checklist of six threat types: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. |
| Trust boundary | A line where data passes from a less trusted place to a more trusted one, such as a stranger's website into our agent. Checks belong at these lines. |
| PII | Personally identifiable information: names, emails, phone numbers and the like. We strip it before sending page text to Gemini. |
| Pre-mortem | Imagining the project has already failed and listing why, so the causes can be prevented now. |
| P50 / P80 estimate | P50: the time you'd beat half the time. P80: the time you'd beat 4 times out of 5. We plan to P80. |
| Lighthouse CI | Runs Google's Lighthouse checks automatically on every preview deploy and fails the build if scores drop below set targets. |
| axe-core | A library that checks a page for common accessibility problems automatically. It catches only part of them, so a manual pass stays. |
| CAN-SPAM | The US law for commercial email. Requires an honest sender, an ad notice, a physical postal address and a working opt-out. |
| Scale to zero | Neon puts the database to sleep after 5 minutes with no activity. Asleep, it uses no compute hours. Anything that touches it every few minutes stops it ever sleeping. |
| CU-hour | Neon's unit of compute time: one compute unit running for one hour. The free plan gives a fixed number per month. |
| Snapshot | A saved copy of the public data, written once per agent run, so visitors can read it without touching the database. |
| Mom Test | A way of interviewing people about their past behaviour rather than asking if they like your idea, so they can't just be polite. |

---

## Safeguards register

Every protection against a known problem, the threat it answers (IDs from `docs/THREAT_MODEL.md`), where it lives in the code and how it's tested. Claude Code fills in **Where** and **Test**, and sets **Status**, as each one is built. A safeguard with no threat is either missing a threat row or isn't needed.

| # | Threat | Problem it prevents | Safeguard | Where in the code | Test | Status |
| --- | --- | --- | --- | --- | --- | --- |
| S1 | T-P1 | Private data shown on /lab | Public API reads only the public views | | Leak test | Planned |
| S2 | T-P2 | Business names or URLs in public text | public_text scanner rejects URLs, emails and lead names | | Unit test | Planned |
| S3 | T-G4 | Private data in the public GitHub Actions logs | Logs record counts and IDs only | | Log test + review at each gate | Planned |
| S4 | T-L1 | Web pages giving the AI instructions | Strip HTML, cap at 4,000 characters, wrap as data, tool allowlist | | Injection site in the eval gate | Planned |
| S5 | T-L2 | Agent fetching internal or unrelated addresses | http/https only, private IPs blocked after DNS lookup, max 3 redirects each re-checked, lead's own domain only | | One test per rule | Planned |
| S6 | T-L6 | Runaway costs or quota | Max 8 steps per lead, 10 leads a day, 40 Gemini calls per run, stop after 5 errors | | Unit test | Planned |
| S7 | — (reliability) | False alarms from noisy scores | 3-day median, sustained-drop rule; threshold is the larger of 10 and the site's SP2 range (ADR-0015) | `lib/score-drop.ts` (`sustainedDrop`, `dropThreshold`) | `tests/score-drop.test.ts` | Built and tested (4 Nov); not yet used by Site Doctor |
| S8 | T-L4 | Pitches with made-up facts | Evidence check: every number and platform name must appear in the tool results | | Unit test; eval gate (0 fabricated) | Planned |
| S9 | — (reliability) | Two runs overlapping | GitHub Actions `concurrency` group per workflow | | Manual double trigger | Planned |
| S10 | — (reliability) | Duplicate rows after a retry | Unique keys, insert-or-ignore | | Run twice and compare counts | Planned |
| S11 | T-L6 | A hung request freezing a run | 10-second timeout per request (named slow APIs up to 60 s, ADR-0015), 10-minute cap per run | `lib/reliability.ts` (`fetchWithTimeout`, `SLOW_API_TIMEOUT_MS`); cap: `timeout-minutes: 10` in each workflow | `tests/reliability.test.ts` (server that never answers; slow-API list capped at 60 s) | Built and tested (4 Nov); Site Doctor still sets its timeouts inline |
| S12 | T-L6 | Flaky APIs failing a whole run | Up to 3 retries with increasing waits | `lib/reliability.ts` (`withRetry`) | `tests/reliability.test.ts` | Built and tested (4 Nov); not yet used by Site Doctor |
| S13 | T-G1 | Missing or wrong environment variables | zod check at startup with a clear error message | | Run with a key removed | Planned |
| S14 | — (reliability) | Gemini changing its output format | Pinned model version, zod validation of tool arguments, alert on parse failures | | Malformed-response test | Planned |
| S15 | T-L6 | Free tier changes | One LLM wrapper file, usage counted per run, alert at 80% of the limits recorded in SP1 | | Monthly check | Planned |
| S16 | T-A3, T-G5 | Schedule silently paused | Heartbeat ping after every run | | SP6, then pause the workflow and expect an email | Planned |
| S17 | T-A3 | /lab broken during an interview | Static demo run, stale-data badge | | Playwright: API down, replay still plays | Planned |
| S18 | T-D1 | Testing touching live data | Neon development branch for local work and preview deploys | | Check the preview's database URL | Planned |
| S19 | T-L6 | Queue overload | 20-item cap, agents pause when it's full, 14-day expiry | | Fill the queue in dev | Planned |
| S20 | T-L4 | Misleading quality figure | Shows sample size, hidden below 20 decisions | | Unit test | Planned |
| S21 | T-D3 | Untracked database changes | Numbered migrations only, no hand edits; `pg_dump` before production migrations | | Rebuild the dev branch from migrations | Planned |
| S22 | — (reliability) | Time-zone confusion | Store UTC, display ICT | | Unit test | Planned |
| S23 | T-L4, T-L9 | Prompt changes making quality worse | 24-site golden set with saved fixtures; new versions must pass the eval gate and not score worse (`docs/EVALS.md`) | | Eval run in CI | Planned (was a 10-site set) |
| S24 | T-L2 | Being unwelcome on sites we audit | Obey robots.txt, honest user agent linking to /lab | | Unit test; robots site in the eval gate | Planned |
| S25 | T-L3 | Personal details sent to Gemini's free tier, which Google may review | Remove emails and phone numbers from page text before every model call | | Unit test with common formats | Planned (new) |
| S26 | T-A6 | A pitch breaking CAN-SPAM | Pitch template requires a postal address, an ad notice and an opt-out line; opt-out list checked before queuing; opt-outs never contacted again | | Unit test on the template; opt-out test | Paused: cold email is off (ADR-0012). Returns as a hard requirement if it's turned on |
| S27 | T-G5 | Runs delayed or dropped at busy times | Schedules at odd minutes (e.g. :17, :43), never on the hour | | SP3 measures delay | Planned (new) |
| S28 | T-D2 | Agent Lab and the chatbot using up each other's compute | Separate Neon project | | SP4 | Planned (new) |
| S29 | T-A1 | Any Clerk user reaching admin | Server-side check of the Clerk session **and** `ADMIN_USER_ID` on every admin route | | 401 / 403 tests | Planned (was a rule, now registered) |
| S30 | T-A5 | Pitches marked ready before legal sign-off | `pitches_enabled` flag, off by default, enforced in the database and the API | | Unit test at both levels | Planned (was a rule, now registered) |
| S31 | T-P3 | API flooding | Upstash rate limit plus 60-second CDN cache on the snapshot (ADR-0011) | | 100-request test expects a 429 | Planned (was a rule, now registered) |
| S32 | T-G1 | Secrets leaking | Secrets only in env vars and GitHub secrets; secret scanning on | | Secret scanning; review | Planned (was a rule, now registered) |
| S33 | T-L8 | Compromised dependency | Lockfile, `npm ci`, pinned Node, Dependabot; SkillSpector for skills | | CI uses `npm ci` | Planned (was a rule, now registered) |
| S34 | T-L1, T-L5 | AI output acting on its own | Model output only goes to the approval queue; never sent or executed | | Code review; no send path exists | Planned (was a rule, now registered) |
| S35 | T-L1, T-L4 | Releasing a worse or unsafe Lead Scout | Eval gate before go-live and before every prompt change | | `npx vitest run evals/` in CI | Planned (new) |
| S41 | T-D4 | Visitors waking Neon until the month's compute runs out | /lab and the public API read a snapshot in Upstash, published at the end of each run; no public route imports the database client | | Import test; 30-minute no-wake check | Planned (28 Oct) |
| S42 | T-D4 | Running out of Neon compute without warning | Weekly Neon usage check fails above a 70% projection | | Manual run with a fake allowance | Planned (28 Oct) |
| S43 | T-D4 | Uptime checks keeping a client's database awake | Database-backed sites are checked on a static URL | | Unit test | Planned (28 Oct) |
| S44 | T-D4, T-A3 | A quota lockout flooding errors or alerts | 402 "exceeded the quota" caught, shown plainly, reported once, not retried | `lib/reliability.ts` (`isQuotaError`, `withRetry`); `agents/site-doctor/index.ts` | `tests/reliability.test.ts` | Built and tested (4 Nov) |
| S36 | — (quality) | Lazy follow-ups that add nothing ("just following up") | Phrase filter rejects banned phrases before a follow-up reaches the queue; every follow-up must carry a new finding, tip or example | | Unit test per phrase | Planned (18 Oct) |
| S37 | T-A6 | Pestering businesses, or emailing after an opt-out | At most 2 follow-ups, none after a reply or opt-out; follow-ups held behind `pitches_enabled` | | Unit test | Planned (18 Oct) |

**Proposed, waiting for Henry's yes or no** (from the threat model's unmitigated list): P1 pin third-party Actions to a commit SHA (T-G2); P2 `permissions: contents: read` in every workflow (T-G3); P3 model and database text only ever rendered as text, never HTML (T-L5, T-P4). If accepted, they become S38–S40.

---

## Phase entries

Copy this template for each phase.

```
### Phase N: <name> (<date>)

**What we built**
<3–5 plain sentences.>

**The picture**
docs/diagrams/phase-N.md (Mermaid)

**File by file**
- `path/to/file.ts`: what it does in one line.
  - Key part: <short code excerpt>
  - Why it's written this way: <reason, in beginner terms>
  - What we didn't do instead, and why: <alternative + reason>

**Decisions**
| Decision | Alternatives rejected | Why |

**What broke and how we fixed it**
- <error message> → <cause> → <fix>

**Safeguards added this phase**
S# … (also update the register above)

**The check**
<the commands from docs/DONE_CHECKS.md> → PASSED / FAILED + the output

**Evidence ledger**
Rows in docs/EVIDENCE_LEDGER.md this phase settled, and their new status.

**Time**
Planned days vs actual hours, for re-estimating (docs/PREMORTEM.md).

**Quiz**
1. <question>
2. <question>
3. <question>
<details><summary>Answers</summary> … </details>

**In my own words** (Henry writes this)
…
```

---

### Phase 0: Planning (October 2026)

**What we decided**
Agent Lab is two AI workers plus a public page that shows them working. Site Doctor checks my client sites on a schedule and is a plain script, because monitoring follows fixed rules. Lead Scout audits business websites I give it and drafts pitches. It's a real agent, because deciding which checks a site needs is a judgment call. Nothing leaves the system without my approval. The public /lab page shows what they're doing, replays past runs, and shows how often I approve the AI's drafts without changes.

**Why this design**
- **$0 budget:** GitHub Actions, Neon, Vercel, Gemini, Upstash and Healthchecks free tiers. Resend waits until I own a domain (ADR-0007).
- **Hiring goal:** a hand-written agent loop and measured AI quality are skills I can explain and prove.
- **Safety:** three database roles, public views only, and human approval on everything.

**Evidence, not guesses (17 Oct 2026):** every outside fact the plan depends on was checked against the provider's own page (`docs/SOURCES.md`). Two assumptions failed and changed the plan: Resend needs a domain I own, and Vercel's free plan can't host commercial demo previews. Anything still unproven is a spike (`docs/SPIKES.md`), an eval (`docs/EVALS.md`) or a conversation (`docs/VALIDATION_PLAN.md`), and its status is in `docs/EVIDENCE_LEDGER.md`.

**Full plan:** `docs/PRD.md`, with decisions in `docs/adr/` and the index in `docs/README.md`.

**In my own words** (Henry writes this)
…
