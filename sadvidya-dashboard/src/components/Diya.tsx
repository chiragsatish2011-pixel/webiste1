/**
 * A diya (oil lamp) drawn in SVG. The flame's height and brightness follow the
 * score: 10 gives a tall, steady, bright flame; a low score gives a small,
 * flickering one. An unlit diya (score = null) is the empty state.
 */
import { motion } from 'framer-motion'

interface DiyaProps {
  /** Overall score out of 10, or null for an unlit lamp. */
  score: number | null
  /** Overall size in pixels. */
  size?: number
  /** Plays the "being lit" animation once when true. */
  justLit?: boolean
}

export default function Diya({ score, size = 72, justLit = false }: DiyaProps) {
  const lit = score !== null
  // 0..1 strength of the flame.
  const strength = lit ? Math.max(0.12, Math.min(1, score / 10)) : 0
  const flameHeight = 14 + strength * 26
  const flameWidth = 9 + strength * 5
  // A weak flame flickers more and is dimmer.
  const flicker = lit ? 1 - strength : 0
  const glow = 0.18 + strength * 0.5

  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 64 74"
      aria-hidden="true"
      className="overflow-visible"
    >
      <defs>
        <radialGradient id={`glow-${flameHeight.toFixed(1)}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F6B24A" stopOpacity={glow} />
          <stop offset="100%" stopColor="#F6B24A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Warm glow behind the flame */}
      {lit && (
        <motion.circle
          cx="32"
          cy={44 - flameHeight * 0.55}
          r={16 + strength * 12}
          fill={`url(#glow-${flameHeight.toFixed(1)})`}
          animate={{ opacity: [0.75, 1, 0.8] }}
          transition={{ duration: 2.4 + flicker, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Flame */}
      {lit && (
        <motion.g
          initial={justLit ? { scaleY: 0, opacity: 0 } : false}
          animate={
            justLit
              ? { scaleY: 1, opacity: 1 }
              : {
                  scaleY: [1, 1 - flicker * 0.18, 1 + flicker * 0.1, 1],
                  x: [0, flicker * 1.4, -flicker * 1.2, 0],
                }
          }
          transition={
            justLit
              ? { duration: 0.7, ease: 'easeOut' }
              : { duration: 1.6 + flicker * 0.8, repeat: Infinity, ease: 'easeInOut' }
          }
          style={{ originY: 1, originX: 0.5, transformBox: 'fill-box' }}
        >
          {/* Outer flame */}
          <path
            d={`M32 44 C ${32 - flameWidth} ${44 - flameHeight * 0.45}, ${32 - flameWidth * 0.5} ${
              44 - flameHeight
            }, 32 ${44 - flameHeight - 3} C ${32 + flameWidth * 0.5} ${44 - flameHeight}, ${
              32 + flameWidth
            } ${44 - flameHeight * 0.45}, 32 44 Z`}
            fill="#E9922F"
            opacity={0.55 + strength * 0.4}
          />
          {/* Inner flame */}
          <path
            d={`M32 44 C ${32 - flameWidth * 0.5} ${44 - flameHeight * 0.4}, ${
              32 - flameWidth * 0.25
            } ${44 - flameHeight * 0.66}, 32 ${44 - flameHeight * 0.78} C ${
              32 + flameWidth * 0.25
            } ${44 - flameHeight * 0.66}, ${32 + flameWidth * 0.5} ${44 - flameHeight * 0.4}, 32 44 Z`}
            fill="#FFD98A"
            opacity={0.5 + strength * 0.5}
          />
        </motion.g>
      )}

      {/* Wick */}
      <path d="M31 46 L32 41 L33 46 Z" fill="#6B6B52" opacity={lit ? 0.9 : 0.5} />

      {/* Lamp body */}
      <path
        d="M10 46 C 10 46, 16 62, 32 62 C 48 62, 54 46, 54 46 Z"
        fill={lit ? '#C4623F' : '#D9D2C4'}
      />
      <ellipse cx="32" cy="46" rx="22" ry="5" fill={lit ? '#A94F32' : '#C9C1B2'} />
      <ellipse cx="32" cy="45" rx="16" ry="3" fill={lit ? '#EEB487' : '#E4DED2'} opacity="0.7" />
      {/* Base */}
      <path d="M22 62 L42 62 L38 67 L26 67 Z" fill={lit ? '#8E4228' : '#CCC4B5'} />
    </svg>
  )
}
