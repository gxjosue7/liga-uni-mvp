import 'server-only'

import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors'
import type { RoomInput } from '@/lib/validations/room'

const roomSelect = {
  id: true,
  name: true,
  building: true,
  capacity: true,
  description: true,
  active: true,
} as const

export async function listRooms() {
  return prisma.room.findMany({
    orderBy: [{ active: 'desc' }, { building: 'asc' }, { name: 'asc' }],
    select: { ...roomSelect, _count: { select: { reservations: true } } },
  })
}

export async function listActiveRooms() {
  return prisma.room.findMany({
    where: { active: true },
    orderBy: [{ building: 'asc' }, { name: 'asc' }],
    select: roomSelect,
  })
}

export async function listRoomOptions() {
  return prisma.room.findMany({
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
    select: { id: true, name: true, active: true },
  })
}

function toData(input: RoomInput) {
  return {
    name: input.name,
    building: input.building ?? null,
    capacity: input.capacity ?? null,
    description: input.description ?? null,
  }
}

export async function createRoom(input: RoomInput) {
  await prisma.room.create({ data: toData(input) })
}

export async function updateRoom(id: string, input: RoomInput) {
  const result = await prisma.room.updateMany({ where: { id }, data: toData(input) })
  if (result.count === 0) throw new AppError('NOT_FOUND', 'Sala não encontrada.')
}

// "Remover" sala = desativar: o histórico de reservas continua intacto.
export async function setRoomActive(id: string, active: boolean) {
  const result = await prisma.room.updateMany({ where: { id }, data: { active } })
  if (result.count === 0) throw new AppError('NOT_FOUND', 'Sala não encontrada.')
}
