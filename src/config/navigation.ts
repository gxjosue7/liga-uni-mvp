import type { IconName } from '@/components/ui/AppIcon'

export interface NavItem {
  href: string
  label: string
  shortLabel: string
  icon: IconName
}

export const ADMIN_NAV: NavItem[] = [
  { href: '/admin/dashboard', label: 'Painel', shortLabel: 'Painel', icon: 'LayoutDashboard' },
  { href: '/admin/entidades', label: 'Entidades', shortLabel: 'Entidades', icon: 'Building2' },
  { href: '/admin/membros', label: 'Membros', shortLabel: 'Membros', icon: 'Users' },
  { href: '/admin/calendario', label: 'Calendário', shortLabel: 'Agenda', icon: 'CalendarDays' },
  { href: '/admin/reservas', label: 'Reservas', shortLabel: 'Reservas', icon: 'ClipboardList' },
  { href: '/admin/salas', label: 'Salas', shortLabel: 'Salas', icon: 'DoorOpen' },
]

export const LEADER_NAV: NavItem[] = [
  { href: '/lider/dashboard', label: 'Painel', shortLabel: 'Painel', icon: 'LayoutDashboard' },
  { href: '/lider/equipe', label: 'Minha entidade', shortLabel: 'Entidade', icon: 'Users' },
  { href: '/lider/calendario', label: 'Calendário', shortLabel: 'Agenda', icon: 'CalendarDays' },
  { href: '/lider/reservas', label: 'Reservas', shortLabel: 'Reservas', icon: 'ClipboardList' },
]
