# 9. Where Studio's demo previews are hosted

Date: 2026-10-17

## Status

**Proposed.** Not decided. Needed before Phase 12.

## Context

Studio builds demo sites for businesses Henry might pitch. The plan put previews on Vercel. Vercel's fair-use guidelines say Hobby is "restricted to non-commercial personal use only", and count "advertising the sale of a product or service" and "receiving payment to create, update, or host the site" as commercial ([SOURCES.md](../SOURCES.md#vercel-hosting-lab-and-its-api)). A demo built to win paid work is very likely commercial use. Vercel Pro costs money.

Cloudflare Pages' free plan has generous build and project limits, but its limits page doesn't address commercial use.

## Options

1. **Ask Vercel support** whether unlisted, noindex demo previews made to pitch work count as commercial. Free; takes time.
2. **Cloudflare Pages free**, after reading Cloudflare's terms on commercial use. Free if allowed.
3. **No hosted preview:** send screenshots and a short screen recording instead. Free and clearly allowed, but less impressive.
4. **Vercel Pro** once there's paid work to cover it.

## Decision

Pending. Default until decided: option 3 (screenshots and recording). Pitches are on hold anyway (ADR-0008), so nothing is blocked yet.

## Consequences

- Studio can be built and tested now; only the hosting step waits.
- **Outside this project:** if Big T's or Grass Roots take payments or advertise and are hosted on Henry's Vercel Hobby account, the same rule applies to them. Check which plan they're on.
