import { SITE } from '@/config/site'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showEnvironment?: boolean
  isOnBrand?: boolean
}

// Marca própria da Liga UNI: bloco com um "U" vazado. Sobre o fundo amarelo o
// bloco inverte (preto com U amarelo) para não sumir.
export function Logo({ className, showEnvironment = true, isOnBrand }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className={cn('flex size-9 items-center justify-center rounded', isOnBrand ? 'bg-ink text-brand' : 'bg-brand text-ink')}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="square">
          <path d="M5 4v9a7 7 0 0 0 14 0V4" />
        </svg>
      </span>
      <div className="leading-none">
        <p className="display text-lg">{SITE.name}</p>
        {showEnvironment ? <p className={cn('mt-1 text-xs', isOnBrand ? 'text-ink-soft' : 'text-ink-muted')}>{SITE.environment}</p> : null}
      </div>
    </div>
  )
}
