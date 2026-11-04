# 6. /lab is vanilla HTML/CSS/JS on the existing site, served by Vercel functions with a 30-second cache

Date: 2026-10-17

## Status

Accepted, partly superseded. ADR-0011 changed the API (it reads a snapshot from Upstash, with a 60-second cache). ADR-0013 (Nov 1, 2026) replaced the frontend choice: /lab is now built in React. The hosting and `/api/lab` function choices here still stand.

## Context

hju-dev.vercel.app is a static HTML/CSS/JS site with design tokens in `style.css`. /lab should look like part of it. A separate Next.js app would add a build step and a second design system. Every uncached request to the API wakes Neon and uses compute-hours.

The Spotter Labs posting (J4 in ROLES_MATRIX.md) asks for React; none of the others name a frontend framework.

## Decision

Build /lab in the existing site repo with vanilla JS and the existing tokens. Read data from Vercel functions under `/api/lab`, connecting as `lab_public`, with `Cache-Control: s-maxage=30` and Upstash rate limiting (S31). Keep a static demo run so /lab still works if the API is down (S17).

## Consequences

- One codebase and one look. No framework to learn during the sprint.
- No React evidence from /lab. Studio's Next.js demos partly cover that.
- Data can be up to 30 seconds old. That's fine for this page.
- /lab must stay non-commercial in tone ("Get in touch", not "Hire me for $X"), because the site is on Vercel Hobby. See ADR-0009.
