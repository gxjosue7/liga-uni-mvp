import type { Metadata } from 'next'

import { MemberDialog } from '@/components/members/MemberDialog'
import { MembersTable } from '@/components/members/MembersTable'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { Panel } from '@/components/ui/Panel'
import { requireLeader } from '@/lib/session'
import { buildQuery, firstParam, oneOf, type SearchParams } from '@/lib/searchParams'
import { listMembers } from '@/server/members'
import { parsePage } from '@/server/pagination'

export const metadata: Metadata = { title: 'Membros' }

const BASE = '/lider/equipe/membros'

export default async function LeaderMembersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const actor = await requireLeader()
  const params = await searchParams
  const status = oneOf(firstParam(params.status), ['ativos', 'removidos'] as const, 'ativos')
  const page = parsePage(firstParam(params.page))

  const result = await listMembers({ entityId: actor.entityId, active: status === 'ativos', page })

  return (
    <>
      <PageHeader
        title="Membros"
        description="Quem faz parte da sua entidade e de qual curso."
        actions={<MemberDialog />}
      />
      <Panel>
        <FilterTabs
          label="Situação dos membros"
          current={status}
          options={[
            { value: 'ativos', label: 'Ativos', href: BASE },
            { value: 'removidos', label: 'Removidos', href: `${BASE}${buildQuery({ status: 'removidos' })}` },
          ]}
        />
        <MembersTable members={result.items} canEdit emptyAction={status === 'ativos' ? <MemberDialog /> : undefined} />
        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          hrefFor={(next) => `${BASE}${buildQuery({ status: status === 'ativos' ? undefined : status, page: String(next) })}`}
        />
      </Panel>
    </>
  )
}
