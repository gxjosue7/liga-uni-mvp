import type { Metadata } from 'next'

import { MembersTable } from '@/components/members/MembersTable'
import { FilterForm } from '@/components/ui/FilterForm'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { Panel } from '@/components/ui/Panel'
import { requireAdmin } from '@/lib/session'
import { buildQuery, firstParam, oneOf, type SearchParams } from '@/lib/searchParams'
import { listEntityOptions } from '@/server/entities'
import { listMembers } from '@/server/members'
import { parsePage } from '@/server/pagination'

export const metadata: Metadata = { title: 'Membros' }

const BASE = '/admin/membros'
const STATUS = ['ativos', 'removidos', 'todos'] as const

export default async function AdminMembersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin()
  const params = await searchParams
  const entity = firstParam(params.entidade) ?? ''
  const search = firstParam(params.q) ?? ''
  const status = oneOf(firstParam(params.status), STATUS, 'ativos')
  const page = parsePage(firstParam(params.page))

  const [result, entities] = await Promise.all([
    listMembers({
      entityId: entity || undefined,
      search: search || undefined,
      active: status === 'todos' ? undefined : status === 'ativos',
      page,
    }),
    listEntityOptions(),
  ])

  return (
    <>
      <PageHeader title="Membros" description="Todos os membros cadastrados pelas entidades, com o curso de cada pessoa." />
      <Panel>
        <FilterForm
          label="Filtros de membros"
          resetHref={BASE}
          fields={[
            { name: 'q', label: 'Nome ou curso', type: 'search', value: search },
            {
              name: 'entidade',
              label: 'Entidade',
              type: 'select',
              value: entity,
              options: [{ value: '', label: 'Todas' }, ...entities.map((item) => ({ value: item.id, label: item.acronym ?? item.name }))],
            },
            {
              name: 'status',
              label: 'Situação',
              type: 'select',
              value: status,
              options: [
                { value: 'ativos', label: 'Ativos' },
                { value: 'removidos', label: 'Removidos' },
                { value: 'todos', label: 'Todos' },
              ],
            },
          ]}
        />
        <MembersTable members={result.items} showEntity />
        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          hrefFor={(next) =>
            `${BASE}${buildQuery({
              q: search || undefined,
              entidade: entity || undefined,
              status: status === 'ativos' ? undefined : status,
              page: String(next),
            })}`
          }
        />
      </Panel>
    </>
  )
}
