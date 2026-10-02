import { describe, expect, it } from 'vitest'

import { isOverlapViolation } from '@/server/reservations'

describe('isOverlapViolation', () => {
  it('reconhece a constraint do banco pelo nome', () => {
    const error = new Error('conflicting key value violates exclusion constraint "reservation_no_overlap"')
    expect(isOverlapViolation(error)).toBe(true)
  })

  it('reconhece o SQLSTATE 23P01 aninhado em cause/meta', () => {
    expect(isOverlapViolation({ message: 'falha', meta: { driverAdapterError: { cause: { originalCode: '23P01' } } } })).toBe(true)
    expect(isOverlapViolation({ message: 'falha', cause: { code: '23P01' } })).toBe(true)
  })

  it('não confunde outros erros com conflito de sala', () => {
    expect(isOverlapViolation(new Error('Unique constraint failed on email'))).toBe(false)
    expect(isOverlapViolation({ code: 'P2002' })).toBe(false)
    expect(isOverlapViolation(null)).toBe(false)
  })

  it('não entra em loop com cause circular', () => {
    const error: { message: string; cause?: unknown } = { message: 'x' }
    error.cause = error
    expect(isOverlapViolation(error)).toBe(false)
  })
})
