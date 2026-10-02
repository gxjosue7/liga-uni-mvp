import type { Metadata } from 'next'

import { ReservationDialog } from '@/components/reservations/ReservationDialog'
import { ReservationsTable } from '@/components/reservations/ReservationsTable'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { Panel } from '@/components/ui/Panel'
import { requireLeader } from '@/lib/session'
import { buildQuery, firstParam, oneOf, type SearchParams } from '@/lib/searchParams'
import { parsePage } from '@/server/pagination'
import { listReservations } from '@/server/reservations'
import { listActiveRooms } from '@/server/rooms'

export const metadata: Metadata = { title: 'Reservas' }

const BASE = '/lider/reservas'
const FILTERS = ['todas', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const
const LABELS: Record<(typeof FILTERS)[number], string> = {
  todas: 'Todas',
  PENDING: 'Aguardando',
  APPROVED: 'Aprovadas',
  REJECTED: 'Recusadas',
  CANCELLED: 'Canceladas',
}

export default async function LeaderReservationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const actor = await requireLeader()
  const params = await searchParams
  const filter = oneOf(firstParam(params.status), FILTERS, 'todas')
  const page = parsePage(firstParam(params.page))

  const [result, rooms] = await Promise.all([
    listReservations({ entityId: actor.entityId, status: filter === 'todas' ? undefined : filter, page }),
    listActiveRooms(),
  ])

  return (
    <>
      <PageHeader
        title="Reservas de sala"
        description="Solicite espaços do Ágora UNI e acompanhe a resposta da equipe."
        actions={<ReservationDialog rooms={rooms} />}
      />
      <Panel>
        <FilterTabs
          label="Status das reservas"
          current={filter}
          options={FILTERS.map((value) => ({
            value,
            label: LABELS[value],
            href: `${BASE}${buildQuery({ status: value === 'todas' ? undefined : value })}`,
          }))}
        />
        <ReservationsTable reservations={result.items} mode="leader" emptyAction={<ReservationDialog rooms={rooms} />} />
        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          hrefFor={(next) => `${BASE}${buildQuery({ status: filter === 'todas' ? undefined : filter, page: String(next) })}`}
        />
      </Panel>
    </>
  )
}
