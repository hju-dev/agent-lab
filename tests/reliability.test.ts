// S11, S12, S44: timeouts, retries, and the quota error that is never retried.
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { REQUEST_TIMEOUT_MS, SLOW_API_TIMEOUT_MS, fetchWithTimeout, isQuotaError, withRetry } from '../lib/reliability.ts'

// Records each wait instead of really waiting.
function fakeSleep() {
  const waits: number[] = []
  return { waits, sleep: async (ms: number) => void waits.push(ms) }
}

describe('fetchWithTimeout (S11)', () => {
  let server: Server
  let url: string
  beforeAll(async () => {
    server = createServer(() => {}) // accepts the request and never answers
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`
  })
  afterAll(() => {
    server.closeAllConnections()
    server.close()
  })

  test('gives up on a server that never answers', async () => {
    const started = Date.now()
    await expect(fetchWithTimeout(url, {}, 100)).rejects.toThrow()
    expect(Date.now() - started).toBeLessThan(2_000)
  })
})

describe('slow API exceptions (S11, ADR-0015)', () => {
  test('only named APIs get longer, and none waits more than 60 seconds', () => {
    expect(Object.keys(SLOW_API_TIMEOUT_MS).sort()).toEqual(['gemmaGrader', 'pagespeed'])
    for (const ms of Object.values(SLOW_API_TIMEOUT_MS)) {
      expect(ms).toBeGreaterThan(REQUEST_TIMEOUT_MS)
      expect(ms).toBeLessThanOrEqual(60_000)
    }
  })
})

describe('withRetry (S12)', () => {
  test('retries a flaky call with increasing waits, then returns its result', async () => {
    const { waits, sleep } = fakeSleep()
    let calls = 0
    const result = await withRetry(
      async () => {
        calls++
        if (calls < 3) throw new Error('flaky')
        return 'ok'
      },
      { sleep },
    )
    expect(result).toBe('ok')
    expect(calls).toBe(3)
    expect(waits).toEqual([1_000, 2_000])
  })

  test('stops after 3 retries (4 tries) and throws the last error', async () => {
    const { waits, sleep } = fakeSleep()
    let calls = 0
    const alwaysFails = async () => {
      calls++
      throw new Error(`fail ${calls}`)
    }
    await expect(withRetry(alwaysFails, { sleep })).rejects.toThrow('fail 4')
    expect(calls).toBe(4)
    expect(waits).toEqual([1_000, 2_000, 4_000])
  })
})

describe('quota error (S44)', () => {
  const quotaError = () => Object.assign(new Error('Your project has exceeded the quota'), { status: 402 })

  test('is recognized by its status or its message', () => {
    expect(isQuotaError(quotaError())).toBe(true)
    expect(isQuotaError(Object.assign(new Error('Payment required'), { status: 402 }))).toBe(true)
    expect(isQuotaError(new Error('compute time quota: exceeded the quota'))).toBe(true)
    expect(isQuotaError(new Error('connection reset'))).toBe(false)
    expect(isQuotaError('not an error')).toBe(false)
  })

  test('is tried once and never retried', async () => {
    const { waits, sleep } = fakeSleep()
    let calls = 0
    const outOfQuota = async () => {
      calls++
      throw quotaError()
    }
    await expect(withRetry(outOfQuota, { sleep })).rejects.toThrow('exceeded the quota')
    expect(calls).toBe(1)
    expect(waits).toEqual([])
  })
})
