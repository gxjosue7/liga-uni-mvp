import type { Metadata } from 'next'
import { Building2 } from 'lucide-react'

import { EntityDialog } from '@/components/entities/EntityDialog'
import { ConfirmDialog } from '@/components/form/ConfirmDialog'
import { QuickAction } from '@/components/form/QuickAction'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Panel } from '@/components/ui/Panel'
import { ActiveBadge } from '@/components/ui/StatusBadge'
import { setEntityActiveAction } from '@/actions/entities'
import { requireAdmin } from '@/lib/session'
import { listEntities } from '@/server/entities'

export const metadata: Metadata = { title: 'Entidades' }

type EntityRow = Awaited<ReturnType<typeof listEntities>>[number]

const columns: Column<EntityRow>[] = [
  {
    header: 'Entidade',
    primary: true,
    cell: (entity) => (
      <>
        {entity.acronym ? `${entity.acronym}, ` : ''}
        {entity.name}
      </>
    ),
  },
  { header: 'Instituição', cell: (entity) => entity.institution },
  {
    header: 'Líder',
    cell: (entity) =>
      entity.leader ? (
        <>
          {entity.leader.name}
          <span className="block text-xs text-ink-muted">{entity.leader.email}</span>
        </>
      ) : (
        <span className="text-ink-muted">Sem líder</span>
      ),
  },
  {
    header: 'Números',
    cell: (entity) => (
      <span className="text-ink-soft">
        {entity._count.members} membros, {entity._count.events} eventos, {entity._count.reservations} reservas
      </span>
    ),
  },
  { header: 'Situação', cell: (entity) => <ActiveBadge active={entity.active} /> },
]

export default async function AdminEntitiesPage() {
  await requireAdmin()
  const entities = await listEntities()

  return (
    <>
      <PageHeader
        title="Entidades"
        description="Entidades acadêmicas participantes e seus líderes de acesso."
        actions={<EntityDialog />}
      />
      <Panel>
        <DataTable
          caption="Entidades acadêmicas"
          columns={columns}
          rows={entities}
          rowKey={(entity) => entity.id}
          empty={
            <EmptyState
              icon={Building2}
              title="Nenhuma entidade cadastrada"
              description="Crie a primeira entidade e o líder que vai acessar o sistema."
              action={<EntityDialog />}
            />
          }
          actions={(entity) => (
            <>
              <EntityDialog entity={entity} />
              {entity.active ? (
                <ConfirmDialog
                  action={setEntityActiveAction}
                  fields={{ id: entity.id, active: 'false' }}
                  trigger={{ label: `Desativar ${entity.acronym ?? entity.name}`, icon: 'Ban', variant: 'ghost', size: 'sm', iconOnly: true }}
                  title="Desativar esta entidade?"
                  description="O líder deixa de acessar o sistema. Membros, eventos e reservas continuam no histórico."
                  confirmLabel="Desativar entidade"
                />
              ) : (
                <QuickAction
                  action={setEntityActiveAction}
                  fields={{ id: entity.id, active: 'true' }}
                  button={{ label: 'Reativar', icon: 'RotateCcw', variant: 'secondary', size: 'sm' }}
                />
              )}
            </>
          )}
        />
      </Panel>
    </>
  )
}
