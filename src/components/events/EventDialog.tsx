import { ActionForm } from '@/components/form/ActionForm'
import { ConfirmDialog } from '@/components/form/ConfirmDialog'
import { DatePicker, TimeField } from '@/components/form/DateTimeFields'
import { TextAreaField, TextField } from '@/components/form/Fields'
import { Dialog } from '@/components/ui/Dialog'
import { createEventAction, deleteEventAction, updateEventAction } from '@/actions/events'
import { toDayKey, toTimeKey, todayKey } from '@/lib/datetime'

import type { CalendarItem } from '@/types/calendar'

interface EventDialogProps {
  event?: CalendarItem
}

export function EventDialog({ event }: EventDialogProps) {
  const start = event ? new Date(event.startAt) : null
  const end = event ? new Date(event.endAt) : null
  const today = todayKey()

  return (
    <Dialog
      title={event ? 'Editar evento' : 'Novo evento'}
      description={event ? undefined : 'O evento aparece no calendário geral para todas as entidades.'}
      trigger={
        event
          ? { label: 'Editar evento', icon: 'Pencil', variant: 'ghost', size: 'sm', iconOnly: true }
          : { label: 'Novo evento', icon: 'Plus', variant: 'primary' }
      }
    >
      <ActionForm
        action={event ? updateEventAction : createEventAction}
        hidden={event ? { id: event.id } : undefined}
        submit={{ label: event ? 'Salvar alterações' : 'Criar evento' }}
      >
        <TextField label="Título" name="title" defaultValue={event?.title} maxLength={140} required />
        <div className="grid grid-cols-2 gap-3">
          <DatePicker label="Data de início" name="startDate" defaultValue={start ? toDayKey(start) : today} />
          <TimeField label="Hora de início" name="startTime" defaultValue={start ? toTimeKey(start) : '09:00'} />
          <DatePicker label="Data de fim" name="endDate" defaultValue={end ? toDayKey(end) : today} />
          <TimeField label="Hora de fim" name="endTime" defaultValue={end ? toTimeKey(end) : '10:00'} />
        </div>
        <TextField label="Local" name="location" defaultValue={event?.place ?? ''} maxLength={140} hint="Opcional." />
        <TextAreaField label="Descrição" name="description" defaultValue={event?.description ?? ''} maxLength={1000} hint="Opcional." />
      </ActionForm>
    </Dialog>
  )
}

export function DeleteEventDialog({ event }: { event: CalendarItem }) {
  return (
    <ConfirmDialog
      action={deleteEventAction}
      fields={{ id: event.id }}
      trigger={{ label: 'Excluir evento', icon: 'Trash2', variant: 'ghost', size: 'sm', iconOnly: true }}
      title="Excluir este evento?"
      description={`“${event.title}” sai do calendário de todas as entidades. Essa ação não pode ser desfeita.`}
      confirmLabel="Excluir evento"
    />
  )
}
