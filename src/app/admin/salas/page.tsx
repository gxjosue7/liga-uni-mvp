import type { Metadata } from 'next'
import { DoorOpen } from 'lucide-react'

import { ConfirmDialog } from '@/components/form/ConfirmDialog'
import { QuickAction } from '@/components/form/QuickAction'
import { RoomDialog } from '@/components/rooms/RoomDialog'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Panel } from '@/components/ui/Panel'
import { ActiveBadge } from '@/components/ui/StatusBadge'
import { setRoomActiveAction } from '@/actions/rooms'
import { requireAdmin } from '@/lib/session'
import { listRooms } from '@/server/rooms'

export const metadata: Metadata = { title: 'Salas' }

type RoomRow = Awaited<ReturnType<typeof listRooms>>[number]

const columns: Column<RoomRow>[] = [
  { header: 'Sala', primary: true, cell: (room) => room.name },
  { header: 'Local', cell: (room) => room.building ?? <span className="text-ink-muted">Não informado</span> },
  { header: 'Capacidade', cell: (room) => (room.capacity ? `${room.capacity} pessoas` : <span className="text-ink-muted">Não informada</span>) },
  { header: 'Reservas', cell: (room) => room._count.reservations },
  { header: 'Situação', cell: (room) => <ActiveBadge active={room.active} /> },
]

export default async function AdminRoomsPage() {
  await requireAdmin()
  const rooms = await listRooms()

  return (
    <>
      <PageHeader
        title="Salas"
        description="Espaços do Ágora que as entidades podem solicitar."
        actions={<RoomDialog />}
      />
      <Panel>
        <DataTable
          caption="Salas do Ágora"
          columns={columns}
          rows={rooms}
          rowKey={(room) => room.id}
          empty={<EmptyState icon={DoorOpen} title="Nenhuma sala cadastrada" description="Cadastre as salas para liberar solicitações." action={<RoomDialog />} />}
          actions={(room) => (
            <>
              <RoomDialog room={room} />
              {room.active ? (
                <ConfirmDialog
                  action={setRoomActiveAction}
                  fields={{ id: room.id, active: 'false' }}
                  trigger={{ label: `Desativar ${room.name}`, icon: 'Ban', variant: 'ghost', size: 'sm', iconOnly: true }}
                  title="Desativar esta sala?"
                  description="Ela deixa de receber novas solicitações. O histórico de reservas continua intacto."
                  confirmLabel="Desativar sala"
                />
              ) : (
                <QuickAction
                  action={setRoomActiveAction}
                  fields={{ id: room.id, active: 'true' }}
                  button={{ label: 'Reativar', icon: 'RotateCcw', variant: 'secondary', size: 'sm' }}
                />
              )}
            </>
          )}
        />
      </Panel>
    </>
  )
}
