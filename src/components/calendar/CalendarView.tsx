import { CalendarAgenda } from '@/components/calendar/CalendarAgenda'
import { CalendarFilters } from '@/components/calendar/CalendarFilters'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { CalendarLegend } from '@/components/calendar/CalendarLegend'
import { CalendarToolbar } from '@/components/calendar/CalendarToolbar'
import { buildQuery } from '@/lib/searchParams'

import type { CalendarViewData } from '@/server/calendarView'
import type { CalendarItem } from '@/types/calendar'

interface CalendarViewProps {
  view: CalendarViewData
  basePath: string
  canEdit: (item: CalendarItem) => boolean
  entities?: { id: string; name: string; acronym: string | null }[]
}

export function CalendarView({ view, basePath, canEdit, entities }: CalendarViewProps) {
  const { monthKey, grid, filters, itemsByDay, selectedDay } = view

  function hrefFor(params: { m?: string; d?: string }) {
    return `${basePath}${buildQuery({
      m: params.m ?? monthKey,
      d: params.d,
      entidade: filters.entity || undefined,
      tipo: filters.type === 'all' ? undefined : filters.type,
      status: filters.status === 'active' ? undefined : filters.status,
    })}`
  }

  return (
    <div className="space-y-5">
      {entities ? <CalendarFilters monthKey={monthKey} entities={entities} values={filters} resetHref={basePath} /> : null}
      <CalendarToolbar monthKey={monthKey} hrefForMonth={(month) => hrefFor({ m: month })} />
      <CalendarLegend showsOwnership={!entities} />
      <CalendarGrid grid={grid} itemsByDay={itemsByDay} selectedDay={selectedDay} hrefFor={(day) => hrefFor({ d: day })} />
      <CalendarAgenda dayKey={selectedDay} items={itemsByDay.get(selectedDay) ?? []} canEdit={canEdit} />
    </div>
  )
}
