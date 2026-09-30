/**
 * End-to-end check: build a real PDF from the review template, read it back with
 * pdfjs-dist (the same library the browser uses), rebuild the lines and parse it.
 */
import { describe, expect, it } from 'vitest'
import { buildSamplePdf } from '../../scripts/make-sample-pdf.mjs'
import { pagesToText, piecesToLines, type TextPiece } from './pdfLines'
import { parseFlagReportText } from './parseFlagReport'
import { scoreReport } from './scoring'

/** Read a PDF's text using the Node build of pdfjs. */
async function pdfToText(bytes: Uint8Array): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const task = pdfjs.getDocument({ data: bytes, useSystemFonts: false })
  const doc = await task.promise
  const pages: string[][] = []
  for (let n = 1; n <= doc.numPages; n += 1) {
    const page = await doc.getPage(n)
    const content = await page.getTextContent()
    pages.push(piecesToLines(content.items as unknown as TextPiece[]))
  }
  await task.destroy()
  return pagesToText(pages)
}

describe('piecesToLines', () => {
  it('groups pieces on the same baseline and orders them left to right', () => {
    const pieces: TextPiece[] = [
      { str: 'world', transform: [1, 0, 0, 1, 80, 700], width: 30 },
      { str: 'Hello ', transform: [1, 0, 0, 1, 50, 700], width: 30 },
      { str: 'Second line', transform: [1, 0, 0, 1, 50, 685], width: 50 },
      { str: 'same-ish baseline', transform: [1, 0, 0, 1, 200, 701], width: 80 },
    ]
    expect(piecesToLines(pieces)).toEqual(['Hello world same-ish baseline', 'Second line'])
  })

  it('drops whitespace-only pieces and returns nothing for an empty page', () => {
    expect(piecesToLines([])).toEqual([])
    expect(piecesToLines([{ str: '  ', transform: [1, 0, 0, 1, 0, 0] }])).toEqual([''])
  })
})

describe('PDF -> text -> parsed report', () => {
  it('parses a real generated PDF', async () => {
    const text = await pdfToText(await buildSamplePdf())
    const parsed = parseFlagReportText(text)

    expect(parsed.title).toBe('The Lamp That Does Not Flicker')
    expect(parsed.date).toBe('2026-03-12')
    expect(parsed.language).toBe('Hindi')
    expect(parsed.overallStatus).toBe('FLAGGED')
    expect(parsed.flags).toHaveLength(4)
    expect(parsed.flags.map((f) => f.parameter)).toEqual([
      'naturalPhrasing',
      'meaningDrift',
      'termConsistency',
      'voiceConviction',
    ])
    expect(parsed.flags[2].status).toBe('UNSURE')
    expect(parsed.flags[2].term).toBe('dehbhav')
    expect(parsed.warnings).toEqual([])

    // MD 8 x .35 + Voice 8.5 x .25 + NP 9 x .25 + TC 10 x .15 = 8.66 -> 8.7
    const card = scoreReport(parsed)
    expect(card.overall).toBe(8.7)
    expect(card.grade).toBe('Almost there')
  }, 30_000)
})
