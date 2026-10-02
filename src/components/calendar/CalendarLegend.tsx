import { cn } from '@/lib/utils'

const ENTRIES = [
  { label: 'Evento', swatch: 'bg-event' },
  { label: 'Reserva aprovada', swatch: 'bg-ok' },
  { label: 'Reserva aguardando', swatch: 'bg-brand' },
]

export function CalendarLegend({ showsOwnership }: { showsOwnership: boolean }) {
  return (
    <ul aria-label="Legenda" className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-soft">
      {ENTRIES.map((entry) => (
        <li key={entry.label} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={cn('size-3 rounded-sm', entry.swatch)} />
          {entry.label}
        </li>
      ))}
      {showsOwnership ? <li className="text-ink-muted">Cor cheia: da sua entidade. Cor suave: das demais.</li> : null}
    </ul>
  )
}
