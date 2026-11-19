// The palette playbook's table and palettes.json must list the same palettes with the same hex values,
// so an agent reading either one gets Henry's real colors (docs/playbooks/accent-palettes.md, ADR-0018).
import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

const md = readFileSync('docs/playbooks/accent-palettes.md', 'utf8')
const json = JSON.parse(readFileSync('docs/playbooks/palettes.json', 'utf8')) as {
  palettes: { id: number; base_1: { hex: string }; base_2: { hex: string }; accent: { hex: string } }[]
}

// Table rows look like: | 7 | Mandarin orange `#F37A1F` | Forest green `#228B22` (CSS forestgreen) | Crest yellow `#F9D648` | ...
const tableRows = md
  .split('\n')
  .filter((line) => /^\| \d+ \|/.test(line))
  .map((line) => {
    const id = Number(line.split('|')[1]!.trim())
    const hexes = [...line.matchAll(/`(#[0-9A-F]{6})`/gi)].map((m) => m[1]!.toUpperCase())
    return { id, hexes: hexes.slice(0, 3) }
  })

test('the table and palettes.json hold the same palettes, in order, with the same hex values', () => {
  expect(tableRows.length).toBeGreaterThanOrEqual(13)
  expect(json.palettes.map((p) => ({ id: p.id, hexes: [p.base_1.hex, p.base_2.hex, p.accent.hex].map((h) => h.toUpperCase()) }))).toEqual(tableRows)
})
