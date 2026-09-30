/**
 * Export/import of the whole dashboard as one JSON file, plus single-article export.
 * This is the backup: keep the file somewhere safe and it can be re-imported.
 */
import type { Report } from '../types'

export interface Backup {
  /** Lets a future version know how to read an old file. */
  format: 'sadvidya-scorecard-backup'
  version: 1
  exportedAt: string
  reports: Report[]
}

export function makeBackup(reports: Report[]): Backup {
  return {
    format: 'sadvidya-scorecard-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    reports,
  }
}

/** Ask the browser to download an object as a .json file. */
export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** A filename-safe version of an article title. */
export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'report'
  )
}

/**
 * Read a backup file. Throws a readable error when the file is not a backup,
 * so the settings drawer can show the message as-is.
 */
export function readBackup(text: string): Report[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }

  // Accept both a full backup and a bare array of reports.
  const reports = Array.isArray(parsed)
    ? parsed
    : (parsed as Backup)?.reports

  if (!Array.isArray(reports)) {
    throw new Error('That file does not look like a Scorecard backup.')
  }

  return reports.map((r, index) => {
    if (!r || typeof r !== 'object') throw new Error(`Report ${index + 1} in the file is not readable.`)
    const report = r as Report
    if (!report.title || !Array.isArray(report.flags)) {
      throw new Error(`Report ${index + 1} in the file is missing a title or its flags.`)
    }
    // Drop the old id so importing never overwrites an existing report.
    const { id: _ignored, ...rest } = report
    return {
      ...rest,
      language: report.language === 'Gujarati' ? 'Gujarati' : 'Hindi',
      overallStatus: report.flags.length === 0 ? 'CLEAN' : 'FLAGGED',
      createdAt: report.createdAt ?? new Date().toISOString(),
    } as Report
  })
}
