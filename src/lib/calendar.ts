import { addDays, addMonths, endOfMonth, endOfWeek, format, parse, startOfMonth, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { startOfDay, todayKey } from '@/lib/datetime'
import type { CalendarItem } from '@/types/calendar'

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/

// Aritmética de calendário em datas "de parede" (sem fuso): as chaves
// yyyy-MM-dd é que carregam o dia. Os instantes do banco são convertidos para
// chave em src/lib/datetime.ts.
export function parseMonthKey(value: string | undefined): string {
  return value && MONTH_RE.test(value) ? value : todayKey().slice(0, 7)
}

function monthStart(monthKey: string): Date {
  return parse(`${monthKey}-01`, 'yyyy-MM-dd', new Date())
}

export function shiftMonth(monthKey: string, delta: number): string {
  return format(addMonths(monthStart(monthKey), delta), 'yyyy-MM')
}

export function monthLabel(monthKey: string): string {
  return format(monthStart(monthKey), "MMMM 'de' yyyy", { locale: ptBR })
}

export function dayLabel(dayKey: string): string {
  return format(parse(dayKey, 'yyyy-MM-dd', new Date()), "EEEE, d 'de' MMMM", { locale: ptBR })
}

export function dayNumber(dayKey: string): number {
  return Number(dayKey.slice(8, 10))
}

export interface MonthGrid {
  days: { key: string; isInMonth: boolean }[]
  from: Date
  to: Date
}

export function buildMonthGrid(monthKey: string): MonthGrid {
  const first = monthStart(monthKey)
  const gridStart = startOfWeek(startOfMonth(first), { weekStartsOn: 0 })
  const gridEnd = endOfWeek(endOfMonth(first), { weekStartsOn: 0 })

  const days: MonthGrid['days'] = []
  for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) {
    const key = format(day, 'yyyy-MM-dd')
    days.push({ key, isInMonth: key.startsWith(monthKey) })
  }

  const lastKey = days[days.length - 1].key
  const nextDay = format(addDays(parse(lastKey, 'yyyy-MM-dd', new Date()), 1), 'yyyy-MM-dd')
  return { days, from: startOfDay(days[0].key), to: startOfDay(nextDay) }
}

export function groupItemsByDay(items: CalendarItem[], dayKeysOf: (item: CalendarItem) => string[]) {
  const byDay = new Map<string, CalendarItem[]>()
  for (const item of items) {
    for (const key of dayKeysOf(item)) {
      const list = byDay.get(key)
      if (list) list.push(item)
      else byDay.set(key, [item])
    }
  }
  return byDay
}
