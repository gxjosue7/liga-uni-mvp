'use client'

import { ActionForm } from '@/components/form/ActionForm'
import { Dialog } from '@/components/ui/Dialog'
import type { ActionState } from '@/lib/action-state'
import type { ButtonSpec } from '@/types/ui'

interface ConfirmDialogProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  fields: Record<string, string>
  trigger: ButtonSpec
  title: string
  description: string
  confirmLabel: string
  children?: React.ReactNode
}

// Confirmação antes de ação destrutiva. `children` permite campos extras (ex.: motivo da recusa).
export function ConfirmDialog({ action, fields, trigger, title, description, confirmLabel, children }: ConfirmDialogProps) {
  return (
    <Dialog title={title} description={description} trigger={trigger}>
      <ActionForm
        action={action}
        hidden={fields}
        submit={{ label: confirmLabel, variant: 'danger', pendingLabel: 'Aguarde…' }}
      >
        {children}
      </ActionForm>
    </Dialog>
  )
}
