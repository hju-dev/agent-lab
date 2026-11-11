# 17. Site Doctor's checks are "several times a day, best effort"

Date: 2026-11-11

## Status

Accepted (Henry, Nov 11, 2026). Replaces SP3's listed fallback ("about hourly, best effort", stale badge after 3 hours). The hourly cron itself stays.

## Context

SP3 failed far worse than its fallback assumed: 15 of 96 scheduled runs started in 48 hours, and Site Doctor has since run about once in every 6 hourly slots, with gaps of 4 to 9 hours (`docs/SPIKES.md`, results). With a 3-hour stale badge, /lab would look broken most of the time. The other option, an outside service that triggers the workflow on time, adds a new dependency and a GitHub token stored with a third party; Henry chose not to do that for now.

## Decision

- **Say what's true.** /lab, the projects card, the chat's knowledge and the agent's schedule label (migration 005) say "several times a day", not "hourly".
- **/lab's stale badge** appears after **12 hours** without a run.
- **Healthchecks `agent-lab heartbeat`:** period 1 hour, grace 11 hours, so it alerts at the same 12 hours (Henry sets this on healthchecks.io).
- **The cron stays hourly** (`37 * * * *`): every slot GitHub does run is a check.
- **"Down twice in a row"** now means two checks some hours apart. That's fine for a portfolio monitor; Uptime Robot remains Henry's real alert (ADR-0016).

## Consequences

- /lab only shows the stale badge when something is really wrong.
- A site outage can take hours to show up. Acceptable: client alerting is Uptime Robot's job.
- If GitHub's schedule gets reliable again, or Henry wants true hourly checks, revisit with an external trigger.
