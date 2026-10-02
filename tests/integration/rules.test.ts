import bcrypt from 'bcryptjs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors'
import { addDaysToKey, parseLocalDateTime, todayKey } from '@/lib/datetime'
import { reservationSchema } from '@/lib/validations/reservation'
import { eventSchema } from '@/lib/validations/event'
import { createEntity, setEntityActive } from '@/server/entities'
import { createEvent, deleteEvent, updateEvent } from '@/server/events'
import { createMember, listMembers, setMemberActive, updateMember } from '@/server/members'
import {
  approveReservation,
  cancelReservation,
  createReservation,
  isOverlapViolation,
  listReservations,
  rejectReservation,
} from '@/server/reservations'
import { createRoom, listActiveRooms, setRoomActive } from '@/server/rooms'
import { getCalendarItems } from '@/server/calendar'
import type { Actor, LeaderActor } from '@/lib/session'

const PREFIX = `itest-${Date.now()}`
const FAR = 400 + (Date.now() % 200)

let admin: Actor
let leaderA: LeaderActor
let leaderB: LeaderActor
let entityA = ''
let entityB = ''
let roomId = ''

function slot(offsetDays: number, start: string, end: string) {
  const date = addDaysToKey(todayKey(), FAR + offsetDays)
  return { date, startTime: start, endTime: end }
}

function reservation(room: string, offsetDays: number, start: string, end: string, title = 'Atividade') {
  return reservationSchema.parse({ roomId: room, title, purpose: 'Teste de integração', ...slot(offsetDays, start, end) })
}

async function expectAppError(promise: Promise<unknown>, code: AppError['code']) {
  const error = await promise.then(
    () => null,
    (caught: unknown) => caught,
  )
  expect(error).toBeInstanceOf(AppError)
  expect((error as AppError).code).toBe(code)
}

async function makeLeader(entityId: string, name: string): Promise<LeaderActor> {
  const user = await prisma.user.findFirstOrThrow({ where: { entityId }, select: { id: true, email: true } })
  return { id: user.id, name, email: user.email, role: 'LEADER', entityId, entityName: name }
}

beforeAll(async () => {
  const adminUser = await prisma.user.create({
    data: { name: `${PREFIX} admin`, email: `${PREFIX}-admin@itest.invalid`, passwordHash: await bcrypt.hash('x'.repeat(12), 4), role: 'ADMIN' },
  })
  admin = { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: 'ADMIN', entityId: null, entityName: null }

  for (const key of ['A', 'B']) {
    await createEntity({
      name: `${PREFIX} Entidade ${key}`,
      acronym: `${PREFIX}-${key}`,
      institution: 'Teste',
      description: undefined,
      leaderName: `${PREFIX} Líder ${key}`,
      leaderEmail: `${PREFIX}-lider-${key.toLowerCase()}@itest.invalid`,
      leaderPassword: 'senha-de-teste-123',
    })
  }
  entityA = (await prisma.entity.findFirstOrThrow({ where: { name: `${PREFIX} Entidade A` } })).id
  entityB = (await prisma.entity.findFirstOrThrow({ where: { name: `${PREFIX} Entidade B` } })).id
  leaderA = await makeLeader(entityA, `${PREFIX} Líder A`)
  leaderB = await makeLeader(entityB, `${PREFIX} Líder B`)

  await createRoom({ name: `${PREFIX} Sala 1`, building: 'Teste', capacity: undefined, description: undefined })
  roomId = (await prisma.room.findFirstOrThrow({ where: { name: `${PREFIX} Sala 1` } })).id
})

afterAll(async () => {
  const entities = { entity: { name: { startsWith: PREFIX } } }
  await prisma.reservation.deleteMany({ where: entities })
  await prisma.calendarEvent.deleteMany({ where: entities })
  await prisma.member.deleteMany({ where: entities })
  await prisma.room.deleteMany({ where: { name: { startsWith: PREFIX } } })
  await prisma.user.deleteMany({ where: { OR: [{ email: { startsWith: PREFIX } }, { name: { startsWith: PREFIX } }] } })
  await prisma.entity.deleteMany({ where: { name: { startsWith: PREFIX } } })
  await prisma.$disconnect()
})

describe('Cenário 1: admin cria entidade + líder', () => {
  it('cria o líder LEADER vinculado à entidade, com senha só em hash bcrypt', async () => {
    const leader = await prisma.user.findFirstOrThrow({ where: { entityId: entityA } })
    expect(leader.role).toBe('LEADER')
    expect(leader.active).toBe(true)
    expect(leader.passwordHash).not.toContain('senha-de-teste')
    expect(await bcrypt.compare('senha-de-teste-123', leader.passwordHash)).toBe(true)
  })

  it('recusa e-mail de líder repetido com mensagem amigável', async () => {
    await expectAppError(
      createEntity({
        name: `${PREFIX} Duplicada`,
        acronym: undefined,
        institution: 'Teste',
        description: undefined,
        leaderName: 'Outro',
        leaderEmail: `${PREFIX}-lider-a@itest.invalid`,
        leaderPassword: 'senha-de-teste-123',
      }),
      'CONFLICT',
    )
    expect(await prisma.entity.count({ where: { name: `${PREFIX} Duplicada` } })).toBe(0)
  })
})

describe('Cenários 2 e 10: membros e isolamento entre entidades', () => {
  it('líder cadastra 3 membros com curso e eles aparecem na lista da própria entidade', async () => {
    for (const [name, course] of [['Ana', 'Sistemas de Informação'], ['Bruno', 'Engenharia de Software'], ['Carla', 'Administração']]) {
      await createMember(leaderA, { name: `${PREFIX} ${name}`, course, email: undefined, phone: undefined, semester: undefined })
    }
    const result = await listMembers({ entityId: leaderA.entityId, active: true })
    expect(result.total).toBe(3)
    expect(result.items.map((member) => member.course).sort()).toEqual(['Administração', 'Engenharia de Software', 'Sistemas de Informação'])
  })

  it('a outra entidade não vê esses membros', async () => {
    expect((await listMembers({ entityId: leaderB.entityId, active: true })).total).toBe(0)
  })

  it('líder B não consegue editar nem remover membro da entidade A', async () => {
    const target = (await listMembers({ entityId: entityA })).items[0]
    await expectAppError(updateMember(leaderB, target.id, { name: 'Invasor', course: 'X', email: undefined, phone: undefined, semester: undefined }), 'NOT_FOUND')
    await expectAppError(setMemberActive(leaderB, target.id, false), 'NOT_FOUND')
    const after = await prisma.member.findUniqueOrThrow({ where: { id: target.id } })
    expect(after.name).not.toBe('Invasor')
    expect(after.active).toBe(true)
  })

  it('remover = desativar; reativar volta o membro', async () => {
    const target = (await listMembers({ entityId: entityA })).items[0]
    await setMemberActive(leaderA, target.id, false)
    expect((await listMembers({ entityId: entityA, active: true })).total).toBe(2)
    expect((await listMembers({ entityId: entityA, active: false })).total).toBe(1)
    await setMemberActive(leaderA, target.id, true)
    expect((await listMembers({ entityId: entityA, active: true })).total).toBe(3)
  })
})

describe('Cenário 3: eventos no calendário geral', () => {
  const range = () => ({
    from: parseLocalDateTime(addDaysToKey(todayKey(), FAR + 9), '00:00') as Date,
    to: parseLocalDateTime(addDaysToKey(todayKey(), FAR + 13), '00:00') as Date,
    type: 'all' as const,
    status: 'active' as const,
  })
  let eventId = ''

  it('evento do líder A aparece para o líder B (suave), para o próprio A (cheio) e para o admin', async () => {
    const day = addDaysToKey(todayKey(), FAR + 10)
    await createEvent(leaderA, eventSchema.parse({ title: `${PREFIX} Evento`, startDate: day, startTime: '10:00', endDate: day, endTime: '12:00' }))
    const created = await prisma.calendarEvent.findFirstOrThrow({ where: { title: `${PREFIX} Evento` } })
    eventId = created.id
    expect(created.entityId).toBe(entityA)
    expect(created.createdById).toBe(leaderA.id)

    const asB = (await getCalendarItems(leaderB, range())).find((item) => item.id === eventId)
    const asA = (await getCalendarItems(leaderA, range())).find((item) => item.id === eventId)
    const asAdmin = (await getCalendarItems(admin, range())).find((item) => item.id === eventId)
    expect(asB?.mine).toBe(false)
    expect(asA?.mine).toBe(true)
    expect(asAdmin).toBeTruthy()
  })

  it('admin filtra por entidade e por tipo', async () => {
    const onlyB = await getCalendarItems(admin, { ...range(), entityId: entityB })
    expect(onlyB.find((item) => item.id === eventId)).toBeUndefined()
    const onlyReservations = await getCalendarItems(admin, { ...range(), type: 'reservations' })
    expect(onlyReservations.find((item) => item.id === eventId)).toBeUndefined()
  })

  it('líder B não edita nem exclui evento da A; admin pode', async () => {
    const input = eventSchema.parse({ title: 'Hack', startDate: addDaysToKey(todayKey(), FAR + 10), startTime: '10:00', endDate: addDaysToKey(todayKey(), FAR + 10), endTime: '11:00' })
    await expectAppError(updateEvent(leaderB, eventId, input), 'NOT_FOUND')
    await expectAppError(deleteEvent(leaderB, eventId), 'NOT_FOUND')
    expect(await prisma.calendarEvent.count({ where: { id: eventId } })).toBe(1)
    await updateEvent(admin, eventId, input)
    expect((await prisma.calendarEvent.findUniqueOrThrow({ where: { id: eventId } })).title).toBe('Hack')
    await deleteEvent(admin, eventId)
    expect(await prisma.calendarEvent.count({ where: { id: eventId } })).toBe(0)
  })
})

describe('Cenários 4 a 7: reservas, aprovação, conflito e recusa', () => {
  let firstId = ''

  it('4: líder A solicita sala e a reserva fica PENDING (admin enxerga)', async () => {
    await createReservation(leaderA, reservation(roomId, 20, '14:00', '16:00', `${PREFIX} R1`))
    const created = await prisma.reservation.findFirstOrThrow({ where: { title: `${PREFIX} R1` } })
    firstId = created.id
    expect(created.status).toBe('PENDING')
    expect(created.entityId).toBe(entityA)
    expect(created.requesterId).toBe(leaderA.id)
    const queue = await listReservations({ status: 'PENDING', entityId: entityA })
    expect(queue.items.some((item) => item.id === firstId)).toBe(true)
  })

  it('6: outra entidade pedindo o mesmo horário é bloqueada (PENDING já ocupa a sala)', async () => {
    await expectAppError(createReservation(leaderB, reservation(roomId, 20, '15:00', '17:00')), 'CONFLICT')
    await expectAppError(createReservation(leaderB, reservation(roomId, 20, '13:00', '14:30')), 'CONFLICT')
    await expectAppError(createReservation(leaderB, reservation(roomId, 20, '14:30', '15:00')), 'CONFLICT')
  })

  it('horários colados (fim = início) não conflitam', async () => {
    await createReservation(leaderB, reservation(roomId, 20, '16:00', '17:00', `${PREFIX} R-colada`))
    await createReservation(leaderB, reservation(roomId, 20, '13:00', '14:00', `${PREFIX} R-colada2`))
  })

  it('5: admin aprova, vira APPROVED e aparece para outras entidades no calendário', async () => {
    await approveReservation(admin, firstId)
    expect((await prisma.reservation.findUniqueOrThrow({ where: { id: firstId } })).status).toBe('APPROVED')
    const range = {
      from: parseLocalDateTime(addDaysToKey(todayKey(), FAR + 19), '00:00') as Date,
      to: parseLocalDateTime(addDaysToKey(todayKey(), FAR + 22), '00:00') as Date,
      type: 'all' as const,
      status: 'active' as const,
    }
    expect((await getCalendarItems(leaderB, range)).some((item) => item.id === firstId)).toBe(true)
    await expectAppError(approveReservation(admin, firstId), 'NOT_FOUND')
    await expectAppError(createReservation(leaderB, reservation(roomId, 20, '14:00', '16:00')), 'CONFLICT')
  })

  it('o líder B não vê reservas PENDING da A no calendário, mas o admin vê', async () => {
    await createReservation(leaderA, reservation(roomId, 21, '09:00', '10:00', `${PREFIX} R-pendente-A`))
    const range = {
      from: parseLocalDateTime(addDaysToKey(todayKey(), FAR + 21), '00:00') as Date,
      to: parseLocalDateTime(addDaysToKey(todayKey(), FAR + 22), '00:00') as Date,
      type: 'all' as const,
      status: 'active' as const,
    }
    expect((await getCalendarItems(leaderB, range)).some((item) => item.title === `${PREFIX} R-pendente-A`)).toBe(false)
    expect((await getCalendarItems(leaderA, range)).some((item) => item.title === `${PREFIX} R-pendente-A`)).toBe(true)
    expect((await getCalendarItems(admin, range)).some((item) => item.title === `${PREFIX} R-pendente-A`)).toBe(true)
  })

  it('7: admin recusa com motivo, vira REJECTED, o líder vê o motivo e o horário é liberado', async () => {
    const pending = await prisma.reservation.findFirstOrThrow({ where: { title: `${PREFIX} R-pendente-A` } })
    await rejectReservation(admin, pending.id, 'Sala em manutenção')
    const rejected = (await listReservations({ entityId: entityA, status: 'REJECTED' })).items.find((item) => item.id === pending.id)
    expect(rejected?.status).toBe('REJECTED')
    expect(rejected?.rejectionReason).toBe('Sala em manutenção')
    await createReservation(leaderB, reservation(roomId, 21, '09:00', '10:00', `${PREFIX} R-reaproveita`))
  })

  it('cancelar: só o dono cancela e o horário é liberado', async () => {
    const target = await prisma.reservation.findFirstOrThrow({ where: { title: `${PREFIX} R-reaproveita` } })
    await expectAppError(cancelReservation(leaderA, target.id), 'NOT_FOUND')
    await cancelReservation(leaderB, target.id)
    expect((await prisma.reservation.findUniqueOrThrow({ where: { id: target.id } })).status).toBe('CANCELLED')
    await createReservation(leaderA, reservation(roomId, 21, '09:00', '10:00', `${PREFIX} R-depois-cancelar`))
  })

  it('recusa horário no passado', async () => {
    const yesterday = addDaysToKey(todayKey(), -1)
    const past = reservationSchema.parse({ roomId, title: 'x', purpose: 'y', date: yesterday, startTime: '10:00', endTime: '11:00' })
    await expectAppError(createReservation(leaderA, past), 'INVALID')
  })

  it('líder só lista as próprias reservas quando o escopo vem da sessão', async () => {
    const mine = await listReservations({ entityId: leaderB.entityId })
    expect(mine.items.every((item) => item.entity.name.startsWith(PREFIX))).toBe(true)
    expect(mine.items.some((item) => item.title === `${PREFIX} R1`)).toBe(false)
  })
})

describe('Constraint do banco e corrida entre duas requisições', () => {
  it('inserção direta sobreposta é barrada pelo Postgres e o erro é reconhecido', async () => {
    const base = { entityId: entityA, requesterId: leaderA.id, roomId, purpose: 'x', status: 'PENDING' as const }
    const day = addDaysToKey(todayKey(), FAR + 40)
    const at = (time: string) => parseLocalDateTime(day, time) as Date
    await prisma.reservation.create({ data: { ...base, title: `${PREFIX} direta-1`, startAt: at('10:00'), endAt: at('12:00') } })
    const error = await prisma.reservation
      .create({ data: { ...base, title: `${PREFIX} direta-2`, startAt: at('11:00'), endAt: at('13:00') } })
      .then(() => null, (caught: unknown) => caught)
    expect(error).not.toBeNull()
    expect(isOverlapViolation(error)).toBe(true)
  })

  it('REJECTED/CANCELLED não bloqueiam no banco', async () => {
    const day = addDaysToKey(todayKey(), FAR + 41)
    const at = (time: string) => parseLocalDateTime(day, time) as Date
    const base = { entityId: entityA, requesterId: leaderA.id, roomId, purpose: 'x' }
    await prisma.reservation.create({ data: { ...base, title: `${PREFIX} rej`, status: 'REJECTED', startAt: at('10:00'), endAt: at('12:00') } })
    await prisma.reservation.create({ data: { ...base, title: `${PREFIX} pend`, status: 'PENDING', startAt: at('10:00'), endAt: at('12:00') } })
  })

  it('duas requisições simultâneas ao mesmo horário: exatamente uma vence, a outra recebe CONFLICT', async () => {
    for (let round = 0; round < 6; round++) {
      await createRoom({ name: `${PREFIX} Sala corrida ${round}`, building: undefined, capacity: undefined, description: undefined })
      const room = await prisma.room.findFirstOrThrow({ where: { name: `${PREFIX} Sala corrida ${round}` } })
      const input = reservation(room.id, 50 + round, '10:00', '11:00', `${PREFIX} corrida-${round}`)
      const results = await Promise.allSettled([createReservation(leaderA, input), createReservation(leaderB, input)])
      const fulfilled = results.filter((result) => result.status === 'fulfilled')
      const rejected = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      expect(fulfilled).toHaveLength(1)
      expect(rejected).toHaveLength(1)
      expect(rejected[0].reason).toBeInstanceOf(AppError)
      expect((rejected[0].reason as AppError).code).toBe('CONFLICT')
      expect(await prisma.reservation.count({ where: { roomId: room.id, status: { in: ['PENDING', 'APPROVED'] } } })).toBe(1)
    }
  })
})

describe('Cenários 8 e 9: salas', () => {
  it('8: sala nova aparece para solicitação', async () => {
    await createRoom({ name: `${PREFIX} Sala nova`, building: undefined, capacity: 30, description: undefined })
    expect((await listActiveRooms()).some((room) => room.name === `${PREFIX} Sala nova`)).toBe(true)
  })

  it('9: sala desativada não recebe reserva, mas o histórico fica intacto', async () => {
    const before = await prisma.reservation.count({ where: { roomId } })
    expect(before).toBeGreaterThan(0)
    await setRoomActive(roomId, false)
    expect((await listActiveRooms()).some((room) => room.id === roomId)).toBe(false)
    await expectAppError(createReservation(leaderA, reservation(roomId, 70, '10:00', '11:00')), 'NOT_FOUND')
    expect(await prisma.reservation.count({ where: { roomId } })).toBe(before)
    await setRoomActive(roomId, true)
    expect((await listActiveRooms()).some((room) => room.id === roomId)).toBe(true)
  })

  it('sala com reservas não pode ser apagada pelo banco (sem hard delete acidental)', async () => {
    const error = await prisma.room.delete({ where: { id: roomId } }).then(() => null, (caught: unknown) => caught)
    expect(error).not.toBeNull()
  })
})

describe('Entidade desativada', () => {
  it('desativar e reativar a entidade muda só o flag (dados preservados)', async () => {
    await setEntityActive(entityB, false)
    expect((await prisma.entity.findUniqueOrThrow({ where: { id: entityB } })).active).toBe(false)
    expect(await prisma.reservation.count({ where: { entityId: entityB } })).toBeGreaterThan(0)
    await setEntityActive(entityB, true)
  })
})
