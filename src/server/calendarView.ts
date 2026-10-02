import 'server-only'

import { buildMonthGrid, groupItemsByDay, parseMonthKey } from '@/lib/calendar'
import { dayKeysBetween, isDateKey, todayKey } from '@/lib/datetime'
import { firstParam, oneOf, type SearchParams } from '@/lib/searchParams'
import { getCalendarItems, type CalendarStatusFilter, type CalendarTypeFilter } from '@/server/calendar'

import type { Actor } from '@/lib/session'

const TYPES = ['all', 'events', 'reservations'] as const
const STATUSES = ['active', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const

export interface CalendarFilterValues {
  entity: string
  type: CalendarTypeFilter
  status: CalendarStatusFilter
}

// Lê só o que a URL pediu e consulta apenas o intervalo visível do mês.
// Filtros por entidade/status só valem para o admin; o líder sempre vê o
// calendário geral com o escopo fixado em src/server/calendar.ts.
export async function loadCalendarView(actor: Actor, params: SearchParams) {
  const monthKey = parseMonthKey(firstParam(params.m))
  const grid = buildMonthGrid(monthKey)

  const filters: CalendarFilterValues =
    actor.role === 'ADMIN'
      ? {
          entity: firstParam(params.entidade) ?? '',
          type: oneOf(firstParam(params.tipo), TYPES, 'all'),
          status: oneOf(firstParam(params.status), STATUSES, 'active'),
        }
      : { entity: '', type: 'all', status: 'active' }

  const items = await getCalendarItems(actor, {
    from: grid.from,
    to: grid.to,
    entityId: filters.entity || undefined,
    type: filters.type,
    status: filters.status,
  })

  const itemsByDay = groupItemsByDay(items, (item) => dayKeysBetween(new Date(item.startAt), new Date(item.endAt)))

  const requestedDay = firstParam(params.d)
  const today = todayKey()
  const selectedDay =
    requestedDay && isDateKey(requestedDay) && requestedDay.startsWith(monthKey)
      ? requestedDay
      : today.startsWith(monthKey)
        ? today
        : `${monthKey}-01`

  return { monthKey, grid, filters, itemsByDay, selectedDay }
}

export type CalendarViewData = Awaited<ReturnType<typeof loadCalendarView>>
