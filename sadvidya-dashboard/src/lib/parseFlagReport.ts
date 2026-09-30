/**
 * Turns the plain text of a Flag Report into structured data.
 * Written to be forgiving: labels can differ in case and spacing,
 * parameter names can be written "meaning-drift", "Meaning  Drift", etc.
 */
import { PARAMETERS } from '../config/scoring'
import type { Flag, FlagStatus, Language, ParameterKey } from '../types'

export interface ParsedReport {
  title: string
  date: string
  language: Language
  overallStatus: 'CLEAN' | 'FLAGGED'
  flags: Flag[]
  /** Anything the parser wants to warn about, shown above the review table. */
  warnings: string[]
  /** The summary line counts, when the PDF had a SUMMARY section. */
  summaryCounts?: Partial<Record<ParameterKey, number>> & { unsure?: number }
}

/** Drop accents/spacing/case so "Meaning-Drift " and "meaning drift" match. */
function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z]/g, '')
}

/** Lenient parameter matching. Returns null when nothing looks close enough. */
export function matchParameter(raw: string): ParameterKey | null {
  const n = normalise(raw)
  if (!n) return null

  // Exact-ish match on the full label first (meaningdrift, voiceconviction...).
  for (const p of PARAMETERS) {
    if (normalise(p.label) === n) return p.key
    if (normalise(p.key) === n) return p.key
  }
  // Then fall back to distinctive keywords.
  if (n.includes('meaning') || n.includes('drift')) return 'meaningDrift'
  if (n.includes('natural') || n.includes('phras')) return 'naturalPhrasing'
  if (n.includes('term') || n.includes('consisten')) return 'termConsistency'
  if (n.includes('voice') || n.includes('convict') || n.includes('tone')) return 'voiceConviction'
  return null
}

/** Lenient status matching: anything that isn't clearly UNSURE counts as FLAGGED. */
export function matchStatus(raw: string): FlagStatus {
  const n = normalise(raw)
  if (n.includes('unsure') || n.includes('maybe') || n.includes('judgement') || n.includes('judgment')) {
    return 'UNSURE'
  }
  return 'FLAGGED'
}

function matchLanguage(raw: string): Language {
  return normalise(raw).includes('gujarati') ? 'Gujarati' : 'Hindi'
}

/**
 * Pull "Label: value" out of a block of text, case-insensitively.
 * Spacing is matched with [^\S\n] (a space or tab but never a newline), so an
 * empty label such as a bare "Term:" line returns "" instead of swallowing the
 * next line.
 */
function field(block: string, label: string): string {
  const space = '[^\\S\\n]*'
  const re = new RegExp(`^${space}[>*-]*${space}${label}${space}[:\\-–]${space}(.*)$`, 'im')
  const m = block.match(re)
  return m ? m[1].trim() : ''
}

/**
 * A date found in the text, normalised to YYYY-MM-DD.
 * Returns a note when the format was ambiguous, so the review step can ask about it.
 */
function parseDate(raw: string): { date: string; note?: string } {
  const iso = raw.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (iso) {
    const [, y, m, d] = iso
    return { date: `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` }
  }

  // 12/03/2026 could be 12 March or 3 December. Read it as day/month (how I write dates) and say so.
  const dmy = raw.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/)
  if (dmy) {
    const [, d, m, y] = dmy
    return {
      date: `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`,
      note: `Read "${raw.trim()}" as ${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y} (day/month) — change it if that is wrong.`,
    }
  }

  // Written-out months, e.g. "12 March 2026" or "March 12, 2026".
  const parsed = raw ? new Date(raw) : null
  if (parsed && !Number.isNaN(parsed.getTime())) {
    return { date: parsed.toISOString().slice(0, 10) }
  }
  return { date: '' }
}

let flagCounter = 0
/** Unique enough ids for rows inside the review table. */
function newId(): string {
  flagCounter += 1
  return `f${Date.now().toString(36)}${flagCounter}`
}

export function makeEmptyFlag(): Flag {
  return {
    id: newId(),
    line: null,
    parameter: 'meaningDrift',
    status: 'FLAGGED',
    english: '',
    hindi: '',
    reason: '',
    term: '',
  }
}

/** Read the "SUMMARY Meaning Drift: 1 | Natural Phrasing: 2 ..." line. */
function parseSummary(text: string): ParsedReport['summaryCounts'] | undefined {
  const idx = text.search(/^\s*summary\s*$/im)
  if (idx === -1) return undefined
  const tail = text.slice(idx)
  const counts: NonNullable<ParsedReport['summaryCounts']> = {}
  for (const [, name, value] of tail.matchAll(/([A-Za-z&\s-]+?)\s*[:\-]\s*(\d+)/g)) {
    const n = normalise(name)
    if (n.includes('unsure')) {
      counts.unsure = Number(value)
      continue
    }
    const key = matchParameter(name)
    if (key) counts[key] = Number(value)
  }
  return Object.keys(counts).length > 0 ? counts : undefined
}

/**
 * The main entry point. Works on text extracted from a PDF or pasted by hand.
 * Never throws: on bad input it returns whatever it found plus warnings.
 */
export function parseFlagReportText(rawText: string): ParsedReport {
  // Normalise line endings and strip page-break noise from PDFs.
  const text = rawText.replace(/\r\n?/g, '\n').replace(/\f/g, '\n')
  const warnings: string[] = []

  // ---- Header ----
  const header = text.split(/---+\s*FLAG/i)[0] ?? text
  let title = field(header, 'article') || field(header, 'title')
  if (!title) {
    // Fall back to the first non-boilerplate line.
    const firstLine = text
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l && !/^flag report$/i.test(l))
    title = firstLine ?? ''
    if (title) warnings.push('Could not find an "Article:" line — guessed the title from the first line.')
  }

  const { date, note: dateNote } = parseDate(field(header, 'date'))
  if (!date) warnings.push('Could not read a date — please set it yourself.')
  if (dateNote) warnings.push(dateNote)

  const language = matchLanguage(field(header, 'language'))
  const headerStatus = field(header, 'status')

  // ---- Flag blocks ----
  // Split on "--- FLAG n ---" markers; anything before the first one is header.
  const parts = text.split(/^[\s>*-]*-*\s*FLAG\s*\d*\s*-*\s*$/gim)
  const blocks = parts.slice(1)

  const flags: Flag[] = []
  for (const block of blocks) {
    // Stop a block at the SUMMARY section if it ran into it.
    const body = block.split(/^\s*summary\s*$/im)[0]
    const parameterRaw = field(body, 'parameter') || field(body, 'param')
    const parameter = matchParameter(parameterRaw)
    const english = field(body, 'english') || field(body, 'en')
    const hindi = field(body, 'hindi') || field(body, 'gujarati') || field(body, 'translation')
    const reason = field(body, 'reason')
    const lineRaw = field(body, 'line')
    const lineNum = Number.parseInt(lineRaw.replace(/[^0-9]/g, ''), 10)

    // A block with nothing recognisable in it is skipped rather than saved empty.
    if (!parameter && !english && !hindi && !reason) continue

    if (!parameter) {
      warnings.push(
        `A flag had an unrecognised parameter (${parameterRaw || 'blank'}) — set to Meaning Drift, please check.`,
      )
    }

    flags.push({
      id: newId(),
      line: Number.isFinite(lineNum) ? lineNum : null,
      parameter: parameter ?? 'meaningDrift',
      status: matchStatus(field(body, 'status')),
      english,
      hindi,
      reason,
      term: field(body, 'term'),
    })
  }

  // ---- Overall status ----
  // Trust the header when it says CLEAN and no flags were found; otherwise go by the flags.
  let overallStatus: 'CLEAN' | 'FLAGGED'
  if (flags.length === 0) {
    overallStatus = 'CLEAN'
    if (normalise(headerStatus).includes('flagged')) {
      warnings.push('The report says FLAGGED but no flag blocks were found — add them by hand if needed.')
    }
  } else {
    overallStatus = 'FLAGGED'
    if (normalise(headerStatus).includes('clean')) {
      warnings.push('The report says CLEAN but flags were found — treating it as FLAGGED.')
    }
  }

  const summaryCounts = parseSummary(text)
  if (summaryCounts) {
    // Cross-check the flags we found against the report's own summary line.
    for (const p of PARAMETERS) {
      const expected = summaryCounts[p.key]
      if (expected === undefined) continue
      const found = flags.filter((f) => f.parameter === p.key && f.status === 'FLAGGED').length
      if (found !== expected) {
        warnings.push(
          `Summary says ${expected} ${p.label} flag(s) but ${found} were read from the report — check the table.`,
        )
      }
    }
  }

  return { title, date, language, overallStatus, flags, warnings, summaryCounts }
}

/** True when the text does not look like a Flag Report at all. */
export function looksLikeFlagReport(text: string): boolean {
  return /flag\s*report/i.test(text) || /---+\s*FLAG/i.test(text) || /parameter\s*:/i.test(text)
}
