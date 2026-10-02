import Link from 'next/link'

import { cn } from '@/lib/utils'

interface FilterTabsProps {
  label: string
  options: { value: string; label: string; href: string }[]
  current: string
}

// Abas que são links: o filtro mora na URL e o servidor consulta só o necessário.
export function FilterTabs({ label, options, current }: FilterTabsProps) {
  return (
    <nav aria-label={label} className="flex gap-1 border-b border-line px-2 md:px-3">
      {options.map((option) => {
        const isCurrent = option.value === current
        return (
          <Link
            key={option.value}
            href={option.href}
            aria-current={isCurrent ? 'page' : undefined}
            className={cn(
              'flex min-h-11 items-center border-b-4 px-3 text-sm font-semibold transition-colors',
              isCurrent ? 'border-brand text-ink' : 'border-transparent text-ink-muted hover:text-ink',
            )}
          >
            {option.label}
          </Link>
        )
      })}
    </nav>
  )
}
