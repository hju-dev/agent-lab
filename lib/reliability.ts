// Shared reliability rules for every agent's network calls (safeguards S11, S12, S44).
// The 10-minute cap per run lives in each workflow (`timeout-minutes: 10`), not here.

export const REQUEST_TIMEOUT_MS = 10_000 // S11: CLAUDE.md, "Reliability"

// S11 exception (ADR-0015): only these named APIs may wait longer than 10 seconds.
// The Day 0 spikes measured them as slower; everything else keeps the 10-second limit.
export const SLOW_API_TIMEOUT_MS = {
  pagespeed: 60_000, // SP2: PageSpeed calls took longer than 10 s; all 25 finished within 60 s
  gemmaGrader: 60_000, // SP1: the Gemma 4 grader's replies took about 35 s
} as const

// S11: a request that hangs is cut off instead of freezing the run.
export function fetchWithTimeout(url: string | URL, init: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) })
}

// S44: Neon refuses every query once the month's free compute runs out.
// Retrying can't help until the 1st, so this error is never retried.
export function isQuotaError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const status = (err as { status?: unknown }).status
  return status === 402 || /exceeded the quota/i.test(err.message)
}

export const QUOTA_MESSAGE = "Neon's free compute for this month has run out. Nothing was written. It resets on the 1st."

type RetryOptions = {
  retries?: number // retries after the first try, so 3 means up to 4 tries
  baseDelayMs?: number // waits are base, 2 × base, 4 × base
  sleep?: (ms: number) => Promise<void> // tests pass a fake so they don't really wait
  shouldRetry?: (err: unknown) => boolean // say no for errors a retry can't fix, such as a bad API key
}

const realSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// S12: a flaky API gets up to 3 more tries, waiting longer each time, before the run gives up.
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { retries = 3, baseDelayMs = 1_000, sleep = realSleep, shouldRetry = () => true } = options
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (isQuotaError(err) || attempt >= retries || !shouldRetry(err)) throw err
      await sleep(baseDelayMs * 2 ** attempt)
    }
  }
}
