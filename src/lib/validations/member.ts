import { z } from 'zod'

import { idField, optionalEmail, optionalInt, optionalText, requiredText } from '@/lib/validations/common'

export const memberSchema = z.object({
  name: requiredText('Nome'),
  course: requiredText('Curso', 100),
  email: optionalEmail(),
  phone: optionalText('Telefone', 30),
  semester: optionalInt('Semestre', 1, 20),
})

export const memberIdSchema = z.object({ id: idField })

export type MemberInput = z.output<typeof memberSchema>
