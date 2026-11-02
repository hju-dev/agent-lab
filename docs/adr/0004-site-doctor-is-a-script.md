# 4. Site Doctor is a plain script, not an agent

Date: 2026-10-17

## Status

Accepted.

## Context

Site Doctor checks uptime, PageSpeed, links and SSL on Henry's client sites. Every check runs every time, and the rules for raising a flag are fixed (a 3-day median and a sustained drop, S7). Nothing about the order or choice of checks needs judgment.

An agent costs model calls, can behave differently on the same input, and is harder to test.

## Decision

Site Doctor is a fixed script. The model is used only after a flag is raised, to write a plain-English finding for the approval queue.

## Consequences

- Cheap, predictable and fully testable with Vitest.
- A clear interview answer to "when should something be an agent?": Lead Scout is, Site Doctor isn't, and here's why.
- Site Doctor can't adapt to unusual sites. It doesn't need to.
