// S7: the sustained-drop rule on sample data.
import { describe, expect, test } from 'vitest'
import { median, sustainedDrop } from '../lib/score-drop.ts'

describe('median', () => {
  test('odd and even lengths', () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 3, 2])).toBe(2.5)
  })
})

describe('sustainedDrop (S7)', () => {
  test('waits for 6 days of scores', () => {
    expect(sustainedDrop([90, 90, 90, 80, 80])).toBeNull()
  })

  test('one bad day does not flag', () => {
    expect(sustainedDrop([90, 90, 90, 90, 60, 90])?.flagged).toBe(false)
  })

  test('three lower days flag', () => {
    expect(sustainedDrop([90, 91, 89, 80, 79, 78])).toEqual({ before: 90, recent: 79, drop: 11, flagged: true })
  })

  test('a drop of exactly 10 flags, 9 does not', () => {
    expect(sustainedDrop([90, 90, 90, 80, 80, 80])?.flagged).toBe(true)
    expect(sustainedDrop([90, 90, 90, 81, 81, 81])?.flagged).toBe(false)
  })

  test('noise like SP2’s noisiest site (range 14) does not flag', () => {
    expect(sustainedDrop([49, 50, 47, 57, 43, 49])?.flagged).toBe(false)
  })

  test('only the last 6 days count', () => {
    expect(sustainedDrop([100, 100, 100, 80, 80, 80, 80, 80, 80])?.flagged).toBe(false)
  })

  test('a rising score never flags', () => {
    expect(sustainedDrop([60, 60, 60, 90, 90, 90])?.flagged).toBe(false)
  })
})
