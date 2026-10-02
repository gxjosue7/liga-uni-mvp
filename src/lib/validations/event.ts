import { z } from 'zod'

import {
  dateField,
  idField,
  optionalText,
  requiredText,
  resolveRange,
  timeField,
} from '@/lib/validations/common'

export const eventSchema = z
  .object({
    title: requiredText('Título', 140),
    description: optionalText('Descrição', 1000),
    location: optionalText('Local', 140),
    startDate: dateField,
    startTime: timeField,
    endDate: dateField,
    endTime: timeField,
  })
  .transform((value, ctx) => {
    const range = resolveRange(value.startDate, value.startTime, value.endDate, value.endTime)
    if ('field' in range) {
      ctx.issues.push({ code: 'custom', message: range.message, input: value, path: [range.field] })
      return z.NEVER
    }
    return {
      title: value.title,
      description: value.description,
      location: value.location,
      startAt: range.startAt,
      endAt: range.endAt,
    }
  })

export const eventIdSchema = z.object({ id: idField })

export type EventInput = z.output<typeof eventSchema>
