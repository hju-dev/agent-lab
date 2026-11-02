# 8. Every output needs Henry's approval, and pitches are held behind a flag

Date: 2026-10-17

## Status

Accepted. Narrowed by ADR-0012: with no cold email, the CAN-SPAM condition no longer applies.

## Context

Model output can be wrong (OWASP LLM09) or manipulated by page content (LLM01). Sending anything automatically would give the agent "excessive agency" (LLM06).

Separately, whether Henry may do paid freelance work while in Thailand on his current status is a legal question that no public source answers. Cold pitches to US businesses must also follow CAN-SPAM: a physical postal address, an ad disclosure and a working opt-out ([SOURCES.md](../SOURCES.md#law-and-licensing)). Henry has no US postal address yet.

## Decision

- All model output goes to an approval queue. Nothing is sent or executed automatically (S34).
- A `pitches_enabled` setting, off by default, enforced in the database and the API (S30). While off, Henry can approve, edit and reject drafts, but nothing can be marked "ready to send".
- Only Henry turns it on, after a lawyer confirms his status **and** the pitch template meets CAN-SPAM (S26).

## Consequences

- Slower: every finding waits for Henry. The queue cap and 14-day expiry (S19) stop it piling up.
- Every decision becomes eval data (F8).
- Lead Scout is fully buildable and demonstrable without any pitch being sent.
- The freelance half of the goal is blocked on the lawyer, not on code.
