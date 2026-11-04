# Fast app startup playbook

**Audience:** Studio's Builder and Auditor, and Claude Code on any of Henry's apps with a login (client web apps, PWAs like Raeng, /lab/admin).
**Purpose:** make an app usable within moments of opening, even on a slow phone connection, a plane or a weak signal, not just on the fast wifi it was tested on.
**Origin:** Henry's notes, Nov 1, 2026, adapted for web apps and checked for security.

## The problem

On open, many apps run a chain of network requests one after another: check the session, then load the account, then load the home screen data. The user waits for the whole chain before seeing anything, even though the answers are usually the same as last time. On fast wifi it's invisible. On a slow connection each step in the chain adds a full round trip.

## Rule 1 · Trust the last known session, and verify it in the background

- If the user was signed in last time, show the signed-in app straight away using the session and account details already on the device.
- Check the session with the server **in the background**. If the server says it's no longer valid, sign the user out, clear what's cached on the device, and show the sign-in screen.
- **Security limit:** this is only about what the screen shows first. The server still checks the session on **every** request for private data and on every action. A cached session must never authorize anything on its own.
- With Clerk or similar libraries, use their built-in client-side session state rather than custom token handling. Check the library's docs for how it handles offline and expired sessions.

## Rule 2 · Cache the home screen's data, then refresh it

- After each successful load, save the data the home screen needs (as JSON, not an image) on the device.
  - Small data: `localStorage`. Larger: IndexedDB.
  - In a native iOS app the equivalent is UserDefaults; a database isn't needed for this.
- On the next open, render immediately from that saved data, fetch fresh data in the background, and update the screen when it arrives (stale-while-revalidate).
- Show a small "updating…" or "last updated" hint if stale data could mislead.
- **Privacy:** cache only what's needed for the first screen. Clear the cache on sign-out. Don't cache sensitive data (payment details, health information, other people's personal data). Wrap storage reads and writes in try/catch: storage can be full, blocked or unavailable.

## Rule 3 · Run independent requests in parallel

- Requests that don't depend on each other start at the same time (`Promise.all`, or parallel fetches in server components), not one after another.
- Only truly dependent requests stay in sequence.
- Prefer one endpoint that returns everything the first screen needs over several small ones.
- Keep parallel requests within rate limits.

## How it's checked (Auditor)

1. **Waterfall check.** In Chrome DevTools or a Playwright trace, with network throttled to "Slow 4G", record the requests on open. No chain longer than 2 sequential requests before first useful content.
2. **Repeat-open check.** On the second open, the home screen shows content before any network request finishes. Test this with the network set to offline.
3. **Sign-out check.** Revoke the session on the server, then reopen the app: it shows cached UI briefly, then signs out, and private data is not shown or requested after the server says no.
4. **Lighthouse** on mobile: performance target as in DONE_CHECKS. Check the "Avoid chaining critical requests" audit.

## How this fits the Neon playbook

Caching on the device and fewer repeated requests also mean fewer database wake-ups. Background refreshes still hit the server, so the Neon rules (long caches, no polling) still apply.
