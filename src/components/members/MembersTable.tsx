import { Users } from 'lucide-react'

import { ConfirmDialog } from '@/components/form/ConfirmDialog'
import { QuickAction } from '@/components/form/QuickAction'
import { MemberDialog } from '@/components/members/MemberDialog'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { setMemberActiveAction } from '@/actions/members'

type MemberRow = {
  id: string
  name: string
  email: string | null
  phone: string | null
  course: string
  semester: number | null
  active: boolean
  entity: { name: string; acronym: string | null }
}

interface MembersTableProps {
  members: MemberRow[]
  showEntity?: boolean
  canEdit?: boolean
  emptyAction?: React.ReactNode
}

export function MembersTable({ members, showEntity, canEdit, emptyAction }: MembersTableProps) {
  const columns: Column<MemberRow>[] = [
    {
      header: 'Nome',
      primary: true,
      cell: (member) => (
        <span className={member.active ? undefined : 'text-ink-muted'}>
          {member.name}
          {member.active ? null : <span className="ml-2 text-xs font-normal">(removido)</span>}
        </span>
      ),
    },
    {
      header: 'Curso',
      cell: (member) => (member.semester ? `${member.course}, ${member.semester}º semestre` : member.course),
    },
    ...(showEntity
      ? [{ header: 'Entidade', cell: (member: MemberRow) => member.entity.acronym ?? member.entity.name }]
      : []),
    {
      header: 'Contato',
      cell: (member) => [member.email, member.phone].filter(Boolean).join(' / ') || <span className="text-ink-muted">Não informado</span>,
    },
  ]

  return (
    <DataTable
      caption="Membros"
      columns={columns}
      rows={members}
      rowKey={(member) => member.id}
      empty={
        <EmptyState
          icon={Users}
          title="Nenhum membro por aqui"
          description="Cadastre quem faz parte da entidade, com o curso de cada pessoa."
          action={emptyAction}
        />
      }
      actions={
        canEdit
          ? (member) =>
              member.active ? (
                <>
                  <MemberDialog member={member} />
                  <ConfirmDialog
                    action={setMemberActiveAction}
                    fields={{ id: member.id, active: 'false' }}
                    trigger={{ label: `Remover ${member.name}`, icon: 'Trash2', variant: 'ghost', size: 'sm', iconOnly: true }}
                    title="Remover este membro?"
                    description={`${member.name} sai da lista da entidade. Você pode reativar depois, em “Removidos”.`}
                    confirmLabel="Remover membro"
                  />
                </>
              ) : (
                <QuickAction
                  action={setMemberActiveAction}
                  fields={{ id: member.id, active: 'true' }}
                  button={{ label: 'Reativar', icon: 'RotateCcw', variant: 'secondary', size: 'sm' }}
                />
              )
          : undefined
      }
    />
  )
}
