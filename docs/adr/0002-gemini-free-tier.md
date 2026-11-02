# 2. Use the Gemini API free tier for Lead Scout, with personal details removed first

Date: 2026-10-17

## Status

Accepted. Depends on Spikes SP1 and SP5.

## Context

The budget is $0. Gemini has a free tier with several Flash models ([SOURCES.md](../SOURCES.md#gemini-api-lead-scouts-model)). Its terms say free-tier content may be used to improve Google's products and read by human reviewers, and tell users not to submit personal information. Google doesn't publish the free-tier rate limits in its docs; they're shown per project in AI Studio and are "not guaranteed".

Claude via the API would cost money. Henry's Claude Pro plan can't be called from GitHub Actions.

## Decision

Use a free-tier Gemini Flash model, pinned to an exact version in the wrapper file. Before every call, remove email addresses and phone numbers from page text (S25). Never send client admin data or anything from the private tables except the lead's public page text and tool results. Count calls and tokens per run and alert at 80% of the limits recorded from AI Studio (S15).

## Consequences

- $0, but limits can change without notice. The monthly check and the one-file wrapper make switching cheap.
- Public business page text is sent to a service that may use it for training. That's acceptable for public pages; it's why the scrub exists.
- **Outside this project:** Henry's existing public chatbot also uses the free tier. The terms require Paid Services for API clients made available to users in the EEA, Switzerland or the UK. Raise this with the lawyer or senior reviewer.
