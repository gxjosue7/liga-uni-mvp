import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'md' | 'sm'

const base =
  'inline-flex items-center justify-center gap-2 rounded font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-ink hover:bg-brand-deep',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-paper',
  danger: 'bg-danger text-white hover:bg-danger-deep',
  ghost: 'text-ink-soft hover:bg-paper',
}

const sizes: Record<ButtonSize, string> = {
  md: 'min-h-11 px-4 text-sm md:min-h-10',
  sm: 'min-h-11 px-3 text-sm md:min-h-9',
}

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />
}
