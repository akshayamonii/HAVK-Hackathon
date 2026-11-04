import { CheckCircle2, Info, TriangleAlert, XCircle, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const STYLE = {
  success: ['border-mint/50', CheckCircle2, 'text-mint'],
  info: ['border-brand/50', Info, 'text-violet-300'],
  warning: ['border-amber-400/50', TriangleAlert, 'text-amber-300'],
  error: ['border-red-500/50', XCircle, 'text-red-400'],
}

export default function ToastNotification() {
  const { toasts, dismiss } = useApp()
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => {
        const [border, Icon, color] = STYLE[t.type] ?? STYLE.info
        return (
          <div key={t.id} role="status" className={`anim-rise pointer-events-auto flex items-start gap-3 rounded-xl border bg-card p-3.5 shadow-2xl ${border}`}>
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} aria-hidden="true" />
            <p className="flex-1 text-sm">{t.message}</p>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="text-muted hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        )
      })}
    </div>
  )
}
