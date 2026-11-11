# Day 0 spikes and the walking skeleton

A **spike** is a small throwaway experiment that answers one risky question before you build on top of it. Each one below has a test, a pass or fail threshold that's written down **before** you run it, and the plan change if it fails. Spike code lives in `spikes/` and is never imported by real code.

Record every result in the table at the bottom, with the date and the raw numbers. A spike that "kind of passed" is a fail.

Several spikes need time to collect data (SP3, SP4). Start those first on Day 0 and let them run in the background while you do the others and the walking skeleton.

---

## SP1 · Does Gemini tool calling work on the free tier?

**Why it's risky:** the whole Lead Scout design depends on it, and Google's docs don't say which free-tier models support function calling ([SOURCES.md](SOURCES.md#gemini-api-lead-scouts-model)).

**Test:** `spikes/sp1-tools.ts`, on **Gemini 3.5 Flash Lite**, with calls at least 4.5 seconds apart. Declare the real six tools (`fetch_page`, `run_pagespeed`, `check_links`, `check_ssl`, `detect_platform`, `finish`) with their real argument schemas. Send 20 prompts of the shape "Audit https://example-business.com", using a fixed fake tool result for each call and looping until the model calls `finish` or reaches the 8-step cap. Parse every `functionCall` with the real zod schemas.

**Grader test:** send 5 sample drafts and the rubric in [EVALS.md](EVALS.md) to **Gemma 4 31B**, asking for a 1–5 score on each of the four criteria as JSON, and parse each reply with zod. This only tests whether the output is usable. Whether the grader can be trusted is settled later by calibration (EVALS section 5).

**Record:** the exact model id used, how many of the 20 runs had only valid tool calls, whether the model ever called a tool not on the list, which of the six tools were called, how many runs hit the 8-step cap, and the limits shown on [aistudio.google.com/rate-limit](https://aistudio.google.com/rate-limit) for that model. For the grader: its exact model id, how many of the 5 replies parsed, and the tokens per minute at peak.

**Pass:** at least 19 of 20 runs have only tool calls that pass zod, **and** 0 calls to tools not on the list, **and** each of the six tools is called at least once across the 20 runs, **and** the free-tier daily request limit is at least 2× what one day needs (10 leads × 8 steps + 10 = 90 requests, so ≥ 180), **and** all 5 grader replies parse with Gemma's peak under its limit of 16K tokens a minute.

**If it fails:**
- Invalid calls but some work → try 3.1 Flash Lite, then any other free model listed in SOURCES.md, and re-run.
- The grader test fails → try Gemma 4 26B. If that fails too, Henry scores drafts by hand (EVALS section 5).
- No free model works → switch to structured JSON output: the model returns `{ "next_tool": "...", "args": {...} }`, zod validates it, and the code dispatches. The loop, logs and evals stay the same. Record this as an amendment to ADR-0001.
- Daily limit too low → cut to 5 leads a day (change the S6 cap).

## SP2 · How noisy are PageSpeed scores?

**Why it's risky:** Site Doctor flags drops in score. Google says performance scores vary from run to run and should be treated as a distribution ([SOURCES.md](SOURCES.md#pagespeed-insights-api-site-doctor-and-lead-scout-audits)). If noise is bigger than the drops we flag, every alert is a false alarm.

**Test:** `spikes/sp2-psi.ts`. Call the PageSpeed API (mobile strategy) 5 times for each of 5 URLs: Memory Matters, Big T's, Grass Roots (staging if needed), hju-dev.vercel.app, and one large public site. Wait 60 seconds between calls to the same URL.

**Record:** each score, plus the median and the range (max − min) per URL.

**Pass:** the range is ≤ 10 points for at least 4 of the 5 URLs.

**If it fails:** the sustained-drop rule in S7 changes from "a drop of N points" to "a drop larger than that site's measured range, held for 3 days". Store the range per site. No new feature, just a different threshold.

## SP3 · Do GitHub schedules run on time?

**Why it's risky:** GitHub says scheduled runs can be delayed, especially at the top of the hour, and can even be dropped ([SOURCES.md](SOURCES.md#github-actions-schedules)). Site Doctor's "hourly" uptime promise depends on it.

**Test:** in the agent-lab repo, a workflow `spike-schedule.yml` on `cron: '17,47 * * * *'` that writes the scheduled time and the real start time (`date -u`) to a table or an artifact. Run it for 48 hours. Delete it afterward.

**Record:** number of runs expected (96) vs started, and the delay of each run. Then set the final period and grace of the Healthchecks check `agent-lab heartbeat` from these delays, and write them here. Until then it stays at period 1 hour, grace 1 hour.

**Pass:** at least 92 of 96 runs start (≥ 95%), and 95% of them start within 20 minutes of the scheduled time.

**If it fails:** /lab and the README describe uptime checks as "about hourly, best effort", and the stale-data badge threshold moves from 2 hours to 3. Healthchecks' grace period is set to match. No new hosting.

## SP4 · How much Neon compute does this use?

**Why it's risky:** the free plan gives 100 compute-hours per project per month, and the database wakes up for every write and every uncached read ([SOURCES.md](SOURCES.md#neon-database)).

**Test:** in the new Agent Lab Neon project, let SP3's workflow write a row every run for 48 hours, then publish the snapshot. Also run a script that calls the deployed `/api/lab/state` once a minute for 1 hour, to prove visitor traffic never wakes Neon. The awake ratio shouldn't move during that hour.

**Note, Nov 2, 2026, written before the run:** SP3's workflow fires every 30 minutes and Neon stays awake about 5 minutes after each write ([SOURCES.md](SOURCES.md#neon-database)). Writing on every run would mean at least 5 ÷ 30 = 16.7% awake, failing the 15% rule by arithmetic without measuring the real hourly plan. Henry decided that only the `:17` runs write and publish, which matches production's hourly writes. The pass rule is unchanged. SP3's timing still covers all 96 runs, read from GitHub's run records, because the `:47` runs don't touch the table. Rows go in a throwaway `spike` schema, dropped when the spike ends. The one-hour `/api/lab/state` test runs once the walking skeleton has deployed that endpoint, so SP4 can't pass before then.

**Record:** from the Neon API (`docs/playbooks/neon-free-tier.md` section 3.1, script `spikes/sp4-usage.ts`): `compute_time_seconds` and `active_time_seconds` at the start and after 48 hours, the awake ratio (time awake ÷ time elapsed) and the projected month. Also list every branch and compute, since all of them count against the same allowance.

**Pass:** projected monthly use is ≤ 40 CU-hours **and** the awake ratio is ≤ 15%. The playbook calls under 20 CU-hours healthy and over 70 urgent. Hourly writes are expected to land around 10% awake.

**If it fails:** first check nothing else is waking it: a dev server, a database GUI left connected, or a preview pointing at the main branch. Then group all of a run's writes into one transaction at the end of the run. If it still fails, buffer hourly uptime results in Upstash and write them to Neon once a day (ADR-0011).

## SP5 · How many tokens does a Lead Scout run use?

**Why it's risky:** the free tier has token-per-minute limits that aren't published, and a full page is a lot of text.

**Test:** `spikes/sp5-loop.ts`, a rough version of the real loop, on 3 real public business sites. Page text stripped and capped at 4,000 characters, as in the plan.

**Record:** calls per lead, input and output tokens per call (from the API's usage metadata), and the wall-clock time per lead.

**Pass:** ≤ 8 calls per lead on all 3, and the peak tokens per minute stays under 50% of the limit shown in AI Studio.

**If it fails:** lower the page cap from 4,000 to 2,000 characters, and add a 5-second wait between leads. If calls per lead exceed 8, the step cap does its job (S6) and the eval will show whether quality suffers.

## SP6 · Do alerts actually reach you?

**Why it's risky:** with Resend deferred, every alert depends on GitHub's failure emails and Healthchecks.io. Healthchecks' pricing page doesn't say whether free accounts get email alerts ([SOURCES.md](SOURCES.md#email-and-monitoring)).

**Test:**
1. A workflow that always fails (`exit 1`), triggered by a schedule you created. Check your inbox.
2. A Healthchecks check with a 10-minute period and 5-minute grace that's never pinged. Check your inbox.

**Note, Nov 4, 2026, before the re-run:** a check that has never been pinged stays "New" and never goes down, so step 2 as written can't send an alert ([Healthchecks docs](https://healthchecks.io/docs/) define the New state; the down timer counts from the last ping). The first attempt got no email for that reason. The method is now: ping the check once, then never again. It goes down 15 minutes after that ping. The pass rule is unchanged.

**Pass:** both emails arrive within 20 minutes, and neither lands in spam (if one does, add a filter and re-test).

**If it fails:** GitHub's mobile app push notifications for failed runs become the backup. Turn them on in the GitHub app settings and repeat test 1. If Healthchecks email isn't free, use its other free channels if any; otherwise record the gap in the threat model (T-A3) and check /lab/admin daily.

---

## The walking skeleton (end of Day 0 or Day 1)

A **walking skeleton** is the thinnest possible version of the whole system that runs end to end: every part exists, each part does almost nothing. It proves the parts connect before you make any of them clever.

**Scope:** one GitHub Actions workflow → one Site Doctor check of one URL → one row written as `lab_agent` → one `public_state` view → `GET /api/lab/state` → one line on /lab showing "Site Doctor last ran at HH:MM ICT".

**Includes from day one:** the zod environment check (S13), migration `001` (S21), the `concurrency` group (S9), the Healthchecks ping (S16), and the Vitest leak test with one assertion (S1).

**Done when (executable):**

```bash
gh workflow run site-doctor.yml && sleep 120
curl -s https://<preview-url>/api/lab/state | jq '.agents[0].last_run_at'   # a time from the last 5 minutes
psql "$LAB_PUBLIC_URL" -c 'select * from lab.runs'                          # fails: permission denied
npx vitest run tests/leak.test.ts                                            # passes
```

From here, each phase thickens one part of the skeleton instead of building parts separately and joining them at the end.

---

## Results

| Spike | Date run | Raw result | Pass / Fail | Plan change made |
| --- | --- | --- | --- | --- |
| SP1 Tool calling | 2026-11-04 | `gemini-3.5-flash-lite`: 20 of 20 runs had only valid tool calls, 0 calls off the list, all 6 tools called, 0 runs hit the 8-step cap, 0 text replies; 97 requests, peak 10,131 tokens a minute; daily limit 500 (≥ 180). Grader `gemma-4-26b-a4b-it`: 5 of 5 replies parsed, peak 3,766 tokens a minute. `gemma-4-31b-it` was tried first and timed out or returned 500s; Gemma replies take about 35 seconds | Pass | The grader is Gemma 4 26B, the listed fallback. Its replies take longer than CLAUDE.md's 10-second timeout, so the spike used 60 seconds (open question for Henry) |
| SP2 PageSpeed noise | 2026-11-04 | Mobile performance, 5 runs each. Client A: 49, 50, 47, 57, 43 (median 49, range 14). Client B: 93, 87, 87, 87, 87 (87, 6). Client C: 95, 99, 99, 99, 99 (99, 4). hju-dev.vercel.app: 100, 100, 99, 100, 100 (100, 1). wikipedia.org: 100 × 5 (100, 0). Client names are in `private/sp2-results.json` | Pass (4 of 5 within 10 points) | None. Note for S7: Client A's own range is 14, so a 10-point drop there is noise. PageSpeed calls take longer than 10 seconds, so the spike used 60 (open question for Henry) |
| SP3 Schedule delay | 2026-11-03 to 2026-11-05 | `spike-schedule.yml` (`:17` and `:47`), 48 hours from the first run at 18:55 ICT, Nov 3: **15 of 96 runs started (16%)**. 13 of the 15 started within 20 minutes of a slot; the gaps between runs reached 8.3 hours. GitHub Actions was degraded on the evening of Nov 4 (githubstatus.com) and no scheduled run started from 15:00 to 23:17 ICT that day, but the drop rate was just as bad outside the outage. Site Doctor (`:37`) since then: 25 scheduled runs in about 6.5 days, roughly 1 in 6 hourly slots, gaps of about 4 to 9 hours | **Fail** | Worse than the listed fallback assumed. Henry chose to accept it and say so (ADR-0017): "several times a day, best effort", stale badge after 12 hours, Healthchecks period 1 hour plus 11 hours' grace |
| SP4 Neon compute | 2026-11-11 | `neon-usage` run on Nov 11, 15:05 ICT: **2.0 CU-hours used** this billing period, **5.8 projected** for the month (limit for the pass: 40). Last active 14:03 ICT, which matches Site Doctor's 13:58 ICT run, so only agent runs wake the database. The awake ratio wasn't measured directly (the script reports CU-hours only), and the projection is low partly because SP3's dropped runs mean fewer wakes. The one-hour `/api/lab/state` no-wake test is still open (Phase 3 check) | **Pass** (CU-hours) | None |
| SP5 Tokens per run | | | | |
| SP6 Alert delivery | 2026-11-04 (part 2) | Part 2, Healthchecks: the first try got no email because the check was never pinged (see the note above). Re-run with one ping: the check went Down at 16:09:18 ICT and the email arrived at 16:09 ICT, under a minute later, in the inbox (not spam). Part 1, GitHub failure email: `sp6-fail.yml` failed on schedule from Nov 4. The first three failures sent only an in-app notification, because email was off for Actions in Henry's GitHub notification settings. After he turned it on (Nov 5), the run that finished at 23:31:47 ICT emailed him at 23:32 ICT and the one at 05:41:50 ICT, Nov 6, at 05:42 ICT: about a minute each, in the inbox (not spam). Workflow deleted Nov 10 | **Pass** (both parts) | Email for Actions must stay on in Henry's GitHub notification settings |
| Walking skeleton | | | | |

When a spike is done, update its row in [EVIDENCE_LEDGER.md](EVIDENCE_LEDGER.md) from "Testing" to "Verified" or "Failed → changed".
