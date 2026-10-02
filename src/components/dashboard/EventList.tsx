import { CalendarDays } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { formatRange } from '@/lib/datetime'

import type { EventRowData } from '@/types/reservation'

interface EventListProps {
  events: EventRowData[]
  showEntity?: boolean
}

export function EventList({ events, showEntity }: EventListProps) {
  if (events.length === 0) {
    return <EmptyState icon={CalendarDays} title="Nenhum evento à vista" description="Eventos cadastrados pelas entidades aparecem aqui." />
  }

  return (
    <ul className="divide-y divide-line">
      {events.map((event) => (
        <li key={event.id} className="flex gap-3 px-4 py-3 md:px-5">
          <span aria-hidden="true" className="w-1 shrink-0 rounded-sm bg-event" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{event.title}</p>
            <p className="text-sm text-ink-muted">{formatRange(event.startAt, event.endAt)}</p>
            {showEntity || event.location ? (
              <p className="truncate text-sm text-ink-soft">
                {[showEntity ? (event.entity.acronym ?? event.entity.name) : null, event.location].filter(Boolean).join(' – ')}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}
