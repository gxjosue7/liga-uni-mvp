'use client'

import { createContext, useContext, useRef, useState } from 'react'

import { AppIcon } from '@/components/ui/AppIcon'

interface ToastContextValue {
  notify: (message: string) => void
}

const ToastContext = createContext<ToastContextValue>({ notify: () => undefined })

export function useToast() {
  return useContext(ToastContext)
}

const TOAST_DURATION_MS = 4500

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function notify(next: string) {
    if (timer.current) clearTimeout(timer.current)
    setMessage(next)
    timer.current = setTimeout(() => setMessage(null), TOAST_DURATION_MS)
  }

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6"
      >
        {message ? (
          <p className="pointer-events-auto flex max-w-md animate-rise items-center gap-2 rounded bg-ink px-4 py-3 text-sm font-medium text-white shadow-dialog">
            <AppIcon name="CheckCircle2" className="text-brand" />
            {message}
          </p>
        ) : null}
      </div>
    </ToastContext.Provider>
  )
}
