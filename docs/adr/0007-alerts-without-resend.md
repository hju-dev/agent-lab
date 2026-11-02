# 7. Alerts come from GitHub and Healthchecks; Resend waits for a domain

Date: 2026-10-17

## Status

Accepted. Supersedes the earlier plan to send alerts, a daily digest and client reports through Resend. Depends on Spike SP6.

## Context

The plan assumed Resend could send to Henry's own address without a custom domain. Resend's docs say "You must add and verify at least one domain" and that `onboarding@resend.dev` is for testing only ([SOURCES.md](../SOURCES.md#email-and-monitoring)). Henry has no domain and a $0 budget.

GitHub emails the creator of a scheduled workflow when it fails, if their notification settings allow. Healthchecks.io emails when pings stop; whether that's included on the free plan isn't stated on its pricing page.

## Decision

- **Failure alerts:** GitHub's own failure notifications plus Healthchecks.io.
- **Daily digest (F10):** deferred until a domain is owned. /lab/admin shows the same summary.
- **Client reports (F11):** downloaded from /lab/admin and sent by Henry from his own email.
- **When a domain is bought:** add Resend, verify the domain, and turn the digest on.

## Consequences

- $0 and no domain needed now.
- Henry has to open /lab/admin instead of reading a morning email.
- If SP6 shows Healthchecks free has no email, the backup is GitHub mobile push notifications, and the gap is recorded as T-A3 in the threat model.
- No code path can email a client, which also enforces "the system never emails clients".
