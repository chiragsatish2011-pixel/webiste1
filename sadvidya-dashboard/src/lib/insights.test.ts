import { describe, expect, it } from 'vitest'
import {
  badges,
  currentStreak,
  latestChange,
  parameterAverages,
  reFlagCount,
  repeatOffenders,
  scoreAll,
  totalFlagsResolved,
  weakestParameters,
} from './insights'
import type { Flag, ParameterKey, Report } from '../types'

let n = 0
function f(parameter: ParameterKey, over: Partial<Flag> = {}): Flag {
  n += 1
  return {
    id: `x${n}`,
    line: n,
    parameter,
    status: 'FLAGGED',
    english: 'en',
    hindi: 'hi',
    reason: 'the hindi follows english word order closely',
    term: '',
    ...over,
  }
}

function report(id: number, date: string, flags: Flag[], title = `A${id}`): Report {
  return {
    id,
    title,
    date,
    language: 'Hindi',
    overallStatus: flags.length ? 'FLAGGED' : 'CLEAN',
    flags,
    createdAt: `${date}T10:00:00.000Z`,
  }
}

const reports: Report[] = [
  report(1, '2026-01-01', [f('naturalPhrasing'), f('meaningDrift'), f('termConsistency', { term: 'dehbhav' })]),
  report(2, '2026-02-01', [f('naturalPhrasing'), f('termConsistency', { term: 'dehbhav' })]),
  report(3, '2026-03-01', [f('termConsistency', { term: 'Dehbhav' })]),
  report(4, '2026-04-01', []),
]

describe('scoreAll', () => {
  it('sorts oldest first and attaches scores', () => {
    const scored = scoreAll([...reports].reverse())
    expect(scored.map((r) => r.id)).toEqual([1, 2, 3, 4])
    expect(scored.at(-1)!.overall).toBe(10)
    expect(scored.at(-1)!.grade).toBe('Written in Hindi')
  })
})

describe('streaks and latest change', () => {
  it('counts the run of recent reports at 8 or above', () => {
    const scored = scoreAll(reports)
    // 1: 8.65-ish, 2: 9.25, 3: 9.85, 4: 10 -> all above 8
    expect(currentStreak(scored)).toBe(4)
  })

  it('breaks the streak on a low score', () => {
    const low = report(5, '2026-05-01', Array.from({ length: 4 }, () => f('meaningDrift')))
    expect(currentStreak(scoreAll([...reports, low]))).toBe(0)
  })

  it('reports the change against the previous article', () => {
    const { latest, delta } = latestChange(scoreAll(reports))
    expect(latest).toBe(10)
    expect(delta).toBeGreaterThan(0)
    expect(latestChange([]).latest).toBeNull()
    expect(latestChange(scoreAll([reports[0]])).delta).toBeNull()
  })
})

describe('weak spots', () => {
  it('names the weakest parameters first', () => {
    const weak = weakestParameters(reports)
    expect(weak).toHaveLength(3)
    expect(weak[0].key).toBe('termConsistency') // flagged in three of four articles
    expect(weak[0].sentence).toContain('Term Consistency')
  })

  it('averages parameters across reports', () => {
    const avg = parameterAverages(reports)
    expect(avg.voiceConviction).toBe(10) // never flagged
    expect(avg.meaningDrift).toBeLessThan(10)
  })

  it('totals the flags', () => {
    expect(totalFlagsResolved(reports)).toBe(6)
  })
})

describe('repeatOffenders', () => {
  it('finds terms flagged in two or more articles, ignoring case', () => {
    const offenders = repeatOffenders(reports)
    const dehbhav = offenders.find((o) => o.label.toLowerCase() === 'dehbhav')
    expect(dehbhav).toBeDefined()
    expect(dehbhav!.articles).toBe(3)
    expect(dehbhav!.kind).toBe('term')
  })

  it('falls back to repeated reasons when there is no term', () => {
    const offenders = repeatOffenders(reports)
    expect(offenders.some((o) => o.kind === 'reason')).toBe(true)
  })

  it('ignores one-off flags', () => {
    const once = [report(1, '2026-01-01', [f('meaningDrift', { term: 'ekantik', reason: 'unique one' })])]
    expect(repeatOffenders(once)).toEqual([])
  })
})

describe('reFlagCount', () => {
  it('counts flags in the newest report that were already flagged before', () => {
    const latest = report(5, '2026-05-01', [
      f('termConsistency', { term: 'dehbhav' }),
      f('meaningDrift', { term: 'brand new term', reason: 'a completely different explanation entirely' }),
    ])
    const { count, total } = reFlagCount([...reports, latest])
    expect(total).toBe(2)
    expect(count).toBe(1)
  })

  it('is zero when there is only one report', () => {
    expect(reFlagCount([reports[0]])).toEqual({ count: 0, total: 3 })
  })
})

describe('badges', () => {
  it('unlocks as the work progresses', () => {
    const list = badges(reports)
    const byId = Object.fromEntries(list.map((b) => [b.id, b]))
    expect(byId['first-report'].earned).toBe(true)
    expect(byId['first-clean'].earned).toBe(true) // report 4 is clean
    expect(byId['five-articles'].earned).toBe(false)
    expect(byId['three-above-8'].earned).toBe(true)
    expect(byId['zero-drift'].earned).toBe(false) // report 1 had a drift flag
  })

  it('has nothing earned with no reports', () => {
    expect(badges([]).every((b) => !b.earned)).toBe(true)
  })
})
