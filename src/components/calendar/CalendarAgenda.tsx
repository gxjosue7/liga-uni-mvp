import { CalendarDays, MapPin, UserRound } from 'lucide-react'

import { itemTone } from '@/components/calendar/itemStyle'
import { DeleteEventDialog, EventDialog } from '@/components/events/EventDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReservationStatus, StatusBadge } from '@/components/ui/StatusBadge'
import { dayLabel } from '@/lib/calendar'
import { formatTime } from '@/lib/datetime'
import { cn } from '@/lib/utils'

import type { CalendarItem } from '@/types/calendar'

interface CalendarAgendaProps {
  dayKey: string
  items: CalendarItem[]
  canEdit: (item: CalendarItem) => boolean
}

export function CalendarAgenda({ dayKey, items, canEdit }: CalendarAgendaProps) {
  return (
    <section aria-labelledby="agenda-title" className="rounded-lg border border-line bg-surface">
      <header className="border-b border-line px-4 py-3 md:px-5">
        <h2 id="agenda-title" className="display text-base capitalize">{dayLabel(dayKey)}</h2>
      </header>

      {items.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Nada marcado neste dia" description="Escolha outro dia no calendário ou cadastre um evento." />
      ) : (
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={`${item.kind}-${item.id}`} className="flex gap-3 px-4 py-4 md:px-5">
              <span aria-hidden="true" className={cn('w-1 shrink-0 rounded-sm', itemTone(item).bar)} />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatTime(new Date(item.startAt))}–{formatTime(new Date(item.endAt))}
                  </p>
                  {item.kind === 'reservation' && item.status ? (
                    <ReservationStatus status={item.status} />
                  ) : (
                    <StatusBadge tone="event">Evento</StatusBadge>
                  )}
                  {item.mine ? <StatusBadge tone="neutral">Sua entidade</StatusBadge> : null}
                </div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-ink-muted">{item.entityName}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                  {item.place ? (
                    <span className="flex items-center gap-1.5">
                      <MapPin aria-hidden="true" className="size-4 shrink-0" />
                      {item.place}
                    </span>
                  ) : null}
                  {item.requester ? (
                    <span className="flex items-center gap-1.5">
                      <UserRound aria-hidden="true" className="size-4 shrink-0" />
                      {item.requester}
                    </span>
                  ) : null}
                </div>
                {item.description ? <p className="max-w-prose text-sm text-ink-soft">{item.description}</p> : null}
              </div>
              {item.kind === 'event' && canEdit(item) ? (
                <div className="flex shrink-0 items-start">
                  <EventDialog event={item} />
                  <DeleteEventDialog event={item} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
