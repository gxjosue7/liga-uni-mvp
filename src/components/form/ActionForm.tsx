'use client'

import { createContext, useActionState, useContext } from 'react'
import { useFormStatus } from 'react-dom'

import { buttonClass } from '@/components/ui/Button'
import { ButtonContent } from '@/components/ui/ButtonContent'
import { AppIcon } from '@/components/ui/AppIcon'
import { useDialogClose } from '@/components/ui/Dialog'
import { useToast } from '@/components/ui/Toast'
import { INITIAL_ACTION_STATE, type ActionState } from '@/lib/action-state'
import { cn } from '@/lib/utils'

import type { ButtonSpec } from '@/types/ui'

const FieldErrorsContext = createContext<Record<string, string[]>>({})

export function useFieldErrors(name: string): string[] {
  return useContext(FieldErrorsContext)[name] ?? []
}

interface SubmitSpec extends ButtonSpec {
  pendingLabel?: string
  isFullWidth?: boolean
}

function SubmitButton({ submit }: { submit: SubmitSpec }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={buttonClass(
        submit.variant ?? 'primary',
        submit.size ?? 'md',
        cn(submit.iconOnly && 'px-0 min-w-11', submit.isFullWidth && 'w-full'),
      )}
    >
      <ButtonContent spec={submit} labelOverride={pending ? (submit.pendingLabel ?? 'Salvando…') : undefined} />
    </button>
  )
}

interface ActionFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  submit: SubmitSpec
  hidden?: Record<string, string>
  children?: React.ReactNode
  className?: string
}

// Envolve uma Server Action: mostra erro geral e por campo, avisa o sucesso por
// toast e, dentro de um Dialog, fecha ao concluir.
export function ActionForm({ action, submit, hidden, children, className }: ActionFormProps) {
  const closeDialog = useDialogClose()
  const { notify } = useToast()

  async function handleAction(previous: ActionState, formData: FormData): Promise<ActionState> {
    let next: ActionState
    try {
      next = await action(previous, formData)
    } catch {
      // Página aberta de um deploy anterior (a ação não existe mais no servidor) ou rede caída.
      return { status: 'error', message: 'Esta página ficou desatualizada ou a conexão falhou. Recarregue a página e tente de novo.' }
    }
    if (next.status === 'success') {
      if (next.message) notify(next.message)
      closeDialog?.()
    }
    return next
  }

  const [state, formAction] = useActionState(handleAction, INITIAL_ACTION_STATE)
  const hasError = state.status === 'error'

  return (
    <FieldErrorsContext.Provider value={state.fieldErrors ?? {}}>
      <form action={formAction} className={cn('space-y-4', className)} noValidate>
        {Object.entries(hidden ?? {}).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        {children}
        {hasError && state.message ? (
          <p role="alert" className="flex items-start gap-2 rounded border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
            <AppIcon name="AlertCircle" className="mt-0.5" />
            {state.message}
          </p>
        ) : null}
        <div className={cn(children ? 'pt-1' : 'contents', children && !submit.isFullWidth && 'flex justify-end')}>
          <SubmitButton submit={submit} />
        </div>
      </form>
    </FieldErrorsContext.Provider>
  )
}
