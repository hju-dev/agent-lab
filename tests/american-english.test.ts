// Keeps the repo in American English (Henry, Nov 4, 2026; CLAUDE.md, "While you build").
// Fails on British spellings and on day-first dates such as "4 Nov 2026" (write "Nov 4, 2026").
// Quotes must stay as their source wrote them: if one ever needs a British spelling, add the exact
// file and phrase to ALLOWED below, with a reason.
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

const BRITISH = [
  'behaviour', 'colour', 'favour', 'honour', 'labour', 'neighbour', 'humour', 'flavour', 'harbour', 'rumour',
  'labelled', 'labelling', 'travelled', 'travelling', 'cancelled', 'cancelling', 'modelled', 'modelling',
  'signalled', 'signalling', 'totalled', 'fuelled', 'counsellor', 'jewellery',
  'centre', 'centred', 'metre', 'litre', 'theatre', 'fibre', 'calibre', 'centrepiece',
  'licence', 'defence', 'offence', 'judgement', 'grey', 'towards', 'afterwards', 'whilst', 'amongst', 'learnt',
  'spelt', 'cheque', 'catalogue', 'programme', 'enquiry', 'enquiries', 'practise', 'practised', 'tyre', 'ageing',
  'artefact', 'aluminium', 'sceptical', 'maths', 'fortnight', 'CV', 'CVs',
  'analyse', 'analysed', 'analysing', 'paralyse',
]
// Any word ending in -isation, -ise, -ised, -ises or -ising where the American form uses z.
const ISE_STEMS = [
  'organ', 'recogn', 'real', 'priorit', 'summar', 'minim', 'maxim', 'optim', 'custom', 'apolog', 'categor',
  'normal', 'author', 'standard', 'final', 'initial', 'util', 'visual', 'critic', 'memor', 'special', 'personal',
  'synchron', 'serial', 'sanit', 'local', 'stabil', 'central', 'capital', 'character', 'familiar', 'monet',
  'penal', 'legal', 'mobil', 'neutral', 'digit', 'token', 'container', 'emphas', 'general', 'modern', 'author',
]
const ALLOWED: { file: string; phrase: string; reason: string }[] = [
  { file: 'CLAUDE.md', phrase: 'résumé, not CV', reason: 'the American English rule names the word it replaces' },
]

const words = new RegExp(
  `\\b(${BRITISH.join('|')}|(?:${ISE_STEMS.join('|')})is(?:e|ed|es|ing|ation|ations))\\b`,
  'gi',
)
const MONTHS = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December'
const dayFirstDate = new RegExp(`\\b\\d{1,2} (?:${MONTHS})\\b`, 'g')

const files = spawnSync('git', ['ls-files'], { encoding: 'utf8' })
  .stdout.split('\n')
  .filter((f) => /\.(md|ts|yml|sql|json)$/.test(f) && !f.endsWith('package-lock.json') && f !== 'tests/american-english.test.ts')

test('the repo has text files to check', () => {
  expect(files.length).toBeGreaterThan(20)
})

test('everything is written in American English', () => {
  const problems: string[] = []
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, i) => {
      const allowed = ALLOWED.filter((a) => a.file === file && line.includes(a.phrase))
      for (const m of line.matchAll(words)) {
        const word = m[0]
        // "CV" counts only in capitals: a lower-case "cv" could be a variable name.
        if (/^cvs?$/i.test(word) && !/^CVs?$/.test(word)) continue
        if (allowed.some((a) => a.phrase.includes(word))) continue
        problems.push(`${file}:${i + 1}: British spelling "${word}"`)
      }
      for (const m of line.matchAll(dayFirstDate)) {
        if (allowed.some((a) => a.phrase.includes(m[0]))) continue
        problems.push(`${file}:${i + 1}: day-first date "${m[0]}" (write the month first, e.g. "Nov 4, 2026")`)
      }
    })
  }
  expect(problems).toEqual([])
})
