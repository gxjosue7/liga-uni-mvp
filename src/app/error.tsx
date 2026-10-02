'use client'

import { buttonClass } from '@/components/ui/Button'

interface ErrorPageProps {
  reset: () => void
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="display text-2xl">Algo deu errado</p>
      <p className="max-w-sm text-ink-muted">
        Não conseguimos carregar esta página. Tente de novo; se continuar, recarregue o navegador.
      </p>
      <button type="button" onClick={reset} className={buttonClass('primary')}>
        Tentar de novo
      </button>
    </main>
  )
}
