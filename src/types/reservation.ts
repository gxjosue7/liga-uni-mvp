import type { ReservationStatusValue } from '@/types/calendar'

export interface ReservationRowData {
  id: string
  title: string
  startAt: Date
  endAt: Date
  status: ReservationStatusValue
  rejectionReason?: string | null
  entity: { name: string; acronym: string | null }
  room: { name: string }
  requester?: { name: string }
  isPast?: boolean
}

export interface EventRowData {
  id: string
  title: string
  startAt: Date
  endAt: Date
  location: string | null
  entity: { name: string; acronym: string | null }
}
