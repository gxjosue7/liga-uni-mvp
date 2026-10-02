'use client'

import { createContext, useContext, useId, useRef, useState } from 'react'

import { buttonClass } from '@/components/ui/Button'
import { AppIcon } from '@/components/ui/AppIcon'
import { ButtonContent } from '@/components/ui/ButtonContent'
import { cn } from '@/lib/utils'

import type { ButtonSpec } from '@/types/ui'

const DialogCloseContext = createContext<(() => void) | null>(null)

export function useDialogClose() {
  return useContext(DialogCloseContext)
}

interface DialogProps {
  title: string
  description?: string
  trigger: ButtonSpec
  children: React.ReactNode
  className?: string
}

// <dialog> nativo: foco preso, Esc fecha, foco volta ao gatilho. O conteúdo só
// é montado enquanto aberto, então cada abertura começa com o formulário limpo.
export function Dialog({ title, description, trigger, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const titleId = useId()
  const descriptionId = useId()

  function handleOpen() {
    setIsOpen(true)
    ref.current?.showModal()
  }

  function handleClose() {
    ref.current?.close()
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === ref.current) handleClose()
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-haspopup="dialog"
        className={buttonClass(trigger.variant ?? 'secondary', trigger.size ?? 'md', trigger.iconOnly ? 'px-0 min-w-11' : undefined)}
      >
        <ButtonContent spec={trigger} />
      </button>

      <dialog
        ref={ref}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClose={() => setIsOpen(false)}
        onClick={handleBackdropClick}
        className={cn(
          'm-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-lg bg-surface p-0 text-ink shadow-dialog',
          'md:m-auto md:max-w-lg md:rounded-lg',
          className,
        )}
      >
        {isOpen ? (
          <DialogCloseContext.Provider value={handleClose}>
            <div className="p-5 md:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 id={titleId} className="display text-lg">{title}</h2>
                  {description ? (
                    <p id={descriptionId} className="mt-1 text-sm text-ink-muted">{description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Fechar"
                  className="-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded text-ink-soft hover:bg-paper"
                >
                  <AppIcon name="X" className="size-5" />
                </button>
              </div>
              {children}
            </div>
          </DialogCloseContext.Provider>
        ) : null}
      </dialog>
    </>
  )
}
