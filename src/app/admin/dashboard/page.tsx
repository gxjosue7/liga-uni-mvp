import type { Metadata } from 'next'
import Link from 'next/link'

import { EventList } from '@/components/dashboard/EventList'
import { ReservationList } from '@/components/dashboard/ReservationList'
import { StatCard } from '@/components/dashboard/StatCard'
import { buttonClass } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Panel } from '@/components/ui/Panel'
import { requireAdmin } from '@/lib/session'
import { getAdminDashboard } from '@/server/dashboard'

export const metadata: Metadata = { title: 'Painel' }

export default async function AdminDashboardPage() {
  await requireAdmin()
  const data = await getAdminDashboard()

  return (
    <>
      <PageHeader
        title="Painel da Liga UNI"
        description="Visão geral das entidades, reservas e agenda do Ágora UNI."
        actions={
          <Link href="/admin/reservas?status=PENDING" className={buttonClass('primary')}>
            Ver solicitações
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Entidades" value={data.entities} icon="Building2" href="/admin/entidades" />
        <StatCard label="Membros" value={data.members} icon="Users" href="/admin/membros" />
        <StatCard label="Reservas aguardando" value={data.pending} icon="Clock" href="/admin/reservas?status=PENDING" isHighlighted />
        <StatCard label="Salas ativas" value={data.rooms} icon="DoorOpen" href="/admin/salas" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Solicitações aguardando">
          <ReservationList reservations={data.pendingList} emptyTitle="Nenhuma solicitação aguardando" showEntity />
        </Panel>
        <Panel title="Próximos eventos">
          <EventList events={data.events} showEntity />
        </Panel>
        <Panel title="Próximas reservas aprovadas">
          <ReservationList reservations={data.approved} emptyTitle="Nenhuma reserva aprovada à frente" showEntity />
        </Panel>
        <Panel title="Resumo por entidade">
          <ul className="divide-y divide-line">
            {data.perEntity.map((entity) => (
              <li key={entity.id} className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{entity.acronym ?? entity.name}</p>
                  <p className="truncate text-sm text-ink-muted">{entity.institution}</p>
                </div>
                <ul className="shrink-0 text-right text-sm text-ink-soft">
                  <li>{entity._count.members} membros</li>
                  <li>{entity._count.events} eventos futuros</li>
                  <li>{entity._count.reservations} reservas aguardando</li>
                </ul>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}
