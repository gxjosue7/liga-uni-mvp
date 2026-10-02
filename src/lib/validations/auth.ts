import { z } from 'zod'

import { emailField } from '@/lib/validations/common'

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Senha é obrigatória.').max(72),
})
