import type { CalendarItem } from '@/types/calendar'

export interface ItemTone {
  chip: string
  bar: string
  label: string
}

// Cor = tipo/status; cor cheia = item da própria entidade, cor suave = das demais.
export function itemTone(item: CalendarItem): ItemTone {
  if (item.kind === 'event') {
    return item.mine
      ? { chip: 'bg-event text-white', bar: 'bg-event', label: 'Evento' }
      : { chip: 'bg-event-soft text-event', bar: 'bg-event/40', label: 'Evento' }
  }
  switch (item.status) {
    case 'APPROVED':
      return item.mine
        ? { chip: 'bg-ok text-white', bar: 'bg-ok', label: 'Reserva aprovada' }
        : { chip: 'bg-ok-soft text-ok', bar: 'bg-ok/40', label: 'Reserva aprovada' }
    case 'PENDING':
      return item.mine
        ? { chip: 'bg-brand text-ink', bar: 'bg-brand', label: 'Reserva aguardando' }
        : { chip: 'bg-brand-soft text-ink', bar: 'bg-brand-deep/60', label: 'Reserva aguardando' }
    case 'REJECTED':
      return { chip: 'bg-danger-soft text-danger', bar: 'bg-danger/50', label: 'Reserva recusada' }
    default:
      return { chip: 'bg-paper text-ink-muted', bar: 'bg-line-strong', label: 'Reserva cancelada' }
  }
}
