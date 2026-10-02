import type { Metadata } from 'next'
import Link from 'next/link'

import { ActionForm } from '@/components/form/ActionForm'
import { TextAreaField } from '@/components/form/Fields'
import { buttonClass } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { PageHeader } from '@/components/ui/PageHeader'
import { Panel } from '@/components/ui/Panel'
import { updateOwnEntityAction } from '@/actions/entities'
import { prisma } from '@/lib/db'
import { requireLeader } from '@/lib/session'

export const metadata: Metadata = { title: 'Minha entidade' }

export default async function LeaderEntityPage() {
  const actor = await requireLeader()
  const entity = await prisma.entity.findUniqueOrThrow({
    where: { id: actor.entityId },
    select: {
      name: true,
      acronym: true,
      institution: true,
      description: true,
      _count: { select: { members: { where: { active: true } }, events: true, reservations: true } },
    },
  })

  return (
    <>
      <PageHeader
        title={entity.acronym ?? entity.name}
        description="Dados da sua entidade na Liga UNI."
        actions={
          <Link href="/lider/equipe/membros" className={buttonClass('primary')}>
            Gerenciar membros
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Panel
          title="Sobre a entidade"
          action={
            <Dialog title="Editar descrição" trigger={{ label: 'Editar', icon: 'Pencil', variant: 'ghost', size: 'sm' }}>
              <ActionForm action={updateOwnEntityAction} submit={{ label: 'Salvar descrição' }}>
                <TextAreaField
                  label="Descrição"
                  name="description"
                  defaultValue={entity.description ?? ''}
                  maxLength={600}
                  hint="Conte em poucas linhas o que a entidade faz."
                />
              </ActionForm>
            </Dialog>
          }
          bodyClassName="space-y-4 p-4 md:p-5"
        >
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-ink-muted">Nome</dt>
              <dd className="font-semibold">{entity.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Instituição</dt>
              <dd className="font-semibold">{entity.institution}</dd>
            </div>
          </dl>
          <p className="max-w-prose text-ink-soft">
            {entity.description ?? 'Nenhuma descrição ainda. Use “Editar” para apresentar a entidade.'}
          </p>
        </Panel>

        <Panel title="Em números" bodyClassName="divide-y divide-line">
          <dl>
            {[
              ['Membros ativos', entity._count.members],
              ['Eventos cadastrados', entity._count.events],
              ['Solicitações de sala', entity._count.reservations],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between px-4 py-3 md:px-5">
                <dt className="text-sm text-ink-soft">{label}</dt>
                <dd className="display text-2xl tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </>
  )
}
