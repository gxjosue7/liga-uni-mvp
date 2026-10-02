import 'server-only'
import { z } from 'zod'

import { AppError, ValidationError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import type { ActionState } from '@/lib/action-state'

export function parseForm<T extends z.ZodType>(schema: T, formData: FormData): z.output<T> {
  const raw: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && !key.startsWith('$ACTION')) raw[key] = value
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const [field, messages] of Object.entries(z.flattenError(result.error).fieldErrors)) {
      if (Array.isArray(messages)) fieldErrors[field] = messages.map(String)
    }
    throw new ValidationError(fieldErrors)
  }
  return result.data
}

// Erros esperados viram mensagem amigável; qualquer outro é logado no servidor
// e o cliente recebe uma mensagem genérica (nunca o erro do Prisma).
export async function runAction(fn: () => Promise<string | void>): Promise<ActionState> {
  try {
    const message = await fn()
    return { status: 'success', message: message ?? undefined }
  } catch (error) {
    if (error instanceof ValidationError) {
      return { status: 'error', message: error.message, fieldErrors: error.fieldErrors }
    }
    if (error instanceof AppError) {
      return { status: 'error', message: error.message }
    }
    logger.error('[action]', error)
    return { status: 'error', message: 'Não foi possível concluir a operação. Tente novamente.' }
  }
}
