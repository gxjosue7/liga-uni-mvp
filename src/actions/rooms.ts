'use server'

import { parseForm, runAction } from '@/lib/action'
import { refreshApp } from '@/lib/revalidate'
import { requireAdmin } from '@/lib/session'
import { createRoomSchema, updateRoomSchema } from '@/lib/validations/room'
import { toggleActiveSchema } from '@/lib/validations/toggle'
import { createRoom, setRoomActive, updateRoom } from '@/server/rooms'
import type { ActionState } from '@/lib/action-state'

export async function createRoomAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()
  return runAction(async () => {
    await createRoom(parseForm(createRoomSchema, formData))
    refreshApp()
    return 'Sala criada.'
  })
}

export async function updateRoomAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()
  return runAction(async () => {
    const { id, ...input } = parseForm(updateRoomSchema, formData)
    await updateRoom(id, input)
    refreshApp()
    return 'Sala atualizada.'
  })
}

export async function setRoomActiveAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()
  return runAction(async () => {
    const { id, active } = parseForm(toggleActiveSchema, formData)
    await setRoomActive(id, active)
    refreshApp()
    return active ? 'Sala reativada.' : 'Sala desativada.'
  })
}
