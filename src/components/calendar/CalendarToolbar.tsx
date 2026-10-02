import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { buttonClass } from '@/components/ui/Button'
import { monthLabel, shiftMonth } from '@/lib/calendar'
import { todayKey } from '@/lib/datetime'

interface CalendarToolbarProps {
  monthKey: string
  hrefForMonth: (monthKey: string) => string
}

export function CalendarToolbar({ monthKey, hrefForMonth }: CalendarToolbarProps) {
  const currentMonth = todayKey().slice(0, 7)

  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="display text-xl capitalize md:text-2xl">{monthLabel(monthKey)}</h2>
      <div className="flex items-center gap-1.5">
        <Link href={hrefForMonth(shiftMonth(monthKey, -1))} className={buttonClass('secondary', 'sm', 'px-0 min-w-11')}>
          <ChevronLeft aria-hidden="true" className="size-4" />
          <span className="sr-only">Mês anterior</span>
        </Link>
        {monthKey !== currentMonth ? (
          <Link href={hrefForMonth(currentMonth)} className={buttonClass('secondary', 'sm')}>
            Hoje
          </Link>
        ) : null}
        <Link href={hrefForMonth(shiftMonth(monthKey, 1))} className={buttonClass('secondary', 'sm', 'px-0 min-w-11')}>
          <ChevronRight aria-hidden="true" className="size-4" />
          <span className="sr-only">Próximo mês</span>
        </Link>
      </div>
    </div>
  )
}
