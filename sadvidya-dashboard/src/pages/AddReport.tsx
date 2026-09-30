/**
 * ADD REPORT — drop a Flag Report PDF, check what the parser read,
 * then save. Nothing is stored until "Save Report" is pressed.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Diya from '../components/Diya'
import ReviewTable from '../components/ReviewTable'
import ScoreInfo from '../components/ScoreInfo'
import Section from '../components/Section'
import { useData } from '../context/DataContext'
import { extractTextFromPdf } from '../lib/pdf'
import {
  looksLikeFlagReport,
  makeEmptyFlag,
  parseFlagReportText,
  type ParsedReport,
} from '../lib/parseFlagReport'
import { REVIEW_TEMPLATE } from '../lib/reviewTemplate'
import { scoreReport } from '../lib/scoring'
import type { Flag, Language, Report } from '../types'

type Stage = 'upload' | 'review' | 'saving' | 'lit'

export default function AddReport() {
  const navigate = useNavigate()
  const { saveReport } = useData()
  const fileRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<Stage>('upload')
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // The draft being reviewed before saving.
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [language, setLanguage] = useState<Language>('Hindi')
  const [flags, setFlags] = useState<Flag[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [sourceFile, setSourceFile] = useState<string | undefined>()
  const [savedScore, setSavedScore] = useState(0)
  const [savedId, setSavedId] = useState<number | null>(null)

  /** Fill the review form from a parse result. */
  function applyParsed(parsed: ParsedReport, fileName?: string) {
    if (parsed.title) setTitle(parsed.title)
    if (parsed.date) setDate(parsed.date)
    setLanguage(parsed.language)
    setFlags(parsed.flags)
    setWarnings(parsed.warnings)
    setSourceFile(fileName)
    setStage('review')
  }

  /** Read a dropped/chosen PDF and move on to the review step. */
  async function handleFile(file: File) {
    setError(null)
    setBusy(true)
    try {
      if (!/\.pdf$/i.test(file.name)) {
        throw new Error('That is not a PDF. Drop the Flag Report PDF, or fill the form by hand below.')
      }
      const text = await extractTextFromPdf(file)
      const parsed = parseFlagReportText(text)

      if (!looksLikeFlagReport(text) && parsed.flags.length === 0) {
        // Parsing failed completely: fall back to a blank manual form.
        setError(
          'Could not read a Flag Report from that PDF. The form below is blank — fill it in by hand, or try another file.',
        )
        setFlags([])
        setWarnings([])
        setSourceFile(file.name)
        setStage('review')
        return
      }

      applyParsed(parsed, file.name)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  /** Save the reviewed report, play the lighting animation, then open the article. */
  async function save() {
    const report: Report = {
      title: title.trim() || 'Untitled article',
      date: date || new Date().toISOString().slice(0, 10),
      language,
      overallStatus: flags.length === 0 ? 'CLEAN' : 'FLAGGED',
      flags,
      createdAt: new Date().toISOString(),
      sourceFile,
    }
    setStage('saving')
    const id = await saveReport(report)
    setSavedId(id)
    setSavedScore(scoreReport(report).overall)
    setStage('lit')
    // Give the new diya a moment to be seen, then go to its page.
    setTimeout(() => navigate(`/articles/${id}`), 1900)
  }

  const preview = scoreReport({ flags, overallStatus: flags.length === 0 ? 'CLEAN' : 'FLAGGED' })

  return (
    <div>
      <Section
        number="01"
        title="Add a Flag Report"
        subtitle="Drop the PDF Claude gave you. You will see everything it read before anything is saved."
      >
        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) void handleFile(file)
          }}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileRef.current?.click()}
          className={`card flex cursor-pointer flex-col items-center justify-center px-6 py-14 text-center
            transition-colors ${dragging ? 'border-terracotta bg-peach/40' : 'hover:bg-sand/35'}`}
        >
          <Diya score={dragging ? 10 : null} size={72} />
          <p className="mt-5 font-heading text-base">
            {busy ? 'Reading the PDF…' : 'Drop your Flag Report PDF here'}
          </p>
          <p className="mt-1 text-[13px] text-ink/55">or click to choose a file</p>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
              e.target.value = ''
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={() => {
              void navigator.clipboard.writeText(REVIEW_TEMPLATE).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2200)
              })
            }}
          >
            {copied ? 'Copied ✓' : 'Copy review template'}
          </button>
          <button
            type="button"
            className="btn-quiet text-xs"
            onClick={() => {
              setFlags([makeEmptyFlag()])
              setWarnings([])
              setError(null)
              setStage('review')
            }}
          >
            Enter a report by hand instead
          </button>
          <a className="btn-quiet text-xs" href="./sample-flag-report.pdf" download>
            Download a sample PDF
          </a>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-terracotta/30 bg-peach/45 p-3 text-[13px] text-terracotta">
            {error}
          </p>
        )}
      </Section>

      {/* Review step */}
      {(stage === 'review' || stage === 'saving') && (
        <Section
          number="02"
          title="Check what was read"
          subtitle="Fix anything the parser got wrong. Nothing is saved until you press Save Report."
          right={
            <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-card px-4 py-2">
              <span className="label-caps">Score preview</span>
              <span className="font-heading text-lg text-terracotta">{preview.overall.toFixed(1)}</span>
              <ScoreInfo />
            </div>
          }
        >
          <div className="card card-pad">
            {warnings.length > 0 && (
              <ul className="mb-5 space-y-1 rounded-xl border border-terracotta/25 bg-peach/35 p-3 text-[13px] text-ink/80">
                {warnings.map((w) => (
                  <li key={w}>• {w}</li>
                ))}
              </ul>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-[12px] text-ink/65">
                Article title
                <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label className="text-[12px] text-ink/65">
                Date
                <input
                  type="date"
                  className="input mt-1"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label className="text-[12px] text-ink/65">
                Language
                <select
                  className="input mt-1"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                >
                  <option value="Hindi">Hindi</option>
                  <option value="Gujarati">Gujarati</option>
                </select>
              </label>
            </div>

            <div className="mt-6">
              <p className="label-caps">
                {flags.length} flag{flags.length === 1 ? '' : 's'} read from the report
              </p>
              <div className="mt-3">
                <ReviewTable flags={flags} onChange={setFlags} />
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-2 border-t border-ink/10 pt-5">
              <button
                type="button"
                className="btn-primary"
                disabled={stage === 'saving'}
                onClick={() => void save()}
              >
                {stage === 'saving' ? 'Saving…' : 'Save Report'}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setStage('upload')
                  setFlags([])
                  setWarnings([])
                  setTitle('')
                }}
              >
                Start over
              </button>
            </div>
          </div>
        </Section>
      )}

      {/* The new diya being lit */}
      <AnimatePresence>
        {stage === 'lit' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-cream/95"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="mx-auto w-fit"
              >
                <Diya score={savedScore} size={150} justLit />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="h-display mt-6 text-xl"
              >
                A new diya is lit — {savedScore.toFixed(1)} / 10
              </motion.p>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="btn-quiet mt-3 text-xs"
                onClick={() => savedId && navigate(`/articles/${savedId}`)}
              >
                Open the report card →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
