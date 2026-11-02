# Roles matrix: what employers ask for vs what Agent Lab proves

**Question this answers:** does each feature earn its place by proving something a real employer asks for? If no posting asks for it, it's justified by the freelance goal or it's cut or moved down.

**Method:** 10 live postings that a self-taught developer in Thailand could realistically apply to (remote APAC, worldwide, or Bangkok-based), collected 17 October 2026. Requirements are quoted exactly as written on the posting page. Postings expire, so the links may die; the quotes are the record.

**Limits of this sample:** 10 postings is enough to see patterns, not to measure them. They lean towards support engineering, solutions engineering and AI roles, because that's where junior-friendly remote roles in APAC showed up. Re-run this with 10 new postings at the full-launch gate.

## The postings

| # | Role, company | Location (as posted) | Posted / deadline | Link |
| --- | --- | --- | --- | --- |
| J1 | Support Engineer (APAC), Supabase | "Any country in APAC timezones" | No date shown | [wfh.team](https://wfh.team/job/12932-support-engineer-apac-supabase) |
| J2 | Database Support Engineer (APAC), Supabase | "Remote from APAC" | 25 Sep 2026 / 25 Oct 2026 | [jobicy](https://jobicy.com/jobs/154081-database-support-engineer-apac) |
| J3 | Junior Support Engineer, HeadSpin | "Open to candidates from all countries." | 16 Oct 2026 / 15 Dec 2026 | [himalayas](https://himalayas.app/companies/headspin/jobs/junior-support-engineer) |
| J4 | Full-stack Engineer (React + Django, AI systems), Spotter Labs | "Open to candidates from all countries." | 16 Oct 2026 / 15 Nov 2026 | [himalayas](https://himalayas.app/companies/spotter-labs/jobs/remote-fullstack-engineer-react-django-ai-systems-2947975802) |
| J5 | Agentic AI Technical Mentor (contractor), Udacity | Remote, APAC among listed regions | 16 Oct 2026 / 16 Nov 2026 | [jobicy](https://jobicy.com/jobs/150763-agentic-ai-technical-mentor-independent-contractor-us-canada-europe-mena-india-apac-timezones) |
| J6 | Technical Support Engineer (APAC), Cenosco | "Thailand" | "Posted 16 days ago" | [dailyremote](https://dailyremote.com/remote-job/technical-support-engineer-apac-5684423) |
| J7 | Customer Success Engineer, SerpApi | "Remote-first"; contractors outside Austin | No date shown | [serpapi.com](https://serpapi.com/careers/customer-success-engineer) |
| J8 | AI Solutions Engineer (via Adecco) | "Bangkok" | No date shown | [adecco.com](https://www.adecco.com/en-th/jobs/ai-solutions-engineer-bangkok/jn-102026-212302) |
| J9 | Associate Manager / Manager, Technical Account Management, Agoda | "based in Bangkok, Thailand (with relocation support provide)" | No date shown | [careersatagoda.com](https://careersatagoda.com/job/8054914-rta-associate-manager-manager-technical-account-management-travel-distribution-bangkok-based/) |
| J10 | AI Support Engineer, Cognition | "Singapore, SGP (In-Office, Mid level)" | "Reposted 2 Months Ago" | [builtinsingapore](https://builtinsingapore.com/job/ai-support-engineer/9986637) |

## Requirement → feature → gap

Each row is one requirement, quoted exactly. **Proven by** names the feature or practice that produces evidence for it. **Gap** is what Agent Lab can't prove.

| Requirement (verbatim) | Posting | Proven by | Gap |
| --- | --- | --- | --- |
| "Proficient in SQL (ideally PostgreSQL). You feel comfortable with complex SQL queries." | J1 | Schema, three roles, RLS, public views, quality aggregates (F8) | None for the junior bar |
| "You know PostgreSQL deeply—including autovacuum behavior, WAL growth, long-running transactions, table bloat, and other internals." | J2 | Not proven | Deep Postgres internals. Out of scope |
| "You've handled data migration issues (pg_dump/restore, schema drift, failed migrations) and know how to recover safely." | J2 | Numbered migrations (S21), rebuilding the dev branch from migrations | Recovery from a failed migration isn't practised. Write one up if it happens |
| "You have 7+ years in technical support, databases, backend engineering, SRE, or similar roles." | J2 | — | Years. Can't be built |
| "Skilled in using Linux/Unix operating systems and the command line." | J1 | GitHub Actions runners, scripts run with `tsx`, `psql` | Light |
| "Experienced working with GitHub Issues and Discussions." | J1 | Public repo, phase issues, PR per phase | None if issues are actually used. **Use them** |
| "Experience or Knowledge with command line *nix tools, e.g. ssh, scp, bash, curl, vim, python terminal, ping, tcpdump, etc." | J3 | `curl` checks in DONE_CHECKS, bash in workflows | ssh, tcpdump not used |
| "Familiarity with common issue management practices and tools, e.g. service desks, SLAs, on call rotation, escalation paths, sprint, kanban, etc" | J3 | Site Doctor alerts, approval queue with expiry, sprint table | No formal SLA. The client report (F11) is the closest |
| "Systematic troubleshooting and problem-solving approach, coupled with a strong sense of ownership and drive." | J3 | Build journal "What broke and how we fixed it", run replay (F9) | None |
| "Bachelor's degree in computer science or comparable" | J3, J9, J10 | — | Degree. Can't be built |
| "Comfortable designing and building RESTful APIs" | J4 | `/api/lab/state`, `/api/lab/events`, caching, rate limits | None |
| "Experience working on non-trivial business logic or algorithms (e.g., decision flows, scoring rules, optimization logic)." | J4 | 3-day median and sustained-drop rule (S7), evidence check (S8), eval metrics | None |
| "Good instincts around performance: understanding query behavior, avoiding obvious pitfalls, and using caching when it counts." | J4 | 30s CDN cache, Neon compute spike SP4, Lighthouse CI | None |
| "Strong proficiency in React and Material UI." | J4 | /lab is built in React + TypeScript (ADR-0013, decided 1 Nov) | Material UI |
| "Ability to design and implement AI agents with tool use, API integrations, structured outputs, memory, state management, and database interaction" | J5 | Lead Scout (F2): hand-written loop, tool allowlist, zod-validated arguments, `run_steps` | Long-term memory. Out of scope |
| "Knowledge of AI agent evaluation, including testing, debugging, and improving agent performance" | J5 | Golden set and eval gate (EVALS.md), prompt versions, quality tracking (F8), replay (F9) | None, once the eval gate runs |
| "Experience designing and implementing prompt chains, role-based prompts, feedback loops, and iterative prompt refinement" | J5 | Prompt versions with before/after numbers (phase 8); Studio's five roles | None |
| "Understanding of multi-agent system design, including orchestration, routing, state coordination, and multi-agent architectures" | J5 | Studio: five subagents with three gates | Studio is coordinated by Claude Code, not Henry's own code. Say so honestly |
| "Experience with RAG-based agent systems, including single-agent and multi-agent RAG implementations" | J5 | Henry's existing RAG chatbot (not Agent Lab) | Agentic RAG |
| "Proven technical expertise with 5+ years of experience in the relevant field" | J5 | — | Years |
| "Ability to explain complex Agentic AI concepts clearly through instruction, demos, and learner support" | J5 | /lab/how-it-works, replay, build journal, devlog posts, Henry's teaching job | None. Strongest match in the set |
| "Working knowledge of SQL" / "Experience investigating issues using data and database queries" | J6 | Admin quality queries, run_steps investigation | None |
| "Familiarity with browser developer tools (DevTools, Network tab)" / "Ability to inspect request/response data (e.g., JSON payloads)" | J6 | Leak test on API JSON, debugging /lab | None |
| "Structured problem-solving and root cause analysis" | J6 | Journal "What broke", pre-mortem | None |
| "Familiarity with application logs and debugging workflows" | J6 | Quiet Actions logs (S3), run replay | None |
| "6+ years in Technical Support, Application Support, or customer-facing technical engineering roles (5+ minimum considered)" | J6 | — | Years |
| "Work with either Ruby, JavaScript or Python to help users troubleshoot" | J7 | TypeScript throughout | None |
| "Write blog posts to educate customers and prospects on our products and services" | J7 | Devlog posts at each gate, case study at phase 10 | None |
| "Open tickets on GitHub if issues cannot be resolved directly" | J7 | GitHub Issues per phase | Use them |
| "Able to understand and work with APIs, integrations, and system architecture at a working level" | J8 | Six external APIs, C4 diagrams, ADRs | None |
| "Strong communication skills in Thai and English, since you'll be working with local enterprise clients" | J8 | — | **Thai.** Can't be built in a sprint |
| "Bonus: exposure to LLMs / generative AI, enterprise software sales cycles, or solution consulting" | J8 | Lead Scout, Studio audits | Enterprise sales |
| "Practical experience with API integrations/data transfers, with strong proficiency in SQL and Excel." | J9 | APIs and SQL as above | Excel |
| "4-6+ years of hands-on experience in technical account management, solutions engineering, or similar roles in technology or travel industries." | J9 | — | Years |
| "Working knowledge of Linux, Docker, Git, CI/CD pipelines, cloud platforms such as AWS/GCP/Azure, and networking fundamentals." | J10 | Git, CI/CD (Actions, Lighthouse CI), Vercel | Docker, AWS |
| "Demonstrated ability to reproduce, isolate, and debug technical issues from incomplete or ambiguous reports." | J10 | Run replay, journal | None |
| "Experience analyzing logs, traces, errors, and system behavior across distributed or multi-component systems." | J10 | `run_steps` traces across Actions, Neon, Vercel, Gemini | None |
| "Passion for AI, developer tools, and the future of software engineering." | J10 | The whole project | None |

## What the matrix says

**Proven strongly (asked for by 3 or more postings):** SQL and Postgres; APIs and integrations; debugging from logs; clear written explanation; CI/CD. Agent tool use and agent evaluation match J5 almost line for line, and J8 and J10 partly.

**Gaps Agent Lab can't close:** years of experience (J2, J5, J6, J9, J10), a degree (J3, J9, J10), Thai (J8), Docker and AWS (J10), deep Postgres internals (J2). These need other answers: paid freelance work for years of experience, and Thai study if Bangkok roles stay the target. That's outside this project.

**Nothing in these 10 postings asks for:** the WebGL orientation, the Showpieces, or Studio's design gates. Studio is still justified by the freelance goal (it builds client demos), not by the job goal.

## Re-ranked features (no features added or removed)

Order of build priority when time runs short. The sprint order stays the same where dependencies force it.

| Rank | Feature | Evidence it earns its place |
| --- | --- | --- |
| 1 | F2 Lead Scout + eval gate | J5 (near 1:1), J8, J10 |
| 2 | F4 Activity log / `run_steps` + F9 Run replay | J3, J6, J10 (logs, traces, reproducing issues) |
| 3 | Schema, roles, RLS, migrations (phase 1) | J1, J2, J6, J9 |
| 4 | Public API (phase 3) | J4, J8, J9 |
| 5 | F8 Quality tracking | J5 (agent evaluation), J4 (scoring rules) |
| 6 | F1 Site Doctor + F10 Alerts | J3 (incident response, SLAs) |
| 7 | F3 Approval queue | J5 (feedback loops); also the safety story |
| 8 | F12 Explainer, /lab/how-it-works | J5 (explain clearly), J7 (blog posts) |
| 9 | F6 Lab floor, F7 Ticker | Presentation layer; no posting asks for it directly |
| 10 | F11 Monthly client report | Freelance goal; J3's SLA practice loosely |
| 11 | F5 Orientation animation | No posting asks for it. **First thing to cut if the sprint slips** |
| 12 | Studio and Showpieces (phases 11–14, Stage E) | Freelance goal only |

**Plan change from this:** F5 (orientation) moves from "must-do in phase 7" to "do only if phase 7 has time left after replay". Replay stays. This is a re-rank, not a cut.

## Re-weighted for Henry's targets (29 Oct 2026)

The job-search session settled Henry's targets: **(1) SDR at a software or AI company, (2) associate solutions or integration engineer, (3) junior front-end developer.** He does not want help-desk work, and product support engineer is optional. Six of the ten postings above are support roles, so the matrix leans the wrong way. Read it like this:

| Target role | What Agent Lab proves | Gap Agent Lab won't close |
| --- | --- | --- |
| SDR (software/AI) | Lead Scout's research before outreach, problem-first messages, follow-ups that add something new, and the pipeline/constraint view | Sales basics: an outreach sequence and a discovery call. Practise those outside the Lab |
| Solutions / integration engineer | APIs, integrations, function calling, evals, architecture docs and ADRs, explaining to non-technical people (J5, J8, J9) | Years of experience; Thai for Bangkok-local roles (J8) |
| Junior front-end | Accessible, tested UI (Playwright, axe, Lighthouse CI), and Studio's Next.js demos later | None for React any more: /lab is built in React (ADR-0013), alongside Raeng and the client Next.js sites |

The top skill gap from the job search, team engineering habits (tests, PRs, CI), is something the Lab can prove right away. It's why every phase now goes through a PR with a written description.

Next refresh: 10 postings drawn from the job-search tracker's shortlist (SDR, solutions, front-end), not support roles.
