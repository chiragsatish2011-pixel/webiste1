/**
 * One place that holds all the reports, the language filter, and the
 * save/delete helpers. Every page reads from here so the whole dashboard
 * stays in step.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as store from '../db/db'
import { demoReports } from '../lib/demoData'
import { scoreAll, type ScoredReport } from '../lib/insights'
import type { Language, Report } from '../types'

/** "All" plus the two languages — used by the filter in the settings drawer. */
export type LanguageFilter = 'All' | Language

interface DataContextValue {
  /** Reports after the language filter, oldest first, with scores attached. */
  reports: ScoredReport[]
  /** Every report, ignoring the filter (used for "is the dashboard empty?"). */
  allReports: ScoredReport[]
  loading: boolean
  languageFilter: LanguageFilter
  setLanguageFilter: (value: LanguageFilter) => void
  hasDemoData: boolean
  reload: () => Promise<void>
  saveReport: (report: Report) => Promise<number>
  editReport: (id: number, changes: Partial<Report>) => Promise<void>
  removeReport: (id: number) => Promise<void>
  loadDemoData: () => Promise<void>
  removeDemoData: () => Promise<void>
  clearEverything: () => Promise<void>
  importReports: (reports: Report[]) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

const FILTER_KEY = 'sadvidya-language-filter'

export function DataProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [languageFilter, setFilter] = useState<LanguageFilter>(
    () => (localStorage.getItem(FILTER_KEY) as LanguageFilter) || 'All',
  )

  const reload = useCallback(async () => {
    const rows = await store.allReports()
    setRaw(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const setLanguageFilter = useCallback((value: LanguageFilter) => {
    setFilter(value)
    localStorage.setItem(FILTER_KEY, value)
  }, [])

  const allReports = useMemo(() => scoreAll(raw), [raw])
  const reports = useMemo(
    () => (languageFilter === 'All' ? allReports : allReports.filter((r) => r.language === languageFilter)),
    [allReports, languageFilter],
  )

  const value: DataContextValue = {
    reports,
    allReports,
    loading,
    languageFilter,
    setLanguageFilter,
    hasDemoData: raw.some((r) => r.isDemo),
    reload,
    saveReport: async (report) => {
      const id = await store.addReport(report)
      await reload()
      return id
    },
    editReport: async (id, changes) => {
      await store.updateReport(id, changes)
      await reload()
    },
    removeReport: async (id) => {
      await store.deleteReport(id)
      await reload()
    },
    loadDemoData: async () => {
      await store.bulkAdd(demoReports())
      await reload()
    },
    removeDemoData: async () => {
      await store.clearDemo()
      await reload()
    },
    clearEverything: async () => {
      await store.clearAll()
      await reload()
    },
    importReports: async (imported) => {
      await store.bulkAdd(imported)
      await reload()
    },
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

/** Read the shared data. Throws if used outside the provider, which is a bug. */
export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}
