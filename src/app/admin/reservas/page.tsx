import type { Metadata } from 'next'

import { ReservationsTable } from '@/components/reservations/ReservationsTable'
import { FilterForm } from '@/components/ui/FilterForm'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { Panel } from '@/components/ui/Panel'
import { addDaysToKey, isDateKey, startOfDay } from '@/lib/datetime'
import { requireAdmin } from '@/lib/session'
import { buildQuery, firstParam, oneOf, type SearchParams } from '@/lib/searchParams'
import { listEntityOptions } from '@/server/entities'
import { parsePage } from '@/server/pagination'
import { listReservations } from '@/server/reservations'
import { listRoomOptions } from '@/server/rooms'

export const metadata: Metadata = { title: 'Reservas' }

const BASE = '/admin/reservas'
const STATUSES = ['todas', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const

export default async function AdminReservationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin()
  const params = await searchParams
  const status = oneOf(firstParam(params.status), STATUSES, 'PENDING')
  const entity = firstParam(params.entidade) ?? ''
  const room = firstParam(params.sala) ?? ''
  const fromParam = firstParam(params.de)
  const toParam = firstParam(params.ate)
  const from = fromParam && isDateKey(fromParam) ? fromParam : ''
  const to = toParam && isDateKey(toParam) ? toParam : ''
  const page = parsePage(firstParam(params.page))

  const [result, entities, rooms] = await Promise.all([
    listReservations({
      status: status === 'todas' ? undefined : status,
      entityId: entity || undefined,
      roomId: room || undefined,
      from: from ? startOfDay(from) : undefined,
      to: to ? startOfDay(addDaysToKey(to, 1)) : undefined,
      page,
    }),
    listEntityOptions(),
    listRoomOptions(),
  ])

  return (
    <>
      <PageHeader title="Reservas" description="Fila de solicitações de sala. Aprove ou recuse com um motivo." />
      <Panel>
        <FilterForm
          label="Filtros de reservas"
          resetHref={BASE}
          fields={[
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              value: status,
              options: [
                { value: 'todas', label: 'Todos' },
                { value: 'PENDING', label: 'Aguardando' },
                { value: 'APPROVED', label: 'Aprovadas' },
                { value: 'REJECTED', label: 'Recusadas' },
                { value: 'CANCELLED', label: 'Canceladas' },
              ],
            },
            {
              name: 'entidade',
              label: 'Entidade',
              type: 'select',
              value: entity,
              options: [{ value: '', label: 'Todas' }, ...entities.map((item) => ({ value: item.id, label: item.acronym ?? item.name }))],
            },
            {
              name: 'sala',
              label: 'Sala',
              type: 'select',
              value: room,
              options: [{ value: '', label: 'Todas' }, ...rooms.map((item) => ({ value: item.id, label: item.active ? item.name : `${item.name} (inativa)` }))],
            },
            { name: 'de', label: 'De', type: 'date', value: from },
            { name: 'ate', label: 'Até', type: 'date', value: to },
          ]}
        />
        <ReservationsTable reservations={result.items} mode="admin" />
        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          hrefFor={(next) =>
            `${BASE}${buildQuery({
              status,
              entidade: entity || undefined,
              sala: room || undefined,
              de: from || undefined,
              ate: to || undefined,
              page: String(next),
            })}`
          }
        />
      </Panel>
    </>
  )
}
