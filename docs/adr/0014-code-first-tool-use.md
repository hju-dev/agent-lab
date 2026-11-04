# 14. Code-first tool use; no programmatic tool calling on a $0 budget

Date: 2026-11-01

## Status

Accepted.

## Context

Calling tools one at a time is slow and expensive: the model calls a tool, the full result comes back into the context, then it calls the next one. A long list of MCP tools also fills the context before any work starts.

The fix that's spreading is to let the model write a small program that calls the tools and returns only the result:
- **Cloudflare's Code Mode** (blog post, Feb 20, 2026) serves its API of over 2,500 endpoints through two tools, `search()` and `execute()`, in about 1,000 tokens instead of an estimated 1.17 million. The code runs in a V8 sandbox with no file system, no environment variables and outside network access off by default.
- **Anthropic's programmatic tool calling** lets code running inside the Claude API's code execution tool call tools that are marked as callable from code (`allowed_callers`).
- **Claude Code** already loads MCP tool details only when needed (tool search), and it can write and run scripts in the terminal, which gives the same effect.

MCP is still the protocol underneath. This is a change in how tools are used, not a replacement for MCP.

## Decision

- **No programmatic tool calling.** It's a Claude API feature, so it needs an API key and billing. That breaks the $0 rule and ADR-0010 (never set `ANTHROPIC_API_KEY`). Revisit only if the budget changes.
- **Lead Scout never runs code the model writes.** It reads untrusted websites, so a hidden instruction on a page could turn into code running in GitHub Actions with the repo's secrets (OWASP LLM01, LLM06). Its 6-tool allowlist is small enough that the tool list isn't a cost.
- **Claude Code works code-first,** following the rules in CLAUDE.md under "Tools and MCP":
  - prefer a CLI or a script to an MCP server
  - keep MCP servers few and per project
  - do bulk work in a script that filters and returns a summary
  - read-only by default
  - leave tool search on
  - untrusted content never reaches a step that runs code
- **Later (after Nov 30):** move Lead Scout's fixed audit steps into one deterministic `audit_site` step written in code (fetch, PageSpeed, links, SSL, platform), so Gemini only decides what matters and writes the draft. It's on the README's Later list, and it would change the tool allowlist, so it needs its own ADR and the eval gate.

## Consequences

- **The token savings come at no cost,** from habits rather than a paid feature.
- **No extra attack surface:** model-written code never runs where untrusted text or secrets are.
- **Bulk scripts are written per task.** That costs a little time, but the scripts are reviewable and can be reused.
- **Claude Code's tool search defaults** come from a third-party guide (about a 10% context threshold, on by default). Check the current Claude Code docs before relying on the exact setting.
