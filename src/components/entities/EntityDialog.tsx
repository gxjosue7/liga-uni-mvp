import { ActionForm } from '@/components/form/ActionForm'
import { TextAreaField, TextField } from '@/components/form/Fields'
import { Dialog } from '@/components/ui/Dialog'
import { createEntityAction, updateEntityAction } from '@/actions/entities'

interface EntityDialogProps {
  entity?: {
    id: string
    name: string
    acronym: string | null
    institution: string
    description: string | null
    leader: { name: string; email: string } | null
  }
}

export function EntityDialog({ entity }: EntityDialogProps) {
  return (
    <Dialog
      title={entity ? 'Editar entidade' : 'Nova entidade'}
      description={entity ? undefined : 'Cada entidade tem um líder principal, que acessa o sistema com e-mail e senha.'}
      trigger={
        entity
          ? { label: `Editar ${entity.acronym ?? entity.name}`, icon: 'Pencil', variant: 'ghost', size: 'sm', iconOnly: true }
          : { label: 'Nova entidade', icon: 'Plus', variant: 'primary' }
      }
    >
      <ActionForm
        action={entity ? updateEntityAction : createEntityAction}
        hidden={entity ? { id: entity.id } : undefined}
        submit={{ label: entity ? 'Salvar alterações' : 'Criar entidade' }}
      >
        <TextField label="Nome da entidade" name="name" defaultValue={entity?.name} maxLength={120} required />
        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <TextField label="Sigla" name="acronym" defaultValue={entity?.acronym ?? ''} maxLength={20} />
          <TextField label="Instituição" name="institution" defaultValue={entity?.institution} maxLength={120} required />
        </div>
        <TextAreaField label="Descrição" name="description" defaultValue={entity?.description ?? ''} maxLength={600} hint="Opcional." />

        <fieldset className="space-y-4 rounded border border-line p-4">
          <legend className="px-1 text-sm font-semibold">Líder da entidade</legend>
          <TextField label="Nome do líder" name="leaderName" defaultValue={entity?.leader?.name} maxLength={120} autoComplete="off" required />
          <TextField label="E-mail de acesso" name="leaderEmail" type="email" inputMode="email" defaultValue={entity?.leader?.email} autoComplete="off" required />
          <TextField
            label={entity ? 'Nova senha' : 'Senha inicial'}
            name="leaderPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            hint={entity ? 'Deixe em branco para manter a senha atual. Mínimo de 8 caracteres.' : 'Mínimo de 8 caracteres. Repasse ao líder por um canal seguro.'}
            required={!entity}
          />
        </fieldset>
      </ActionForm>
    </Dialog>
  )
}
