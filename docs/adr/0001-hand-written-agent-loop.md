# 1. Hand-write the Lead Scout agent loop, with no agent framework

Date: 2026-10-17

## Status

Accepted. Depends on Spike SP1.

## Context

Lead Scout needs to choose which checks to run on a site, so it's an agent: a model picks a tool, code runs it, the result goes back, repeat. Frameworks such as LangGraph do this for you. The earlier Gemini-drafted plan used one.

Henry's goal is to explain every line in an interview. The Udacity mentor posting in ROLES_MATRIX.md (J5) asks for "agents with tool use, API integrations, structured outputs, memory, state management" and "AI agent evaluation". A framework hides the loop that proves those skills. Lead Scout has six tools and a maximum of 8 steps, which is small enough to write by hand.

## Decision

Write the loop by hand in TypeScript (about 100–150 lines): call Gemini with function declarations, validate each tool call with zod, run the tool from an allowlist, log the step to `run_steps`, stop on `finish`, the step cap, or 5 consecutive errors. All model calls go through one wrapper file.

If SP1 shows free-tier function calling doesn't work, the same loop takes structured JSON (`{ next_tool, args }`) instead and the code dispatches. That keeps this decision intact.

## Consequences

- Henry can explain and debug every step; the loop is the centerpiece of the case study.
- Retries, timeouts and caps are our code to maintain (S6, S11, S12).
- No built-in tracing UI. `run_steps` and replay (F9) replace it.
- Switching model providers means changing one wrapper file.
