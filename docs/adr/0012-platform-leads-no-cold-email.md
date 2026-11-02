# 12. Find freelance clients through platforms, with no cold email

Date: 2026-10-29

## Status

Accepted. Narrows ADR-0008: the approval queue and the `pitches_enabled` flag stay. The CAN-SPAM requirements (S26) no longer block anything while cold email is off.

## Context

The plan had Lead Scout drafting cold emails to US businesses. That needs a physical postal address in every email under CAN-SPAM, which costs money for a virtual mailbox. Henry can't put any money into this project. Platforms such as Fiverr bring buyers who are already asking for help, at no upfront cost.

The work-permit question is unchanged. Doing paid work while living in Thailand is the issue, wherever the client comes from.

## Decision

- **No cold email.** Leads come from freelance platforms: buyer requests, messages and orders.
- **Henry pastes in only sites a buyer shared,** on /lab/admin. Lead Scout audits them and drafts a problem-first proposal or reply. It never scrapes the platform.
- **Proposals, replies and follow-ups are sent by Henry inside the platform's own messaging,** never by email or off-platform. They follow the platform's rules on contact and messaging; check its terms, since platforms commonly forbid moving buyers off-platform.
- **The Pitching rules still apply:** problem first, follow-ups that add something new, and the phrase filter (S36). S37's limits still apply, counted within the platform.
- **`pitches_enabled` stays off** until the lawyer confirms Henry's work status.
- **Offer sheets (Move 1) become gig packages.** Fixed scope and fixed price in tiers is how platforms already sell, which fits "make the decision feel safe".

## Consequences

- No postal-address cost, and no CAN-SPAM exposure.
- The pipeline's "stranger → lead" stage now means platform visibility: gig listings, profile, portfolio and replies to requests. Lead Scout helps only once a buyer has shared a site.
- The platform takes a fee on each sale, and its rules limit how Henry can contact buyers. Check both in its terms before the first gig.
- If cold email is ever turned on again, S26 (postal address, ad notice, opt-out) returns as a hard requirement.
