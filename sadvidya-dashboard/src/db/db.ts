/**
 * Storage. Everything lives in the browser's IndexedDB (via Dexie),
 * so reports survive refreshes and never leave this machine.
 */
import Dexie, { type Table } from 'dexie'
import type { Report } from '../types'

class ScorecardDB extends Dexie {
  reports!: Table<Report, number>

  constructor() {
    super('sadvidya-scorecard')
    // Indexes: ++id = auto key. The others let us sort/filter quickly.
    this.version(1).stores({
      reports: '++id, date, title, language, isDemo, createdAt',
    })
  }
}

export const db = new ScorecardDB()

/** Save a new report and return its new id. */
export async function addReport(report: Report): Promise<number> {
  return db.reports.add(report)
}

/** Replace an existing report (used by "Edit report"). */
export async function updateReport(id: number, changes: Partial<Report>): Promise<void> {
  await db.reports.update(id, changes)
}

export async function deleteReport(id: number): Promise<void> {
  await db.reports.delete(id)
}

/** All reports, oldest first — the order the diya row and charts want. */
export async function allReports(): Promise<Report[]> {
  const rows = await db.reports.toArray()
  return rows.sort((a, b) => a.date.localeCompare(b.date))
}

export async function getReport(id: number): Promise<Report | undefined> {
  return db.reports.get(id)
}

export async function clearAll(): Promise<void> {
  await db.reports.clear()
}

/** Remove only the rows created by "Load demo data". */
export async function clearDemo(): Promise<void> {
  const demoIds = await db.reports.filter((r) => r.isDemo === true).primaryKeys()
  await db.reports.bulkDelete(demoIds)
}

/** Insert many reports at once (demo data and backup import). */
export async function bulkAdd(reports: Report[]): Promise<void> {
  await db.reports.bulkAdd(reports)
}
