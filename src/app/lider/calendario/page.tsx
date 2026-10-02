import type { Metadata } from 'next'

import { CalendarView } from '@/components/calendar/CalendarView'
import { EventDialog } from '@/components/events/EventDialog'
import { ReservationDialog } from '@/components/reservations/ReservationDialog'
import { PageHeader } from '@/components/ui/PageHeader'
import { requireLeader } from '@/lib/session'
import type { SearchParams } from '@/lib/searchParams'
import { loadCalendarView } from '@/server/calendarView'
import { listActiveRooms } from '@/server/rooms'

export const metadata: Metadata = { title: 'Calendário' }

export default async function LeaderCalendarPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const actor = await requireLeader()
  const [view, rooms] = await Promise.all([loadCalendarView(actor, await searchParams), listActiveRooms()])

  return (
    <>
      <PageHeader
        title="Calendário"
        description="Eventos das entidades e salas ocupadas no Ágora UNI."
        actions={
          <>
            <ReservationDialog rooms={rooms} isSecondary />
            <EventDialog />
          </>
        }
      />
      <CalendarView view={view} basePath="/lider/calendario" canEdit={(item) => item.mine} />
    </>
  )
}
