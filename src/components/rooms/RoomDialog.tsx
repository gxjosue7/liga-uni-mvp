import { ActionForm } from '@/components/form/ActionForm'
import { TextAreaField, TextField } from '@/components/form/Fields'
import { Dialog } from '@/components/ui/Dialog'
import { createRoomAction, updateRoomAction } from '@/actions/rooms'

interface RoomDialogProps {
  room?: { id: string; name: string; building: string | null; capacity: number | null; description: string | null }
}

export function RoomDialog({ room }: RoomDialogProps) {
  return (
    <Dialog
      title={room ? 'Editar sala' : 'Nova sala'}
      trigger={
        room
          ? { label: `Editar ${room.name}`, icon: 'Pencil', variant: 'ghost', size: 'sm', iconOnly: true }
          : { label: 'Nova sala', icon: 'Plus', variant: 'primary' }
      }
    >
      <ActionForm
        action={room ? updateRoomAction : createRoomAction}
        hidden={room ? { id: room.id } : undefined}
        submit={{ label: room ? 'Salvar alterações' : 'Criar sala' }}
      >
        <TextField label="Nome" name="name" defaultValue={room?.name} maxLength={120} placeholder="Ex.: Rooftop 1 - UNI" required />
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <TextField label="Local ou prédio" name="building" defaultValue={room?.building ?? ''} maxLength={100} placeholder="Ex.: UNI" />
          <TextField label="Capacidade" name="capacity" type="number" inputMode="numeric" min={1} defaultValue={room?.capacity ?? ''} hint="Opcional." />
        </div>
        <TextAreaField label="Descrição" name="description" defaultValue={room?.description ?? ''} maxLength={500} hint="Opcional." />
      </ActionForm>
    </Dialog>
  )
}
