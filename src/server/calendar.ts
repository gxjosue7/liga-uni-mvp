import 'server-only'

import { prisma } from '@/lib/db'
import type { Actor } from '@/lib/session'
import type { CalendarItem } from '@/types/calendar'
import type { Prisma } from '@/generated/prisma/client'

export type CalendarTypeFilter = 'all' | 'events' | 'reservations'
export type CalendarStatusFilter = 'active' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface CalendarQuery {
  from: Date
  to: Date
  entityId?: string
  type: CalendarTypeFilter
  status: CalendarStatusFilter
}

const MAX_ITEMS = 400

function reservationScope(actor: Actor, status: CalendarStatusFilter): Prisma.ReservationWhereInput {
  if (actor.role === 'ADMIN') {
    return status === 'active' ? { status: { in: ['PENDING', 'APPROVED'] } } : { status }
  }
  // Líder: reservas aprovadas de qualquer entidade (ocupação das salas) e as
  // próprias pendentes. Pendentes/recusadas de outras entidades nunca aparecem.
  return {
    OR: [
      { status: 'APPROVED' },
      { status: 'PENDING', entityId: actor.entityId ?? '__none__' },
    ],
  }
}

// Só consulta o intervalo visível (from..to) e já filtra no banco.
export async function getCalendarItems(actor: Actor, query: CalendarQuery): Promise<CalendarItem[]> {
  const overlap = { startAt: { lt: query.to }, endAt: { gt: query.from } }
  const entityFilter = query.entityId ? { entityId: query.entityId } : {}

  const [events, reservations] = await Promise.all([
    query.type === 'reservations'
      ? []
      : prisma.calendarEvent.findMany({
          where: { ...overlap, ...entityFilter },
          orderBy: { startAt: 'asc' },
          take: MAX_ITEMS,
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            startAt: true,
            endAt: true,
            entity: { select: { id: true, name: true, acronym: true } },
          },
        }),
    query.type === 'events'
      ? []
      : prisma.reservation.findMany({
          where: { AND: [overlap, entityFilter, reservationScope(actor, query.status)] },
          orderBy: { startAt: 'asc' },
          take: MAX_ITEMS,
          select: {
            id: true,
            title: true,
            purpose: true,
            startAt: true,
            endAt: true,
            status: true,
            entity: { select: { id: true, name: true, acronym: true } },
            room: { select: { name: true } },
            requester: { select: { name: true } },
          },
        }),
  ])

  const items: CalendarItem[] = [
    ...events.map((event): CalendarItem => ({
      id: event.id,
      kind: 'event',
      title: event.title,
      description: event.description,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt.toISOString(),
      entityId: event.entity.id,
      entityName: event.entity.acronym ?? event.entity.name,
      place: event.location,
      status: null,
      mine: actor.entityId !== null && event.entity.id === actor.entityId,
      requester: null,
    })),
    ...reservations.map((reservation): CalendarItem => ({
      id: reservation.id,
      kind: 'reservation',
      title: reservation.title,
      description: actor.role === 'ADMIN' || reservation.entity.id === actor.entityId ? reservation.purpose : null,
      startAt: reservation.startAt.toISOString(),
      endAt: reservation.endAt.toISOString(),
      entityId: reservation.entity.id,
      entityName: reservation.entity.acronym ?? reservation.entity.name,
      place: reservation.room.name,
      status: reservation.status,
      mine: actor.entityId !== null && reservation.entity.id === actor.entityId,
      requester: actor.role === 'ADMIN' ? reservation.requester.name : null,
    })),
  ]

  return items.sort((a, b) => a.startAt.localeCompare(b.startAt))
}
