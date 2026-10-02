import {
  AlertCircle,
  Ban,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  DoorOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const ICONS = {
  AlertCircle,
  Ban,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  DoorOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  UserRound,
  Users,
  X,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof ICONS

interface AppIconProps {
  name: IconName
  className?: string
}

// Ícones decorativos: o nome acessível vem sempre do texto/aria-label do controle.
export function AppIcon({ name, className }: AppIconProps) {
  const Icon = ICONS[name]
  return <Icon aria-hidden="true" className={cn('size-4 shrink-0', className)} />
}
