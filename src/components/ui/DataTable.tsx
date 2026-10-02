import { cn } from '@/lib/utils'

export interface Column<Row> {
  header: string
  cell: (row: Row) => React.ReactNode
  className?: string
  // Na lista empilhada (celular) a coluna principal vira o título do item.
  primary?: boolean
  hideOnMobile?: boolean
}

interface DataTableProps<Row> {
  caption: string
  columns: Column<Row>[]
  rows: Row[]
  rowKey: (row: Row) => string
  actions?: (row: Row) => React.ReactNode
  empty: React.ReactNode
}

// Tabela no desktop; lista empilhada no celular (nada de scroll horizontal).
export function DataTable<Row>({ caption, columns, rows, rowKey, actions, empty }: DataTableProps<Row>) {
  if (rows.length === 0) return <>{empty}</>

  const primary = columns.find((column) => column.primary) ?? columns[0]
  const secondary = columns.filter((column) => column !== primary && !column.hideOnMobile)

  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-paper text-ink-soft">
            {columns.map((column) => (
              <th key={column.header} scope="col" className={cn('px-5 py-2.5 font-semibold', column.className)}>
                {column.header}
              </th>
            ))}
            {actions ? <th scope="col" className="px-5 py-2.5 text-right font-semibold">Ações</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="align-middle">
              {columns.map((column) => (
                <td key={column.header} className={cn('px-5 py-3', column.className)}>
                  {column.cell(row)}
                </td>
              ))}
              {actions ? <td className="px-5 py-3"><div className="flex justify-end gap-1">{actions(row)}</div></td> : null}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li key={rowKey(row)} className="space-y-2 px-4 py-4">
            <div className="font-semibold">{primary.cell(row)}</div>
            <dl className="space-y-1 text-sm">
              {secondary.map((column) => (
                <div key={column.header} className="flex gap-2">
                  <dt className="w-24 shrink-0 text-ink-muted">{column.header}</dt>
                  <dd className="min-w-0 flex-1 break-words">{column.cell(row)}</dd>
                </div>
              ))}
            </dl>
            {actions ? <div className="flex flex-wrap gap-2 pt-1">{actions(row)}</div> : null}
          </li>
        ))}
      </ul>
    </>
  )
}
