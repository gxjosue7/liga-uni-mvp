'use server'

import { parseForm, runAction } from '@/lib/action'
import { refreshApp } from '@/lib/revalidate'
import { requireAdmin, requireLeader } from '@/lib/session'
import { createEntitySchema, leaderEntitySchema, updateEntitySchema } from '@/lib/validations/entity'
import { toggleActiveSchema } from '@/lib/validations/toggle'
import { createEntity, setEntityActive, updateEntity, updateOwnEntityDescription } from '@/server/entities'
import type { ActionState } from '@/lib/action-state'

export async function createEntityAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()
  return runAction(async () => {
    await createEntity(parseForm(createEntitySchema, formData))
    refreshApp()
    return 'Entidade e líder criados.'
  })
}

export async function updateEntityAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()
  return runAction(async () => {
    await updateEntity(parseForm(updateEntitySchema, formData))
    refreshApp()
    return 'Entidade atualizada.'
  })
}

export async function setEntityActiveAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()
  return runAction(async () => {
    const { id, active } = parseForm(toggleActiveSchema, formData)
    await setEntityActive(id, active)
    refreshApp()
    return active ? 'Entidade reativada.' : 'Entidade desativada.'
  })
}

// A entidade vem da sessão do líder; o formulário só traz a descrição.
export async function updateOwnEntityAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireLeader()
  return runAction(async () => {
    const { description } = parseForm(leaderEntitySchema, formData)
    await updateOwnEntityDescription(actor.entityId, description)
    refreshApp()
    return 'Descrição atualizada.'
  })
}
