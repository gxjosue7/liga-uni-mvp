import { AppShell } from '@/components/layout/AppShell'
import { ADMIN_NAV } from '@/config/navigation'
import { requireAdmin } from '@/lib/session'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireAdmin()

  return (
    <AppShell nav={ADMIN_NAV} user={{ name: actor.name, role: actor.role }}>
      {children}
    </AppShell>
  )
}
