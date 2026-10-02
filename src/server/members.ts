import 'server-only'

import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors'
import type { LeaderActor } from '@/lib/session'
import type { MemberInput } from '@/lib/validations/member'
import type { Prisma } from '@/generated/prisma/client'

import { PAGE_SIZE } from '@/server/pagination'

const memberSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  course: true,
  semester: true,
  active: true,
  createdAt: true,
  entity: { select: { id: true, name: true, acronym: true, institution: true } },
} satisfies Prisma.MemberSelect

export interface MemberFilters {
  entityId?: string
  active?: boolean
  search?: string
  page?: number
}

// Quem chama decide o escopo: o líder SEMPRE passa o entityId da própria sessão
// (nunca um valor do cliente); o admin pode filtrar livremente.
export async function listMembers(filters: MemberFilters) {
  const where: Prisma.MemberWhereInput = {
    ...(filters.entityId ? { entityId: filters.entityId } : {}),
    ...(filters.active === undefined ? {} : { active: filters.active }),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { course: { contains: filters.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
  const page = Math.max(1, filters.page ?? 1)

  const [items, total] = await Promise.all([
    prisma.member.findMany({
      where,
      select: memberSelect,
      orderBy: [{ name: 'asc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.member.count({ where }),
  ])
  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
}

function toData(input: MemberInput) {
  return {
    name: input.name,
    course: input.course,
    email: input.email ?? null,
    phone: input.phone ?? null,
    semester: input.semester ?? null,
  }
}

export async function createMember(actor: LeaderActor, input: MemberInput) {
  await prisma.member.create({ data: { ...toData(input), entityId: actor.entityId } })
}

export async function updateMember(actor: LeaderActor, id: string, input: MemberInput) {
  const result = await prisma.member.updateMany({
    where: { id, entityId: actor.entityId },
    data: toData(input),
  })
  if (result.count === 0) throw new AppError('NOT_FOUND', 'Membro não encontrado.')
}

export async function setMemberActive(actor: LeaderActor, id: string, active: boolean) {
  const result = await prisma.member.updateMany({
    where: { id, entityId: actor.entityId },
    data: { active },
  })
  if (result.count === 0) throw new AppError('NOT_FOUND', 'Membro não encontrado.')
}
