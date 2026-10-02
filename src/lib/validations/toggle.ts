import { z } from 'zod'

import { idField } from '@/lib/validations/common'

export const toggleActiveSchema = z.object({
  id: idField,
  active: z.enum(['true', 'false']).transform((value) => value === 'true'),
})
