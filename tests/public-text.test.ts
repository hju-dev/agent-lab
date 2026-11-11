// S2: public text never holds a web address, an email address or a site's name.
import { describe, expect, test } from 'vitest'
import { identifyingWords, safePublicText } from '../lib/public-text.ts'

const sites = [
  { id: 'seeded-private-bakery', name: 'Seeded Private Bakery', url: 'https://www.privatebakery.example' },
  { id: 'memory-matters', name: null, url: 'https://memorymatters.example.org' },
]
const words = identifyingWords(sites)

describe('safePublicText (S2)', () => {
  test.each(['Checked 5 sites: all up', 'Audited 2 sites, 1 skipped for time'])('keeps a counts-only summary: %s', (text) => {
    expect(safePublicText(text, words)).toBe(text)
  })

  test.each([
    ['a web address', 'Checked https://example.org'],
    ['a bare domain', 'Checked example.com'],
    ['a domain with an unusual ending', 'private-lead.example is down'],
    ['an email address', 'Wrote to owner@example.org'],
    ["a site's name", 'Seeded Private Bakery is down'],
    ["a site's id", 'memory-matters is slow'],
    ["a site's host name", 'privatebakery timed out'],
  ])('rejects text with %s', (_, text) => {
    expect(safePublicText(text, words)).toBeNull()
  })
})

test('identifyingWords uses id, name and host, and skips very short words', () => {
  expect(identifyingWords(sites)).toEqual(
    expect.arrayContaining(['seeded-private-bakery', 'Seeded Private Bakery', 'privatebakery.example', 'privatebakery', 'memory-matters', 'memorymatters']),
  )
  expect(identifyingWords([{ id: 'ab', url: 'https://x.io' }])).toEqual(['x.io'])
})
