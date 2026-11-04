# Pre-mortem and the sprint estimate

## Part 1 · Pre-mortem

**Method:** imagine it's the last day of the two-week break and Agent Lab has failed. Write down every believable story of why. Then, for each story, decide what would prevent it and what early signal would warn you. A pre-mortem works because it's easier to explain a failure that has "already happened" than to predict one.

These rows are folded into the PRD's risk table. **Likelihood** and **impact** are judgments (High / Medium / Low), not measurements; each row says what evidence would change it.

| # | Failure story | Likelihood | Impact | Prevention in the plan | Early warning | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Stage A wasn't finished because every phase took longer than planned | High until recalibrated | High | Re-estimate from past builds (Part 2); plan to the P80 figure; cut F5 first (ROLES_MATRIX) | 2+ days behind on day 3 | Henry |
| 2 | Gemini's free tier couldn't run the tool loop, found on day 10 | Medium | High | SP1 and SP5 on Day 0, fallback in ADR-0001 | SP1 fails | Claude Code |
| 3 | Lead Scout launched but its "quality" was never measured, so there's nothing to say in interviews | Medium | High | Golden set labelled from Day 0; eval gate in Phase 6 | Fewer than 20 sites labelled by day 8 | Henry |
| 4 | Henry can't explain the code | Medium | High | Journal entry, quiz and "In my own words" each phase; rebuild the loop by hand once | Can't answer "why this way?" about a file | Henry |
| 5 | /lab broke during an interview | Low | High | Static demo run, stale badge, heartbeat | Healthchecks email | Claude Code |
| 6 | Alerts never arrived, so a broken schedule went unnoticed for weeks | Medium | Medium | SP6 tests delivery; heartbeat | SP6 fails | Henry |
| 7 | Private data leaked to /lab or the public logs | Low | High | Roles, views, leak test, scanner, quiet logs | Leak test fails | Claude Code |
| 8 | Lead page details went to Gemini's free tier | Medium without S25 | Medium | PII scrub S25 | Scrub test fails | Claude Code |
| 9 | Neon compute ran out mid-month and /lab went stale | Low | Medium | SP4, separate project, cache | > 50% used by the 15th | Henry (monthly check) |
| 10 | Recruiters didn't care about the project | Medium | High | Three Mom Test conversations; ROLES_MATRIX ranking | Recruiters only ask about years, degree, Thai | Henry |
| 11 | The work-status question was never answered, so freelancing never started | Medium | High | Lawyer booked in week 1; questions in VALIDATION_PLAN | No appointment by day 5 | Henry |
| 12 | A platform account was suspended for breaking its rules (e.g. moving a buyer off-platform) | Low | High | ADR-0012: all contact inside the platform; read its terms first | A warning from the platform | Henry |
| 13 | Studio ate the Pro plan's weekly limit, blocking other work | Medium | Low | One role at a time, `/status`, measure first demo | First demo uses > 50% of a session | Henry |
| 14 | A demo preview was taken down under Vercel's non-commercial rule | Medium if hosted on Hobby | Medium | ADR-0009; screenshots by default | — | Henry |
| 15 | Henry burned out and stopped after the break | Medium | High | ~3 hours a week after the break; Stage C waits on data, not effort | Two weeks with no commit | Henry |

## Part 2 · Re-estimating the sprint from your real history

**Why:** the current sprint table was estimated by judgment. People reliably underestimate how long their own projects take, even when they know about the bias (the "planning fallacy"). The fix with the best track record is **reference-class forecasting**: use how long similar past projects actually took, not how long this one feels like it will take.

### What I need from you

For each past build, fill in what you can. Rough is fine; "about 3 weekends" is useful.

Filled in from Henry's answers on 4 Nov 2026, with start dates checked against each repo's git history.

| Build | Start date | Launch date | Hours per week | Expected | Overrun (calendar) | What took longer than expected |
| --- | --- | --- | --- | --- | --- | --- |
| hju.dev website | 14 May 2026 | 21 Aug 2026 (Vercel project created) | ~6 | 1 week | ~14 weeks → **14×** | The chatbot. The site grew in scope (multi-page, then the chatbot) |
| Raeng | 10 Aug 2026 | 25 Sep 2026 (latest release) | not given | 3 weeks | ~6.6 weeks → **2.2×** | UI and UX |
| RAG chatbot | 24 Sep 2026 (Henry); git shows `api/` work from 22 Aug | 24 Sep 2026 | ~6 hours total | 1 week | **Unclear**: dates don't match git (22 Aug–11 Oct) | Learning how AI works |
| Big T's | 8 Aug 2026 | 8 Sep 2026 | ~12 | 3 weeks | ~4.4 weeks → **1.5×** | UI and UX, backend and database problems |
| Grass Roots | 5 Aug 2026 | 6 Aug 2026 (Henry) | ~6 | 3 weeks | **Unclear**: the site repo says "awaiting launch", and git shows work to 28 Oct | UI and UX, backend and database problems |

If you remember what you **expected** at the start ("I thought it'd take a week"), add that too. It's the most useful number.

### How the estimate gets redone

1. **Overrun ratio** for each build = actual hours ÷ expected hours. If you don't remember the expected time, use actual hours per comparable unit of work (for example, hours per page or per API route).
2. Take the **median** ratio (P50) and the **worst** ratio (a stand-in for P80 with only three data points).
3. Multiply each phase's planned days in the sprint table by both.
4. Plan to the P80 figure. Whatever doesn't fit in 14 days moves to "after the break", starting from the bottom of the ROLES_MATRIX ranking (F5 first).
5. On day 3 and day 7, compare actual progress against the P50 line. If you're beyond P80, cut scope again.

Three builds is a small sample. Treat the result as a better guess, not a measurement. After Stage A, your own Agent Lab phase times become the best reference class and replace this.

### Re-estimated sprint

*First pass, 4 Nov 2026. Redo it once the two unclear rows are confirmed.*

- **P50 (median of the three clear builds): about 2×** (1.5×, 2.2×, 14×). Big T's and Raeng had clear endpoints and are the best comparison.
- **Worst: 14× (hju.dev).** It mostly measures scope growth, not speed, so read it as a warning about adding features mid-build rather than as a multiplier.
- **Pattern:** UI and UX took longest in four of five builds, plus backend and database problems in two. Expect /lab (all UI) and the Phase 1 roles to overrun first.
- **The 30 Nov target at 2×:** the four steps of the revised plan don't fit in about 13 hours, and Day 0 alone has taken 4 hours so far. Plan to the PRD's fallback, Day 0, Phase 1 and the Site Doctor half of Phase 2 with a screenshot instead of a live /lab, and treat the live page as a stretch.
- After Phase 1, Agent Lab's own phase times replace this estimate (Part 2, step 6 above).

| Phase | Planned days | × P50 | × P80 | Fits in 14 days at P80? |
| --- | --- | --- | --- | --- |
| Day 0 spikes + skeleton | 1 | | | |
| 1 Database core | 1 | | | |
| 2 Site Doctor and alerts | 2 | | | |
| 3 Public API | 1 | | | |
| 4 /lab v1 | 2 | | | |
| 5 Admin and approvals | 2 | | | |
| 6 Lead Scout + eval gate | 2 | | | |
| 7 Replay (+ orientation if time) | 1 | | | |
