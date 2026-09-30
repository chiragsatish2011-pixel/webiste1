import { describe, expect, it } from 'vitest'
import { average, countFlags, gradeFor, parameterScore, round1, scoreReport } from './scoring'
import { PARAMETERS } from '../config/scoring'
import type { Flag, ParameterKey } from '../types'

/** Small helper so tests read like sentences. */
function flag(parameter: ParameterKey, status: Flag['status'] = 'FLAGGED'): Flag {
  return {
    id: Math.random().toString(36).slice(2),
    line: 1,
    parameter,
    status,
    english: 'en',
    hindi: 'hi',
    reason: 'because',
    term: '',
  }
}

describe('config sanity', () => {
  it('weights add up to 1', () => {
    const total = PARAMETERS.reduce((s, p) => s + p.weight, 0)
    expect(round1(total)).toBe(1)
  })
})

describe('parameterScore', () => {
  it('starts at 10 with no flags', () => {
    expect(parameterScore('meaningDrift', 0)).toBe(10)
  })

  it('deducts the configured amount per flag', () => {
    expect(parameterScore('meaningDrift', 1)).toBe(8) // -2.0
    expect(parameterScore('voiceConviction', 2)).toBe(7) // -1.5 x2
    expect(parameterScore('naturalPhrasing', 3)).toBe(7) // -1.0 x3
    expect(parameterScore('termConsistency', 4)).toBe(6)
  })

  it('never goes below zero', () => {
    expect(parameterScore('meaningDrift', 20)).toBe(0)
  })
})

describe('gradeFor', () => {
  it('maps scores to labels', () => {
    expect(gradeFor(10)).toBe('Written in Hindi')
    expect(gradeFor(9)).toBe('Written in Hindi')
    expect(gradeFor(8.9)).toBe('Almost there')
    expect(gradeFor(7.5)).toBe('Almost there')
    expect(gradeFor(7.4)).toBe('Needs polish')
    expect(gradeFor(6)).toBe('Needs polish')
    expect(gradeFor(5.9)).toBe('Reads like a translation')
    expect(gradeFor(0)).toBe('Reads like a translation')
  })
})

describe('countFlags', () => {
  it('separates FLAGGED from UNSURE', () => {
    const counts = countFlags([
      flag('meaningDrift'),
      flag('meaningDrift', 'UNSURE'),
      flag('naturalPhrasing'),
    ])
    expect(counts.meaningDrift).toEqual({ flagged: 1, unsure: 1 })
    expect(counts.naturalPhrasing).toEqual({ flagged: 1, unsure: 0 })
    expect(counts.termConsistency).toEqual({ flagged: 0, unsure: 0 })
  })
})

describe('scoreReport', () => {
  it('gives a CLEAN report 10 on everything', () => {
    const card = scoreReport({ flags: [], overallStatus: 'CLEAN' })
    expect(card.overall).toBe(10)
    expect(card.grade).toBe('Written in Hindi')
    expect(card.parameters.every((p) => p.score === 10)).toBe(true)
  })

  it('UNSURE flags cost nothing but are tracked', () => {
    const card = scoreReport({
      flags: [flag('meaningDrift', 'UNSURE'), flag('voiceConviction', 'UNSURE')],
      overallStatus: 'FLAGGED',
    })
    expect(card.overall).toBe(10)
    expect(card.totalUnsure).toBe(2)
    expect(card.totalFlagged).toBe(0)
  })

  it('computes the weighted average from the template example', () => {
    // Meaning Drift 1, Natural Phrasing 2, Term Consistency 0, Voice 1, plus 1 unsure.
    const card = scoreReport({
      flags: [
        flag('meaningDrift'),
        flag('naturalPhrasing'),
        flag('naturalPhrasing'),
        flag('voiceConviction'),
        flag('termConsistency', 'UNSURE'),
      ],
      overallStatus: 'FLAGGED',
    })
    // MD 8 x .35 = 2.8 | Voice 8.5 x .25 = 2.125 | NP 8 x .25 = 2 | TC 10 x .15 = 1.5
    expect(card.overall).toBe(8.4)
    expect(card.grade).toBe('Almost there')
    expect(card.totalFlagged).toBe(4)
    expect(card.totalUnsure).toBe(1)
  })

  it('bottoms out at 0 when everything is flagged heavily', () => {
    const many = [
      ...Array(5).fill(0).map(() => flag('meaningDrift')),
      ...Array(10).fill(0).map(() => flag('naturalPhrasing')),
      ...Array(10).fill(0).map(() => flag('termConsistency')),
      ...Array(7).fill(0).map(() => flag('voiceConviction')),
    ]
    expect(scoreReport({ flags: many, overallStatus: 'FLAGGED' }).overall).toBe(0)
  })

  it('ignores flags with an unknown parameter instead of crashing', () => {
    const bad = { ...flag('meaningDrift'), parameter: 'nonsense' as ParameterKey }
    const card = scoreReport({ flags: [bad], overallStatus: 'FLAGGED' })
    expect(card.overall).toBe(10)
  })
})

describe('average', () => {
  it('handles the empty case', () => {
    expect(average([])).toBe(0)
  })
  it('rounds to one decimal', () => {
    expect(average([8, 9, 10])).toBe(9)
    expect(average([8.2, 8.4])).toBe(8.3)
  })
})
