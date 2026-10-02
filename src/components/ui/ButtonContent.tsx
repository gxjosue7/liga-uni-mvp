import { AppIcon } from '@/components/ui/AppIcon'
import type { ButtonSpec } from '@/types/ui'

interface ButtonContentProps {
  spec: Pick<ButtonSpec, 'label' | 'icon' | 'iconOnly'>
  labelOverride?: string
}

export function ButtonContent({ spec, labelOverride }: ButtonContentProps) {
  const label = labelOverride ?? spec.label
  return (
    <>
      {spec.icon ? <AppIcon name={spec.icon} /> : null}
      {spec.iconOnly ? <span className="sr-only">{label}</span> : label}
    </>
  )
}
