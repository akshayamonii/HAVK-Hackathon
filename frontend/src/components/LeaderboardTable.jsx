export default function LeaderboardTable({ rows, currentUser }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
          <tr>
            <th scope="col" className="px-5 py-3">Rank</th>
            <th scope="col" className="px-5 py-3">Player</th>
            <th scope="col" className="px-5 py-3 text-right">Points</th>
            <th scope="col" className="hidden px-5 py-3 text-right sm:table-cell">Correct</th>
            <th scope="col" className="hidden px-5 py-3 text-right sm:table-cell">Resolved</th>
            <th scope="col" className="px-5 py-3">Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const me = r.user_id === currentUser
            return (
              <tr key={r.user_id} className={`border-b border-line/60 last:border-0 ${me ? 'bg-brand/15' : 'hover:bg-white/[.03]'}`}>
                <td className="px-5 py-3.5 font-mono font-bold text-muted">#{i + 1}</td>
                <td className="px-5 py-3.5 font-bold">{r.username}{me && <span className="ml-2 rounded-full bg-mint px-2 py-0.5 text-[10px] font-black uppercase text-ink">You</span>}</td>
                <td className="px-5 py-3.5 text-right font-mono font-bold text-mint">{r.points}</td>
                <td className="hidden px-5 py-3.5 text-right sm:table-cell">{r.correct_picks}</td>
                <td className="hidden px-5 py-3.5 text-right sm:table-cell">{r.resolved_picks}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-black/40" aria-hidden="true"><div className="h-full bg-gradient-to-r from-brand to-mint" style={{ width: `${r.accuracy}%` }} /></div>
                    <span className="font-mono">{Math.round(r.accuracy)}%</span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
