import 'server-only'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors'
import type { CreateEntityInput, UpdateEntityInput } from '@/lib/validations/entity'
import type { Prisma } from '@/generated/prisma/client'

const EMAIL_TAKEN = 'Já existe um usuário com este e-mail.'

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 'P2002'
}

export async function listEntities() {
  return prisma.entity.findMany({
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      acronym: true,
      institution: true,
      description: true,
      active: true,
      leader: { select: { name: true, email: true } },
      _count: { select: { members: { where: { active: true } }, events: true, reservations: true } },
    },
  })
}

export async function listEntityOptions() {
  return prisma.entity.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, acronym: true },
  })
}

export async function createEntity(input: CreateEntityInput) {
  const passwordHash = await bcrypt.hash(input.leaderPassword, 10)
  try {
    await prisma.entity.create({
      data: {
        name: input.name,
        acronym: input.acronym ?? null,
        institution: input.institution,
        description: input.description ?? null,
        leader: {
          create: {
            name: input.leaderName,
            email: input.leaderEmail,
            passwordHash,
            role: 'LEADER',
          },
        },
      },
    })
  } catch (error) {
    if (isUniqueViolation(error)) throw new AppError('CONFLICT', EMAIL_TAKEN)
    throw error
  }
}

export async function updateEntity(input: UpdateEntityInput) {
  const entity = await prisma.entity.findUnique({
    where: { id: input.id },
    select: { id: true, leader: { select: { id: true } } },
  })
  if (!entity) throw new AppError('NOT_FOUND', 'Entidade não encontrada.')

  const leaderData: Prisma.UserUpdateInput = {
    name: input.leaderName,
    email: input.leaderEmail,
    ...(input.leaderPassword ? { passwordHash: await bcrypt.hash(input.leaderPassword, 10) } : {}),
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.entity.update({
        where: { id: entity.id },
        data: {
          name: input.name,
          acronym: input.acronym ?? null,
          institution: input.institution,
          description: input.description ?? null,
        },
      })
      if (entity.leader) {
        await tx.user.update({ where: { id: entity.leader.id }, data: leaderData })
        return
      }
      if (!input.leaderPassword) {
        throw new AppError('INVALID', 'Informe uma senha para criar o líder desta entidade.')
      }
      await tx.user.create({
        data: {
          name: input.leaderName,
          email: input.leaderEmail,
          passwordHash: await bcrypt.hash(input.leaderPassword, 10),
          role: 'LEADER',
          entityId: entity.id,
        },
      })
    })
  } catch (error) {
    if (isUniqueViolation(error)) throw new AppError('CONFLICT', EMAIL_TAKEN)
    throw error
  }
}

export async function setEntityActive(id: string, active: boolean) {
  const result = await prisma.entity.updateMany({ where: { id }, data: { active } })
  if (result.count === 0) throw new AppError('NOT_FOUND', 'Entidade não encontrada.')
}

export async function updateOwnEntityDescription(entityId: string, description: string | undefined) {
  await prisma.entity.update({ where: { id: entityId }, data: { description: description ?? null } })
}
