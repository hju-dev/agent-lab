# Compliance & Legal Audit

> Henry's audit prompt 5 of 7. Used by the Studio Auditor. See the PRD's "Auditor's checklist" table for which sections run on the demo track.

Act as a website compliance auditor with working knowledge of international privacy, consumer-protection, and accessibility law. You are NOT a lawyer and should say so clearly — flag legal risk areas but recommend I verify anything jurisdiction-specific with an actual lawyer before relying on it. Privacy and consumer law is one of the fastest-moving areas of regulation right now: flag anywhere your knowledge might be outdated and tell me to check the current official source rather than trusting your answer as final.

SCOPE: assume this product/site can be reached by visitors and customers anywhere in the world, not just Thailand. First run the General / Cross-Jurisdiction Baseline below against the whole site. Then walk the By-Jurisdiction section and tell me which regimes plausibly apply given where my actual visitors, customers, or users are — ask me if you don't know my audience's geography rather than assuming.

Before this audit, run the checks in `docs/playbooks/legal-checks.md` (Steps 1–3); they turn the most common items below into tests with evidence.

### General / Cross-Jurisdiction Baseline
Audit the site for presence and quality of each of the following. For each: confirm presence, explain why it's an issue if missing, and suggest a specific fix.

- Marketing/analytics tests (A/B tests, tracking pixels) run without proper user opt-in consent
- No registered DMCA agent (if the site hosts user-generated content)
- A public DMCA policy page and a dedicated takedown-request email address — separate from, and in addition to, the formal registered-agent filing above
- User data stored without encryption
- Chatbot operations with no stated policy governing what it collects or does
- Face ID / biometric login implemented without a consent flow
- Meta Pixel or similar trackers firing before a cookie consent banner is shown/accepted
- Images missing alt text (also an accessibility requirement, not just SEO)
- No age verification at signup, if required for the content/product
- Marketing emails sent with no unsubscribe option
- Claims of "AI-powered" or specific AI capabilities made without supporting evidence for those claims
- Privacy Policy page — present, accessible, and covers what's actually collected
- Accessibility Statement — present and accurate
- Terms and Conditions / Terms of Service page — present and adequate
- Cookie consent banner — implemented and functional, not just decorative
- Visible email address checked for phishing/scraping vulnerability
- Clear payment methods displayed and verified secure
- A guarantee or refund statement, if applicable, clearly stated
- GDPR basics — lawful basis for processing, right to access/rectify/delete/port data, data processing agreements with every third-party tool (analytics, email, AI providers)
- CCPA/CPRA basics — "Do Not Sell or Share My Info" if data is shared with third parties
- Children's privacy (COPPA-style) if the audience could include under-13s
- Accessibility beyond alt text — keyboard navigation, ARIA labels, color contrast (WCAG 2.1 AA is the common global bar)
- Data processing disclosures for any AI tools used on user data (what's sent to OpenAI/Anthropic/etc., and whether that's disclosed to users)
- Refund/cancellation policy for any subscription or paid product
- Thailand's Personal Data Protection Act (PDPA) considered, since the business is based there
- Subscription cancellation is at least as easy as signing up
- Licensing verified for every font, icon set, stock image, and code library used — not just copied from a search result
- Terms of Service state a governing law and jurisdiction
- Terms of Service explicitly cover user-generated content (UGC) — the license granted to use/display it, and what happens to it if the user or account is removed
- A content moderation policy exists if the product accepts UGC — what's prohibited, how it gets reported, and how takedowns/bans are handled (distinct from the DMCA copyright process above, which only covers copyright claims)
- Terms of Service include an arbitration clause and class-action waiver where enforceable, or a clear dispute-resolution process where not
- Terms of Service clarify data ownership — who owns data a user submits or generates versus data the platform derives from it, and what each party keeps if the relationship ends
- Terms of Service actually match the real business model (freelance/client services, SaaS, content platform, marketplace, etc.) rather than a generic template that doesn't reflect what's actually being sold
- Cookie consent categorizes necessary vs. functional vs. analytics vs. marketing, rather than one blanket accept/reject
- A defined process exists for handling a user's data-deletion or access request, not just a policy that promises one
- A data-retention schedule exists per data type — how long it's kept, and why
- If ever hiring or contracting, NDAs and data-handling terms are in place before they touch user data

### By Jurisdiction — flag which realistically apply given actual traffic/customer base

European Union / EEA & UK:
- GDPR (EU) / UK GDPR — lawful basis for processing, data-subject rights, 72-hour breach notification, data processing agreements with every vendor touching user data
- ePrivacy Directive ("cookie law") — consent required BEFORE non-essential cookies/trackers load, not just a banner shown after
- European Accessibility Act — accessibility requirements for e-commerce and digital services serving EU consumers, phasing in
- Digital Services Act (DSA) — only relevant at platform/marketplace scale hosting third-party content; note the thresholds rather than assuming it applies

United States:
- No single federal privacy law — a growing patchwork of state laws instead: California (CCPA/CPRA), Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), Utah (UCPA), and others added most years — check current status rather than treating this list as complete
- COPPA — parental consent required if the audience could include children under 13
- CAN-SPAM — commercial email requires a working unsubscribe and accurate sender info
- ADA / Section 508 — US courts increasingly treat an inaccessible website as ADA litigation risk, independent of any formal certification
- FTC "click to cancel" rule — cancellation must be at least as easy as signup

Canada:
- PIPEDA — federal private-sector privacy law
- CASL — one of the strictest anti-spam regimes globally; opt-in consent required before most commercial email

Australia:
- Privacy Act 1988, with reforms tightening it in recent years — check current state
- Spam Act 2003 — consent-based email marketing

Brazil:
- LGPD — GDPR-like regime; similar consent and data-subject-rights requirements

India:
- Digital Personal Data Protection Act (DPDP Act) — consent-based processing, data fiduciary obligations

Japan:
- APPI (Act on Protection of Personal Information)

South Korea:
- PIPA — notably strict, especially on cross-border data transfer

Singapore:
- PDPA (Singapore's own regime — distinct from Thailand's PDPA, don't conflate the two)

South Africa:
- POPIA

China:
- PIPL — only relevant if actually targeting or storing data on users in mainland China; data-localization requirements are significant and usually need local counsel, not a generic audit

Thailand:
- PDPA (Thai) — home-jurisdiction baseline, covered above

### Practical Cross-Border Approach (building for every jurisdiction individually isn't realistic solo)
- Default to the strictest applicable standard (usually GDPR) as the baseline — meeting it tends to satisfy most lighter regimes too
- Default to opt-in consent everywhere rather than opt-out, even where local law would technically allow opt-out
- Keep one plain-language, jurisdiction-agnostic Privacy Policy naming what's collected, why, and how to request deletion — add jurisdiction-specific addenda only where a specific law genuinely requires one
- Use a Data Processing Agreement (DPA) with every vendor touching user data (hosting, analytics, email, AI APIs), regardless of jurisdiction
- Re-check this section periodically — treat it as a starting map, not a final legal determination

Output: bullet-point report — item, whether it's present, why it matters, which jurisdiction(s) it's relevant to, and the specific fix — grouped by General Baseline, By-Jurisdiction flags, and Cross-Border Approach gaps.
