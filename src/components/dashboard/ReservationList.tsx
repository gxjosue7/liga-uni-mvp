import { ClipboardList } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { ReservationStatus } from '@/components/ui/StatusBadge'
import { formatRange } from '@/lib/datetime'

import type { ReservationRowData } from '@/types/reservation'

interface ReservationListProps {
  reservations: ReservationRowData[]
  emptyTitle: string
  showEntity?: boolean
}

export function ReservationList({ reservations, emptyTitle, showEntity }: ReservationListProps) {
  if (reservations.length === 0) {
    return <EmptyState icon={ClipboardList} title={emptyTitle} />
  }

  return (
    <ul className="divide-y divide-line">
      {reservations.map((reservation) => (
        <li key={reservation.id} className="space-y-1 px-4 py-3 md:px-5">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 truncate font-semibold">{reservation.title}</p>
            <ReservationStatus status={reservation.status} className="shrink-0" />
          </div>
          <p className="text-sm text-ink-muted">{formatRange(reservation.startAt, reservation.endAt)}</p>
          <p className="truncate text-sm text-ink-soft">
            {[reservation.room.name, showEntity ? (reservation.entity.acronym ?? reservation.entity.name) : null]
              .filter(Boolean)
              .join(' – ')}
          </p>
          {reservation.status === 'REJECTED' && reservation.rejectionReason ? (
            <p className="text-sm text-danger">Motivo: {reservation.rejectionReason}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
