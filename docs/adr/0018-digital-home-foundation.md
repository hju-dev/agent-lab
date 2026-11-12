# 18. Studio builds every Digital Home on a working foundation, shaped by a mood board

Date: 2026-11-12

## Status

Accepted (Henry, Nov 12, 2026). Changes how Studio starts a build (PRD "Studio", "Blueprints" and "The build workflow" step 6). The team, the three gates, the Auditor's checks and every legal and Neon rule are unchanged.

## Context

Henry's position: starting a website from scratch is a waste of time. Every client site ("Digital Home") needs the same back end, SEO and core features, and rebuilding them each time is slow and is where mistakes creep in. What differs between clients is the look.

## Decision

- **One foundation, built once and tested.** A Next.js starter repo with the parts every Digital Home needs, already working and covered by tests:
  - SEO: metadata, sitemap, robots, structured data (JSON-LD), Open Graph images
  - core pages and features: contact form with spam protection, privacy and accessibility pages, 404
  - the legal-checks defaults (self-hosted fonts, no trackers before consent, and the rest of `docs/playbooks/legal-checks.md`)
  - the back end, where a client needs one: Neon and Clerk, set up per `docs/playbooks/neon-free-tier.md` and `docs/playbooks/fast-app-startup.md`
  - a design layer kept separate: tokens, typography, and the components' look
- **The Designer works from a mood board.** Henry hands over visual references (screenshots, links, colors). The Designer turns them into 2–3 directions using a palette from `docs/playbooks/accent-palettes.md` and a hero layout, as today (gate 2).
- **The Builder changes the design layer and content, not the foundation.** Blueprints become content structures on top of it. A change to the foundation itself is its own pull request to the foundation repo, with its tests.
- **The Auditor also runs the foundation's own tests** on every build, so molding the look can never break SEO, forms or the legal defaults.

## Consequences

- A demo goes from brief to preview much faster, and every site starts with the same tested SEO and legal basics.
- The foundation doesn't exist yet. Building it is Studio's first task (phase 11), before any client demo.
- Sites share a skeleton. The mood board and palette keep them from looking alike; the Auditor's design checks still apply.
- "Without touching a line of code" holds for Henry's part (mood board in, approvals at the gates). Studio still writes code, and every change still goes through tests and review.
