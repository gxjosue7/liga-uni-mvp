import type { ButtonSize, ButtonVariant } from '@/components/ui/Button'
import type { IconName } from '@/components/ui/AppIcon'

export interface ButtonSpec {
  label: string
  icon?: IconName
  variant?: ButtonVariant
  size?: ButtonSize
  iconOnly?: boolean
}
