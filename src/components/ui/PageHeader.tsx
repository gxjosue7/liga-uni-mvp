interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

// A barra amarela é a assinatura da marca (logo do Ágora): ancora todo título.
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="flex gap-3">
        <span aria-hidden="true" className="mt-1 w-1.5 shrink-0 self-stretch rounded-sm bg-brand" />
        <div className="min-w-0">
          <h1 className="display text-2xl leading-tight md:text-3xl">{title}</h1>
          {description ? <p className="mt-1 max-w-prose text-sm text-ink-muted md:text-base">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
