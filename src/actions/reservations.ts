'use server'

import { parseForm, runAction } from '@/lib/action'
import { refreshApp } from '@/lib/revalidate'
import { requireAdmin, requireLeader } from '@/lib/session'
import {
  rejectReservationSchema,
  reservationIdSchema,
  reservationSchema,
} from '@/lib/validations/reservation'
import {
  approveReservation,
  cancelReservation,
  createReservation,
  rejectReservation,
} from '@/server/reservations'
import type { ActionState } from '@/lib/action-state'

export async function requestReservationAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireLeader()
  return runAction(async () => {
    await createReservation(actor, parseForm(reservationSchema, formData))
    refreshApp()
    return 'Solicitação enviada. Acompanhe o status em Reservas.'
  })
}

export async function cancelReservationAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireLeader()
  return runAction(async () => {
    const { id } = parseForm(reservationIdSchema, formData)
    await cancelReservation(actor, id)
    refreshApp()
    return 'Solicitação cancelada.'
  })
}

export async function approveReservationAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin()
  return runAction(async () => {
    const { id } = parseForm(reservationIdSchema, formData)
    await approveReservation(admin, id)
    refreshApp()
    return 'Reserva aprovada.'
  })
}

export async function rejectReservationAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin()
  return runAction(async () => {
    const { id, reason } = parseForm(rejectReservationSchema, formData)
    await rejectReservation(admin, id, reason)
    refreshApp()
    return 'Reserva recusada.'
  })
}
