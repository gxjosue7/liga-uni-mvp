import Link from 'next/link'

import { itemTone } from '@/components/calendar/itemStyle'
import { dayLabel, dayNumber } from '@/lib/calendar'
import { formatTime, todayKey } from '@/lib/datetime'
import { cn } from '@/lib/utils'

import type { MonthGrid } from '@/lib/calendar'
import type { CalendarItem } from '@/types/calendar'

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MAX_CHIPS = 3

interface CalendarGridProps {
  grid: MonthGrid
  itemsByDay: Map<string, CalendarItem[]>
  selectedDay: string
  hrefFor: (dayKey: string) => string
}

function countLabel(count: number): string {
  if (count === 0) return 'sem itens'
  return `${count} ${count === 1 ? 'item' : 'itens'}`
}

export function CalendarGrid({ grid, itemsByDay, selectedDay, hrefFor }: CalendarGridProps) {
  const today = todayKey()

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div aria-hidden="true" className="grid grid-cols-7 border-b border-line bg-paper">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="py-2 text-center text-xs font-semibold text-ink-soft">
            {weekday}
          </div>
        ))}
      </div>

      <ul aria-label="Dias do mês" className="grid grid-cols-7">
        {grid.days.map((day) => {
          const items = itemsByDay.get(day.key) ?? []
          const isSelected = day.key === selectedDay
          const isToday = day.key === today
          const hidden = items.length - MAX_CHIPS

          return (
            <li key={day.key} className="border-b border-r border-line [&:nth-child(7n)]:border-r-0">
              <Link
                href={hrefFor(day.key)}
                aria-current={isToday ? 'date' : isSelected ? 'true' : undefined}
                aria-label={`${dayLabel(day.key)}, ${countLabel(items.length)}`}
                className={cn(
                  'flex h-full min-h-16 flex-col gap-1 p-1.5 transition-colors md:min-h-28 md:p-2',
                  'hover:bg-paper',
                  !day.isInMonth && 'bg-paper/60 text-ink-muted',
                  isSelected && 'bg-brand-soft ring-2 ring-inset ring-ink hover:bg-brand-soft',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-sm text-xs font-semibold md:text-sm',
                    isToday && 'bg-ink text-white',
                  )}
                >
                  {dayNumber(day.key)}
                </span>

                <span className="mt-auto flex flex-wrap gap-0.5 md:hidden" aria-hidden="true">
                  {items.slice(0, 4).map((item) => (
                    <span key={`${item.kind}-${item.id}`} className={cn('h-1.5 w-3 rounded-sm', itemTone(item).bar)} />
                  ))}
                </span>

                <span className="hidden flex-col gap-0.5 md:flex" aria-hidden="true">
                  {items.slice(0, MAX_CHIPS).map((item) => (
                    <span
                      key={`${item.kind}-${item.id}`}
                      className={cn('truncate rounded-sm px-1.5 py-0.5 text-xs font-medium', itemTone(item).chip)}
                    >
                      {formatTime(new Date(item.startAt))} {item.title}
                    </span>
                  ))}
                  {hidden > 0 ? <span className="px-1 text-xs font-medium text-ink-muted">+{hidden} mais</span> : null}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
