import { redirect } from 'next/navigation'

import { getActor, homeFor } from '@/lib/session'

export default async function RootPage() {
  const actor = await getActor()
  redirect(actor ? homeFor(actor.role) : '/login')
}
