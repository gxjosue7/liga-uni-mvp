// Joinville usa America/Sao_Paulo. O Brasil não tem horário de verão desde 2019,
// então o offset fixo -03:00 é seguro e evita depender do TZ do servidor (a
// Vercel roda em UTC). Todo instante é guardado em UTC; a entrada/saída do
// usuário é sempre convertida por aqui.
export const APP_TZ = 'America/Sao_Paulo'
const OFFSET = '-03:00'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: APP_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})
const dateLongFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: APP_TZ,
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: APP_TZ,
  weekday: 'short',
  day: '2-digit',
  month: 'short',
})

export function isDateKey(value: string): boolean {
  return DATE_RE.test(value) && parseLocalDateTime(value, '00:00') !== null
}

export function isTimeKey(value: string): boolean {
  return TIME_RE.test(value)
}

export function parseLocalDateTime(date: string, time: string): Date | null {
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) return null
  const parsed = new Date(`${date}T${time}:00${OFFSET}`)
  if (Number.isNaN(parsed.getTime())) return null
  // O V8 aceita dia inexistente (2026-02-31 vira 03-03): a ida e volta barra isso.
  return toDayKey(parsed) === date && toTimeKey(parsed) === time ? parsed : null
}

export function toDayKey(date: Date): string {
  return dayFormatter.format(date)
}

export function toTimeKey(date: Date): string {
  return timeFormatter.format(date)
}

export function todayKey(): string {
  return toDayKey(new Date())
}

export function addDaysToKey(dayKey: string, days: number): string {
  const [year, month, day] = dayKey.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  return shifted.toISOString().slice(0, 10)
}

export function startOfDay(dayKey: string): Date {
  return new Date(`${dayKey}T00:00:00${OFFSET}`)
}

export function formatDate(date: Date): string {
  return dateLongFormatter.format(date).replace(/\./g, '')
}

export function formatDayLabel(date: Date): string {
  return weekdayFormatter.format(date).replace(/\./g, '')
}

export function formatTime(date: Date): string {
  return timeFormatter.format(date)
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)}, ${formatTime(date)}`
}

export function formatRange(start: Date, end: Date): string {
  if (toDayKey(start) === toDayKey(end)) {
    return `${formatDate(start)}, ${formatTime(start)}–${formatTime(end)}`
  }
  return `${formatDateTime(start)} → ${formatDateTime(end)}`
}

export function dayKeysBetween(start: Date, end: Date): string[] {
  const first = toDayKey(start)
  const last = toDayKey(new Date(Math.max(start.getTime(), end.getTime() - 1)))
  const keys: string[] = []
  for (let key = first; key <= last && keys.length < 62; key = addDaysToKey(key, 1)) {
    keys.push(key)
  }
  return keys
}
