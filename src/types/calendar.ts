export type CalendarItemKind = 'event' | 'reservation'
export type ReservationStatusValue = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface CalendarItem {
  id: string
  kind: CalendarItemKind
  title: string
  description: string | null
  startAt: string
  endAt: string
  entityId: string
  entityName: string
  place: string | null
  status: ReservationStatusValue | null
  mine: boolean
  requester: string | null
}
