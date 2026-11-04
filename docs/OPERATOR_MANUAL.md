# Operator manual

This is the document to keep open: it takes you from an empty folder to a running Agent Lab, then shows how to use it day to day. Work through Part 1 once, follow Part 2 every build day, and use Part 3 once things are live. Steps marked **Claude Code** are done for you in a build session. Everything else is yours.

> Source of truth: this file in the repo. The claude.ai doc that used to mirror it was archived on Nov 4, 2026.

## Where everything lives

| What | Where | Used for |
| --- | --- | --- |
| The plan | `docs/PRD.md` | What you're building and why |
| This manual | `docs/OPERATOR_MANUAL.md` | How to set up and use it |
| Skills guide | `docs/SKILLS_GUIDE.md` | What to install and how |
| Index of all docs | `docs/README.md` | What every other file is for |
| Instructions for Claude Code | `CLAUDE.md` in the repo root | Read by Claude Code automatically |
| Your learning record | `docs/BUILD_JOURNAL.md` | Filled in after every phase |
| Proof and tests | `docs/SPIKES.md`, `docs/EVALS.md`, `docs/DONE_CHECKS.md` | What has to pass, and when |
| Your audits | `docs/audits/01–07` | The Studio Auditor's checklist |
| Agent code | GitHub: `hju-dev/agent-lab` | Site Doctor, Lead Scout |
| Agent runs and logs | GitHub → agent-lab → **Actions** tab | Checking runs worked |
| Database | Neon console, the agent-lab project, `lab` schema | Everything the agents record |
| Public page | hju-dev.vercel.app/lab | What visitors see |
| Your desk | hju-dev.vercel.app/lab/admin | Approving work, adding leads (after phase 5) |

## Part 1 · Setup, before day 1 (about half a day, plus Day 0)

Do these in order and check each one off. If a step goes wrong, stop and ask in a Claude chat, pasting the exact error message.

### 1. Accounts and keys

Keep every key in a password manager, never in a note or a chat.

- [ ] **Gemini API key:** make a new key in Google AI Studio, in its own Google Cloud project (`agent-lab`), not the chatbot's. Restrict it to the Gemini API only. While you're there, open aistudio.google.com/rate-limit and write down the free-tier limits for the Flash models (Spike SP1 needs them).
- [ ] **PageSpeed Insights API key:** in Google Cloud Console, in the same project, enable the PageSpeed Insights API under APIs & Services, then create a second, separate API key under Credentials, restricted to the PageSpeed Insights API only. That makes two keys, each restricted to one API. Check its quota on the Quotas page and write it in `docs/SOURCES.md`.
- [ ] **Resend:** skip for now. Resend only sends from a domain you own (checked Oct 17, 2026). Your alerts come from GitHub and Healthchecks instead (ADR-0007).
- [ ] **Healthchecks.io:** create a free account and one check called "agent-lab heartbeat". Copy its ping URL. Spike SP6 tests whether its alert emails reach you.
- [ ] **GA4:** add a data stream for hju-dev.vercel.app, or reuse your existing property.
- [ ] **Google Search Console:** add hju-dev.vercel.app as a URL-prefix property and verify it with the HTML tag or file method (you can't use DNS on a vercel.app address). Submit the sitemap once the site has one. Free, about 15 minutes.
- [ ] **Google Keyword Planner (optional):** open it through a Google Ads account. If it asks for a payment card or billing details, stop and skip it; GSC and Semrush's free searches cover you.
- [ ] **Clerk:** reuse your existing account and create an application for /lab/admin. Your user ID comes later, in phase 5.
- [ ] **Immigration lawyer:** book the appointment. Questions are in `docs/VALIDATION_PLAN.md`. Pitches stay switched off until they confirm.

### 2. The repo and files

- [ ] On GitHub, create a **public** repo called `agent-lab` with a README and a Node `.gitignore`.
- [ ] Turn on **secret scanning** and **Dependabot alerts** in the repo's Settings → Code security.
- [ ] Add the ruleset `protect main` in Settings → Rules → Rulesets: active, no bypass, on the default branch. Require a pull request with 0 approvals (you're the only developer), require conversation resolution, allow squash merge only, restrict deletions, block force pushes, require linear history. Status checks get added once the walking skeleton's CI works; Claude Code gives you the exact check names.
- [ ] Clone it to your computer: `git clone https://github.com/hju-dev/agent-lab.git`
- [ ] Copy in the files I sent: `CLAUDE.md` into the root, and the whole `docs/` folder (PRD, journal, skills guide, audits, ADRs, spikes, evals, threat model and the rest) into `docs/`. `docs/README.md` lists what each file is for.
- [ ] Commit and push: `git add . && git commit -m "Add plan and instructions" && git push`
- [ ] Copy `CLAUDE.md` into your **site repo's** root too, for phases 3 and 4.

### 3. Secrets in the right places

- [ ] **GitHub:** agent-lab → Settings → Secrets and variables → Actions → New repository secret. Add `GEMINI_API_KEY`, `PAGESPEED_API_KEY` and `HEALTHCHECK_URL` now. Claude Code tells you when to add `DATABASE_URL_AGENT` in phase 1. No Resend key until you own a domain (ADR-0007).
- [ ] **Vercel:** your site project → Settings → Environment Variables. Claude Code tells you which ones to add in phases 3 and 5.
- [ ] **Never** put a key in a file you commit, or paste one into a chat. If that happens, make a new key and delete the old one.

### 4. Database

- [ ] In the Neon console, create a new project called agent-lab (separate from the chatbot, so each gets its own free compute hours), go to **Branches** and create a branch called `dev`. Claude Code creates the tables and roles in phase 1. Your job is to copy the connection strings it asks for.
- [ ] Enable only the Postgres service. Save both owner connection strings: **direct** (no `-pooler`) for migrations, SP4 and agents on GitHub Actions, and **pooled** (`-pooler`) for the Phase 5 admin functions. The owner role is for migrations only; the three working roles come from numbered migrations in Phase 1 (ADR-0005).
- [ ] If Neon's onboarding offers a setup prompt (`neon init` / `neon deploy`), don't run it. It adds files and Neon skills to the repo, writes the owner string to `.env.local` and starts writing app code. You can install the Neon CLI later for dev branches, but read any skill it offers before installing.

### 5. Skills

Follow `docs/SKILLS_GUIDE.md`. For day 1, you only need **SkillSpector**. Install the rest before Stage D. Archify is on hold (Nov 4, 2026): its scan couldn't complete, so phase diagrams use Mermaid until you decide, before /lab/how-it-works.

- [ ] Install SkillSpector (Python needed) and scan each skill before installing it: `skillspector scan <skill folder or repo> --no-llm`
- [ ] Install a skill only if its scan has no critical or high findings.
- [ ] Open Claude Code in the repo and run `/doctor`. Fix anything it flags.

### 6. Final checks, then Day 0

- [ ] In a new Claude Code session in the agent-lab folder, type `/karpathy-guidelines` (or ask "what skills do you have?") to confirm the skill loaded. Skills are only picked up when a session starts. Optional: run `skillspector scan ~/.claude/skills/karpathy-guidelines --no-llm` once SkillSpector is installed, to match the install rule

- [ ] Run `/status` in Claude Code to see how much plan usage you have.
- [ ] Make sure no `ANTHROPIC_API_KEY` is set on your computer. On Windows PowerShell, run `echo $env:ANTHROPIC_API_KEY` (on a Mac or Linux, `echo $ANTHROPIC_API_KEY`). It should print nothing.
- [ ] Run the Day 0 spikes and the walking skeleton (`docs/SPIKES.md`), and start labeling the eval golden set (`docs/EVALS.md`). Start SP3 and SP4 first, since they need 48 hours.
- [ ] Send me the dates of your past builds (`docs/PREMORTEM.md` Part 2) so the sprint estimate can be redone.

## Part 2 · Every build day

The same routine every day of the sprint. The sprint table in the PRD says which phase is due.

1. **Start fresh.** Open a terminal in the right repo (agent-lab, or the site repo for phases 3–4) and run `claude`. Start a new session each day rather than continuing a long one.
2. **Paste the session prompt:**

   ```
   Read CLAUDE.md, docs/README.md, docs/PRD.md and docs/BUILD_JOURNAL.md. We're starting Phase [N] (budget: [X] days). Confirm the goal and its check in docs/DONE_CHECKS.md before writing any code.
   ```
   Useful prompts during the session:
   - "Build [feature]. Read how the repo already does this, match that pattern, then run typecheck and tests before you tell me it's done."
   - "Write failing tests for [feature] first. Show me them. Then write the code until every one passes."
   - **Debugging:** "Here's the error and its log. Find the root cause, not the symptom. Don't guess: check each assumption by reading the code, running it or adding a log line, and tell me what broke and how you know before you change a line. Then write a test that fails because of the bug, fix it, and show the test passing."
   - Before merging: "Review the diff like you didn't write it. Flag anything that breaks in production, then tell me what you'd delete."

   Prompts for specific phases (adapted from generic "act as a senior engineer" prompts, tied to this repo's rules):
   - **Phase 4, each /lab component:** "Follow CLAUDE.md, docs/STACK.md and ADR-0013. Build [component] for /lab in React + TypeScript using the tokens in style.css. Handle the four states (loading, live, stale, error), visible keyboard focus and reduced motion. Render model and database text as text; never use dangerouslySetInnerHTML. No new dependency without asking me. It's done when the Phase 4 checks in docs/DONE_CHECKS.md that cover this component pass."
   - **Phase 10, security pass:** "Follow CLAUDE.md. Run /security-review, then work through docs/audits/01-security.md, my security_protocol.md and every row of docs/THREAT_MODEL.md. Check for secrets in code, logs and the public snapshot; what lab_public can read; admin auth; fetch_page's SSRF rules; prompt injection; GitHub Actions permissions. List each finding with severity, file and line, evidence and fix. Don't fix anything until I've read the list. Finish with every UNMITIGATED threat-model row marked resolved or accepted by me."
   - **Client code you didn't write** (Big T's, Grass Roots, or a new client's existing site, before touching it): "Follow CLAUDE.md and docs/STACK.md. This is existing client code. Don't change anything yet. First map how it's built: framework, data flow, where secrets and the database are used. Then list problems by severity: security, broken behavior, performance (use docs/playbooks/neon-free-tier.md if it has a database and docs/playbooks/fast-app-startup.md if it has a login), and maintainability. Give file and line, evidence and the smallest fix for each. End with the three fixes you'd do first and how we'd check each one."

   Skipped on purpose: prompts asking Claude to design the whole architecture again (the ADRs already decide it), to "scale to millions" (pushes toward paid infrastructure), to play four agents in one chat (Studio uses real subagents), or to add Docker and Kubernetes (not in the stack).
3. **Check its plan.** Claude restates the goal and the check. If it's wrong, correct it before any code is written.
4. **Build together.** Claude explains each file before writing it. Ask "why?" whenever you don't follow. That's the whole point of the build journal.
5. **Run the check.** Each phase has commands in `docs/DONE_CHECKS.md`. It isn't done until they pass.
6. **Close the phase.** Claude draws the phase diagram, updates the journal and quizzes you. **You** write "In my own words". Update `docs/EVIDENCE_LEDGER.md` if a test settled a claim.
7. **Save your work:**

   ```
   git checkout -b phase-N
   git add .
   git commit -m "Phase N: <what it does>"
   git push -u origin phase-N
   ```

   Then open a pull request on GitHub, wait for CI to pass, check the Vercel preview link, and merge it.
8. **End of day.** Run `/status`. If you're near your limit, stop for the day rather than buying credits. Note your hours for the phase, so the estimate can be checked against reality.

At each stage gate (after phases 4, 7 and 10), also post a LinkedIn update and add a devlog entry. Until the lawyer confirms your status, frame posts as a project you're building, not an offer of services.

## Part 3 · Using it once it's live

### Every day (5–10 minutes)

- **Check the daily summary** on /lab/admin. There's no digest email until you own a domain. Failure alerts still arrive by email from GitHub and Healthchecks.
- **Open /lab/admin** if anything is waiting. For each item, approve, edit then approve, or reject with a reason. Reasons are your quality data, so always pick one.
- **Alert emails** (a failed agent or a site down) come straight away. See the troubleshooting table below.

### Adding leads (Lead Scout)

1. Collect up to 10 websites from buyer requests and messages on Fiverr or similar platforms, using only sites the buyer shared with you. No cold email.
2. Go to /lab/admin → **Add leads**, paste the URLs, and set the country and industry for each.
3. Lead Scout audits them on its next daily run, and the drafts arrive in your queue.
4. Check each draft against the Pitching rules: does the first sentence name a real problem on **their** site? If it opens with you, edit or reject it with the reason "not problem-first".
5. While pitches are on hold, you can still approve and edit the drafts. That trains the quality numbers. Once the lawyer confirms, turn on `pitches_enabled` in admin settings. Send proposals and replies yourself inside the platform; no cold email (ADR-0012).

### Following up (once pitches are switched on)

1. When you send a pitch, mark it sent with the date in /lab/admin.
2. About a week later, if there's no reply, Lead Scout re-checks the site and drafts a follow-up with something new: a fresh finding, a fix they can make themselves, or a short example. It never says "just following up". You send it as a message inside the platform, never by email.
3. Review it like any draft. At most 2 follow-ups per business; none after a reply or an opt-out.

### Every working day (15–30 minutes): move each stage forward

Ask "what should I move forward today?", not "what should I work on?" Open the admin summary, which lists the oldest waiting item for each stage, and do one thing for each:

- [ ] **Stranger → lead:** make a problem visible. A post with a real before-and-after, an audit, or a demo.
- [ ] **Lead → client:** move one lead on. A follow-up with something new, an answer, or a safer next step.
- [ ] **Client → lifetime client:** do one useful thing for a current client. A result from Site Doctor, a report, or an idea for their next step.

Until the lawyer confirms your status, the middle one means business conversations and offer sheets only, no pitching.

### Every Friday (5 minutes): find the constraint

- [ ] Open the pipeline view on /lab/admin. Which stage is slowest (fewest moving on, or longest wait)? That's the constraint.
- [ ] Pick one change for next week from the "Where it stalls" table in the PRD. Don't track hours for the business; track whether the constraint moves.

### Building a demo site (Studio, after Stage D)

1. Open Claude Code in the `hju-studio` repo and run `/status`. You need plenty of your five-hour window left.
2. Run `/build-demo <lead id>`. The command is created in phase 12.
3. **Gate 1:** read `brief.md`, then approve it or correct it.
   Before designing, the Designer shows you a skill check: which of Taste, Impeccable, playwright-cli, DESIGN.md and img2threejs it plans to use and why. Say yes, or tell it what to add or drop. It will also ask you to browse transitions.dev for transitions it needs; paste back the links you like.
4. **Gate 2:** pick one of the 2–3 design directions.
5. **Gate 3:** open the preview and read `audit.md`. Check every `[CONFIRM]` mark. Approve it, or send it back with notes.
   If you're presenting the demo, make a short showcase video in animos.app from the screenshots.
6. Until ADR-0009 is decided, send screenshots and a short recording instead of a preview link, because Vercel's free plan is for non-commercial use only. Previews are deleted after 30 days.

### Showpieces (Stage E)

No command and no gates. Write your own brief, build in Claude Code sessions as in Part 2, run the UI/UX and performance audits with the relaxed target, and publish the write-up.

### First Sunday of each month (30 minutes)

- [ ] Neon branches: delete any test branch you're not using, since every running branch spends the same compute allowance
- [ ] Free-tier usage: Neon compute hours (the weekly check should already have warned you), Gemini (AI Studio), Upstash (the count covers both Agent Lab and the chatbot, which share the database) and PageSpeed. Re-run the eval golden set to catch model changes
- [ ] Quality page: approval rate, and reply rate per segment and per touch (pitch, follow-up 1, follow-up 2). Drop a segment with no replies after 6 weeks
- [ ] Pipeline: has the constraint moved since last month? If the same stage has been slowest for 4+ weeks, revisit its offer sheet in `docs/OFFERS.md`
- [ ] Queue: nothing older than 14 days
- [ ] Dependabot: merge the safe updates
- [ ] GA4: /lab visits, replay plays and Get in touch clicks
- [ ] Search Console: hju-dev's top search terms and any indexing errors. Export the Performance report to `private/` if Studio needs it
- [ ] Make at least one commit or manual run, so GitHub doesn't pause the schedules
- [ ] Re-check any row in `docs/SOURCES.md` older than 60 days
- [ ] Every quarter, also run audit 07 (Business & Product) on your freelance business

## When something goes wrong

| What you see | Most likely cause | What to do |
| --- | --- | --- |
| Heartbeat email: "no ping" | GitHub paused the schedule, or a run is failing | GitHub → Actions. Re-enable the workflow, or open the failed run's log |
| Alert: an agent failed twice | A key expired, or an API limit was reached | Open the run log. If it mentions a key or quota, check that provider's dashboard |
| /lab shows "reconnecting" | The API or database is down | Check Vercel and Neon status. The page keeps showing the last good data meanwhile |
| Queue stuck at 20 | You haven't reviewed for a while | Clear the queue. Agents resume on their own |
| Claude Code says the usage limit was reached | Your Pro window is used up | Stop and resume after the reset. Don't buy credits |
| Claude Code is billing the API | `ANTHROPIC_API_KEY` is set | Remove it from your shell profile and restart the terminal |
| A key was committed or pasted somewhere | Mistake | Make a new key, delete the old one, update the secret. Then tell Claude Code to check the Git history |
| Email: "Neon usage check" failed | The month's projected compute is over 70% | Something is keeping the database awake. Ask Claude Code to run the audit in `docs/playbooks/neon-free-tier.md` (read only first). Don't deploy if the database is already locked out |
| Errors saying "exceeded the quota" (402) | Neon's monthly compute ran out | Every query fails until the 1st (00:00 UTC). /lab keeps showing the last snapshot. Either upgrade the Neon plan or wait; then find the wake source with the playbook |
| An eval or CI check fails | A change made something worse, or a test is wrong | Read which check failed in the PR. Never lower a threshold just to pass; see `docs/EVALS.md` |
| You don't understand what something does | Normal | Look in the build journal's glossary. Still unclear? Ask Claude Code to explain that file for a beginner |
