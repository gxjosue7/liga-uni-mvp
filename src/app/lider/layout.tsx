import { AppShell } from '@/components/layout/AppShell'
import { LEADER_NAV } from '@/config/navigation'
import { requireLeader } from '@/lib/session'

export default async function LeaderLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireLeader()

  return (
    <AppShell nav={LEADER_NAV} user={{ name: actor.name, role: actor.role, entityName: actor.entityName ?? undefined }}>
      {children}
    </AppShell>
  )
}
