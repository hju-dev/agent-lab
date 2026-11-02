# Security Audit

> Henry's audit prompt 1 of 7. Used by the Studio Auditor. See the PRD's "Auditor's checklist" table for which sections run on the demo track.

Act as a senior application security consultant and cybersecurity researcher. You are auditing a live website/app and its codebase for a solo, non-technical-founder developer who is still learning — explain WHY each issue matters, not just what to fix, and give precise, step-by-step remediation instructions.

SCOPE: review the frontend, backend/API, database, auth, CI/CD, and infrastructure config. Where you cannot inspect code directly, tell me exactly what to paste in or which file/command to run so you can check.

Go through every item below. For each one: (1) confirm whether it's present as a risk, (2) explain the risk in plain terms, (3) give a concrete fix with code/config examples where useful. Use chain-of-thought reasoning — work through *how* an attacker would actually exploit each gap before recommending a fix. Present findings as a structured checklist grouped by the sections below, not a wall of text.

### Authentication & Sessions
- "You're logged in" is decided server-side only — the client never fakes identity
- Passwords hashed with a strong, salted algorithm (bcrypt, argon2id, or scrypt) before storage — never stored in plaintext, and never just encrypted (encryption is reversible, hashing isn't, and that distinction matters for stored passwords specifically)
- Password strength enforced at signup: a sensible minimum length (8 is a floor, longer is better) is the main lever, PLUS a check against a breached-password list — e.g. the HaveIBeenPwned Pwned Passwords API — rejecting any match, rather than relying on fixed character-composition rules alone
- Sessions that never expire; short-lived tokens with refresh rotation
- No MFA offered
- Broken password reset flows; reset links that never expire; no rate limit on password resets
- Sessions not reset on password change
- Account enumeration through login errors, signup, or password reset (generic error messages only)
- Accounts not locked after repeated failed logins
- No email verification on signup
- Face ID / biometric login implemented without proper consent flow

### Authorisation & Access Control
- Authorisation checked on every sensitive action, not just "are they logged in" — can THIS user touch THIS specific record?
- Permission checks done only in the frontend/UI, never enforced server-side
- IDOR / BOLA — predictable IDs with no ownership check
- Cross-user data access — one user reading or editing another user's data
- Mass assignment vulnerabilities
- Admin panel or admin/debug routes with no auth, or protected by login check instead of role check
- Permission model goes beyond a binary admin/user split — role-based access control (RBAC) scoped by team/org AND by action (view vs. edit vs. delete vs. invite on a given resource, not one blanket "can touch this" flag)
- A user who's an admin on one team/org can't act as admin on another team/org they don't belong to
- Default credentials left unchanged anywhere
- Excessive database permissions / service role key used where a scoped key would do

### Input Handling & Injection
- All input (form fields, URL params, API payloads, AI-generated input) treated as untrusted
- SQL injection — raw string concatenation instead of parameterized queries / safe ORM patterns
- NoSQL injection
- Stored and reflected XSS — user content ever rendered as raw HTML
- CSRF tokens present on state-changing requests
- Command injection
- Insecure deserialization
- Path traversal vulnerabilities
- SSRF — unrestricted URL fetching by the backend
- Misused dynamic conditions in ORM code

### Secrets & Configuration
- No API keys, JWT secrets, database connection strings (the FULL string — host, port, username, AND password, not just the password token), or admin tokens in frontend code, mobile app, or repo config files — a connection string belongs in .env only, never hardcoded
- Before every push, the entire codebase searched for hardcoded connection strings, API keys, and other secrets — not just the files you remember touching
- No secrets committed to Git or sitting in Git history (check history, not just current state)
- No real API keys ever pasted into a chatbot prompt or public repo — if it's been in either, treat it as exposed and rotate it
- .env files never public; .env.example only ever has placeholder values
- Environment variables not committed to the repository
- Build logs checked for leaked secrets
- Before every deploy, the codebase searched for console.log (or server-side equivalents) that could print form data, passwords, tokens, or anything else a user typed in — removed or replaced with redacted/structured logging

### Database & Storage
- Row Level Security (or equivalent) enabled on every table, tested per role (anon, user, admin)
- No table fully public/readable by default
- Public database key never grants write access it shouldn't
- Misconfigured Firebase, Supabase, S3, or other storage buckets (public buckets that should be private)
- Sensitive data encrypted at rest, not just in transit
- Tenant/data isolation strategy identified explicitly (shared database with row-level policies, separate schema per tenant, or separate database per tenant) and isolation enforced at the database/architecture level — not only in application code a future bug could bypass

### API & Backend
- Rate limiting on every public-facing endpoint, AI routes especially
- API endpoints don't trust user-controlled input for things like price or role
- Prices, permissions, and other business-critical values set server-side, never trusted from the client
- Backend API endpoints don't send excessive/unnecessary data fields in responses
- Error responses are consistent and never leak stack traces or internal details in production
- API versioning strategy in place
- CORS configured strictly (whitelist only) — never set to `*`
- Overly permissive CORS on any specific route
- Request size limits in place
- Timeouts set on all external calls — nothing that can hang indefinitely
- Webhook endpoints (payment, third-party) verify signatures — show me how to check this for Stripe specifically
- Protection against webhook replay attacks

### File Handling
- File uploads validated for type and size
- Upload types whitelisted, not blacklisted
- .php/.jsp or other executable file types blocked from upload
- Uploaded files stored in a way that prevents them from being executed
- Upload size limits enforced server-side

### AI-Specific Risks
- Prompt injection defenses on any user input that reaches an LLM
- AI usage capped (token/spend limits) to prevent budget drain
- AI agents given only the minimum permissions they need, not broad access
- AI-generated output rendered safely, never executed or rendered as raw HTML/code unsanitized
- Unpinned or unreviewed AI-suggested dependencies
- AI features checked for leaking sensitive info in responses

### Frontend & Client-Side
- Tokens never kept in localStorage — use httpOnly secure cookies
- Secure cookie flags set (httpOnly, Secure, SameSite)
- Sensitive data never stored insecurely in localStorage
- Source maps disabled in production builds
- Open redirects / unsafe user-controlled redirects checked
- Client-only security checks flagged as insufficient wherever found

### Dependencies & Supply Chain
- Dependencies audited for known vulnerabilities (`npm audit` or equivalent) and kept updated
- No unused packages shipped to production
- No malicious/typosquatted packages in the dependency tree
- CI/CD build permissions locked down — no untrusted GitHub Actions, pinned action versions
- Deployment credentials not exposed in CI/CD logs or config

### Monitoring, Logging & Recovery
- Security events logged (failed logins, suspicious behavior, rate-limit hits)
- A separate, immutable audit trail for sensitive actions — who did what, to which record, when — covering actual data changes on records that matter, not just security events like failed logins. This is the technical backbone SOC2-style audit logging needs, but say so plainly: full SOC2 certification also requires formal access-review policies, change-management process, vendor risk assessments, and an external auditor's attestation — none of which a code audit alone can confirm or grant. Flag this logging as necessary-but-not-sufficient for SOC2 rather than implying it alone gets me compliant
- Logs NEVER capture passwords, tokens, or other sensitive user data
- Alerts route somewhere I'll actually see them (email/SMS/Slack)
- No security checks that "fail open" on error
- Backup and point-in-time recovery strategy exists and has been tested (rehearse a restore)
- Data retention and deletion policy defined, including a working delete-account flow

### Default Posture
- Least-privilege roles by default everywhere
- HTTPS enforced site-wide; HSTS enabled
- Directory listing disabled
- Default/admin routes removed or renamed where not needed
- Security headers set (CSP, X-Frame-Options, etc.)

ADDITIONS (not in my original prompts, flagged because they're common real-world gaps):
- GraphQL/WebSocket/real-time endpoints reviewed with the same rigor as REST — these are frequently forgotten
- Business logic abuse and race conditions on critical operations (checkout, redemptions, one-time actions) — test what happens with two simultaneous requests
- Payment/subscription checks enforced server-side, never validated only on the frontend
- Duplicate submission / duplicate payment protection (idempotency keys on payment-triggering endpoints)
- Supply-chain review of any third-party MCP servers, browser extensions, or AI agent tool integrations connected to this project
- Dependency confusion risk — internal package names that could be squatted on public registries
- Subdomain takeover risk — check for DNS records pointing at deprovisioned services
- Clickjacking protection (X-Frame-Options / frame-ancestors) on any page handling sensitive actions
- MFA enforced on your own admin accounts — GitHub, hosting provider, domain registrar, database dashboard — not just end-user accounts
- Domain registrar and DNS locked down (registrar lock, DNSSEC where supported) to prevent domain hijacking
- CI/CD secrets scoped per-workflow, never one all-access token
- Full security header set reviewed: Content-Security-Policy, Permissions-Policy, Referrer-Policy — not just X-Frame-Options
- Subresource Integrity (SRI) hashes on any third-party script loaded from a CDN
- Third-party vendors (analytics, email, payment, AI APIs) reviewed for what user data they receive and whether that's disclosed
- A security.txt file present so researchers have a responsible way to report vulnerabilities
- MFA recovery/backup codes stored somewhere other than the device holding the primary factor
- Secrets rotation cadence defined — keys/tokens rotated periodically, not only after a suspected leak
- Encryption key management reviewed — where keys live, who can access them, whether they're rotated
- Backups encrypted at rest, not just the live database
- Session fixation and timing-attack resistance checked on the auth flow (constant-time token comparison)
- Regex used for input validation checked for ReDoS (catastrophic backtracking)
- Log output sanitized so untrusted input can't inject fake log lines
- Lockfiles (package-lock.json / yarn.lock) committed so dependency versions can't silently drift between environments
- A real process behind vulnerability reports — not just a security.txt file, but someone (you) actually reading and responding to what comes in

Output: a findings report grouped by the sections above, each item marked Pass / Fail / Not Applicable / Needs Verification, with a fix for every Fail.
