import Link from 'next/link'

import { buttonClass } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="display text-5xl">404</p>
      <p className="max-w-sm text-ink-muted">Esta página não existe ou você não tem acesso a ela.</p>
      <Link href="/" className={buttonClass('primary')}>Voltar ao início</Link>
    </main>
  )
}
