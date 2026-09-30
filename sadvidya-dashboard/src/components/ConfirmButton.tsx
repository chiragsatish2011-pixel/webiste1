/**
 * A button that asks again before doing something destructive.
 * First click arms it, second click runs the action, and it disarms after 5s.
 */
import { useEffect, useState } from 'react'

interface ConfirmButtonProps {
  label: string
  confirmLabel?: string
  onConfirm: () => void
  className?: string
  /** Ask twice instead of once (used for "Clear all data"). */
  doubleConfirm?: boolean
}

export default function ConfirmButton({
  label,
  confirmLabel = 'Click again to confirm',
  onConfirm,
  className = 'btn-ghost',
  doubleConfirm = false,
}: ConfirmButtonProps) {
  const [stage, setStage] = useState(0)
  const needed = doubleConfirm ? 2 : 1

  // Forget the armed state after a few seconds, so it can't fire by accident later.
  useEffect(() => {
    if (stage === 0) return
    const timer = setTimeout(() => setStage(0), 5000)
    return () => clearTimeout(timer)
  }, [stage])

  return (
    <button
      type="button"
      className={stage > 0 ? 'btn bg-terracotta text-cream' : className}
      onClick={() => {
        if (stage + 1 > needed) {
          setStage(0)
          onConfirm()
        } else {
          setStage(stage + 1)
        }
      }}
    >
      {stage === 0
        ? label
        : stage < needed
          ? `Are you sure? (${needed - stage} more)`
          : confirmLabel}
    </button>
  )
}
