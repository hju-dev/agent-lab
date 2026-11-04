# Sources: verified external facts

Every fact the plan depends on that comes from outside the project, with the primary source and the date it was checked. Free tiers and terms change, so re-check anything older than 60 days before relying on it. If a fact here and the PRD disagree, this file wins until the PRD is corrected.

**Status key:** **Verified** = read on the provider's own page. **Secondary** = only found on a third-party page. **Unpublished** = the provider doesn't state it; a spike or console check must measure it.

Checked: 17 October 2026.

## Gemini API (Lead Scout's model)

| Fact | Status | Source |
| --- | --- | --- |
| Free-tier rate limits (requests per minute, tokens per minute, requests per day) are **not published** in the docs. They're shown per project in AI Studio. | Unpublished | [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) → check [aistudio.google.com/rate-limit](https://aistudio.google.com/rate-limit) |
| Limits apply per project, not per API key. Daily quotas reset at midnight Pacific time. Limits are "not guaranteed". | Verified | [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) |
| Free-tier models listed include Gemini 3.8 Flash, 3.6 Flash, 3.5 Flash-Lite and 3.1 Flash-Lite. | Verified | [Pricing](https://ai.google.dev/gemini-api/docs/pricing) |
| On unpaid services, Google uses submitted content to improve its products, and human reviewers may read it. "Do not submit sensitive, confidential, or personal information to the Unpaid Services." | Verified | [Gemini API terms](https://ai.google.dev/gemini-api/terms) |
| Users must be 18 or older. | Verified | [Gemini API terms](https://ai.google.dev/gemini-api/terms) |
| Paid Services are required when making API clients available to users in the EEA, Switzerland or the UK. | Verified | [Gemini API terms](https://ai.google.dev/gemini-api/terms) |
| Function calling supports parallel and sequential (compositional) calls. Whether every free-tier model supports it is not stated. | Verified / Unpublished | [Function calling](https://ai.google.dev/gemini-api/docs/function-calling) → Spike SP1 |

### Limits shown in AI Studio for Agent Lab's project

Read from [aistudio.google.com/rate-limit](https://aistudio.google.com/rate-limit) by Henry on 2 November 2026. These apply to this project and are "not guaranteed", so re-check them monthly. RPM = requests a minute, TPM = tokens a minute, RPD = requests a day.

| Model | RPM | TPM | RPD | Use |
| --- | --- | --- | --- | --- |
| Gemini 3.5 Flash Lite | 15 | 250K | 500 | Lead Scout |
| Gemini 3.1 Flash Lite | 15 | 250K | 500 | Lead Scout's fallback |
| Gemini 3 Flash, 3.6 Flash, 3.8 Flash, 2.5 Flash | 5 | 250K | 20 | Too low: about 2 leads a day |
| Gemini 2.5 Flash Lite | 10 | 250K | 20 | Too low |
| Gemma 4 26B and 31B | 30 | 16K | 14.4K | Probable eval grader (31B), tested in SP1 |
| Pro models, Gemini 2 Flash, image and video models | 0 | 0 | 0 | Not on the free tier |
| Search grounding for Gemini 3 and newer | | | 0 | Not used |

## PageSpeed Insights API (Site Doctor and Lead Scout audits)

| Fact | Status | Source |
| --- | --- | --- |
| An API key is recommended for automated queries but not required. | Verified | [Get started](https://developers.google.com/speed/docs/insights/v5/get-started) |
| Quota for Agent Lab's project: 25,000 queries a day and 30 queries a minute. Agent Lab needs about 50 a day, with calls at least 2 seconds apart and a 429 treated as wait and retry. | Verified | Read by Henry in Google Cloud Console → APIs → Quotas, 2 Nov 2026 |
| Lighthouse performance scores vary between runs; Google recommends treating them as a distribution, not a single number. | Verified | [Performance scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring) → Spike SP2 |

## GitHub Actions (schedules)

| Fact | Status | Source |
| --- | --- | --- |
| Scheduled runs can be delayed during high load, especially at the start of every hour; if load is high enough, queued jobs may be dropped. | Verified | [Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows) |
| Shortest interval is every 5 minutes. Schedules run on the default branch, in UTC by default. | Verified | same |
| In a public repo, scheduled workflows are disabled automatically after 60 days with no repository activity. | Verified | same |
| Standard GitHub-hosted runners are free for public repositories. | Verified | [Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions) |
| Failure notifications for scheduled workflows go to the user who created the workflow (or last changed the cron), if their notification settings allow. | Verified | [Notifications for workflow runs](https://docs.github.com/en/actions/concepts/workflows-and-actions/notifications-for-workflow-runs) |

## Neon (database)

| Fact | Status | Source |
| --- | --- | --- |
| Free plan: 100 compute-unit hours per project per month and 1 GB of storage per project. | Verified | [Neon pricing](https://neon.com/pricing) |
| 10 branches per project; scale to zero after 5 minutes idle, which can't be turned off on Free; 6-hour restore window. | Verified | [Neon pricing](https://neon.com/pricing) |
| Project-scoped API keys have Editor access to one project and can't delete it. Only organization admins can create them, and they belong to the organization that owns the project (checked 2 Nov 2026). | Verified | [Manage API keys](https://neon.com/docs/manage/api-keys) |

### From Henry's own incident (October 2026)

| Fact | Status | Source |
| --- | --- | --- |
| When the allowance runs out, Neon refuses queries until the 1st of the next month and the driver returns HTTP 402 "Your account or project has exceeded the quota. Upgrade your plan to increase limits." | Observed by Henry on a client site, not checked against Neon's docs | `docs/playbooks/neon-free-tier.md` |
| An always-awake 0.25 CU compute uses about 182 CU-hours a month (0.25 × 730) | Arithmetic from the verified figures above | — |
| Neon's project API returns `compute_time_seconds`, `active_time_seconds` and the consumption period | From the playbook; check against Neon's current API reference before relying on it | `docs/playbooks/neon-free-tier.md` |

## Vercel (hosting /lab and its API)

| Fact | Status | Source |
| --- | --- | --- |
| Hobby cron jobs run at most once a day, with ±59 minutes precision. | Verified | [Cron usage and pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing) |
| Hobby includes 1M function invocations, 4 hours of active CPU and 100 GB of fast data transfer a month. | Verified | [Fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines) |
| Hobby is "restricted to non-commercial personal use only". Commercial usage includes "advertising the sale of a product or service" and "receiving payment to create, update, or host the site". | Verified | [Fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines) → ADR-0009 |

## Email and monitoring

| Fact | Status | Source |
| --- | --- | --- |
| Resend free: 3,000 emails a month, 100 a day. | Verified | [Resend pricing](https://resend.com/pricing) |
| Resend: "You must add and verify at least one domain" to send; `onboarding@resend.dev` is for testing only. | Verified | [Resend domains](https://resend.com/docs/dashboard/domains/introduction) → ADR-0007 |
| Healthchecks.io free (Hobbyist): 20 checks, 100 log entries per check. Whether email alerts are included on free isn't stated on the pricing page. | Verified / Unpublished | [Healthchecks pricing](https://healthchecks.io/pricing/) → Spike SP6 |
| Upstash Redis free: 500K commands a month, 250 MB data, 10 GB bandwidth. The page gives conflicting database counts. | Verified (count unclear) | [Upstash pricing](https://upstash.com/pricing/redis) |
| Upstash's free plan allowed Henry only one database, so Agent Lab shares the chatbot's (2 Nov 2026). | Observed by Henry | Upstash console |
| Upstash supports Redis ACL users limited to a key pattern (`ACL SETUSER`, e.g. `~cache:*`). `ACL SETUSER` rejects made-up passwords: the value must come from `ACL GENTOKEN`, and that token also works as the REST token. The Read-only access page's `>somesecurepassword` example was rejected on this database. The docs don't mention plan limits or show a key pattern used over REST (checked 2 Nov 2026). Tested on the shared free database on 3 Nov 2026 with `spikes/upstash-acl-check.ts`: a `lab_agent` user limited to `~lab:*` could set a `lab:` key over REST and was refused (403) for other keys, `DBSIZE` and `ACL WHOAMI`. | Verified; tested on this database | [ACL SETUSER](https://upstash.com/docs/redis/commands/server/acl-setuser), [ACL GENTOKEN](https://upstash.com/docs/redis/commands/server/acl-gentoken), [Read-only access](https://upstash.com/docs/redis/troubleshooting/readonly_connection) |
| Cloudflare Pages free: 500 builds a month, 100 projects, 20,000 files per site. The limits page doesn't address commercial use. | Verified / Unpublished | [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/) |

## Law and licensing

| Fact | Status | Source |
| --- | --- | --- |
| CAN-SPAM applies to all commercial email, including business-to-business. Requirements: no false headers, no deceptive subject lines, identify the message as an ad, include a valid physical postal address, explain how to opt out, honor opt-outs within 10 business days. Penalties up to $53,088 per violating email. | Verified | [FTC CAN-SPAM compliance guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business) |
| GSAP is free, including all plugins, for commercial use; the license bars using it in no-code visual animation tools that compete with Webflow. | Verified | [GSAP licensing](https://gsap.com/licensing/) |
| Whether Henry may do paid freelance work while in Thailand on his current status. | **Not answerable from a public source.** Lawyer question | [VALIDATION_PLAN.md](VALIDATION_PLAN.md#lawyer) |

## Claude (Studio)

| Fact | Status | Source |
| --- | --- | --- |
| Pro has a 5-hour session limit and a weekly limit, shared between Claude Code and claude.ai. `/status` shows remaining usage. If `ANTHROPIC_API_KEY` is set, Claude Code uses the API and bills it. | Verified | [Use Claude Code with your Pro or Max plan](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan) |
| Programmatic tool calling: code running inside the API's code execution tool (`code_execution_20260120` or later) can call tools listed in `allowed_callers`. It's part of the Claude API (checked 1 Nov 2026) | Verified | [Tool reference](https://platform.claude.com/docs/en/docs/agents-and-tools/tool-use/tool-reference) |
| Cloudflare Code Mode: over 2,500 endpoints through `search()` and `execute()` in about 1,000 tokens, compared with an estimated 1.17 million (the page's summary says "over 2 million"); runs in a V8 sandbox with no file system and outside network access off by default. Post dated 20 Feb 2026 | Verified (vendor's own figures) | [Code Mode: give agents an entire API in 1,000 tokens](https://blog.cloudflare.com/code-mode-mcp/) |
| Claude Code tool search defers MCP tool details, on by default at about a 10% context threshold | Third-party only; check Claude Code docs | [ClaudeLog](https://claudelog.com/faqs/what-is-tool-search-in-claude-code/) |

## Security standards

| Fact | Status | Source |
| --- | --- | --- |
| OWASP Top 10 for LLM Applications 2025: LLM01 Prompt Injection, LLM02 Sensitive Information Disclosure, LLM03 Supply Chain, LLM04 Data and Model Poisoning, LLM05 Improper Output Handling, LLM06 Excessive Agency, LLM07 System Prompt Leakage, LLM08 Vector and Embedding Weaknesses, LLM09 Misinformation, LLM10 Unbounded Consumption. | Verified | [genai.owasp.org/llm-top-10](https://genai.owasp.org/llm-top-10/) |
| OWASP ASVS latest stable version is 5.0.0. | Verified | [owasp.org/asvs](https://owasp.org/asvs) |
| Exact ASVS 5.0 requirement IDs for each safeguard. | Not yet mapped. THREAT_MODEL.md maps by chapter topic; map IDs in Phase 3 | [ASVS on GitHub](https://github.com/OWASP/ASVS) |

## Eval tooling

| Fact | Status | Source |
| --- | --- | --- |
| promptfoo is an open-source CLI for evaluating LLM apps and runs in CI. License not named on the intro page. | Verified / check license | [promptfoo intro](https://www.promptfoo.dev/docs/intro/) |
| promptfoo's `llm-rubric` is an LLM-as-judge grader. With a Google key the default judge is `gemini-2.5-pro`; the grader provider can be overridden per test or assertion. | Verified | [llm-rubric](https://www.promptfoo.dev/docs/configuration/expected-outputs/model-graded/llm-rubric/) → override to a free-tier model; check it's available free |

## Facts that affect things outside Agent Lab

- **Your existing RAG chatbot** uses the Gemini free tier on a public site. The terms require Paid Services for API clients made available to users in the EEA, Switzerland or the UK. Ask the lawyer or senior dev how to handle this (for example, blocking those regions, or a paid key).
- **Big T's and Grass Roots:** if either site takes payments or advertises the business and is hosted on Vercel Hobby, it falls under Vercel's "commercial usage" wording. Check which plan each is on.

## Studio design tools (checked 18 October 2026)

| Fact | Status | Source |
| --- | --- | --- |
| Awesome Design.md is a collection of DESIGN.md files about real sites (Apple and Stripe included), MIT licensed, used by copying a file into a project. It states "We do not claim ownership of any site's visual identity." | Verified | [github.com/voltagent/awesome-design-md](https://github.com/voltagent/awesome-design-md) |
| img2threejs is an agent skill that turns one image into a procedural Three.js model; Apache 2.0; core scripts are Python 3.10+ standard library; the optional img2glb plugin uses a hosted service | Verified | [github.com/img2threejs/img2threejs](https://github.com/img2threejs/img2threejs) |
| "Image 23 js" on your list is img2threejs (image-to-Three.js) | Assumption: the name matches and nothing else by that name turned up. Confirm it's the one you meant | — |

## Motion sources (checked 18 October 2026)

| Fact | Status | Source |
| --- | --- | --- |
| transitions.dev: 43+ UI transitions (HTML/CSS, React), copy-and-paste or via its Motion Skill; free and "Pro only" items | Verified (homepage) | [transitions.dev](https://transitions.dev/) |
| transitions.dev license and client-use terms | Not checked: the Terms page didn't load in this session | Henry reads transitions.dev's Terms page |
| animos: browser-based motion templates exporting MP4/WebM showcase videos | Verified (homepage) | [animos.app](https://animos.app/) |
| animos pricing and commercial terms | Not on the homepage | Henry checks before using exports in a pitch |

## Stack review (checked 29 October 2026)

| Fact | Status | Source |
| --- | --- | --- |
| Node 20 reached end of life on 2026-04-30. Node 24 is LTS until 2028-04-30 (Maintenance from 2026-10-20); Node 22 until 2027-04-30 | Verified | [nodejs/release](https://github.com/nodejs/release) |
| Claude Code: keep CLAUDE.md under 200 lines; longer files "consume more context and may reduce adherence" | Verified | [Claude Code memory docs](https://code.claude.com/docs/en/memory) |
| Claude Code: a `.claudeignore` file "has no effect"; use `Read` deny rules such as `Read(./.env)` | Verified | [Claude Code permissions docs](https://code.claude.com/docs/en/permissions) |
| Supabase free projects pause after low activity over 7 days; restorable for up to a year | Verified | [Supabase project pausing](https://supabase.com/docs/guides/platform/free-project-pausing.md) |
| Supabase free database size and compute limits | Secondary only; pricing page didn't load | Check supabase.com/pricing |
| Railway: Free plan with $1 of credit a month; one-time $5 trial; mentions a post-paid card | Verified (card wording unclear) | [Railway plans](https://docs.railway.com/pricing/plans) |
| Langfuse Hobby: 50k units a month, 30 days of data, 2 users; self-hosting free | Verified | [Langfuse pricing](https://langfuse.com/pricing) |
| Sentry free Developer plan: 5,000 errors a month, 1 user | Secondary only (page contradicts itself) | [costbench](https://costbench.com/software/developer-tools/sentry/free-plan/) |

## Design sources (checked 1 November 2026)

| Fact | Status | Source |
| --- | --- | --- |
| Anime.js is MIT-licensed, v4, with timelines, scroll-linked animation and SVG effects | Verified (docs mirror) | [Anime.js](https://animejs.com/), [docs](https://www.mintlify.com/juliangarnier/anime) |
| SiteReel.ai is a design gallery with copyable AI prompts; pricing and terms not visible | Partly verified | [sitereel.ai](https://sitereel.ai/) |
| React Bits: animated React components, license "MIT + Commons Clause, free for personal and commercial use"; installs via shadcn CLI, jsrepo or copy | Verified (GitHub README); Commons Clause resale terms not read | [react-bits on GitHub](https://github.com/DavidHDev/react-bits) |
| Manus website builds use credits; hosting is usage-based beyond monthly allowances ($10 Cloud, $1 AI, $1 API) | Verified | [Manus usage and pricing](https://manus.im/docs/website-builder/getting-started/usage-and-pricing.md) |

## Methods (books and papers, no links)

These are well-known references for the methods used; they're named so you can look them up, not linked, because I haven't fetched a copy this session.

- **Mom Test interviewing:** Rob Fitzpatrick, *The Mom Test* (book). Used in VALIDATION_PLAN.md.
- **Kappa agreement bands** ("substantial" from 0.61): J. R. Landis and G. G. Koch, "The Measurement of Observer Agreement for Categorical Data", *Biometrics*, 1977. Used in EVALS.md.
- **Planning fallacy:** Daniel Kahneman and Amos Tversky's work on intuitive prediction (1970s). **Reference-class forecasting:** developed in practice by Bent Flyvbjerg. Used in PREMORTEM.md.
- **Pre-mortem:** Gary Klein, "Performing a Project Premortem", *Harvard Business Review*, 2007.
- **C4 model:** Simon Brown (c4model.com). **ADR format:** Michael Nygard, "Documenting Architecture Decisions" (2011 blog post). **STRIDE:** Microsoft's threat modelling method.
