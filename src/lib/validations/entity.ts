import { z } from 'zod'

import {
  emailField,
  idField,
  optionalText,
  passwordField,
  requiredText,
} from '@/lib/validations/common'

const entityFields = {
  name: requiredText('Nome da entidade'),
  acronym: optionalText('Sigla', 20),
  institution: requiredText('Instituição'),
  description: optionalText('Descrição', 600),
  leaderName: requiredText('Nome do líder'),
  leaderEmail: emailField,
}

export const createEntitySchema = z.object({
  ...entityFields,
  leaderPassword: passwordField,
})

export const updateEntitySchema = z.object({
  id: idField,
  ...entityFields,
  leaderPassword: z.preprocess(
    (value) => (typeof value === 'string' && value === '' ? undefined : value),
    passwordField.optional(),
  ),
})

export const entityIdSchema = z.object({ id: idField })

export const leaderEntitySchema = z.object({
  description: optionalText('Descrição', 600),
})

export type CreateEntityInput = z.output<typeof createEntitySchema>
export type UpdateEntityInput = z.output<typeof updateEntitySchema>
