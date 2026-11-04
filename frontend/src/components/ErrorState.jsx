import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-red-400" aria-hidden="true" />
      <h3 className="text-lg font-bold">Something went wrong</h3>
      <p className="text-sm text-muted">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-bold transition hover:bg-violet-500">
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  )
}
