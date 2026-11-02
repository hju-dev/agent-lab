# Performance & Reliability Audit

> Henry's audit prompt 3 of 7. Used by the Studio Auditor. See the PRD's "Auditor's checklist" table for which sections run on the demo track.

Act as a performance optimization and reliability specialist reviewing my website/app. Give detailed, step-by-step guidance for each item, including specific tools/libraries where relevant — I want to actually implement these, not just know the theory.

### Speed & Loading
- Compress images and serve modern formats (WebP)
- Lazy loading for non-critical resources and images
- Code splitting so the initial load is small
- Minify JavaScript and CSS
- Defer non-critical scripts, prioritize essential ones
- Compress JSON/API payloads before transmission
- Add a CDN for content delivery
- Reduce network latency — audit for single points of dependency/bottleneck
- Core Web Vitals measured and acceptable

### Database & Queries
- Index the database for frequently queried columns
- Fix N+1 query problems
- Batch multiple row writes instead of one-at-a-time
- Cache expensive/repeat queries
- Use database connection pooling
- Paginate large lists and result sets server-side

### Frontend Behavior
- Fix unnecessary re-renders in the UI
- Debounce input handlers
- Allow UI updates to happen independent of backend response (optimistic UI, already covered in UX audit — check technical implementation here)
- Server-side rendering or caching to minimize frontend rebuild/load times

### Reliability & Error Handling
- Comprehensive error handling across the app, not just try/catch that swallows errors
- Loading states for every async action
- Empty states for every data fetch
- Graceful handling of failed requests — retries where appropriate, clear failure messaging where not
- API timeouts managed so nothing hangs indefinitely
- Safeguards against duplicate submissions and duplicate payments

### Scaling & Infrastructure
- Rate limiting to prevent abuse
- API usage limits for fair access across users
- Spending caps set to avoid unexpected charges from cloud/API providers
- Load balancer / traffic distribution reviewed
- Single points of failure identified and mitigation documented
- Auto-scaling rules or limits set at the hosting level
- Third-party API rate limits documented — what happens when you hit them?

### Uploads & Storage
- Uploaded files compressed to save storage/bandwidth
- Upload size limits enforced

### Testing Under Load
- Test app performance with simultaneous/concurrent users
- Test backup restoration to confirm data integrity

### Monitoring
- Uptime monitoring configured with real-time alerts
- Error logging in place to catch and fix issues quickly

ADDITIONS (not in my original prompts):
- Memory leak check on any long-running client-side session (SPA that's left open for hours)
- Graceful degradation plan — what happens to the UI if a third-party API (payments, AI provider, maps) is down or slow
- Cold-start latency if running on serverless functions — measure it, not just assume it's fine
- Database migration strategy — can you roll a schema change forward and back without downtime
- Image/asset CDN cache invalidation strategy — stale assets after a redeploy are a common silent bug
- Bundle size budget — a hard ceiling on JS shipped to first paint, checked on every build
- Font loading strategy set (font-display: swap or similar) so text isn't invisible while fonts load
- Third-party scripts audited — each one justified, render-blocking ones deferred or removed
- Preconnect/dns-prefetch added for critical third-party origins (fonts, analytics, APIs)
- A health-check endpoint exists so uptime monitoring checks real app health, not just that the server responds
- Feature flags used for risky changes so they can be rolled back without a redeploy
- Cache-Control/ETag headers set correctly on API responses and static assets
- Static assets versioned/cache-busted on every deploy so users don't get stale JS/CSS after a release
- Client-side error boundaries in place so one broken component doesn't blank the whole page
- Database query timeouts enforced at the application level, not left to the database default
- Load-testing done with a real tool (k6, Artillery, or similar) before assuming the app holds up under traffic
- Read/write load test run specifically against the primary data object/tables — the ones the app can least afford to have slow down or fail under load — not just a generic homepage load test

Output: findings grouped by section above, each flagged Pass / Fail / Needs Verification, with a fix for every Fail and a note on expected impact (e.g. "this query fix should cut dashboard load from ~2s to ~200ms").
