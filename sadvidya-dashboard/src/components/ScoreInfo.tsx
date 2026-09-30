/**
 * The small "How is this calculated?" popover. Shown next to any score so the
 * maths is never a mystery.
 */
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GRADES, MAX_SCORE, PARAMETERS } from '../config/scoring'

export default function ScoreInfo({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on a click outside or the Escape key.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="grid h-5 w-5 place-items-center rounded-full border border-olive/40 font-heading
                   text-[11px] text-olive hover:bg-sand"
        title="How is this calculated?"
      >
        ?
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-30 mt-2 w-[290px] sm:w-[340px] card card-pad text-left"
          >
            <p className="h-display text-sm">How is this calculated?</p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink/75">
              Each parameter starts at {MAX_SCORE}. Every <strong>FLAGGED</strong> item takes points
              off. <strong>UNSURE</strong> items are tracked but cost nothing.
            </p>

            <table className="mt-3 w-full text-[12px]">
              <thead>
                <tr className="text-olive">
                  <th className="text-left font-heading font-medium">Parameter</th>
                  <th className="text-right font-heading font-medium">Per flag</th>
                  <th className="text-right font-heading font-medium">Weight</th>
                </tr>
              </thead>
              <tbody>
                {PARAMETERS.map((p) => (
                  <tr key={p.key} className="border-t border-ink/10">
                    <td className="py-1">{p.label}</td>
                    <td className="py-1 text-right">−{p.deductionPerFlag.toFixed(1)}</td>
                    <td className="py-1 text-right">{Math.round(p.weight * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-3 text-[12px] leading-relaxed text-ink/70">
              The overall score is the weighted average of the four, rounded to one decimal. A CLEAN
              report scores {MAX_SCORE}.0 everywhere.
            </p>
            <p className="mt-2 text-[12px] text-ink/70">
              {GRADES.map((g) => `${g.min}+ ${g.label}`).join(' · ')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
