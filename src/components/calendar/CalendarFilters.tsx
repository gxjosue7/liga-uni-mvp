import Link from 'next/link'

import { buttonClass } from '@/components/ui/Button'

const controlClass = 'block min-h-11 w-full rounded border border-line-strong bg-surface px-3 text-base md:min-h-10 md:text-sm'

interface CalendarFiltersProps {
  monthKey: string
  entities: { id: string; name: string; acronym: string | null }[]
  values: { entity: string; type: string; status: string }
  resetHref: string
}

// Formulário GET: os filtros vão na URL, a página consulta só o que foi pedido.
export function CalendarFilters({ monthKey, entities, values, resetHref }: CalendarFiltersProps) {
  return (
    <form method="get" aria-label="Filtros do calendário" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
      <input type="hidden" name="m" value={monthKey} />
      <label className="space-y-1.5 text-sm font-semibold">
        Entidade
        <select name="entidade" defaultValue={values.entity} className={controlClass}>
          <option value="">Todas</option>
          {entities.map((entity) => (
            <option key={entity.id} value={entity.id}>{entity.acronym ?? entity.name}</option>
          ))}
        </select>
      </label>
      <label className="space-y-1.5 text-sm font-semibold">
        Mostrar
        <select name="tipo" defaultValue={values.type} className={controlClass}>
          <option value="all">Eventos e reservas</option>
          <option value="events">Só eventos</option>
          <option value="reservations">Só reservas</option>
        </select>
      </label>
      <label className="space-y-1.5 text-sm font-semibold">
        Status da reserva
        <select name="status" defaultValue={values.status} className={controlClass}>
          <option value="active">Aguardando e aprovadas</option>
          <option value="PENDING">Aguardando</option>
          <option value="APPROVED">Aprovadas</option>
          <option value="REJECTED">Recusadas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </label>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
        <button type="submit" className={buttonClass('primary', 'md', 'flex-1')}>Filtrar</button>
        <Link href={resetHref} className={buttonClass('secondary', 'md')}>Limpar</Link>
      </div>
    </form>
  )
}
