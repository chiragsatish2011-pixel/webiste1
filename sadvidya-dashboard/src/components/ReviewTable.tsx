/**
 * The review step. Every flag the parser found is editable here:
 * change the parameter or status, fix the text, add a missed flag, delete a wrong one.
 * Nothing is saved until the parent page's Save button is pressed.
 */
import { PARAMETERS } from '../config/scoring'
import { makeEmptyFlag } from '../lib/parseFlagReport'
import type { Flag, FlagStatus, ParameterKey } from '../types'

interface ReviewTableProps {
  flags: Flag[]
  onChange: (flags: Flag[]) => void
}

export default function ReviewTable({ flags, onChange }: ReviewTableProps) {
  /** Replace one field on one row. */
  function update(id: string, changes: Partial<Flag>) {
    onChange(flags.map((f) => (f.id === id ? { ...f, ...changes } : f)))
  }

  return (
    <div>
      <div className="space-y-4">
        {flags.map((flag, index) => (
          <div key={flag.id} className="rounded-card border border-ink/10 bg-cream/50 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-heading text-[12px] uppercase tracking-wider text-olive">
                Flag {index + 1}
              </span>

              <label className="flex items-center gap-1 text-[12px] text-ink/65">
                Line
                <input
                  type="number"
                  min={0}
                  value={flag.line ?? ''}
                  onChange={(e) =>
                    update(flag.id, { line: e.target.value === '' ? null : Number(e.target.value) })
                  }
                  className="input w-20 py-1"
                />
              </label>

              <label className="flex items-center gap-1 text-[12px] text-ink/65">
                Parameter
                <select
                  value={flag.parameter}
                  onChange={(e) => update(flag.id, { parameter: e.target.value as ParameterKey })}
                  className="input w-auto py-1"
                >
                  {PARAMETERS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1 text-[12px] text-ink/65">
                Status
                <select
                  value={flag.status}
                  onChange={(e) => update(flag.id, { status: e.target.value as FlagStatus })}
                  className="input w-auto py-1"
                >
                  <option value="FLAGGED">FLAGGED (counts against the score)</option>
                  <option value="UNSURE">UNSURE (tracked only)</option>
                </select>
              </label>

              <label className="flex items-center gap-1 text-[12px] text-ink/65">
                Term
                <input
                  value={flag.term}
                  onChange={(e) => update(flag.id, { term: e.target.value })}
                  className="input w-32 py-1"
                  placeholder="optional"
                />
              </label>

              <button
                type="button"
                onClick={() => onChange(flags.filter((f) => f.id !== flag.id))}
                className="btn-quiet ml-auto text-xs text-terracotta"
              >
                Delete flag
              </button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-[12px] text-ink/65">
                English line
                <textarea
                  value={flag.english}
                  onChange={(e) => update(flag.id, { english: e.target.value })}
                  rows={2}
                  className="input mt-1"
                />
              </label>
              <label className="block text-[12px] text-ink/65">
                Translated line
                <textarea
                  value={flag.hindi}
                  onChange={(e) => update(flag.id, { hindi: e.target.value })}
                  rows={2}
                  className="input deva mt-1"
                />
              </label>
            </div>

            <label className="mt-3 block text-[12px] text-ink/65">
              Reason
              <textarea
                value={flag.reason}
                onChange={(e) => update(flag.id, { reason: e.target.value })}
                rows={2}
                className="input mt-1"
              />
            </label>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...flags, makeEmptyFlag()])}
        className="btn-ghost mt-4 text-xs"
      >
        + Add a missed flag
      </button>

      {flags.length === 0 && (
        <p className="mt-4 rounded-xl border border-ink/10 bg-sage/40 p-3 text-[13px] text-ink/70">
          No flags — this will be saved as a <strong>CLEAN</strong> report and score 10.0 on
          everything.
        </p>
      )}
    </div>
  )
}
