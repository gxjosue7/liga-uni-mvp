import { ActionForm } from '@/components/form/ActionForm'
import { DatePicker, TimeField } from '@/components/form/DateTimeFields'
import { SelectField, TextAreaField, TextField } from '@/components/form/Fields'
import { Dialog } from '@/components/ui/Dialog'
import { requestReservationAction } from '@/actions/reservations'
import { todayKey } from '@/lib/datetime'

interface ReservationDialogProps {
  rooms: { id: string; name: string; building: string | null }[]
  isSecondary?: boolean
}

export function ReservationDialog({ rooms, isSecondary }: ReservationDialogProps) {
  return (
    <Dialog
      title="Solicitar sala"
      description="A equipe do Ágora analisa a solicitação. Você acompanha o status em Reservas."
      trigger={{ label: 'Solicitar sala', icon: 'Plus', variant: isSecondary ? 'secondary' : 'primary' }}
    >
      <ActionForm action={requestReservationAction} submit={{ label: 'Enviar solicitação', pendingLabel: 'Enviando…' }}>
        <SelectField
          label="Sala"
          name="roomId"
          placeholder="Escolha uma sala"
          options={rooms.map((room) => ({ value: room.id, label: room.building ? `${room.name} (${room.building})` : room.name }))}
          required
        />
        <DatePicker label="Data" name="date" defaultValue={todayKey()} min={todayKey()} />
        <div className="grid grid-cols-2 gap-3">
          <TimeField label="Início" name="startTime" defaultValue="14:00" />
          <TimeField label="Fim" name="endTime" defaultValue="16:00" />
        </div>
        <TextField label="Atividade" name="title" maxLength={140} placeholder="Ex.: Reunião de planejamento do semestre" required />
        <TextAreaField label="Finalidade" name="purpose" maxLength={1000} hint="Explique o que será feito e quantas pessoas participam." required />
      </ActionForm>
    </Dialog>
  )
}
