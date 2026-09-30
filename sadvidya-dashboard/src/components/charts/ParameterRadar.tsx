/**
 * Average score across the four parameters, with a toggle that overlays the
 * last three articles on top of the all-time average.
 */
import { useState } from 'react'
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { PARAMETERS } from '../../config/scoring'
import { parameterAverages, type ScoredReport } from '../../lib/insights'
import { GRID, MUTED, tooltipStyle } from './chartTheme'

export default function ParameterRadar({ reports }: { reports: ScoredReport[] }) {
  const [showRecent, setShowRecent] = useState(true)

  const allTime = parameterAverages(reports)
  const recent = parameterAverages(reports.slice(-3))
  const hasRecent = reports.length > 0

  const data = PARAMETERS.map((p) => ({
    parameter: p.label,
    'All time': allTime[p.key],
    'Last 3': recent[p.key],
  }))

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => setShowRecent((v) => !v)}
          className={showRecent ? 'btn bg-sand text-ink text-xs' : 'btn-quiet text-xs'}
          disabled={!hasRecent}
        >
          {showRecent ? 'Hide last 3 articles' : 'Overlay last 3 articles'}
        </button>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {/* A smaller radius keeps the four labels inside the card on a phone. */}
          <RadarChart data={data} outerRadius="62%" margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <PolarGrid stroke={GRID} />
            <PolarAngleAxis
              dataKey="parameter"
              tick={{ fill: MUTED, fontSize: 11, fontFamily: 'Poppins, system-ui, sans-serif' }}
            />
            <PolarRadiusAxis domain={[0, 10]} tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} />
            <Tooltip {...tooltipStyle} formatter={(v) => `${Number(v).toFixed(1)} / 10`} />
            <Legend
              wrapperStyle={{ fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 12, paddingTop: 6 }}
            />
            <Radar
              name="All time"
              dataKey="All time"
              stroke="#C4623F"
              strokeWidth={2}
              fill="#C4623F"
              fillOpacity={0.18}
            />
            {showRecent && (
              <Radar
                name="Last 3"
                dataKey="Last 3"
                stroke="#2A6FBD"
                strokeWidth={2}
                fill="#2A6FBD"
                fillOpacity={0.14}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
