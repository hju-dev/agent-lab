# 13. /lab is built in React (Vite + TypeScript) inside the existing site repo

Date: 2026-11-01

## Status

Accepted. Supersedes the frontend part of ADR-0006. ADR-0006's hosting and API choices (Vercel functions under `/api/lab`) and ADR-0011's snapshot design are unchanged.

## Context

ADR-0006 chose plain HTML/CSS/JS for /lab. The reasons: hju-dev.vercel.app is a static site with no build step, the plan was a two-week full-time sprint, and only one of the ten job postings collected then asked for React.

Three things changed:
- **Targets.** Henry widened his search to entry-level web development roles, where React is the main front-end requirement. React was the biggest gap for those roles (ROLES_MATRIX.md).
- **Visibility.** /lab is the project recruiters will open, so it should show the skill they're looking for.
- **Reuse.** Studio's demos and React Bits are React, so one framework covers everything Henry builds.

Henry already knows React (Raeng) and Next.js (client sites), so the learning cost is low. The 30 November target is a small /lab, so switching now is cheap; rewriting later would cost more.

## Decision

- **/lab and /lab/how-it-works are a React + TypeScript app built with Vite,** in a `lab/` folder of the existing site repo, with its own `package.json`. The rest of hju-dev stays plain HTML/CSS/JS.
- **Build and deploy:** Vercel builds the Vite app and serves its output at `/lab`. The `base` option in Vite's config is set to `/lab/`. This adds the site's first build step, so test the Vercel build settings on a preview deploy before production, and check that the existing pages and `/api` functions still deploy unchanged.
- **Styling:** reuse the design tokens from `style.css` (colors, fonts, spacing) as CSS variables, so /lab still looks like the rest of the site. Tailwind is optional. React Bits components (TS + Tailwind variant) are allowed for the signature moment.
- **Data:** /lab reads the public snapshot API exactly as before (ADR-0011). It refreshes every 60 seconds while visible and pauses when hidden. No server-side rendering is needed.
- **Text from data** is rendered through React's normal escaping. `dangerouslySetInnerHTML` is never used with model or database text. This also closes P3 in the threat model for /lab.
- **Testing:** Vitest + React Testing Library for components, plus the existing Playwright, axe-core and Lighthouse CI checks.

## Consequences

- **/lab shows React and TypeScript** to recruiters for entry-level front-end roles.
- **The site gains a build step,** about an hour or two of setup. That's the main risk to the 30 November target. If the setup runs long, the fallback is still a screenshot of the working parts.
- **More JavaScript to download** than plain JS. The Lighthouse performance threshold (DONE_CHECKS Phase 4) still applies, and heavy components (WebGL) need checking.
- **Two styles of code in one repo:** the plain site and the React /lab. The README in `lab/` explains how to run each.
- **A Next.js migration of the whole site** stays out of scope. It would be a separate decision after the 30 Nov review.
