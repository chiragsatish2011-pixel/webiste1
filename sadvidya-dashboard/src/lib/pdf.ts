/**
 * Reads a PDF in the browser with pdfjs-dist and returns its text.
 * Nothing is uploaded anywhere — the file is read from disk in this tab.
 */
import * as pdfjs from 'pdfjs-dist'
// Vite turns this into a URL for the pdfjs worker file.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { pagesToText, piecesToLines, type TextPiece } from './pdfLines'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

/** Extract the text of a PDF file chosen in the browser. */
export async function extractTextFromPdf(file: File): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer())
  const task = pdfjs.getDocument({ data })
  const doc = await task.promise
  const pages: string[][] = []

  for (let pageNo = 1; pageNo <= doc.numPages; pageNo += 1) {
    const page = await doc.getPage(pageNo)
    const content = await page.getTextContent()
    pages.push(piecesToLines(content.items as unknown as TextPiece[]))
  }

  // Release the worker's memory for this file.
  await task.destroy()
  return pagesToText(pages)
}
