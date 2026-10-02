import 'server-only'

import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors'
import type { Actor, LeaderActor } from '@/lib/session'
import type { ReservationInput } from '@/lib/validations/reservation'
import type { Prisma } from '@/generated/prisma/client'

import { PAGE_SIZE } from '@/server/pagination'

// PENDING e APPROVED ocupam a sala; REJECTED e CANCELLED liberam o horário.
export const BLOCKING_STATUSES = ['PENDING', 'APPROVED'] as const

const CONFLICT_MESSAGE = 'Esta sala já está reservada (ou aguardando aprovação) nesse horário. Escolha outro horário ou sala.'

// A garantia real é a constraint reservation_no_overlap no Postgres
// (EXCLUDE USING gist). Este reconhecimento transforma a violação (corrida
// entre duas requisições) na mesma mensagem amigável da checagem prévia.
export function isOverlapViolation(error: unknown): boolean {
  const seen = new Set<unknown>()
  let current: unknown = error
  while (typeof current === 'object' && current !== null && !seen.has(current)) {
    seen.add(current)
    const haystack = [
      'message' in current ? String(current.message) : '',
      'code' in current ? String(current.code) : '',
      'meta' in current ? safeJson(current.meta) : '',
    ].join(' ')
    if (haystack.includes('reservation_no_overlap') || haystack.includes('23P01')) return true
    current = 'cause' in current ? current.cause : undefined
  }
  return false
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value) ?? ''
  } catch {
    return ''
  }
}

export async function findConflict(roomId: string, startAt: Date, endAt: Date) {
  return prisma.reservation.findFirst({
    where: {
      roomId,
      status: { in: [...BLOCKING_STATUSES] },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
    select: { id: true },
  })
}

export async function createReservation(actor: LeaderActor, input: ReservationInput) {
  if (input.startAt <= new Date()) {
    throw new AppError('INVALID', 'O horário inicial precisa estar no futuro.')
  }

  const room = await prisma.room.findFirst({
    where: { id: input.roomId, active: true },
    select: { id: true },
  })
  if (!room) throw new AppError('NOT_FOUND', 'Sala indisponível para reserva.')

  if (await findConflict(room.id, input.startAt, input.endAt)) {
    throw new AppError('CONFLICT', CONFLICT_MESSAGE)
  }

  try {
    await prisma.reservation.create({
      data: {
        entityId: actor.entityId,
        requesterId: actor.id,
        roomId: room.id,
        title: input.title,
        purpose: input.purpose,
        startAt: input.startAt,
        endAt: input.endAt,
        status: 'PENDING',
      },
    })
  } catch (error) {
    if (isOverlapViolation(error)) throw new AppError('CONFLICT', CONFLICT_MESSAGE)
    throw error
  }
}

export async function cancelReservation(actor: LeaderActor, id: string) {
  const result = await prisma.reservation.updateMany({
    where: { id, entityId: actor.entityId, status: { in: [...BLOCKING_STATUSES] } },
    data: { status: 'CANCELLED' },
  })
  if (result.count === 0) throw new AppError('NOT_FOUND', 'Solicitação não encontrada ou já finalizada.')
}

export async function approveReservation(admin: Actor, id: string) {
  const result = await prisma.reservation.updateMany({
    where: { id, status: 'PENDING' },
    data: { status: 'APPROVED', reviewedById: admin.id, reviewedAt: new Date(), rejectionReason: null },
  })
  if (result.count === 0) throw new AppError('NOT_FOUND', 'Solicitação não está mais pendente.')
}

export async function rejectReservation(admin: Actor, id: string, reason: string | undefined) {
  const result = await prisma.reservation.updateMany({
    where: { id, status: 'PENDING' },
    data: {
      status: 'REJECTED',
      reviewedById: admin.id,
      reviewedAt: new Date(),
      rejectionReason: reason ?? null,
    },
  })
  if (result.count === 0) throw new AppError('NOT_FOUND', 'Solicitação não está mais pendente.')
}

const reservationSelect = {
  id: true,
  title: true,
  purpose: true,
  startAt: true,
  endAt: true,
  status: true,
  rejectionReason: true,
  reviewedAt: true,
  createdAt: true,
  entity: { select: { id: true, name: true, acronym: true } },
  requester: { select: { name: true } },
  room: { select: { id: true, name: true, building: true } },
} satisfies Prisma.ReservationSelect

export interface ReservationFilters {
  entityId?: string
  status?: Prisma.ReservationWhereInput['status']
  roomId?: string
  from?: Date
  to?: Date
  page?: number
}

export async function listReservations(filters: ReservationFilters) {
  const where: Prisma.ReservationWhereInput = {
    ...(filters.entityId ? { entityId: filters.entityId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.roomId ? { roomId: filters.roomId } : {}),
    ...(filters.from ? { endAt: { gt: filters.from } } : {}),
    ...(filters.to ? { startAt: { lt: filters.to } } : {}),
  }
  const page = Math.max(1, filters.page ?? 1)

  const [items, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      select: reservationSelect,
      orderBy: [{ startAt: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.reservation.count({ where }),
  ])
  const now = new Date()
  return {
    items: items.map((item) => ({ ...item, isPast: item.endAt <= now })),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}
