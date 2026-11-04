// SP2 (docs/SPIKES.md): how much do PageSpeed mobile scores vary from run to run?
// Run: node --env-file=.env spikes/sp2-psi.ts
// URLs come from private/sp2-urls.txt (git-ignored), one per line as "<label> <url>".
// Prints labels and scores only; full results go to private/.
import { readFileSync, writeFileSync } from 'node:fs'

const URLS_FILE = 'private/sp2-urls.txt'
const RESULTS_FILE = 'private/sp2-results.json'
const ROUNDS = 5
const SAME_URL_GAP_MS = 60_000
const SPACING_MS = 2000
// A PageSpeed call runs a full Lighthouse test on Google's side, so it gets 60 seconds, not the usual 10.
const TIMEOUT_MS = 60_000

const key = process.env.PAGESPEED_API_KEY
if (!key) {
  console.error('Add PAGESPEED_API_KEY to .env, then run this again.')
  process.exit(1)
}

const sites = readFileSync(URLS_FILE, 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim().split(/\s+/))
  .filter((parts) => parts.length === 2)
  .map(([label, url]) => ({ label, url }))
if (sites.length !== 5) {
  console.error(`Expected 5 "<label> <url>" lines in ${URLS_FILE}, found ${sites.length}.`)
  process.exit(1)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
let lastCallAt = 0

// One PageSpeed run, spaced from the last call, with 3 retries for 429s, 5xx errors and timeouts.
async function performanceScore(url: string) {
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance&url=${encodeURIComponent(url)}`
  for (let attempt = 0; attempt <= 3; attempt++) {
    const wait = lastCallAt + SPACING_MS - Date.now()
    if (wait > 0) await sleep(wait)
    lastCallAt = Date.now()
    let status = 0
    try {
      const res = await fetch(endpoint, { headers: { 'x-goog-api-key': key! }, signal: AbortSignal.timeout(TIMEOUT_MS) })
      status = res.status
      const json = await res.json()
      if (res.ok) return Math.round(json.lighthouseResult.categories.performance.score * 100)
      if (status !== 429 && status < 500) throw new Error(`PageSpeed returned ${status}: ${json.error?.message ?? 'no message'}`)
    } catch (err) {
      if (status && status !== 429 && status < 500) throw err
    }
    await sleep(5000 * 2 ** attempt)
  }
  throw new Error('Gave up after 3 retries')
}

const scores: Record<string, number[]> = Object.fromEntries(sites.map((s) => [s.label, []]))
for (let round = 1; round <= ROUNDS; round++) {
  const roundStart = Date.now()
  for (const site of sites) {
    scores[site.label].push(await performanceScore(site.url))
    console.log(`round ${round}: ${site.label} ${scores[site.label].at(-1)}`)
  }
  const wait = roundStart + SAME_URL_GAP_MS - Date.now()
  if (round < ROUNDS && wait > 0) await sleep(wait)
}

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
const summary = sites.map(({ label }) => {
  const xs = scores[label]
  return { label, scores: xs, median: median(xs), range: Math.max(...xs) - Math.min(...xs) }
})
writeFileSync(RESULTS_FILE, JSON.stringify({ checkedAt: new Date().toISOString(), summary }, null, 2))

console.log('')
for (const s of summary) console.log(`${s.label.padEnd(16)} scores ${s.scores.join(', ').padEnd(20)} median ${s.median}  range ${s.range}`)
const steady = summary.filter((s) => s.range <= 10).length
console.log(`\nURLs with a range of 10 points or less: ${steady} of 5 (pass: 4 or more)`)
console.log(`SP2 ${steady >= 4 ? 'PASS' : 'FAIL'}`)
console.log(`Full results: ${RESULTS_FILE}`)
