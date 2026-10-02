'use server'

import { parseForm, runAction } from '@/lib/action'
import { refreshApp } from '@/lib/revalidate'
import { requireActor, requireLeader } from '@/lib/session'
import { eventIdSchema, eventSchema } from '@/lib/validations/event'
import { createEvent, deleteEvent, updateEvent } from '@/server/events'
import type { ActionState } from '@/lib/action-state'

export async function createEventAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireLeader()
  return runAction(async () => {
    await createEvent(actor, parseForm(eventSchema, formData))
    refreshApp()
    return 'Evento criado.'
  })
}

// Admin e líder usam a mesma ação; o escopo (qualquer evento x só os da
// própria entidade) é decidido em src/server/events.ts a partir do ator.
export async function updateEventAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireActor()
  return runAction(async () => {
    const { id } = parseForm(eventIdSchema, formData)
    await updateEvent(actor, id, parseForm(eventSchema, formData))
    refreshApp()
    return 'Evento atualizado.'
  })
}

export async function deleteEventAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireActor()
  return runAction(async () => {
    const { id } = parseForm(eventIdSchema, formData)
    await deleteEvent(actor, id)
    refreshApp()
    return 'Evento excluído.'
  })
}
