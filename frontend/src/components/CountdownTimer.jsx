import { useCountdown } from '../hooks/useCountdown'

export default function CountdownTimer({ target, compact = false }) {
  const { done, d, h, m, s } = useCountdown(target)
  if (done) return <span className="font-bold text-mint">Starting now</span>
  const parts = [['d', d], ['h', h], ['m', m], ['s', s]]
  return (
    <div className="flex gap-1.5" role="timer" aria-label={`Starts in ${d} days ${h} hours ${m} minutes`}>
      {parts.map(([label, value]) => (
        <div key={label} className={`rounded-lg bg-black/30 text-center ${compact ? 'min-w-9 px-1.5 py-1' : 'min-w-12 px-2 py-1.5'}`}>
          <div className={`font-mono font-bold tabular-nums text-white ${compact ? 'text-sm' : 'text-lg'}`}>{String(value).padStart(2, '0')}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
        </div>
      ))}
    </div>
  )
}
