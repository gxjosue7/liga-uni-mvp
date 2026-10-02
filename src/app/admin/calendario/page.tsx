import type { Metadata } from 'next'

import { CalendarView } from '@/components/calendar/CalendarView'
import { PageHeader } from '@/components/ui/PageHeader'
import { requireAdmin } from '@/lib/session'
import type { SearchParams } from '@/lib/searchParams'
import { loadCalendarView } from '@/server/calendarView'
import { listEntityOptions } from '@/server/entities'

export const metadata: Metadata = { title: 'Calendário' }

export default async function AdminCalendarPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const actor = await requireAdmin()
  const [view, entities] = await Promise.all([loadCalendarView(actor, await searchParams), listEntityOptions()])

  return (
    <>
      <PageHeader
        title="Calendário geral"
        description="Eventos das entidades e reservas de sala. Filtre por entidade, tipo ou status."
      />
      <CalendarView view={view} basePath="/admin/calendario" canEdit={() => true} entities={entities} />
    </>
  )
}
