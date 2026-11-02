# 3. Run the agents on GitHub Actions schedules in a public repo

Date: 2026-10-17

## Status

Accepted. Depends on Spike SP3.

## Context

The agents need to run on a timer with no server. Options checked:

- **Vercel Hobby cron:** at most once a day, ±59 minutes. Too infrequent for uptime checks.
- **A VPS:** costs money.
- **GitHub Actions:** free on standard runners for public repos. Minimum interval 5 minutes. GitHub says scheduled runs can be delayed, especially at the top of the hour, and queued runs can be dropped. Public-repo schedules switch off after 60 days with no activity. Logs of public repos are public. ([SOURCES.md](../SOURCES.md#github-actions-schedules))

## Decision

Use GitHub Actions in the public `hju-dev/agent-lab` repo. Schedule at odd minutes (for example `17 * * * *`) rather than on the hour (S27). One `concurrency` group per workflow (S9). Every run pings Healthchecks (S16). Logs print counts and IDs only (S3). Third-party actions pinned to a commit SHA and `permissions: contents: read` if Henry accepts P1 and P2 in the threat model.

## Consequences

- $0 and no server to look after.
- "Hourly" means "about hourly". SP3 measures the real delay, and the stale-data badge threshold is set from it.
- The repo must stay active, or the schedule stops. The monthly check includes a commit.
- Everything in the logs is public, which shapes how all agent code logs.
