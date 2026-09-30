/** Shared chart styling so all three charts read as one system. */
export const GRID = '#E4DCCB'
export const AXIS = '#C9C0AE'
export const MUTED = '#8A857B'
export const INK = '#22201C'
export const SURFACE = '#FDFBF6'

/** Tooltip box styling passed to Recharts. */
export const tooltipStyle = {
  contentStyle: {
    background: SURFACE,
    border: '1px solid rgba(34,32,28,0.12)',
    borderRadius: 12,
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 12,
    boxShadow: '0 4px 20px rgba(34,32,28,0.10)',
  },
  labelStyle: { color: INK, fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: INK },
}

/** Short date for an axis label: "12 Mar". */
export function shortDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
