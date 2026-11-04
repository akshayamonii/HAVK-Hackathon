import { LayoutGrid } from 'lucide-react'
import { gameIcon } from '../data/games'

export default function GameCategoryFilter({ games, value, onChange }) {
  const items = [{ name: 'All', Icon: LayoutGrid }, ...games.map((g) => ({ name: g.name, Icon: gameIcon(g.name) }))]
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by game">
      {items.map(({ name, Icon }) => {
        const active = value === name
        return (
          <button key={name} onClick={() => onChange(name)} aria-pressed={active}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${active ? 'border-brand bg-brand text-white glow' : 'border-line bg-card text-muted hover:border-brand/60 hover:text-white'}`}>
            <Icon className="h-4 w-4" aria-hidden="true" /> {name}
          </button>
        )
      })}
    </div>
  )
}
