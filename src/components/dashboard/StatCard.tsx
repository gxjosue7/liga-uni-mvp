import Link from 'next/link'

import { AppIcon, type IconName } from '@/components/ui/AppIcon'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number
  icon: IconName
  href?: string
  isHighlighted?: boolean
}

// Só o cartão que pede ação (reservas aguardando) ganha o amarelo cheio.
export function StatCard({ label, value, icon, href, isHighlighted }: StatCardProps) {
  const body = (
    <div
      className={cn(
        'flex h-full flex-col justify-between gap-6 rounded-lg border p-4 md:p-5',
        isHighlighted && value > 0 ? 'border-brand-deep bg-brand' : 'border-line bg-surface',
        href && 'transition-colors hover:border-ink',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink-soft">{label}</p>
        <AppIcon name={icon} className="size-5 text-ink" />
      </div>
      <p className="display text-4xl tabular-nums leading-none">{value}</p>
    </div>
  )

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  )
}
