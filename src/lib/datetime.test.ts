import { describe, expect, it } from 'vitest'

import { addDaysToKey, dayKeysBetween, parseLocalDateTime, toDayKey, toTimeKey } from '@/lib/datetime'

describe('datetime (America/Sao_Paulo, -03:00)', () => {
  it('converte horário local para UTC', () => {
    expect(parseLocalDateTime('2026-10-05', '14:00')?.toISOString()).toBe('2026-10-05T17:00:00.000Z')
  })

  it('rejeita data/hora inexistente', () => {
    expect(parseLocalDateTime('2026-02-31', '10:00')).toBeNull()
    expect(parseLocalDateTime('2026-10-05', '25:00')).toBeNull()
    expect(parseLocalDateTime('05/10/2026', '10:00')).toBeNull()
  })

  it('devolve o dia local, não o dia UTC', () => {
    const lateNight = new Date('2026-10-06T01:30:00.000Z')
    expect(toDayKey(lateNight)).toBe('2026-10-05')
    expect(toTimeKey(lateNight)).toBe('22:30')
  })

  it('soma dias atravessando o mês', () => {
    expect(addDaysToKey('2026-10-31', 1)).toBe('2026-11-01')
  })

  it('lista todos os dias de um evento de vários dias, sem incluir o dia do fim exato à meia-noite', () => {
    const start = parseLocalDateTime('2026-10-05', '22:00')
    const end = parseLocalDateTime('2026-10-07', '00:00')
    if (!start || !end) throw new Error('datas do teste inválidas')
    expect(dayKeysBetween(start, end)).toEqual(['2026-10-05', '2026-10-06'])
  })
})
