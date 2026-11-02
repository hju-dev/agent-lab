# 2. Use the Gemini API free tier for Lead Scout, with personal details removed first

Date: 2026-10-17

## Status

Accepted. Depends on Spikes SP1 and SP5. Added to on 2026-11-02 (model choice); the original text is unchanged.

## Context

The budget is $0. Gemini has a free tier with several Flash models ([SOURCES.md](../SOURCES.md#gemini-api-lead-scouts-model)). Its terms say free-tier content may be used to improve Google's products and read by human reviewers, and tell users not to submit personal information. Google doesn't publish the free-tier rate limits in its docs; they're shown per project in AI Studio and are "not guaranteed".

Claude via the API would cost money. Henry's Claude Pro plan can't be called from GitHub Actions.

## Decision

Use a free-tier Gemini Flash model, pinned to an exact version in the wrapper file. Before every call, remove email addresses and phone numbers from page text (S25). Never send client admin data or anything from the private tables except the lead's public page text and tool results. Count calls and tokens per run and alert at 80% of the limits recorded from AI Studio (S15).

**Added 2 Nov 2026: the model.** From the limits AI Studio shows for this project ([SOURCES.md](../SOURCES.md#limits-shown-in-ai-studio-for-agent-labs-project)):

- **Lead Scout uses Gemini 3.5 Flash Lite,** with 3.1 Flash Lite as the fallback, because they have the highest daily limit of the Flash models. The other Flash models allow 20 requests a day, which is about 2 leads. SP1 records the exact model ID, and the wrapper pins it.
- **Gemini calls are at least 4.5 seconds apart.** A 429 means wait and retry, within the existing 3 retries.
- **The eval grader runs on a different model,** probably Gemma 4 31B, so eval runs don't use Lead Scout's daily requests. SP1 tests whether its output works for grading. Its limit of 16K tokens a minute is the one to watch.
- **Agent Lab has its own key in its own Google Cloud project,** not the chatbot's, restricted to the Gemini API only.

## Consequences

- $0, but limits can change without notice. The monthly check and the one-file wrapper make switching cheap.
- Public business page text is sent to a service that may use it for training. That's acceptable for public pages; it's why the scrub exists.
- **Outside this project:** Henry's existing public chatbot also uses the free tier. The terms require Paid Services for API clients made available to users in the EEA, Switzerland or the UK. Raise this with the lawyer or senior reviewer.
