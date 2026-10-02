import 'dotenv/config'
import { config as loadEnvLocal } from 'dotenv'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

import { PrismaClient } from '../src/generated/prisma/client'
import { addDaysToKey, parseLocalDateTime, todayKey } from '../src/lib/datetime'

loadEnvLocal({ path: '.env.local', override: true })

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Variável de ambiente ausente: ${name} (veja .env.example)`)
  return value
}

const pool = new Pool({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

function at(daysAhead: number, time: string): Date {
  const date = parseLocalDateTime(addDaysToKey(todayKey(), daysAhead), time)
  if (!date) throw new Error(`Data inválida no seed: +${daysAhead}d ${time}`)
  return date
}

// Espaços divulgados pelo Ágora. São só dados: nenhuma regra de negócio depende dos nomes.
const ROOMS = [
  { name: 'Escadaria - UNI', building: 'UNI' },
  { name: 'Rooftop completo - UNI', building: 'UNI' },
  { name: 'Rooftop 1 - UNI', building: 'UNI' },
  { name: 'Rooftop 2 - UNI', building: 'UNI' },
  { name: 'Sala de Metodologia completa - UNI', building: 'UNI' },
  { name: 'Sala de Metodologia 1 - UNI', building: 'UNI' },
  { name: 'Sala de Metodologia 2 - UNI', building: 'UNI' },
  { name: 'Auditório - HUB', building: 'HUB' },
  { name: 'Sala de Treinamento - HUB', building: 'HUB' },
  { name: 'Square - HUB', building: 'HUB' },
  { name: 'Stand Square', building: 'HUB' },
]

const ENTITIES = [
  {
    key: 'LEADER1',
    name: 'Centro Acadêmico de Sistemas de Informação',
    acronym: 'CASI',
    institution: 'Instituição de demonstração A',
    leaderName: 'Líder Demonstração CASI',
    members: [
      { name: 'Ana Souza', course: 'Sistemas de Informação', semester: 5 },
      { name: 'Bruno Lima', course: 'Engenharia de Software', semester: 3 },
      { name: 'Carla Mendes', course: 'Administração', semester: 7 },
    ],
  },
  {
    key: 'LEADER2',
    name: 'Empresa Júnior de Engenharia',
    acronym: 'EJ Engenharia',
    institution: 'Instituição de demonstração B',
    leaderName: 'Líder Demonstração EJ',
    members: [
      { name: 'Diego Ramos', course: 'Engenharia Mecânica', semester: 6 },
      { name: 'Elisa Prado', course: 'Engenharia Mecânica', semester: 4 },
    ],
  },
]

async function main() {
  const adminHash = await bcrypt.hash(requireEnv('ADMIN_PASSWORD'), 10)
  const admin = await prisma.user.upsert({
    where: { email: requireEnv('ADMIN_EMAIL').toLowerCase() },
    update: { passwordHash: adminHash, active: true },
    create: {
      name: process.env.ADMIN_NAME ?? 'Administrador Ágora',
      email: requireEnv('ADMIN_EMAIL').toLowerCase(),
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  })

  for (const room of ROOMS) {
    const existing = await prisma.room.findFirst({ where: { name: room.name }, select: { id: true } })
    if (!existing) await prisma.room.create({ data: room })
  }
  const rooms = new Map((await prisma.room.findMany({ select: { id: true, name: true } })).map((room) => [room.name, room.id]))
  const roomId = (name: string) => {
    const id = rooms.get(name)
    if (!id) throw new Error(`Sala do seed não encontrada: ${name}`)
    return id
  }

  const created: { entityId: string; leaderId: string; acronym: string }[] = []

  for (const item of ENTITIES) {
    const email = requireEnv(`${item.key}_EMAIL`).toLowerCase()
    const passwordHash = await bcrypt.hash(requireEnv(`${item.key}_PASSWORD`), 10)

    const entity =
      (await prisma.entity.findFirst({ where: { name: item.name } })) ??
      (await prisma.entity.create({
        data: { name: item.name, acronym: item.acronym, institution: item.institution, description: 'Entidade de demonstração criada pelo seed.' },
      }))

    const leader = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, active: true },
      create: { name: item.leaderName, email, passwordHash, role: 'LEADER', entityId: entity.id },
    })

    if ((await prisma.member.count({ where: { entityId: entity.id } })) === 0) {
      await prisma.member.createMany({ data: item.members.map((member) => ({ ...member, entityId: entity.id })) })
    }
    created.push({ entityId: entity.id, leaderId: leader.id, acronym: item.acronym })
  }

  const [first, second] = created
  if ((await prisma.calendarEvent.count()) === 0) {
    await prisma.calendarEvent.createMany({
      data: [
        { entityId: first.entityId, createdById: first.leaderId, title: 'Recepção dos calouros', description: 'Apresentação da entidade e do Ágora UNI.', location: 'Escadaria - UNI', startAt: at(2, '18:30'), endAt: at(2, '20:30') },
        { entityId: first.entityId, createdById: first.leaderId, title: 'Hackathon interno', startAt: at(9, '09:00'), endAt: at(9, '17:00') },
        { entityId: second.entityId, createdById: second.leaderId, title: 'Palestra de mercado', location: 'Auditório - HUB', startAt: at(4, '19:00'), endAt: at(4, '21:00') },
      ],
    })
  }

  if ((await prisma.reservation.count()) === 0) {
    const base = { reviewedById: admin.id, reviewedAt: new Date() }
    await prisma.reservation.createMany({
      data: [
        { entityId: first.entityId, requesterId: first.leaderId, roomId: roomId('Rooftop 1 - UNI'), title: 'Reunião de planejamento', purpose: 'Planejar as atividades do semestre com 15 pessoas.', startAt: at(1, '14:00'), endAt: at(1, '16:00'), status: 'APPROVED', ...base },
        { entityId: first.entityId, requesterId: first.leaderId, roomId: roomId('Sala de Metodologia 1 - UNI'), title: 'Oficina de metodologias ágeis', purpose: 'Oficina para os membros, 20 pessoas.', startAt: at(3, '09:00'), endAt: at(3, '11:00'), status: 'PENDING' },
        { entityId: first.entityId, requesterId: first.leaderId, roomId: roomId('Auditório - HUB'), title: 'Palestra aberta', purpose: 'Palestra para 80 pessoas.', startAt: at(5, '19:00'), endAt: at(5, '21:00'), status: 'REJECTED', rejectionReason: 'Auditório já reservado para evento do Ágora nessa data. Sugerimos a Escadaria - UNI.', ...base },
        { entityId: first.entityId, requesterId: first.leaderId, roomId: roomId('Escadaria - UNI'), title: 'Confraternização', purpose: 'Encontro de integração.', startAt: at(6, '18:00'), endAt: at(6, '20:00'), status: 'CANCELLED' },
        { entityId: second.entityId, requesterId: second.leaderId, roomId: roomId('Rooftop completo - UNI'), title: 'Assembleia da empresa júnior', purpose: 'Assembleia geral com 30 pessoas.', startAt: at(2, '19:00'), endAt: at(2, '21:00'), status: 'APPROVED', ...base },
        { entityId: second.entityId, requesterId: second.leaderId, roomId: roomId('Rooftop 1 - UNI'), title: 'Treinamento de novos membros', purpose: 'Treinamento para 12 pessoas.', startAt: at(1, '16:00'), endAt: at(1, '17:30'), status: 'PENDING' },
      ],
    })
  }

  console.info(`Seed concluído: 1 admin, ${created.length} entidades, ${ROOMS.length} salas.`)
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Falha no seed.')
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
