import { describe, expect, it } from 'vitest'
import { makeBackup, readBackup, slugify } from './backup'
import { demoReports } from './demoData'
import { scoreAll } from './insights'

describe('demo data', () => {
  it('gives six labelled articles with varied scores', () => {
    const reports = demoReports()
    expect(reports).toHaveLength(6)
    expect(reports.every((r) => r.isDemo)).toBe(true)
    expect(reports.every((r) => r.title.includes('(demo)'))).toBe(true)

    const scores = scoreAll(reports).map((r) => r.overall)
    expect(new Set(scores).size).toBeGreaterThan(3) // genuinely varied
    expect(Math.min(...scores)).toBeLessThan(8)
    expect(Math.max(...scores)).toBe(10)
  })

  it('includes a Gujarati article and a clean one', () => {
    const reports = demoReports()
    expect(reports.some((r) => r.language === 'Gujarati')).toBe(true)
    expect(reports.some((r) => r.overallStatus === 'CLEAN')).toBe(true)
  })
})

describe('backup round trip', () => {
  it('exports and re-imports the same reports', () => {
    const backup = makeBackup(demoReports())
    const restored = readBackup(JSON.stringify(backup))
    expect(restored).toHaveLength(6)
    expect(restored[0].title).toBe(demoReports()[0].title)
    expect(restored[0].id).toBeUndefined() // ids are dropped on import
  })

  it('accepts a bare array of reports too', () => {
    expect(readBackup(JSON.stringify(demoReports()))).toHaveLength(6)
  })

  it('explains what is wrong with a bad file', () => {
    expect(() => readBackup('not json')).toThrow(/valid JSON/)
    expect(() => readBackup('{"hello":1}')).toThrow(/Scorecard backup/)
    expect(() => readBackup('[{"title":"x"}]')).toThrow(/missing a title or its flags/)
  })
})

describe('slugify', () => {
  it('makes a safe file name', () => {
    expect(slugify('The Lamp That Does Not Flicker')).toBe('the-lamp-that-does-not-flicker')
    expect(slugify('!!!')).toBe('report')
  })
})
