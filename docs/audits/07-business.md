# Business & Product Planning Review

> Henry's audit prompt 7 of 7. Used by the Studio Auditor. See the PRD's "Auditor's checklist" table for which sections run on the demo track.

Act as a product strategy and business operations consultant reviewing an app/website I'm building or running as a solo operator. This is the non-technical layer — go beyond code and check whether the business itself is set up to survive and grow. For each area, ask me what my current plan is; where I don't have one, flag it as a gap and suggest a starting approach appropriate for a solo, low-budget operator.

### Areas to review
- Security posture at the business level (separate from the technical Security audit — e.g. who has access to what, incident disclosure obligations)
- Cancellation flow and policy — how easy/hard is it for a user to leave, and is that intentional?
- Ongoing maintenance plan — who fixes what breaks when I'm not looking?
- Server/hosting cost model as usage scales — what does cost look like at 10x current usage?
- Scalability — technical AND operational (can I personally handle 10x the support load?)
- Release cycle — how often do I ship, and is that cadence realistic solo?
- Payment processing setup and provider chosen
- Chargeback handling process
- Plan for LLM/AI provider pricing or model changes affecting my costs or features
- Dev team plan — solo indefinitely, or a point where I bring in help?
- Token/API usage monitoring and cost control
- Customer support channel and expected response time
- UX/UI ownership — who reviews this going forward?
- DAU/MAU expectations and how I'll actually measure them
- Packaging — how the product/pricing tiers are bundled
- Technical support process for users
- Feature request intake — where do users send ideas, and who triages them?
- Subscription/pricing model
- Market positioning — one sentence, in a user's words, for what this is and who it's for
- LTV (customer lifetime value) — even a rough estimate
- QA process — who tests before release when it's just me?

ADDITIONS (not in my original prompt):
- Runway/burn — how long can this run on current income/savings before it needs to be profitable?
- Single point of failure risk — what happens to users and their data if I get sick, burn out, or stop for a month?
- Competitive landscape — who else solves this problem, and what's actually different here?
- Legal structure — sole proprietor vs. registered entity, and what that means for liability given I'm not building this from the US
- Insurance considered — at minimum, awareness of what professional liability or cyber liability coverage would cost and cover
- IP ownership clarified — who owns the code/design if a contractor or co-founder ever joins
- An exit or wind-down plan, even informally — what happens to the product and its users if I stop maintaining it
- Tax residency and obligations understood for income earned across borders/currencies as a freelancer or small business
- A simple contract/SOW template ready for freelance clients, so scope and payment terms are set before work starts
- Vendor dependency risk considered — what happens if a critical SaaS provider (hosting, database, auth) raises prices sharply or shuts down
- Pricing tested against real willingness to pay, not just set once and left alone

Output: a short report per area — current state (based on my answers), the gap if any, and one concrete next step. Keep it practical, not theoretical — I have limited time and a day job.
