# Done checks: every phase gate as a command

A phase is done when its commands pass, not when it "looks done". Each check below is a test that runs in CI (GitHub Actions on every pull request) unless it's marked **manual**. Manual checks are the ones a machine genuinely can't judge.

## The tools

| Tool | What it checks | Runs |
| --- | --- | --- |
| **Vitest** | Unit and integration tests: rules, caps, scanners, leak test, eval metrics | `npx vitest run` |
| **Playwright** (`@playwright/test`) | The real /lab page in a real browser: renders, keyboard, states, no private text | `npx playwright test` |
| **axe-core** (`@axe-core/playwright`) | Automated accessibility rules inside the Playwright tests | Part of Playwright |
| **Lighthouse CI** (`@lhci/cli`) | Performance, accessibility, best practices, SEO on the preview URL | `npx lhci autorun` |
| **psql** | Database permissions, run as each role against the dev branch | `psql "$URL" -c ...` |

Automated accessibility tools catch only part of real accessibility problems, so the keyboard and screen-size checks stay as Playwright tests plus a short manual pass.

## Phase by phase

### Day 0 · Spikes and walking skeleton
- Each spike's pass rule in [SPIKES.md](SPIKES.md), recorded in its results table.
- Skeleton commands in SPIKES.md pass.

### Phase 1 · Database core
```bash
psql "$LAB_PUBLIC_URL" -c 'select 1 from lab.runs limit 1'          # must fail: permission denied
psql "$LAB_PUBLIC_URL" -c 'select count(*) from lab.public_state'    # must succeed
npx vitest run tests/db/roles.test.ts
```
`roles.test.ts` loops over every table in `lab` and asserts `lab_public` can't select from any of them, and that every table has RLS enabled (`relrowsecurity = true` in `pg_class`). New tables are covered automatically.

### Phase 2 · Site Doctor and alerts
- `vitest`: for a site marked as having a database, the uptime check calls its static check URL, never the home page (S43).
- The weekly Neon usage workflow runs once by hand (`workflow_dispatch`), prints only the used and projected CU-hours, and fails when given a fake allowance of 1 CU-hour (S42).
- `vitest`: a simulated 402 "exceeded the quota" error marks the run failed once, with a plain message, and isn't retried 3 times (S44).
- `vitest`: sustained-drop rule on sample data (S7), retry and timeout behavior (S11, S12), env check fails with a clear message when a key is missing (S13), insert-or-ignore makes a second run add no rows (S10).
- `vitest tests/logs.test.ts`: runs Site Doctor with a fake lead name in the data and asserts the name never appears in stdout (S3).
- **Manual:** 3 days of runs in `lab.runs`; a deliberately broken URL produces a failure email (SP6 method).

### Phase 3 · Public API
- `vitest tests/leak.test.ts`: calls every public endpoint and asserts no private column name and no seeded private value (a fake lead name and URL) appears anywhere in the JSON (S1).
- `vitest`: public_text scanner rejects URLs, emails and lead names (S2).
- Headers check:
  ```bash
  curl -sI https://<preview>/api/lab/state | grep -i 'cache-control: .*s-maxage=60'
  ```
- `vitest tests/no-db-in-public.test.ts`: no file under `api/lab/` except `api/lab/admin/` imports the database client (S41). The leak test also runs against the snapshot JSON.
- **Neon stays asleep:** with the API under steady requests for 30 minutes (one a minute), Neon's `compute_last_active_at` doesn't change (S41).
- Rate limit: a test sends 100 requests and expects at least one `429` (S31).

### Phase 4 · /lab v1
- **Build check (ADR-0013):** `npm run build` in `lab/` succeeds; on the Vercel preview, `/lab` loads the React app, and the existing pages and `/api` functions still respond. `tsc --noEmit` passes for `lab/`.
- `vitest` + React Testing Library: each of the four states renders from a mocked snapshot; model and database text renders as text (no `dangerouslySetInnerHTML` anywhere, checked by a lint rule or grep in CI).
- **Playwright**, at widths 360, 768 and 1280:
  - the page loads and the stats strip shows a number
  - each of the four states renders (loading, live, stale, error), using mocked API responses
  - tab order reaches every interactive element and focus is visible
  - with `reducedMotion: 'reduce'`, no element has a running animation
  - page text contains no string from the seeded private data
- **axe-core** inside the same tests: zero violations at `serious` or `critical` impact.
- **Lighthouse CI** on the preview URL, 3 runs, median scores: accessibility ≥ 0.95, best practices ≥ 0.9, SEO ≥ 0.9, performance ≥ 0.85. Performance uses the median because single scores vary (SP2).
- `vitest`: a snapshot containing `<script>` renders as text, not HTML (P3, closed for /lab by React's escaping).
- **Manual:** a non-technical friend explains what /lab is after 60 seconds.

### Phase 5 · Admin and approvals
- `vitest tests/admin-auth.test.ts`: every admin route returns `401` with no session and `403` with a valid Clerk session whose user id isn't `ADMIN_USER_ID` (S29).
- `vitest`: approving a draft while `pitches_enabled` is false can't set "ready to send", at the API **and** the database level (S30).
- `vitest`: every decision writes one `evaluations` row.
- Queue cap: the 21st item is refused and the agent pauses (S19).

### Phase 6 · Lead Scout
- **Eval gate** in [EVALS.md](EVALS.md): `npx vitest run evals/` passes, and the draft score threshold is met (by the calibrated grader or by hand).
- `vitest tests/fetch-page.test.ts`: one test per S5 rule, including a hostname that resolves to `127.0.0.1`, a redirect to `169.254.169.254`, a redirect to another domain, a 4th redirect, `file://` and `ftp://` URLs, and a robots.txt disallow (S24).
- `vitest`: step cap 8, call cap 40, stop after 5 consecutive errors (S6).
- `vitest`: PII scrub removes emails and phone numbers in common formats (S25).
- `vitest`: evidence check rejects a draft containing a number not in the tool results (S8).
- `vitest`: the follow-up filter rejects each banned phrase in any letter case (S36), and no follow-up is drafted after a reply, an opt-out, or a second follow-up (S37).
- 5-URL test: 5 real sites run end to end with no errors.
- `vitest tests/logs.test.ts` extended to Lead Scout (S3).

### Phase 7 · Replay
- **Playwright**: with the API mocked as idle, the featured replay plays every step to the end ("3am test"); with the API returning an error, the static demo run plays instead (S17).
- **Playwright**: reduced motion: replay advances without animation.

### Phase 8–10
- Phase 8: `public_quality` hides the rate below 20 decisions (S20 unit test); one prompt change has before/after eval scores in `prompt_versions`.
- Phase 8: `vitest`: the pipeline view computes entered, moved-on and median days per stage from seeded data, flags the slowest stage as the constraint, and is reachable only by the admin role (never in a public view).
- Phase 9: **manual**: Memory Matters receives one report you approved and sent yourself.
- Phase 10: **manual**: security pass against your `security_protocol.md` and THREAT_MODEL.md; every UNMITIGATED row resolved or accepted in writing.

### Phases 11–14 (Studio)
- Phase 11: `skillspector scan` output saved for every installed skill, no high or critical findings; `/doctor` clean.
- Phase 13: the deliberately broken demo fails the Auditor; Lighthouse CI before-and-after scores saved.
- Phase 13: on a test client build, a fresh Playwright session records no request to `fonts.googleapis.com`, `fonts.gstatic.com` or any analytics, pixel or session-replay host before consent, and none after Reject; `audit.md` has a "Legal checks" section covering every applicable item in `docs/playbooks/legal-checks.md`.
- Phase 13: a test client build has a unique title and meta description per page, one `h1`, `sitemap.xml`, `robots.txt`, canonical URLs and valid structured data; Lighthouse SEO ≥ 0.9; every keyword in `brief.md` and `copy.md` cites a source file and date.
- Phase 13: the Auditor's `audit.md` covers every check in `docs/playbooks/ux-laws.md`, including Playwright measurements of the main CTA (at least 44 × 44 px at 375 px wide) and a form test for the Postel's-law input formats.
- Phase 13: each direction's DESIGN.md names a hero layout from the PRD menu and a wireframe from `hero-wireframes.md` with a reason and its phone order (checked at 375 px), and a demo's directions use at least two different layouts. The Auditor's report covers the hero at 375, 768 and 1280 px, text contrast of at least 4.5:1 over images, and the page's largest element (LCP). Each DESIGN.md also has a palette from `docs/playbooks/accent-palettes.md` (or one built with its recipe) and a scripted contrast table; axe-core's color-contrast rule passes on the built demo.
- Phase 13: a test app with a login passes the fast-startup checks in `docs/playbooks/fast-app-startup.md` (Slow 4G waterfall of at most 2 sequential requests before content, instant repeat open, sign-out after server revocation).
- Phase 13: a test client build with a database and `export const revalidate = 300` on a public page fails the Auditor's Neon audit as a High wake source.
- Phase 14: Playwright check that the Studio station on /lab shows no business name.

## Remaining manual checks (can't be automated)

1. The 60-second test with a non-technical person (Phase 4).
2. Reading the Actions logs at each stage gate for anything private (backs up the automated log test).
3. A keyboard-only and screen-reader pass of /lab (axe catches only part of it).
4. Alert emails actually arriving (SP6, then once a month).
5. The client report reaching Memory Matters (Phase 9).
6. Your "In my own words" entry, and Claude Code checking it.
7. Lawyer sign-off before `pitches_enabled` is ever turned on.

## CI wiring

One workflow, `ci.yml`, on `pull_request`: `npm ci` → `tsc --noEmit` (typecheck) → lint → `npm audit --audit-level=high` → `vitest run` → deploy preview (Vercel does this) → `playwright test` against the preview → `lhci autorun` against the preview. The PR can't merge unless all pass. The eval gate runs only when files under `agents/lead-scout/` or `prompts/` change, to save Gemini quota.
