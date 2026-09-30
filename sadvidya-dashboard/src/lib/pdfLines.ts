/**
 * PDFs have no real "lines" — only little pieces of text with coordinates.
 * This rebuilds readable lines from those pieces, which the parser then reads.
 * Kept free of pdfjs imports so it can be unit tested anywhere.
 */

export interface TextPiece {
  /** The text of the piece. */
  str: string
  /** pdfjs transform array; index 5 is the vertical position, 4 the horizontal. */
  transform: number[]
  /** Width of the piece in PDF points, used to spot gaps between words. */
  width?: number
  /** pdfjs sets this when the piece ends a line. */
  hasEOL?: boolean
}

/**
 * Group pieces into lines by their vertical position.
 * `tolerance` is how far apart (in PDF points) two pieces can be and still count
 * as the same line — 2pt copes with slight baseline differences.
 */
export function piecesToLines(pieces: TextPiece[], tolerance = 2): string[] {
  const rows: { y: number; items: TextPiece[] }[] = []

  for (const piece of pieces) {
    if (!piece.str) continue
    const y = piece.transform?.[5] ?? 0
    // PDFs are drawn top-down but y counts up, so find an existing row near this y.
    const row = rows.find((r) => Math.abs(r.y - y) <= tolerance)
    if (row) row.items.push(piece)
    else rows.push({ y, items: [piece] })
  }

  // Top of the page first (largest y), then left to right inside each line.
  rows.sort((a, b) => b.y - a.y)

  return rows.map((row) => {
    const items = row.items.sort((a, b) => (a.transform?.[4] ?? 0) - (b.transform?.[4] ?? 0))
    let line = ''
    let prevEnd: number | null = null

    for (const item of items) {
      const x = item.transform?.[4] ?? 0
      // Two pieces sitting apart on the page are separate words, even when
      // neither piece carries a space of its own.
      const needsGap =
        prevEnd !== null && x - prevEnd > 1 && !/\s$/.test(line) && !/^\s/.test(item.str)
      if (needsGap) line += ' '
      line += item.str
      prevEnd = x + (item.width ?? 0)
    }

    return line.replace(/\s+/g, ' ').trim()
  })
}

/** Join reconstructed lines from every page into one text blob. */
export function pagesToText(pages: string[][]): string {
  return pages.map((lines) => lines.join('\n')).join('\n')
}
