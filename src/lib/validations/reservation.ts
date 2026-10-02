import { z } from 'zod'

import {
  dateField,
  idField,
  optionalText,
  requiredText,
  resolveRange,
  timeField,
} from '@/lib/validations/common'

export const reservationSchema = z
  .object({
    roomId: idField,
    title: requiredText('Atividade', 140),
    purpose: requiredText('Finalidade', 1000),
    date: dateField,
    startTime: timeField,
    endTime: timeField,
  })
  .transform((value, ctx) => {
    const range = resolveRange(value.date, value.startTime, value.date, value.endTime)
    if ('field' in range) {
      ctx.issues.push({ code: 'custom', message: range.message, input: value, path: [range.field] })
      return z.NEVER
    }
    return {
      roomId: value.roomId,
      title: value.title,
      purpose: value.purpose,
      startAt: range.startAt,
      endAt: range.endAt,
    }
  })

export const reservationIdSchema = z.object({ id: idField })

export const rejectReservationSchema = z.object({
  id: idField,
  reason: optionalText('Motivo', 500),
})

export type ReservationInput = z.output<typeof reservationSchema>
