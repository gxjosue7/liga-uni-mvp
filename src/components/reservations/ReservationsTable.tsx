import { ClipboardList } from 'lucide-react'

import { ConfirmDialog } from '@/components/form/ConfirmDialog'
import { QuickAction } from '@/components/form/QuickAction'
import { TextAreaField } from '@/components/form/Fields'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReservationStatus } from '@/components/ui/StatusBadge'
import {
  approveReservationAction,
  cancelReservationAction,
  rejectReservationAction,
} from '@/actions/reservations'
import { formatRange } from '@/lib/datetime'

import type { ReservationRowData } from '@/types/reservation'

interface ReservationsTableProps {
  reservations: ReservationRowData[]
  mode: 'leader' | 'admin'
  emptyAction?: React.ReactNode
}

export function ReservationsTable({ reservations, mode, emptyAction }: ReservationsTableProps) {
  const columns: Column<ReservationRowData>[] = [
    { header: 'Atividade', primary: true, cell: (item) => item.title },
    ...(mode === 'admin'
      ? [
          {
            header: 'Entidade',
            cell: (item: ReservationRowData) => (
              <>
                {item.entity.acronym ?? item.entity.name}
                {item.requester ? <span className="block text-xs text-ink-muted">{item.requester.name}</span> : null}
              </>
            ),
          },
        ]
      : []),
    { header: 'Sala', cell: (item) => item.room.name },
    { header: 'Quando', cell: (item) => formatRange(item.startAt, item.endAt) },
    {
      header: 'Status',
      cell: (item) => (
        <div className="space-y-1">
          <ReservationStatus status={item.status} />
          {item.status === 'REJECTED' && item.rejectionReason ? (
            <p className="max-w-56 text-xs text-danger">Motivo: {item.rejectionReason}</p>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      caption="Reservas de sala"
      columns={columns}
      rows={reservations}
      rowKey={(item) => item.id}
      empty={
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma reserva encontrada"
          description={mode === 'leader' ? 'Solicite uma sala para a próxima atividade da entidade.' : 'Ajuste os filtros para ver outras solicitações.'}
          action={emptyAction}
        />
      }
      actions={(item) => {
        if (mode === 'admin' && item.status === 'PENDING') {
          return (
            <>
              <QuickAction
                action={approveReservationAction}
                fields={{ id: item.id }}
                button={{ label: 'Aprovar', icon: 'Check', variant: 'primary', size: 'sm' }}
              />
              <ConfirmDialog
                action={rejectReservationAction}
                fields={{ id: item.id }}
                trigger={{ label: 'Recusar', icon: 'Ban', variant: 'secondary', size: 'sm' }}
                title="Recusar esta solicitação?"
                description={`“${item.title}” em ${item.room.name}. O líder verá o motivo, se você informar.`}
                confirmLabel="Recusar solicitação"
              >
                <TextAreaField label="Motivo da recusa" name="reason" maxLength={500} hint="Opcional, mas ajuda o líder a reagendar." />
              </ConfirmDialog>
            </>
          )
        }
        const isCancellable = mode === 'leader' && (item.status === 'PENDING' || item.status === 'APPROVED') && !item.isPast
        if (!isCancellable) return null
        return (
          <ConfirmDialog
            action={cancelReservationAction}
            fields={{ id: item.id }}
            trigger={{ label: 'Cancelar', icon: 'X', variant: 'secondary', size: 'sm' }}
            title="Cancelar esta solicitação?"
            description={`A sala ${item.room.name} será liberada para outras entidades.`}
            confirmLabel="Cancelar solicitação"
          />
        )
      }}
    />
  )
}
