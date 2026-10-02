import { cn } from '@/lib/utils'
import type { ReservationStatusValue } from '@/types/calendar'

interface StatusBadgeProps {
  tone: 'brand' | 'ok' | 'danger' | 'neutral' | 'event'
  children: React.ReactNode
  className?: string
}

const tones: Record<StatusBadgeProps['tone'], string> = {
  brand: 'bg-brand-soft text-ink ring-1 ring-inset ring-brand-deep',
  ok: 'bg-ok-soft text-ok ring-1 ring-inset ring-ok/30',
  danger: 'bg-danger-soft text-danger ring-1 ring-inset ring-danger/30',
  neutral: 'bg-paper text-ink-muted ring-1 ring-inset ring-line-strong',
  event: 'bg-event-soft text-event ring-1 ring-inset ring-event/30',
}

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

const reservationLabels: Record<ReservationStatusValue, { label: string; tone: StatusBadgeProps['tone'] }> = {
  PENDING: { label: 'Aguardando', tone: 'brand' },
  APPROVED: { label: 'Aprovada', tone: 'ok' },
  REJECTED: { label: 'Recusada', tone: 'danger' },
  CANCELLED: { label: 'Cancelada', tone: 'neutral' },
}

export function ReservationStatus({ status, className }: { status: ReservationStatusValue; className?: string }) {
  const { label, tone } = reservationLabels[status]
  return (
    <StatusBadge tone={tone} className={className}>
      {label}
    </StatusBadge>
  )
}

export function ActiveBadge({ active }: { active: boolean }) {
  return <StatusBadge tone={active ? 'ok' : 'neutral'}>{active ? 'Ativa' : 'Inativa'}</StatusBadge>
}
