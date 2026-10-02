import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { buttonClass } from '@/components/ui/Button'

interface PaginationProps {
  page: number
  pageCount: number
  total: number
  hrefFor: (page: number) => string
}

export function Pagination({ page, pageCount, total, hrefFor }: PaginationProps) {
  if (pageCount <= 1) {
    return <p className="px-4 py-3 text-sm text-ink-muted md:px-5">{total} {total === 1 ? 'registro' : 'registros'}</p>
  }

  return (
    <nav aria-label="Paginação" className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
      <p className="text-sm text-ink-muted">
        Página {page} de {pageCount} ({total} registros)
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={buttonClass('secondary', 'sm')}>
            <ChevronLeft aria-hidden="true" className="size-4" />
            Anterior
          </Link>
        ) : null}
        {page < pageCount ? (
          <Link href={hrefFor(page + 1)} className={buttonClass('secondary', 'sm')}>
            Próxima
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </div>
    </nav>
  )
}
