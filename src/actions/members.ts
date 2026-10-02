'use server'

import { parseForm, runAction } from '@/lib/action'
import { refreshApp } from '@/lib/revalidate'
import { requireLeader } from '@/lib/session'
import { memberIdSchema, memberSchema } from '@/lib/validations/member'
import { toggleActiveSchema } from '@/lib/validations/toggle'
import { createMember, setMemberActive, updateMember } from '@/server/members'
import type { ActionState } from '@/lib/action-state'

export async function createMemberAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireLeader()
  return runAction(async () => {
    await createMember(actor, parseForm(memberSchema, formData))
    refreshApp()
    return 'Membro adicionado.'
  })
}

export async function updateMemberAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireLeader()
  return runAction(async () => {
    const { id } = parseForm(memberIdSchema, formData)
    await updateMember(actor, id, parseForm(memberSchema, formData))
    refreshApp()
    return 'Membro atualizado.'
  })
}

export async function setMemberActiveAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireLeader()
  return runAction(async () => {
    const { id, active } = parseForm(toggleActiveSchema, formData)
    await setMemberActive(actor, id, active)
    refreshApp()
    return active ? 'Membro reativado.' : 'Membro removido da lista.'
  })
}
