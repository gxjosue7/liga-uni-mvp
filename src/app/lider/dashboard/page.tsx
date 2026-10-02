import type { Metadata } from 'next'
import Link from 'next/link'

import { EventList } from '@/components/dashboard/EventList'
import { ReservationList } from '@/components/dashboard/ReservationList'
import { StatCard } from '@/components/dashboard/StatCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { Panel } from '@/components/ui/Panel'
import { buttonClass } from '@/components/ui/Button'
import { requireLeader } from '@/lib/session'
import { getLeaderDashboard } from '@/server/dashboard'

export const metadata: Metadata = { title: 'Painel' }

export default async function LeaderDashboardPage() {
  const actor = await requireLeader()
  const data = await getLeaderDashboard(actor)

  return (
    <>
      <PageHeader
        title={data.entity.acronym ?? data.entity.name}
        description={`${data.entity.name}, ${data.entity.institution}`}
        actions={
          <Link href="/lider/reservas" className={buttonClass('primary')}>
            Solicitar sala
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Membros" value={data.members} icon="Users" href="/lider/equipe/membros" />
        <StatCard label="Próximos eventos" value={data.upcomingEventsCount} icon="CalendarDays" href="/lider/calendario" />
        <StatCard label="Reservas aguardando" value={data.pending} icon="Clock" href="/lider/reservas" isHighlighted />
        <StatCard label="Reservas aprovadas" value={data.approvedCount} icon="CheckCircle2" href="/lider/reservas" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Próximos eventos da entidade">
          <EventList events={data.upcomingEvents} />
        </Panel>
        <Panel title="Últimas solicitações de sala">
          <ReservationList reservations={data.recent} emptyTitle="Nenhuma solicitação ainda" />
        </Panel>
        <Panel title="Próximas reservas aprovadas" className="lg:col-span-2">
          <ReservationList reservations={data.approved} emptyTitle="Nenhuma reserva aprovada à frente" />
        </Panel>
      </div>
    </>
  )
}
