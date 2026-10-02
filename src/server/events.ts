import 'server-only'

import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors'
import type { Actor, LeaderActor } from '@/lib/session'
import type { EventInput } from '@/lib/validations/event'

function toData(input: EventInput) {
  return {
    title: input.title,
    description: input.description ?? null,
    location: input.location ?? null,
    startAt: input.startAt,
    endAt: input.endAt,
  }
}

// entityId e createdById vêm da sessão, nunca do formulário.
export async function createEvent(actor: LeaderActor, input: EventInput) {
  await prisma.calendarEvent.create({
    data: { ...toData(input), entityId: actor.entityId, createdById: actor.id },
  })
}

// Admin edita/remove qualquer evento; líder só os da própria entidade.
function ownership(actor: Actor, id: string) {
  if (actor.role === 'ADMIN') return { id }
  if (!actor.entityId) throw new AppError('FORBIDDEN', 'Acesso negado.')
  return { id, entityId: actor.entityId }
}

export async function updateEvent(actor: Actor, id: string, input: EventInput) {
  const result = await prisma.calendarEvent.updateMany({
    where: ownership(actor, id),
    data: toData(input),
  })
  if (result.count === 0) throw new AppError('NOT_FOUND', 'Evento não encontrado.')
}

export async function deleteEvent(actor: Actor, id: string) {
  const result = await prisma.calendarEvent.deleteMany({ where: ownership(actor, id) })
  if (result.count === 0) throw new AppError('NOT_FOUND', 'Evento não encontrado.')
}
