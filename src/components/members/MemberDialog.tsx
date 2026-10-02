import { ActionForm } from '@/components/form/ActionForm'
import { TextField } from '@/components/form/Fields'
import { Dialog } from '@/components/ui/Dialog'
import { createMemberAction, updateMemberAction } from '@/actions/members'

interface MemberDialogProps {
  member?: {
    id: string
    name: string
    course: string
    email: string | null
    phone: string | null
    semester: number | null
  }
}

export function MemberDialog({ member }: MemberDialogProps) {
  return (
    <Dialog
      title={member ? 'Editar membro' : 'Novo membro'}
      trigger={
        member
          ? { label: `Editar ${member.name}`, icon: 'Pencil', variant: 'ghost', size: 'sm', iconOnly: true }
          : { label: 'Novo membro', icon: 'Plus', variant: 'primary' }
      }
    >
      <ActionForm
        action={member ? updateMemberAction : createMemberAction}
        hidden={member ? { id: member.id } : undefined}
        submit={{ label: member ? 'Salvar alterações' : 'Adicionar membro' }}
      >
        <TextField label="Nome" name="name" defaultValue={member?.name} maxLength={120} autoComplete="off" required />
        <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
          <TextField
            label="Curso"
            name="course"
            defaultValue={member?.course}
            maxLength={100}
            placeholder="Ex.: Engenharia de Software"
            required
          />
          <TextField label="Semestre" name="semester" type="number" inputMode="numeric" min={1} max={20} defaultValue={member?.semester ?? ''} />
        </div>
        <TextField label="E-mail" name="email" type="email" inputMode="email" defaultValue={member?.email ?? ''} hint="Opcional." />
        <TextField label="Telefone" name="phone" type="tel" inputMode="tel" defaultValue={member?.phone ?? ''} hint="Opcional." />
      </ActionForm>
    </Dialog>
  )
}
