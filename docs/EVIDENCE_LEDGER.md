# Evidence ledger

Every claim the plan rests on, what the evidence is, and how sure we are. Update a row whenever a spike, test, conversation or source check changes it.

**Verified** = primary source read, or test passed. **Testing** = a spike, test or conversation will settle it, and it's scheduled. **Assumption** = believed but not yet tested; it says what would test it. **Failed → changed** = tested, didn't hold, and the plan changed.

Last updated: 28 October 2026.

| # | Claim | Evidence | Status |
| --- | --- | --- | --- |
| 1 | GitHub Actions is free for this repo | GitHub billing docs: free on standard runners for public repos | Verified |
| 2 | Schedules run roughly on time | GitHub docs say delays and drops happen; size unknown | Testing (SP3) |
| 3 | Schedules stop after 60 days without activity | GitHub docs | Verified |
| 4 | Gemini free tier supports function calling for our tools | Docs describe function calling; free-tier support not stated | Testing (SP1) |
| 5 | Gemini free limits cover 10 leads a day | Limits not published; shown in AI Studio only | Testing (SP1, SP5, Henry checks AI Studio) |
| 6 | Free-tier inputs may be used and human-reviewed | Gemini API terms | Verified → S25 added |
| 7 | Chatbot on free tier may conflict with EEA/UK/Swiss terms | Gemini API terms | Verified (outside scope; flagged) |
| 8 | PageSpeed quota is 25,000/day | Third-party page only | Assumption → Henry checks Cloud Console |
| 9 | PageSpeed scores are stable enough to flag drops | Google says treat as a distribution | Testing (SP2) |
| 10 | Neon free compute is enough | 100 CU-h per project (verified); our use unknown | Testing (SP4) |
| 11 | Resend can send without a domain | Resend docs: a verified domain is required | Failed → changed (ADR-0007) |
| 12 | Healthchecks free sends email alerts | Pricing page silent | Testing (SP6) |
| 13 | GitHub emails on scheduled-run failure | GitHub notification docs | Verified; delivery Testing (SP6) |
| 14 | Vercel Hobby is fine for /lab | Fair-use: non-commercial personal use only. /lab is a portfolio page framed as a project | Assumption → keep wording non-commercial; ask Vercel if unsure |
| 15 | Vercel Hobby is fine for demo previews | Fair-use lists advertising services and paid sites as commercial | Failed → changed (ADR-0009, proposed) |
| 16 | Cold B2B email to the US is legal with an address and opt-out | FTC CAN-SPAM guide | Verified, but no longer needed: no cold email (ADR-0012) |
| 17 | Henry may freelance from Thailand | No public source can answer | Assumption → lawyer |
| 18 | GSAP is free for client and showpiece work | GSAP licensing page | Verified |
| 19 | Studio on Pro costs nothing extra if no API key is set | Claude support article | Verified |
| 20 | Studio's usage fits within Pro limits | Limits exist; our usage unknown | Testing (measure first demo) |
| 21 | Employers value the skills Agent Lab proves | 10 postings, verbatim (ROLES_MATRIX) | Verified for SQL, APIs, logs, agent evals; gaps listed |
| 22 | Employers value WebGL showpieces and Studio's design gates | No posting in the sample asks for them | Assumption (freelance goal only) → recruiter conversations |
| 23 | A project gets a self-taught dev interviews in Bangkok | Not yet asked | Testing (3 recruiter conversations) |
| 24 | Small businesses notice and care about broken sites | Not yet asked | Testing (3–5 business conversations) |
| 25 | Lead Scout's drafts are accurate enough to approve | No data yet | Testing (eval gate, EVALS.md) |
| 26 | The AI grader agrees with Henry | No data yet | Testing (calibration, κ ≥ 0.6) |
| 27 | Stage A fits in the first week | Judgment estimate only | Assumption → recalibrate from past builds (PREMORTEM Part 2) |
| 28 | The public role can't read private data | Design (roles, views) | Testing (Phase 1 and 3 checks) |
| 29 | Hidden page text can't steer the agent | Design (S4, allowlist, S5) | Testing (injection site in eval gate) |
| 30 | A hand-written loop is a plus in interviews | Udacity posting asks for these skills directly; no hiring manager asked | Assumption → senior dev review |

| 31 | Problem-first pitches get more replies than intro-first pitches | Freelancing advice Henry adopted; no data yet | Assumption → reply rate once pitches are cleared |
| 32 | Follow-ups that add something new get more replies than "just following up" | Same | Assumption → reply rate per touch |
| 33 | Spending as much time finding work as delivering keeps work coming | Superseded 18 Oct by Move 3 (track the constraint, not hours) | Replaced → see rows 35–37 |
| 34 | img2threejs and Awesome Design.md are what they claim | Read both GitHub READMEs on 18 Oct 2026 (licenses: Apache 2.0, MIT) | Verified (behaviour still to test in Phase 11) |

| 35 | Offers shaped around how a segment decides (who approves, what feels safe) close faster | Jamie Bridle's advice as Henry summarized it; no data yet | Assumption → offer sheets from interviews, then lead → client conversion |
| 36 | The slowest journey stage is the right place to focus | Same; a working rule | Assumption → does fixing the flagged constraint raise that stage's conversion? |
| 37 | Stall causes in the "Where it stalls" table (e.g. leads stall = offer not safe enough) | Same; these are likely causes, not proven ones | Assumption → check against reasons businesses give for saying no |

| 38 | transitions.dev free items and animos exports may be used in client work | Neither homepage states terms | Assumption → Henry reads both sites' terms before first client use |

| 39 | Visitors to /lab never wake Neon | Design (ADR-0011) | Testing (Phase 3 no-wake check, SP4) |
| 40 | Hourly agent runs keep Neon under 40 CU-hours a month | Estimate: about 10% awake | Testing (SP4) |
| 41 | Neon returns 402 with "exceeded the quota" when locked out | Seen on a client site in Oct 2026 | Verified by incident (not Neon docs) |

| 42 | Freelance platforms (e.g. Fiverr) bring enough leads at $0 upfront | Henry's decision; platform fees and rules not yet read | Assumption → read the platform's terms and fees; track the pipeline's stranger → lead stage |

| 43 | Node 20 is still a safe runtime | Node 20 reached end of life 30 Apr 2026 | Failed → changed to Node 24 LTS |
| 44 | `.claudeignore` keeps files out of Claude Code | Claude Code docs: it has no effect | Failed → changed to `Read` deny rules |
| 45 | Supabase free would avoid Neon's compute-hour trap | Pausing rule verified; compute limits only from secondary sources | Assumption → check Supabase's pricing page if SP4 fails |

| 46 | Remote roles are likelier than Bangkok roles for Henry's level | Job-search snapshot 17 Oct: all 89 shortlisted postings remote; 9 Bangkok junior roles with stated pay all below the 60k THB permit floor (the floor itself unverified) | Assumption backed by one snapshot; review 30 Nov |
| 47 | About 3 hours a week is enough for a first launch by 30 Nov | No data | Assumption → recalibrate from past build dates |

| 48 | The Vite build for /lab can be added to the static site's Vercel deploy without breaking the existing pages or `/api` | Not tested | Testing (Phase 4 build check on a preview deploy) |

| 49 | Programmatic tool calling can be used on the $0 setup | Claude docs: it runs inside the API's code execution tool, which needs an API key | Failed → changed (ADR-0014: code-first habits instead) |
| 50 | Claude Code defers MCP tool details until needed (tool search) | Third-party guide (ClaudeLog): on by default, about a 10% context threshold | Assumption → check the current Claude Code docs |

**Counts today:** Verified 11 · Testing 16 · Assumption 18 · Failed → changed 5. (Rows with two parts are counted by the first status.)
