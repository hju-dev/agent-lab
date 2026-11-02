# Neon Free plan playbook: keep the database asleep

**Audience:** a coding agent (Claude Code or similar) working in a project whose database is on Neon, and the developer reviewing its work.
**Purpose:** find and remove everything that keeps a Neon compute awake, so the project stays inside the Free plan's monthly compute allowance and never gets locked out.
**Origin:** written on 28 October 2026 after this failure took down a production site (case study at the end).


> **Copied into agent-lab on 28 October 2026** from Henry's own playbook (kept in a private client repo). The case study is anonymized for this public repo. Free-plan figures here were Henry's at the time of writing; `docs/SOURCES.md` holds the verified ones. Agent Lab applies this playbook in ADR-0011; Studio's Builder and Auditor apply it to any client build with a database.
---

## 1. How the Free plan fails

Read this before changing anything. The fixes only make sense once these five facts are clear.

1. **The limit is compute time, not storage.** A small database (tens of MB) can still exhaust the plan.
2. **The allowance is measured in compute-unit hours (CU-hours) per project per month.** At the time of writing it is about 100 CU-hours per project per month. Confirm the current figure on Neon's pricing page; do not trust this number blindly.
3. **The compute bills while it is awake,** at its current size: at least the autoscaling minimum, usually 0.25 CU.
4. **It sleeps only after about 5 minutes with no activity** (scale to zero). On the Free plan this delay cannot be lengthened or disabled. Any request, open connection or query within 5 minutes of the last one keeps it awake.
5. **An always-awake 0.25 CU compute uses about 182 CU-hours a month** (0.25 × 730 hours). That is nearly double the allowance. **A project that never sleeps will run out around day 16 to 17 of every month.**

**What happens when it runs out:** Neon refuses every query until the 1st of the next month (00:00 UTC). The driver returns HTTP 402 with the message `Your account or project has exceeded the quota. Upgrade your plan to increase limits.` Everything that touches the database fails: sign-in, checkout, admin screens, health checks, backups. Pages served from a cache may keep loading, which hides the outage from anyone who only checks the home page.

**The goal:** the compute is awake only when a person does something that needs the database (submits a form, places an order, edits content), plus a small number of scheduled jobs. Page views and bots must not wake it.

---

## 2. Rules for the agent

- **Phase order is fixed:** audit (read only), report, get approval, change, verify, monitor. Do not edit code before the developer has seen the audit report.
- **Ask before** changing Neon project settings, changing production environment variables, running SQL against production, deleting branches, or committing and pushing.
- **Never deploy while the database is locked out (402).** A build that pre-renders pages may succeed using fallback content and then serve that fallback until the next rebuild, or fail outright. Restore database access first.
- **Before removing a time-based rebuild, confirm on-demand rebuilds exist** for every admin action that changes public content. Otherwise edits stop appearing.
- **Keep behavior identical** for users, apart from caching delays the developer has agreed to.
- **Report what you could not verify,** especially anything that needs a real build, a signed-in user or production traffic.

---

## 3. Phase 1: Audit (read only)

### 3.1 Measure current usage first

Use the Neon MCP server if it is connected (`describe_project`, `list_branches`, `list_branch_computes`). Otherwise use the API with a Neon API key (the developer supplies it; never print it):

```bash
curl -s "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  | jq '.project | {compute_time_seconds, active_time_seconds, consumption_period_start, consumption_period_end, default_endpoint_settings}'
```

Interpret:
- `compute_time_seconds` is CU-weighted. CU-hours used this month = `compute_time_seconds / 3600`.
- `active_time_seconds` is wall-clock time awake.
- **Awake ratio** = `active_time_seconds / seconds elapsed since consumption_period_start`.
- **Projected month** = CU-hours used ÷ days elapsed × days in month.

| Awake ratio | Projected CU-hours | Verdict |
|---|---|---|
| Under 10% | Under 20 | Healthy |
| 10 to 40% | 20 to 70 | Watch; look for avoidable wake sources |
| Over 40% | Over 70 | Will likely run out. Treat as urgent |
| Near 100% | 150+ | Something keeps it permanently awake. Find it before anything else |

Also list every branch and compute. **Every compute on every branch counts toward the same project allowance.** Forgotten test branches with running computes, preview-deployment branches and read replicas all spend it.

### 3.2 Find wake sources in the code

Search the whole repository. For each hit, record file and line, how often it can fire, and whether it touches the database.

**A. Time-based rebuilds or caches that query the database** (Next.js shown; adapt for other frameworks)
```bash
grep -rnE "export const revalidate|revalidate:|next:\s*\{\s*revalidate|unstable_cache|cacheLife\(" src app pages lib
```
Any interval under a few hours on a page or data function that queries the database is a wake source once visits are frequent: every visit after the interval triggers a rebuild, and every rebuild wakes the database.

**B. Pages rendered on every request**
```bash
grep -rnE "force-dynamic|dynamic\s*=\s*'force-dynamic'|cookies\(\)|headers\(\)|searchParams|noStore|unstable_noStore|connection\(\)" src app pages
```
A public page that is dynamic and queries the database wakes it on every visit, including bots. Check whether each one really needs request-time data.

**C. Browser code that calls database-backed endpoints on load or on a timer**
```bash
grep -rnE "fetch\(['\"\`]/api/|useSWR|useQuery|refetchInterval|refreshInterval|setInterval|revalidateOnFocus|refetchOnWindowFocus|EventSource|WebSocket" src app public components
```
Look for per-page-view fetches, polling, refetch-on-focus and live updates.

**D. Short HTTP caching on database-backed route handlers**
```bash
grep -rnE "Cache-Control|s-maxage|max-age|stale-while-revalidate" src app pages
```
A CDN cache of 10 to 60 seconds on a popular endpoint means one database query per short interval, all day.

**E. Middleware or proxy that touches the database on every request**
```bash
grep -rnE "middleware|proxy" -l src app | xargs grep -nE "sql|prisma|drizzle|db\.|pool|query\(" 2>/dev/null
```
Typical culprits: database-stored sessions checked on every request, rate limiting stored in Postgres applied to every route, request logging or analytics written to the database, feature flags read from the database.

**F. Auth with database sessions on public pages**
Check the auth library's session strategy (for example NextAuth or Auth.js `session: { strategy: "database" }`, Lucia, custom session tables). If every page load, including public ones, reads the session table, the database is awake whenever anyone is browsing.

**G. Long-lived connections**
```bash
grep -rnE "new Pool|createPool|pg\.Pool|max:\s*[0-9]+|idleTimeoutMillis|keepAlive|PrismaClient|drizzle\(" src lib server
```
On a long-running server (Docker, VPS, Fly, Railway, Render, a persistent Node process), **an idle pooled connection keeps the compute awake.** Neon only suspends when there are no active connections. Serverless functions using the `@neondatabase/serverless` HTTP driver do not have this problem; a persistent `pg.Pool` with no idle timeout does.

**H. Scheduled and background work**
```bash
grep -rnE "\"crons\"|schedule:|cron\(|node-cron|setInterval|bullmq|agenda|pg-boss|LISTEN|NOTIFY" . --include=*.json --include=*.yml --include=*.yaml --include=*.ts --include=*.js
```
List every cron, queue worker, poller and `LISTEN` loop with its interval. A job every 5 minutes or less keeps the compute awake permanently. Workers that poll a jobs table are a classic cause.

**I. Health checks and monitors**
Find health or status endpoints and check whether they query the database. Ask the developer which URLs their uptime monitors (UptimeRobot, Better Stack, Pingdom, Sentry, Vercel) check, and how often. **A monitor hitting a database-backed URL every 1 to 5 minutes, or a page whose cache expires that often, keeps the database awake by itself.**

**J. Non-production traffic on the production branch**
Check environment files and hosting settings for preview deployments, staging sites, local development, test suites, CI and database tools (pgAdmin, TablePlus, Drizzle Studio, Prisma Studio) pointing at the production branch's connection string. A dev server left running, or a GUI client left connected, keeps it awake.

**K. Neon features that prevent suspend**
Logical replication with active subscribers and read replicas keep computes running. Check `enable_logical_replication` and the computes list.

### 3.3 Write the audit report

Produce, before any change:
1. The usage numbers from 3.1, with the awake ratio and the projected month.
2. A table of wake sources: location, trigger, worst-case frequency, estimated effect (High, Medium, Low), and proposed fix.
3. The single most likely reason the compute is awake as much as it is.
4. What you need from the developer: monitor URLs, preview and staging setup, which pages must show live data.

---

## 4. Phase 2: Fix patterns

Apply only what the audit found and the developer approved. In order of typical impact:

1. **Rebuild public pages on demand, not on a timer.**
   - Every admin action that changes public content must call the framework's on-demand invalidation (Next.js: `revalidatePath` or `revalidateTag`; others: purge the CDN or cache key).
   - Then raise time-based intervals to a long safety net. One day (`export const revalidate = 86400`) is a good default; it self-heals if a rebuild ever ran while the database was unreachable.
   - Do not use "never" (`false`) unless every change path is covered and the developer accepts that a bad build stays until the next edit.
2. **Embed data in the page instead of fetching it after load.** If browser code fetches settings, text or catalog data on every page view, render that data into the page (for example `<script type="application/json" id="page-data">`, with `<` escaped as `\u003c`) and read it in the browser. This removes the request entirely, and the browser copy can never disagree with the page.
3. **Long CDN caching for any database-backed GET endpoint that must remain public:** `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` or longer. Pair it with on-demand purge if freshness matters.
4. **Remove polling.** Disable `refetchInterval`, `refreshInterval`, `revalidateOnFocus` and `setInterval` refreshes on database-backed data unless a person is actively waiting for an update. Prefer refresh-after-action.
5. **Keep the database out of middleware.** Use signed, stateless session tokens (JWT or encrypted cookies) for request-time checks. Rate limit only the routes that need it (form posts, checkout, login), not every page. Send request logs to a log service, not Postgres.
6. **Close idle connections** on long-running servers: set the pool's idle timeout to well under 5 minutes (for example `idleTimeoutMillis: 10_000`) and a small `max`. Or switch to the Neon serverless HTTP driver, which holds no connection.
7. **Make health checks cheap.** An uptime monitor should hit a static file or a route that does not query the database. If a database check is wanted, cache a healthy result for at least 30 minutes (`s-maxage=1800`) and do not cache failures.
8. **Batch scheduled work into as few wake-ups as possible.**
   - Daily rather than hourly where acceptable.
   - Several daily jobs at the same time of day, so one wake-up covers them all.
   - No job more often than every 15 to 30 minutes unless essential.
   - Replace table-polling workers with event-driven triggers.
9. **Separate non-production traffic.** Point preview deployments, staging, local development and tests at a separate Neon branch, and delete idle test branches and their computes.
10. **Optional: cap the compute size** on small projects (autoscaling maximum 0.25 to 0.5 CU) so a traffic burst cannot burn hours at 2 CU. Ask first; it slows heavy queries.
11. **Fail gracefully on 402.** Where the app catches database errors, detect `exceeded the quota` and show a clear message (for example "Online ordering is temporarily unavailable; contact us on ...") instead of a generic error. Make sure the error is reported once, not thousands of times.

---

## 5. Phase 3: Verify

1. Type check, lint and run tests.
2. Confirm on a running copy (local or preview) that a plain page view makes no database-backed requests. In the browser, record network calls; on the server, log queries.
3. Confirm every admin edit still appears on the public site promptly.
4. After deploying, check Neon a few times over 24 to 72 hours:
   - `compute_last_active_at` and the compute state should show it suspending (`idle`) between real activity.
   - The awake ratio should fall sharply.
5. Re-run the projection from section 3.1 after a week, and record the before and after numbers in the project's docs.

---

## 6. Phase 4: Monitor so it can't happen silently again

1. **Weekly usage check** (recommended: a scheduled CI job). Call the Neon API from 3.1, compute the projected month, and fail the job (which emails the repository owner) if the projection exceeds 70% of the allowance. Store `NEON_API_KEY` and `NEON_PROJECT_ID` as CI secrets. A sketch:
   ```yaml
   name: Neon usage check
   on:
     schedule: [{ cron: '0 2 * * 1' }]   # Mondays
     workflow_dispatch:
   jobs:
     check:
       runs-on: ubuntu-latest
       steps:
         - env:
             NEON_API_KEY: ${{ secrets.NEON_API_KEY }}
             NEON_PROJECT_ID: ${{ secrets.NEON_PROJECT_ID }}
             ALLOWANCE_CU_HOURS: '100'
           run: |
             p=$(curl -fsS "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID" -H "Authorization: Bearer $NEON_API_KEY")
             used=$(echo "$p" | jq '.project.compute_time_seconds / 3600')
             start=$(echo "$p" | jq -r '.project.consumption_period_start')
             days=$(( ( $(date +%s) - $(date -d "$start" +%s) ) / 86400 + 1 ))
             proj=$(echo "$used $days" | awk '{printf "%.1f", $1 / $2 * 30}')
             echo "Used ${used} CU-hours in ${days} days; projected ${proj} for the month"
             awk -v p="$proj" -v a="$ALLOWANCE_CU_HOURS" 'BEGIN { exit (p > a * 0.7) }' || { echo "::error::Projected Neon usage ${proj} exceeds 70% of ${ALLOWANCE_CU_HOURS}"; exit 1; }
   ```
   Check the response fields against Neon's current API reference before relying on it.
2. **Error alerts that survive a flood.** Configure the error tracker to alert on a new issue, and make sure its free event quota cannot be exhausted by one repeating error. Use rate limits or sampling for that issue, or catch-and-report-once at the source.
3. **Uptime monitoring that notices database failure.** Keep one monitor on a static URL (site up), plus one on a cached database health check every 30 minutes or more (database reachable). Two different alerts tell you which part failed.
4. **Document it** in the project's runbook: the allowance, how to check usage, what a quota lockout looks like, and the two ways out (upgrade the plan, or wait for the 1st).

---

## 7. Case study: a small bakery shop (October 2026)

A small Next.js shop on Vercel and Neon Free. It used about 7.5 CU-hours in its first three weeks (September). From 1 October it ran at about 6 CU-hours a day, was awake roughly 97% of the time, and was locked out at 19:05 UTC on 18 October with 110 CU-hours used. Online ordering, the admin dashboard and the nightly backups failed for the rest of the month. No alert reached anyone: the error tracker's free quota was used up by the same error within two days.

| Wake source found | Why it kept the database awake | Fix |
|---|---|---|
| Public pages with `export const revalidate = 300` | Any visit more than 5 minutes after the last rebuild triggered a new rebuild with database queries. With regular visits, rebuilds came about every 5 minutes, matching Neon's 5-minute sleep timer | On-demand `revalidatePath` on every admin save (already present), timer raised to 1 day |
| Browser script fetched `/api/content` and `/api/settings` on every page view, CDN-cached for 10 and 30 seconds | Any visitor after a cache expiry woke the database | Data embedded in each page as JSON; endpoints cached for an hour |
| Uptime monitors set up in the first days of October, one with an unrecorded URL (most likely the home page, every 5 minutes) | Guaranteed a visit, and therefore a rebuild, every 5 minutes, day and night | Monitors pointed at a static file; database health check cached 30 minutes |
| Error tracker free quota | One repeating error used the month's events, so later failures were silent | Alert on new issues; protect the quota |

**Lessons:**
1. The risk had been written down ("anything that queries the database on a short interval keeps it awake"), but nothing measured it. Measure usage; don't assume it's fine.
2. "Cached" is not the same as "doesn't touch the database". Ask how often each cache is refilled.
3. Adding monitoring can itself cause the outage it was meant to detect.
