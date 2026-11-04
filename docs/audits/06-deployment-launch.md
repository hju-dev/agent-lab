# Deployment & Launch Readiness Audit

> Henry's audit prompt 6 of 7. Used by the Studio Auditor. See the PRD's "Auditor's checklist" table for which sections run on the demo track.

Act as a seasoned web developer and deployment consultant. Run this as a pre-launch / pre-deploy readiness review. I'm still learning, so explain each unfamiliar term briefly as you go and be precise about what "done" looks like for each item.

### SEO & Metadata Crawlability
- sitemap.xml correctly formatted and uploaded
- Canonical tags set up correctly to avoid duplicate content
- llms.txt properly configured for AI crawlers/bots
- Act like a Google bot / search engine crawler and verify: can you actually read the page content? Check for empty containers caused by missing server-side rendering (No SSR)
- Pre-rendering in place so bots see real content, not a blank shell

### Content & Structure
- At least 5 blog posts live, visible, and optimized
- About page with a real story, not boilerplate
- Before/after or portfolio gallery loads correctly and is well organized (if applicable)
- Each service/product has its own dedicated, well-structured page

### User Experience & Accessibility (deploy-blocking subset)
- Rich tooltips for navigation
- Favicon present and correct
- Tap-to-call phone number works on mobile
- Form error messages clear and visible
- Opening hours displayed (if applicable)

### Security & Compliance (deploy-blocking subset — full detail in the Security and Compliance prompts)
- Visible email address checked for phishing exposure
- Working, compliant cookie consent banner
- Terms of Service accessible and current
- Payment methods clearly displayed and secure
- Guarantee/refund statement included where relevant
- No secrets exposed in frontend code
- HTTPS enforced site-wide

### Technical & Performance
- Google Search Console connected — crawl status and indexing issues checked
- Images compressed and optimized
- All social/external links verified working
- Server-side rendering confirmed for bot-critical pages

### Version Control & Environments
- Repo initialized with proper .gitignore (node_modules, .env, build output)
- .env.example committed with placeholder values only
- main branch protected — no direct pushes
- Each feature developed on its own branch
- Commit messages descriptive and consistent
- Git history checked for accidentally committed secrets
- Three environments defined: local, staging, production, each with separate env var files
- Staging uses a separate database from production
- Staging URL not publicly indexed (robots.txt or auth wall)
- All deploys go to staging first, production second

### Hosting & Deploy Pipeline
- Hosting provider chosen and project configured
- Environment variables set in the hosting dashboard, never in code
- Custom domain configured with HTTPS enforced
- Deploy pipeline runs tests automatically before promoting to production
- Rollback plan documented — how do you revert a bad deploy in under 5 minutes?
- First deploy goes to staging, verified manually, then promoted to production
- Hosting/platform usage limits and abuse thresholds understood ahead of time, so a legitimate traffic spike or signup surge doesn't get the account auto-flagged or suspended
- Never submit/deploy on a Friday

### Launch-Day Checklist
- Run a beta before full launch
- Crash reporting wired up
- Delete-account button built and working
- Privacy policy hosted and linked
- What each SDK/third-party tool collects is declared
- SPF, DKIM, DMARC set up for the sending domain
- Signup tested end-to-end with a fresh email account
- Hard spend caps set on every API (especially AI/LLM APIs)
- LLM credit balance being watched, with an alert before it runs out
- Upgraded off any free tier that will silently throttle at launch traffic
- A database restore has been rehearsed, not just assumed to work
- A kill switch exists to disable a broken feature fast
- An over-the-air hot-fix path exists for the app, if applicable
- Support email is on your own domain, not a personal Gmail
- A demo account is available for reviewers (App Store/Play Store, if applicable)
- Restored purchases tested after a reinstall (mobile apps)
- Test payment keys swapped for production keys before going live
- The business/product confirmed against the payment processor's restricted or prohibited business list (e.g. Stripe's) before launch — violating it risks account termination and frozen funds, not just a warning
- Phased release turned on where the platform supports it (gradual rollout, not 100% at once)

### Reference — Core System Considerations (use as a checklist of areas to have deliberately decided on, not skipped by default)
System design & architecture · Frontend · APIs & backend logic · Databases & storage · Auth & permissions · Hosting & cloud · CI/CD & version control · Security · Rate limiting · Caching & CDN · Error tracking & logs · Monitoring & alerts · Testing · Scaling

### Reference — Pre-Launch Technical Baseline
Hide API keys · Purge Git secrets · Use a public-safe database key client-side · Enable row level security (RLS) · Encrypt sensitive data · Enforce server-side auth · Lock down record access · Block field tampering · Secure session cookies · Hash passwords · Rate limit login attempts · Add bot protection · Parameterize queries · Validate all input · Escape user content · Restrict file uploads · Trim unnecessary fields from API responses · Add security headers · Force HTTPS · Scan dependencies

### Reference — Build/Tooling Knowledge Base (bring in as needed per project)
Infrastructure: Kubernetes · Docker · S3 · FTP · CI/CD · Cloud hosting · Containerization · Firewalls · Serverless · Lambda · Load balancer · Proxy · Sharding · Partitioning · Availability
Data: Databases (relational + embedded) · DynamoDB · Caching · Kafka/RabbitMQ · SQS · Encryption
Dev workflow: Git/GitHub · Cherry-pick · Staging environments · PyCharm or equivalent IDE
AI/ML: TensorFlow (where relevant)
Ops concepts: Rate limiting · Throughput · QPS · RPC · Error logging · Long/short polling · Web sockets

### Reference — App Build Checklist (project kickoff → deploy)
Create a PRD → define value, pain point, and ICP in the PRD → export PRD to a .md file → load PRD into your coding agent → write a CLAUDE.md / agent instructions file → install relevant Claude Code plugins → connect GitHub → add a .gitignore → generate a brand doc → lock in your tech stack → set up a design system → break the PRD into tasks → set up database and auth → move keys to environment variables → split staging from production → add a README → plan your folder structure → add error tracking → explicitly define what you're NOT building for v1 → commit small and often

ADDITIONS (not in my original prompts):
- DNS/domain expiry monitoring — a lapsed domain renewal is a silent full-site outage
- SSL certificate auto-renewal confirmed, not just "it's on now"
- A documented incident response plan — who does what in the first 30 minutes of an outage or breach, even as a solo dev (this is really "what do I check first")
- Legal entity / business registration status checked if accepting payments (this can affect payment processor approval)
- Terms around what happens to user data if you shut the product down
- Domain registrar and hosting accounts secured with MFA and registrar lock (ties to the Security audit)
- Staging never contains real user data — seeded/fake data only
- A basic README and architecture note exist so a future collaborator (or future you) can onboard without asking you everything
- Deployment strategy defined (blue-green, canary, or at minimum "deploy to staging, verify, then promote") rather than one big-bang cutover
- Database backups actually run on an automated schedule — confirmed, not assumed, separately from the restore rehearsal above
- Dependency/patch update cadence — a recurring time set aside to update packages, not just handled at launch
- Post-deploy smoke test (even a manual 5-minute click-through) run every time before calling a deploy done
- A live payment test run in production with a real transaction through the actual payment provider, then immediately refunded — confirms the full payment path works end-to-end, not just that test-mode keys work

Output: a checklist report, grouped by the sections above, each item marked Ready / Not Ready / N/A, with the Not Ready items turned into a prioritized punch list before you ship.
