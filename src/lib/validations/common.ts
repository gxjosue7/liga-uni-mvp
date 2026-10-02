import { z } from 'zod'

import { parseLocalDateTime } from '@/lib/datetime'

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

export function requiredText(label: string, max = 120) {
  return z
    .string({ error: `${label} é obrigatório.` })
    .trim()
    .min(1, `${label} é obrigatório.`)
    .max(max, `${label} deve ter no máximo ${max} caracteres.`)
}

export function optionalText(label: string, max = 500) {
  return z.preprocess(
    emptyToUndefined,
    z.string().trim().max(max, `${label} deve ter no máximo ${max} caracteres.`).optional(),
  )
}

export function optionalEmail(label = 'E-mail') {
  return z.preprocess(
    emptyToUndefined,
    z.string().trim().toLowerCase().max(160).pipe(z.email(`${label} inválido.`)).optional(),
  )
}

export const emailField = z
  .string({ error: 'E-mail é obrigatório.' })
  .trim()
  .toLowerCase()
  .max(160, 'E-mail muito longo.')
  .pipe(z.email('E-mail inválido.'))

export const passwordField = z
  .string({ error: 'Senha é obrigatória.' })
  .min(8, 'A senha deve ter pelo menos 8 caracteres.')
  .max(72, 'A senha deve ter no máximo 72 caracteres.')

export function optionalInt(label: string, min: number, max: number) {
  return z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: `${label} inválido.` })
      .int(`${label} deve ser um número inteiro.`)
      .min(min, `${label} deve ser no mínimo ${min}.`)
      .max(max, `${label} deve ser no máximo ${max}.`)
      .optional(),
  )
}

export const idField = z.string().trim().min(1, 'Seleção inválida.').max(64, 'Seleção inválida.')

export const dateField = z.string({ error: 'Informe a data.' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida.')
export const timeField = z
  .string({ error: 'Informe o horário.' })
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido.')

export interface DateRange {
  startAt: Date
  endAt: Date
}

export function resolveRange(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
): DateRange | { field: 'startTime' | 'endTime' | 'endDate'; message: string } {
  const startAt = parseLocalDateTime(startDate, startTime)
  if (!startAt) return { field: 'startTime', message: 'Data ou horário inicial inválido.' }
  const endAt = parseLocalDateTime(endDate, endTime)
  if (!endAt) return { field: 'endTime', message: 'Data ou horário final inválido.' }
  if (endAt <= startAt) return { field: 'endTime', message: 'O fim deve ser depois do início.' }
  return { startAt, endAt }
}
