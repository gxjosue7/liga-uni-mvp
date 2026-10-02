import { cn } from '@/lib/utils'

interface PanelProps {
  title?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}

export function Panel({ title, action, children, className, bodyClassName }: PanelProps) {
  return (
    <section className={cn('rounded-lg border border-line bg-surface', className)}>
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
          <h2 className="display text-base">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
