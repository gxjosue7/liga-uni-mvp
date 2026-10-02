import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Role } from '@/generated/prisma/enums'

export interface Actor {
  id: string
  name: string
  email: string
  role: Role
  entityId: string | null
  entityName: string | null
}

export interface LeaderActor extends Actor {
  role: 'LEADER'
  entityId: string
}

export function homeFor(role: Role): string {
  return role === 'ADMIN' ? '/admin/dashboard' : '/lider/dashboard'
}

// A sessão (JWT) só diz quem o usuário era no login. Aqui reconsultamos o banco
// para que desativar um usuário/entidade ou trocar o vínculo valha na hora.
export const getActor = cache(async (): Promise<Actor | null> => {
  const session = await auth()
  const id = session?.user?.id
  if (!id) return null

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      entityId: true,
      active: true,
      entity: { select: { active: true, name: true, acronym: true } },
    },
  })

  if (!user || !user.active) return null
  if (user.role === 'LEADER' && (!user.entityId || !user.entity?.active)) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    entityId: user.entityId,
    entityName: user.entity ? (user.entity.acronym ?? user.entity.name) : null,
  }
})

export async function requireActor(): Promise<Actor> {
  const actor = await getActor()
  if (!actor) redirect('/login')
  return actor
}

export async function requireAdmin(): Promise<Actor> {
  const actor = await requireActor()
  if (actor.role !== 'ADMIN') redirect(homeFor(actor.role))
  return actor
}

export async function requireLeader(): Promise<LeaderActor> {
  const actor = await requireActor()
  if (actor.role !== 'LEADER' || !actor.entityId) redirect(homeFor(actor.role))
  return { ...actor, role: 'LEADER', entityId: actor.entityId }
}
