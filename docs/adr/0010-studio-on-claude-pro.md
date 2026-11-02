# 10. Studio runs locally in Claude Code on Henry's Pro plan, never on the API

Date: 2026-10-17

## Status

Accepted.

## Context

Studio is five Claude Code subagents (Strategist, Copywriter, Designer, Builder, Auditor) with three approval gates. Henry pays for Claude Pro. Pro has a 5-hour session limit and a weekly limit, shared between Claude Code and claude.ai. If `ANTHROPIC_API_KEY` is set, Claude Code uses the API and bills it instead of the plan ([SOURCES.md](../SOURCES.md#claude-studio)).

## Decision

Studio runs only when Henry starts it, on his computer, inside Claude Code on his Pro plan. `ANTHROPIC_API_KEY` is never set. One role at a time, `/compact` between roles, and `/status` checked before starting a build. Third-party skills are installed only after a SkillSpector scan and Henry's OK.

## Consequences

- No extra cost.
- Builds are limited by Pro's session and weekly limits. Measure the first full demo and record how much of the limit it used.
- Studio isn't "always on". That's intended for now.
- Studio's multi-agent coordination is done by Claude Code, not by Henry's own code. Say this plainly when presenting it.
