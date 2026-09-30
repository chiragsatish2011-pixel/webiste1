/** First visit: one unlit diya and an invitation to upload. */
import { Link } from 'react-router-dom'
import Diya from './Diya'

export default function EmptyGarden({ filtered = false }: { filtered?: boolean }) {
  return (
    <div className="card card-pad flex flex-col items-center py-16 text-center">
      <Diya score={null} size={96} />
      <p className="mt-6 max-w-sm font-body text-lg text-ink/75">
        {filtered
          ? 'No articles in this language yet. Change the language filter in settings, or add a report.'
          : 'Upload your first Flag Report to light the first diya'}
      </p>
      <Link to="/add" className="btn-primary mt-6">
        + Add Report
      </Link>
    </div>
  )
}
