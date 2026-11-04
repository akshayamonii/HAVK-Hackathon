const STYLES = {
  live: 'bg-red-500/15 text-red-400 border-red-500/40',
  upcoming: 'bg-brand/15 text-violet-300 border-brand/40',
  completed: 'bg-white/5 text-muted border-line',
}
const LABELS = { live: 'Live', upcoming: 'Upcoming', completed: 'Completed' }

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${STYLES[status] ?? STYLES.completed}`}>
      {status === 'live' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" aria-hidden="true" />}
      {LABELS[status] ?? status}
    </span>
  )
}
