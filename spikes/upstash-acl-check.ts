// Checks that the restricted Upstash token can use lab: keys and is refused everywhere else.
// Run: node --env-file=.env spikes/upstash-acl-check.ts
// The refused request uses a made-up key name, so it can't touch the chatbot's data.
const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = process.env
if (!url || !token) {
  console.error('Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env, then run this again.')
  process.exit(1)
}

async function allowed(command: string[]) {
  const res = await fetch(url!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(10_000),
  })
  const body = await res.json()
  return res.ok && !body.error
}

const insideLab = await allowed(['SET', 'lab:spike:acl-check', '1', 'EX', '60'])
const outsideLab = await allowed(['GET', 'acl-check-outside-lab'])

console.log(`lab: key:     ${insideLab ? 'allowed' : 'refused'} (want allowed)`)
console.log(`outside lab:  ${outsideLab ? 'allowed' : 'refused'} (want refused)`)
console.log(insideLab && !outsideLab ? 'PASS' : 'FAIL')
process.exitCode = insideLab && !outsideLab ? 0 : 1
