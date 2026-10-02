import { LogOut } from 'lucide-react'

import { Logo } from '@/components/layout/Logo'
import { NavLinks } from '@/components/layout/NavLinks'
import { ToastProvider } from '@/components/ui/Toast'
import { ROLE_LABELS } from '@/config/site'
import { logoutAction } from '@/app/login/actions'

import type { NavItem } from '@/config/navigation'
import type { Role } from '@/generated/prisma/enums'

interface AppShellProps {
  nav: NavItem[]
  user: { name: string; role: Role; entityName?: string }
  children: React.ReactNode
}

function LogoutButton({ className }: { className: string }) {
  return (
    <form action={logoutAction}>
      <button type="submit" className={className}>
        <LogOut aria-hidden="true" className="size-4" />
        Sair
      </button>
    </form>
  )
}

export function AppShell({ nav, user, children }: AppShellProps) {
  return (
    <ToastProvider>
      <div className="min-h-dvh md:grid md:grid-cols-[17rem_1fr]">
        <aside className="hidden border-r border-line bg-surface md:sticky md:top-0 md:flex md:h-dvh md:flex-col">
          <div className="border-b border-line px-5 py-5">
            <Logo />
          </div>
          <nav aria-label="Principal" className="flex-1 overflow-y-auto p-3">
            <NavLinks items={nav} variant="sidebar" />
          </nav>
          <div className="space-y-3 border-t border-line p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-ink-muted">{user.entityName ?? ROLE_LABELS[user.role]}</p>
            </div>
            <LogoutButton className="flex min-h-10 w-full items-center gap-2 rounded px-2 text-sm font-semibold text-ink-soft hover:bg-paper" />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col pb-16 md:pb-0">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface px-4 py-2.5 md:hidden">
            <Logo showEnvironment={false} />
            <LogoutButton className="flex min-h-11 items-center gap-2 rounded px-3 text-sm font-semibold text-ink-soft hover:bg-paper" />
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
        </div>

        <nav
          aria-label="Principal"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          <NavLinks items={nav} variant="bottom" />
        </nav>
      </div>
    </ToastProvider>
  )
}
