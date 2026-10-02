'use client'

import { ActionForm } from '@/components/form/ActionForm'
import type { ActionState } from '@/lib/action-state'
import type { ButtonSpec } from '@/types/ui'

interface QuickActionProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  fields: Record<string, string>
  button: ButtonSpec
}

// Ação de um clique, sem confirmação (aprovar, reativar).
export function QuickAction({ action, fields, button }: QuickActionProps) {
  return <ActionForm action={action} hidden={fields} submit={button} className="inline-flex" />
}
