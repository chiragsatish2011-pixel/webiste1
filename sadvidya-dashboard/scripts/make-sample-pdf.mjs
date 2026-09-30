/**
 * Builds public/sample-flag-report.pdf from the review template, so the upload
 * flow (and the parser test) can be tried against a real PDF.
 *
 * Run with: npm run make-sample-pdf
 *
 * Note: pdf-lib's built-in fonts cannot draw Devanagari, so the Hindi lines in
 * this sample PDF are written in Roman letters. Devanagari text is covered by
 * the text-level parser tests instead.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument, StandardFonts } from 'pdf-lib'

const here = dirname(fileURLToPath(import.meta.url))
const outPath = join(here, '..', 'public', 'sample-flag-report.pdf')

export const SAMPLE_TEXT = `FLAG REPORT
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
Hindi: vah ek shaant man ke saath mandir mein chala gaya.
Reason: The Hindi follows English word order and sounds stiff.

--- FLAG 2 ---
Line: 9
Parameter: meaning-drift
Status: FLAGGED
Term:
English: Devotion is not a mood; it is a decision.
Hindi: bhakti ek bhaavna nahin, vah ek achchhi aadat hai.
Reason: "A good habit" softens "a decision".

--- FLAG 3 ---
Line: 14
Parameter: Term consistency
Status: UNSURE
Term: dehbhav
English: He let go of dehbhav.
Hindi: usne dehbhaav chhod diya.
Reason: Spelled dehbhaav here and deh-bhaav earlier.

--- FLAG 4 ---
Line: 21
Parameter: Voice & Conviction
Status: FLAGGED
English: This is the whole of it.
Hindi: yah sab kuchh hai.
Reason: The tone has gone flat and generic.

SUMMARY
Meaning Drift: 1 | Natural Phrasing: 1 | Term Consistency: 0 | Voice & Conviction: 1 | Unsure: 1`

/** Draw the text onto A4 pages and return the PDF bytes. */
export async function buildSamplePdf(text = SAMPLE_TEXT) {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const size = 11
  const lineHeight = 15
  const margin = 50
  const pageHeight = 842
  const pageWidth = 595

  let page = pdf.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  for (const line of text.split('\n')) {
    if (y < margin) {
      page = pdf.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
    }
    if (line.trim()) page.drawText(line, { x: margin, y, size, font })
    y -= lineHeight
  }

  return pdf.save()
}

// Only write the file when run directly (the test imports the builder instead).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const bytes = await buildSamplePdf()
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, bytes)
  console.log(`Wrote ${outPath} (${bytes.length} bytes)`)
}
