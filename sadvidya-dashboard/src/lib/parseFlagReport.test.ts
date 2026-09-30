import { describe, expect, it } from 'vitest'
import { looksLikeFlagReport, matchParameter, matchStatus, parseFlagReportText } from './parseFlagReport'

const SAMPLE = `FLAG REPORT
Article: The Lamp That Does Not Flicker
Date: 2026-03-12
Language: Hindi
Status: FLAGGED

--- FLAG 1 ---
Line: 4
Parameter: Natural Phrasing
Status: FLAGGED
Term:
English: He walked into the temple with a quiet mind.
Hindi: वह एक शांत मन के साथ मंदिर में चला गया।
Reason: The Hindi follows English word order and sounds stiff.

--- FLAG 2 ---
Line: 9
Parameter: meaning-drift
Status: FLAGGED
Term:
English: Devotion is not a mood; it is a decision.
Hindi: भक्ति एक भावना नहीं, वह एक अच्छी आदत है।
Reason: "A good habit" softens "a decision".

--- FLAG 3 ---
Line: 14
Parameter: Term consistency
Status: UNSURE
Term: dehbhav
English: He let go of dehbhav.
Hindi: उसने देहभाव छोड़ दिया।
Reason: Spelled देहभाव here and देह-भाव earlier.

--- FLAG 4 ---
Line: 21
Parameter: Voice & Conviction
Status: FLAGGED
English: This is the whole of it.
Hindi: यह सब कुछ है।
Reason: The tone has gone flat and generic.

--- FLAG 5 ---
Line: 26
Parameter: Natural Phrasing
Status: FLAGGED
English: Nothing was left to want.
Hindi: चाहने के लिए कुछ नहीं बचा था।
Reason: Reads like a literal rendering.

SUMMARY
Meaning Drift: 1 | Natural Phrasing: 2 | Term Consistency: 0 | Voice & Conviction: 1 | Unsure: 1
`

describe('matchParameter', () => {
  it('matches the four labels exactly', () => {
    expect(matchParameter('Meaning Drift')).toBe('meaningDrift')
    expect(matchParameter('Natural Phrasing')).toBe('naturalPhrasing')
    expect(matchParameter('Term Consistency')).toBe('termConsistency')
    expect(matchParameter('Voice & Conviction')).toBe('voiceConviction')
  })

  it('is lenient about case, spacing and punctuation', () => {
    expect(matchParameter('meaning-drift')).toBe('meaningDrift')
    expect(matchParameter('  MEANING   DRIFT ')).toBe('meaningDrift')
    expect(matchParameter('Term consistency')).toBe('termConsistency')
    expect(matchParameter('natural_phrasing')).toBe('naturalPhrasing')
    expect(matchParameter('voice and conviction')).toBe('voiceConviction')
    expect(matchParameter('Tone')).toBe('voiceConviction')
  })

  it('returns null for nonsense', () => {
    expect(matchParameter('grammar')).toBeNull()
    expect(matchParameter('')).toBeNull()
  })
})

describe('matchStatus', () => {
  it('detects UNSURE and defaults to FLAGGED', () => {
    expect(matchStatus('UNSURE')).toBe('UNSURE')
    expect(matchStatus('unsure ')).toBe('UNSURE')
    expect(matchStatus('FLAGGED')).toBe('FLAGGED')
    expect(matchStatus('')).toBe('FLAGGED')
  })
})

describe('parseFlagReportText', () => {
  const parsed = parseFlagReportText(SAMPLE)

  it('reads the header', () => {
    expect(parsed.title).toBe('The Lamp That Does Not Flicker')
    expect(parsed.date).toBe('2026-03-12')
    expect(parsed.language).toBe('Hindi')
    expect(parsed.overallStatus).toBe('FLAGGED')
  })

  it('reads every flag block', () => {
    expect(parsed.flags).toHaveLength(5)
    expect(parsed.flags.map((f) => f.parameter)).toEqual([
      'naturalPhrasing',
      'meaningDrift',
      'termConsistency',
      'voiceConviction',
      'naturalPhrasing',
    ])
    expect(parsed.flags.map((f) => f.line)).toEqual([4, 9, 14, 21, 26])
  })

  it('keeps the English, Hindi, reason and term', () => {
    const third = parsed.flags[2]
    expect(third.status).toBe('UNSURE')
    expect(third.term).toBe('dehbhav')
    expect(third.hindi).toBe('उसने देहभाव छोड़ दिया।')
    expect(third.english).toBe('He let go of dehbhav.')
    expect(third.reason).toContain('Spelled')
  })

  it('leaves an empty label empty instead of taking the next line', () => {
    // "Term:" is blank on flags 1, 2 and 5 in the sample.
    expect(parsed.flags[0].term).toBe('')
    expect(parsed.flags[1].term).toBe('')
    expect(parsed.flags[0].english).toBe('He walked into the temple with a quiet mind.')
  })

  it('reads the summary line', () => {
    expect(parsed.summaryCounts).toMatchObject({
      meaningDrift: 1,
      naturalPhrasing: 2,
      termConsistency: 0,
      voiceConviction: 1,
      unsure: 1,
    })
  })

  it('has no warnings for a well-formed report', () => {
    expect(parsed.warnings).toEqual([])
  })

  it('handles a CLEAN report', () => {
    const clean = parseFlagReportText(`FLAG REPORT
Article: A Clean One
Date: 2026-04-01
Language: Hindi
Status: CLEAN
`)
    expect(clean.overallStatus).toBe('CLEAN')
    expect(clean.flags).toEqual([])
    expect(clean.title).toBe('A Clean One')
  })

  it('handles Gujarati', () => {
    const g = parseFlagReportText('FLAG REPORT\nArticle: X\nDate: 2026-01-02\nLanguage: Gujarati\nStatus: CLEAN\n')
    expect(g.language).toBe('Gujarati')
  })

  it('warns instead of crashing on an unknown parameter', () => {
    const odd = parseFlagReportText(`FLAG REPORT
Article: Odd
Date: 2026-02-02
Language: Hindi
Status: FLAGGED

--- FLAG 1 ---
Line: 3
Parameter: Punctuation
Status: FLAGGED
English: a
Hindi: ब
Reason: comma
`)
    expect(odd.flags).toHaveLength(1)
    expect(odd.flags[0].parameter).toBe('meaningDrift')
    expect(odd.warnings.join(' ')).toContain('unrecognised parameter')
  })

  it('warns when the summary disagrees with the flags found', () => {
    const mismatch = parseFlagReportText(`FLAG REPORT
Article: Mismatch
Date: 2026-02-02
Status: FLAGGED

--- FLAG 1 ---
Line: 1
Parameter: Meaning Drift
Status: FLAGGED
English: a
Hindi: ब
Reason: r

SUMMARY
Meaning Drift: 3 | Natural Phrasing: 0 | Term Consistency: 0 | Voice & Conviction: 0 | Unsure: 0
`)
    expect(mismatch.warnings.join(' ')).toContain('Summary says 3 Meaning Drift')
  })

  it('accepts a different date format and reports missing dates', () => {
    const dmy = parseFlagReportText('Article: X\nDate: 12/03/2026\n')
    expect(dmy.date).toBe('2026-03-12') // read as day/month
    expect(dmy.warnings.join(' ')).toContain('day/month')
    expect(parseFlagReportText('Article: X\nDate: 12 March 2026\n').date).toBe('2026-03-12')
    expect(parseFlagReportText('Article: X\nDate: 2026/03/12\n').date).toBe('2026-03-12')
    expect(parseFlagReportText('Article: X\n').warnings.join(' ')).toContain('Could not read a date')
  })

  it('never throws on rubbish input', () => {
    const junk = parseFlagReportText('some random pdf text with no structure at all')
    expect(junk.flags).toEqual([])
    expect(junk.warnings.length).toBeGreaterThan(0)
    expect(looksLikeFlagReport('some random pdf text')).toBe(false)
    expect(looksLikeFlagReport(SAMPLE)).toBe(true)
  })
})
