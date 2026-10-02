import { z } from 'zod'

import { idField, optionalInt, optionalText, requiredText } from '@/lib/validations/common'

const roomFields = {
  name: requiredText('Nome da sala'),
  building: optionalText('Local/prédio', 100),
  capacity: optionalInt('Capacidade', 1, 5000),
  description: optionalText('Descrição', 500),
}

export const createRoomSchema = z.object(roomFields)
export const updateRoomSchema = z.object({ id: idField, ...roomFields })
export const roomIdSchema = z.object({ id: idField })

export type RoomInput = z.output<typeof createRoomSchema>
