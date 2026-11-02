# Freelance principles (Henry's working rules)

> Mirrored from the hju.dev project on claude.ai. The PRD sections it points to are the version agents follow.

These guide every decision about the freelancing business, in Agent Lab and outside it. They're working rules from advice Henry adopted, not proven facts, so each is tested against his own numbers once pitching is allowed (Agent Lab evidence ledger, rows 31–37).

## How the business is organized (Jamie Bridle's three moves, as Henry summarized them, 18 Oct 2026)

### Move 1 · Design the offer around the buying decision, not my skill set
- Reverse-engineer how the client says yes: who decides, who else must approve, what makes the decision feel safe, what risk they're avoiding.
- Build the offer to remove friction at that moment (fixed price and scope, proof before paying, a small first step, something they can show whoever else approves).
- Match the offer to their specific pain point. Close by alignment, not persuasion.
- One offer sheet per segment, filled from real conversations (`docs/OFFERS.md` in agent-lab).

### Move 2 · Organize the business by the customer journey
- Ask "what should I move forward today?", not "what should I work on today?"
- Every working day, at least one action for each transformation:
  - Stranger → lead (make the problem visible: content, audits, demos)
  - Lead → client (follow up with something new, make the next step safe)
  - Client → lifetime client (care for current clients, recurring offers, next offers)

### Move 3 · Track the constraint, not effort
- Don't measure hours, posts or tasks. Track where progress slows down.
- Leads stall → the problem isn't visible enough or the niche isn't specific enough.
- Sales stall → the offer isn't safe enough.
- Revenue stalls → value isn't being captured clearly.
- Fix one constraint at a time.

## Outreach rules (adopted 18 Oct 2026)

- **Lead with their problem, not with me.** Open with something specific that's wrong on their side, what it likely costs them, and how it gets fixed. Position myself as the person who fixes it. Every claim verified.
- **Follow up with a new reason to be helpful.** Never "just following up", "checking in", "circling back", "touching base" or "bumping this". Starting limits to test: first follow-up about a week later, at most 2, none after a reply or opt-out.
- **My first job is keeping myself employed.** Measured by the pipeline (Move 3), not by hours. This replaces the earlier "match hours finding work to hours delivering" rule.

## Finding clients (decided 29 Oct 2026)

- **No cold email for now.** Leads come from freelance platforms such as Fiverr: buyer requests, messages and orders.
- All proposals, replies and follow-ups go through the platform's own messaging, never email or off-platform. Read the platform's terms and fees before the first gig.
- Offer sheets (Move 1) become gig packages: fixed scope and price in tiers, with a small safe first step as the basic package.
- Agent Lab's Lead Scout audits only sites a buyer has shared, to make proposals problem-first. It never scrapes platforms (ADR-0012).

## Current limits (as of 29 Oct 2026)

- Paid freelancing and pitching wait for a Thai immigration lawyer's confirmation of work status. Until then: stranger → lead = posts about projects and Lead Scout in learning mode; lead → client = business conversations and offer sheets, no pitching; client → lifetime = looking after existing clients.
- If cold email is ever turned back on, US emails must follow CAN-SPAM (postal address, ad notice, opt-out).

## Where these live in Agent Lab

- PRD: "How the freelance business is organized" and "Pitching rules" (under F3); pipeline view in F8; "Keeping yourself employed comes first" under Working rules.
- `docs/OFFERS.md` (Move 1), `docs/VALIDATION_PLAN.md` questions 6–8 (buying decision).
- EVALS.md: Problem-first criterion and banned follow-up phrases. Safeguards S36–S37.
- Operator manual: daily three-stage moves and the Friday constraint check.
