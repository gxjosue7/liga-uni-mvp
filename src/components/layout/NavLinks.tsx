'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { AppIcon } from '@/components/ui/AppIcon'
import { cn } from '@/lib/utils'

import type { NavItem } from '@/config/navigation'

interface NavLinksProps {
  items: NavItem[]
  variant: 'sidebar' | 'bottom'
}

export function NavLinks({ items, variant }: NavLinksProps) {
  const pathname = usePathname()

  return (
    <ul className={variant === 'sidebar' ? 'space-y-1' : 'flex'}>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <li key={item.href} className={variant === 'bottom' ? 'min-w-0 flex-1' : undefined}>
            <Link
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                variant === 'sidebar'
                  ? 'flex min-h-11 items-center gap-3 rounded border-l-4 px-3 text-sm font-semibold transition-colors'
                  : 'flex min-h-14 flex-col items-center justify-center gap-0.5 border-t-4 px-1 text-[11px] font-semibold transition-colors',
                isActive
                  ? 'border-brand bg-brand-soft text-ink'
                  : 'border-transparent text-ink-soft hover:bg-paper',
              )}
            >
              <AppIcon name={item.icon} className={variant === 'bottom' ? 'size-5' : 'size-[18px]'} />
              <span className={variant === 'bottom' ? 'truncate' : undefined}>
                {variant === 'bottom' ? item.shortLabel : item.label}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
