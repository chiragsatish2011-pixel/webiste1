/**
 * The settings drawer: backup export/import, demo data, clear all,
 * and the language filter that applies to the whole dashboard.
 */
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useData, type LanguageFilter } from '../context/DataContext'
import { downloadJson, makeBackup, readBackup } from '../lib/backup'
import ConfirmButton from './ConfirmButton'

const FILTERS: LanguageFilter[] = ['All', 'Hindi', 'Gujarati']

export default function SettingsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    allReports,
    languageFilter,
    setLanguageFilter,
    hasDemoData,
    loadDemoData,
    removeDemoData,
    clearEverything,
    importReports,
  } = useData()

  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  async function handleImport(file: File) {
    try {
      const reports = readBackup(await file.text())
      await importReports(reports)
      setMessage({ kind: 'ok', text: `Imported ${reports.length} report(s).` })
    } catch (error) {
      setMessage({ kind: 'error', text: (error as Error).message })
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/25"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="fixed right-0 top-0 z-50 h-full w-[88%] max-w-sm overflow-y-auto border-l
                       border-ink/10 bg-card p-6"
            aria-label="Settings"
          >
            <div className="flex items-center justify-between">
              <h2 className="h-display text-lg">Settings</h2>
              <button type="button" onClick={onClose} className="btn-quiet" aria-label="Close settings">
                ✕
              </button>
            </div>

            {/* Language filter */}
            <div className="mt-7">
              <p className="label-caps">Language filter</p>
              <p className="mt-1 text-[13px] text-ink/60">Applies to every page.</p>
              <div className="mt-3 flex gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setLanguageFilter(f)}
                    className={
                      languageFilter === f ? 'btn bg-terracotta text-cream text-xs' : 'btn-ghost text-xs'
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Backup */}
            <div className="mt-8 border-t border-ink/10 pt-6">
              <p className="label-caps">Backup</p>
              <p className="mt-1 text-[13px] text-ink/60">
                {allReports.length} report(s) stored in this browser.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  onClick={() =>
                    downloadJson(
                      makeBackup(allReports),
                      `sadvidya-scorecard-backup-${new Date().toISOString().slice(0, 10)}.json`,
                    )
                  }
                >
                  Export all data
                </button>
                <button type="button" className="btn-ghost text-xs" onClick={() => fileRef.current?.click()}>
                  Import from backup
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleImport(file)
                    e.target.value = ''
                  }}
                />
              </div>
            </div>

            {/* Demo data */}
            <div className="mt-8 border-t border-ink/10 pt-6">
              <p className="label-caps">Demo data</p>
              <p className="mt-1 text-[13px] text-ink/60">
                Six fake articles labelled “(demo)”, so you can see the dashboard full.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  onClick={() => void loadDemoData()}
                  disabled={hasDemoData}
                >
                  {hasDemoData ? 'Demo data loaded' : 'Load demo data'}
                </button>
                {hasDemoData && (
                  <button type="button" className="btn-ghost text-xs" onClick={() => void removeDemoData()}>
                    Remove demo data
                  </button>
                )}
              </div>
            </div>

            {/* Danger zone */}
            <div className="mt-8 border-t border-ink/10 pt-6">
              <p className="label-caps">Clear everything</p>
              <p className="mt-1 text-[13px] text-ink/60">
                Deletes every report from this browser. Export a backup first.
              </p>
              <div className="mt-3">
                <ConfirmButton
                  label="Clear all data"
                  confirmLabel="Yes, delete everything"
                  doubleConfirm
                  onConfirm={() => void clearEverything()}
                />
              </div>
            </div>

            {message && (
              <p
                className={`mt-6 rounded-xl border p-3 text-[13px] ${
                  message.kind === 'ok'
                    ? 'border-[#12805A]/30 bg-sage/50 text-[#0f5f45]'
                    : 'border-terracotta/30 bg-peach/50 text-terracotta'
                }`}
              >
                {message.text}
              </p>
            )}

            <p className="mt-8 text-[12px] leading-relaxed text-ink/45">
              Everything stays in this browser. No login, no server, no AI calls.
            </p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
