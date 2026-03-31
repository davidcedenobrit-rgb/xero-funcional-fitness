'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  LayoutDashboard, Users, CreditCard, Layers, DollarSign,
  TrendingDown, ClipboardCheck, Settings, LogOut, X, ClipboardList
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/miembros',      label: 'Miembros',       icon: Users },
  { href: '/suscripciones', label: 'Suscripciones',  icon: CreditCard },
  { href: '/planes',        label: 'Planes',         icon: Layers },
  { href: '/caja',          label: 'Caja',           icon: DollarSign },
  { href: '/gastos',        label: 'Gastos',         icon: TrendingDown },
  { href: '/asistencia',    label: 'Asistencia',     icon: ClipboardCheck },
  { href: '/inscripciones', label: 'Inscripciones',  icon: ClipboardList },
  { href: '/configuracion', label: 'Configuración',  icon: Settings },
]

interface SidebarProps { onClose?: () => void }

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-full bg-[#141614] border-r border-[#1E261E] w-64">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-[#1E261E]">
        <img src="/xero-logo.png" alt="XERO" className="h-8 object-contain" />
        {onClose && (
          <button onClick={onClose} className="text-[#6B7A6B] hover:text-white transition-colors lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all group',
                active ? 'bg-[#5B8A3C] text-white' : 'text-[#6B7A6B] hover:text-white hover:bg-[#1E261E]'
              )}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#1E261E]">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-[#6B7A6B] hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
