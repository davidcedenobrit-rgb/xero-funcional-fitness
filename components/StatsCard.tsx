'use client'

import clsx from 'clsx'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  color?: string
  subtitle?: string
}

const colorMap: Record<string, { bg: string; icon: string; border: string; text: string }> = {
  green:   { bg: 'bg-[#5B8A3C]/10', icon: 'text-[#5B8A3C]', border: 'border-l-[#5B8A3C]', text: 'text-[#5B8A3C]' },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-l-emerald-500', text: 'text-emerald-400' },
  red:     { bg: 'bg-red-500/10', icon: 'text-red-400', border: 'border-l-red-500', text: 'text-red-400' },
  gray:    { bg: 'bg-[#9CA89C]/10', icon: 'text-[#9CA89C]', border: 'border-l-[#9CA89C]', text: 'text-[#9CA89C]' },
  orange:  { bg: 'bg-[#5B8A3C]/10', icon: 'text-[#5B8A3C]', border: 'border-l-[#5B8A3C]', text: 'text-[#5B8A3C]' },
}

export default function StatsCard({ title, value, icon: Icon, color = 'gray', subtitle }: StatsCardProps) {
  const c = colorMap[color] ?? colorMap['gray']
  return (
    <div className={clsx('bg-[#141614] border border-[#1E261E] border-l-4 rounded-2xl p-6 animate-fade-in', c.border)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#6B7A6B] text-xs uppercase tracking-widest mb-2">{title}</p>
          <p className={clsx('text-3xl font-black', c.text)} style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            {value}
          </p>
          {subtitle && <p className="text-[#444] text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', c.bg)}>
          <Icon className={clsx('w-6 h-6', c.icon)} />
        </div>
      </div>
    </div>
  )
}
