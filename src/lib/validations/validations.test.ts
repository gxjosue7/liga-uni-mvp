import { describe, expect, it } from 'vitest'

import { createEntitySchema } from '@/lib/validations/entity'
import { eventSchema } from '@/lib/validations/event'
import { memberSchema } from '@/lib/validations/member'
import { reservationSchema } from '@/lib/validations/reservation'

const validReservation = {
  roomId: 'sala1',
  title: 'Reunião',
  purpose: 'Planejamento',
  date: '2026-10-05',
  startTime: '14:00',
  endTime: '16:00',
}

describe('reservationSchema', () => {
  it('aceita um intervalo válido e converte para instantes UTC', () => {
    const parsed = reservationSchema.parse(validReservation)
    expect(parsed.startAt.toISOString()).toBe('2026-10-05T17:00:00.000Z')
    expect(parsed.endAt.toISOString()).toBe('2026-10-05T19:00:00.000Z')
  })

  it('recusa fim antes ou igual ao início', () => {
    expect(reservationSchema.safeParse({ ...validReservation, endTime: '14:00' }).success).toBe(false)
    expect(reservationSchema.safeParse({ ...validReservation, endTime: '13:00' }).success).toBe(false)
  })

  it('exige sala, atividade e finalidade', () => {
    expect(reservationSchema.safeParse({ ...validReservation, roomId: '' }).success).toBe(false)
    expect(reservationSchema.safeParse({ ...validReservation, title: '  ' }).success).toBe(false)
    expect(reservationSchema.safeParse({ ...validReservation, purpose: '' }).success).toBe(false)
  })
})

describe('eventSchema', () => {
  it('aceita evento de vários dias e recusa fim anterior ao início', () => {
    const base = { title: 'Hackathon', startDate: '2026-10-05', startTime: '09:00', endDate: '2026-10-06', endTime: '17:00' }
    expect(eventSchema.safeParse(base).success).toBe(true)
    expect(eventSchema.safeParse({ ...base, endDate: '2026-10-04' }).success).toBe(false)
  })
})

describe('memberSchema', () => {
  it('exige o curso', () => {
    expect(memberSchema.safeParse({ name: 'Ana', course: '' }).success).toBe(false)
    expect(memberSchema.safeParse({ name: 'Ana', course: 'Sistemas de Informação' }).success).toBe(true)
  })

  it('trata campos opcionais vazios como ausentes', () => {
    const parsed = memberSchema.parse({ name: 'Ana', course: 'ADM', email: '', phone: '', semester: '' })
    expect(parsed.email).toBeUndefined()
    expect(parsed.semester).toBeUndefined()
  })

  it('recusa e-mail inválido', () => {
    expect(memberSchema.safeParse({ name: 'Ana', course: 'ADM', email: 'nao-e-email' }).success).toBe(false)
  })
})

describe('createEntitySchema', () => {
  it('exige senha do líder com pelo menos 8 caracteres e normaliza o e-mail', () => {
    const base = { name: 'CA', institution: 'Univ', leaderName: 'Fulano', leaderEmail: 'FULANO@Exemplo.com', leaderPassword: '12345678' }
    expect(createEntitySchema.parse(base).leaderEmail).toBe('fulano@exemplo.com')
    expect(createEntitySchema.safeParse({ ...base, leaderPassword: '1234567' }).success).toBe(false)
  })
})
