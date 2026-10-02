import 'server-only'

import { prisma } from '@/lib/db'
import type { LeaderActor } from '@/lib/session'

const upcomingEventSelect = {
  id: true,
  title: true,
  startAt: true,
  endAt: true,
  location: true,
  entity: { select: { name: true, acronym: true } },
} as const

const reservationRowSelect = {
  id: true,
  title: true,
  startAt: true,
  endAt: true,
  status: true,
  rejectionReason: true,
  entity: { select: { name: true, acronym: true } },
  room: { select: { name: true } },
  requester: { select: { name: true } },
} as const

export async function getAdminDashboard() {
  const now = new Date()
  const [entities, members, pending, rooms, pendingList, events, approved, perEntity] = await Promise.all([
    prisma.entity.count({ where: { active: true } }),
    prisma.member.count({ where: { active: true } }),
    prisma.reservation.count({ where: { status: 'PENDING' } }),
    prisma.room.count({ where: { active: true } }),
    prisma.reservation.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: reservationRowSelect,
    }),
    prisma.calendarEvent.findMany({
      where: { endAt: { gt: now } },
      orderBy: { startAt: 'asc' },
      take: 5,
      select: upcomingEventSelect,
    }),
    prisma.reservation.findMany({
      where: { status: 'APPROVED', endAt: { gt: now } },
      orderBy: { startAt: 'asc' },
      take: 5,
      select: reservationRowSelect,
    }),
    prisma.entity.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        acronym: true,
        institution: true,
        _count: {
          select: {
            members: { where: { active: true } },
            events: { where: { endAt: { gt: now } } },
            reservations: { where: { status: 'PENDING' } },
          },
        },
      },
    }),
  ])
  return { entities, members, pending, rooms, pendingList, events, approved, perEntity }
}

export async function getLeaderDashboard(actor: LeaderActor) {
  const now = new Date()
  const [entity, members, upcomingEventsCount, approvedCount, upcomingEvents, pending, approved, recent] = await Promise.all([
    prisma.entity.findUniqueOrThrow({
      where: { id: actor.entityId },
      select: { name: true, acronym: true, institution: true },
    }),
    prisma.member.count({ where: { entityId: actor.entityId, active: true } }),
    prisma.calendarEvent.count({ where: { entityId: actor.entityId, endAt: { gt: now } } }),
    prisma.reservation.count({ where: { entityId: actor.entityId, status: 'APPROVED', endAt: { gt: now } } }),
    prisma.calendarEvent.findMany({
      where: { entityId: actor.entityId, endAt: { gt: now } },
      orderBy: { startAt: 'asc' },
      take: 5,
      select: upcomingEventSelect,
    }),
    prisma.reservation.count({ where: { entityId: actor.entityId, status: 'PENDING' } }),
    prisma.reservation.findMany({
      where: { entityId: actor.entityId, status: 'APPROVED', endAt: { gt: now } },
      orderBy: { startAt: 'asc' },
      take: 5,
      select: reservationRowSelect,
    }),
    prisma.reservation.findMany({
      where: { entityId: actor.entityId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: reservationRowSelect,
    }),
  ])
  return { entity, members, upcomingEventsCount, approvedCount, upcomingEvents, pending, approved, recent }
}
