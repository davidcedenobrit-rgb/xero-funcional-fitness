'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { CreditCard, Plus, CheckCircle, XCircle, Clock, AlertTriangle, Search } from 'lucide-react'

const FORMAS_PAGO: Record<string, string> = {
  efectivo:      '💵 Efectivo',
  zelle:         '💙 Zelle',
  usdt:          '🪙 USDT',
  pagomovil:     '📱 Pago Móvil',
  transferencia: '🏦 Transferencia',
}

export default function SuscripcionesPage() {
  const [suscripciones, setSuscripciones] = useState<any[]>([])
  const [porCobrar, setPorCobrar] = useState<any[]>([])
  const [tab, setTab] = useState<'todas' | 'porcobrar'>('todas')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const supabase = createClient()
    const hoy = new Date().toISOString().split('T')[0]
    const en7dias = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

    const [{ data: suscs }, { data: venc }] = await Promise.all([
      supabase.from('suscripciones')
        .select('*, socios(nombre, dni), planes(nombre, precio)')
        .order('created_at', { ascending: false }),
      supabase.from('suscripciones')
        .select('*, socios(nombre, dni, telefono), planes(nombre, precio)')
        .eq('estado', 'activa')
        .lte('fecha_fin', en7dias)
        .order('fecha_fin', { ascending: true }),
    ])

    setSuscripciones(suscs || [])
    setPorCobrar(venc || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const estadoConfig: Record<string, { color: string; icon: any; label: string }> = {
    activa:    { color: 'bg-[#5B8A3C]/10 text-[#5B8A3C]', icon: CheckCircle, label: 'Activa' },
    vencida:   { color: 'bg-amber-500/10 text-amber-400', icon: Clock,        label: 'Vencida' },
    cancelada: { color: 'bg-red-500/10 text-red-400',     icon: XCircle,      label: 'Cancelada' },
  }

  const filtered = suscripciones.filter(s =>
    s.socios?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    s.socios?.dni?.includes(search)
  )

  const diasRestantes = (fecha_fin: string) => {
    const diff = Math.ceil((new Date(fecha_fin).getTime() - Date.now()) / 86400000)
    return diff
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Suscripciones & <span className="text-[#5B8A3C]">Pagos</span>
          </h1>
          <p className="text-[#6B7A6B] text-sm mt-1">
            {suscripciones.filter(s => s.estado === 'activa').length} activas ·
            <span className="text-amber-400 font-medium"> {porCobrar.length} por cobrar esta semana</span>
          </p>
        </div>
        <Link href="/suscripciones/nueva"
          className="inline-flex items-center gap-2 bg-[#5B8A3C] hover:bg-[#4A7230] text-white font-bold px-5 py-3 rounded-xl transition-colors uppercase tracking-wider text-sm"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          <Plus className="w-4 h-4" /> Registrar Pago
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'todas', label: 'Todos los Pagos' },
          { key: 'porcobrar', label: `⚠️ Por Cobrar (${porCobrar.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-[#5B8A3C] text-white'
                : 'bg-[#141614] border border-[#1E261E] text-[#6B7A6B] hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'porcobrar' ? (
        /* TABLA POR COBRAR */
        <div className="bg-[#141614] border border-amber-500/20 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1E261E] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">Membresías por vencer — próximos 7 días</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-[#5B8A3C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : porCobrar.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="w-12 h-12 text-[#5B8A3C] mx-auto mb-3" />
              <p className="text-[#6B7A6B]">¡Sin vencimientos esta semana! 🎉</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1E261E]">
                    {['Miembro', 'Teléfono', 'Plan', 'Monto', 'Vence', 'Días', 'Acción'].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-[#6B7A6B] text-xs uppercase tracking-widest font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {porCobrar.map(s => {
                    const dias = diasRestantes(s.fecha_fin)
                    return (
                      <tr key={s.id} className="border-b border-[#1E261E] last:border-0 hover:bg-[#1E261E]/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                              <span className="text-amber-400 text-sm font-bold">{s.socios?.nombre?.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{s.socios?.nombre}</p>
                              <p className="text-[#444] text-xs">{s.socios?.dni}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#6B7A6B] text-sm">{s.socios?.telefono || '—'}</td>
                        <td className="px-6 py-4 text-[#6B7A6B] text-sm">{s.planes?.nombre}</td>
                        <td className="px-6 py-4 text-[#5B8A3C] font-bold text-sm">${s.planes?.precio?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-[#6B7A6B] text-sm">{new Date(s.fecha_fin).toLocaleDateString('es')}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                            dias <= 0 ? 'bg-red-500/10 text-red-400' :
                            dias <= 3 ? 'bg-amber-500/10 text-amber-400' :
                            'bg-[#5B8A3C]/10 text-[#5B8A3C]'
                          }`}>
                            {dias <= 0 ? 'Vencido' : `${dias}d`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href="/suscripciones/nueva"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#5B8A3C]/10 hover:bg-[#5B8A3C]/20 text-[#5B8A3C] text-xs font-medium rounded-lg transition-colors">
                            <CreditCard className="w-3 h-3" /> Cobrar
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* TABLA GENERAL */
        <>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
            <input type="text" placeholder="Buscar por nombre o DNI..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#141614] border border-[#1E261E] rounded-xl pl-11 pr-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors" />
          </div>

          <div className="bg-[#141614] border border-[#1E261E] rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-[#5B8A3C] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <CreditCard className="w-12 h-12 text-[#333] mx-auto" />
                <p className="text-[#444]">Sin suscripciones registradas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1E261E]">
                      {['Miembro', 'Plan', 'Monto', 'Forma Pago', 'Inicio', 'Vencimiento', 'Estado'].map(h => (
                        <th key={h} className="text-left px-6 py-4 text-[#6B7A6B] text-xs uppercase tracking-widest font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => {
                      const cfg = estadoConfig[s.estado] || estadoConfig.vencida
                      const Icon = cfg.icon
                      return (
                        <tr key={s.id} className="border-b border-[#1E261E] last:border-0 hover:bg-[#1E261E]/40 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white text-sm font-medium">{s.socios?.nombre}</p>
                              <p className="text-[#444] text-xs">{s.socios?.dni}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#6B7A6B] text-sm">{s.planes?.nombre}</td>
                          <td className="px-6 py-4 text-[#5B8A3C] font-bold text-sm">${s.monto_pagado?.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs bg-[#1E261E] text-[#9CA89C] px-2 py-1 rounded-lg">
                              {FORMAS_PAGO[s.forma_pago] || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#6B7A6B] text-sm">{new Date(s.fecha_inicio).toLocaleDateString('es')}</td>
                          <td className="px-6 py-4 text-[#6B7A6B] text-sm">{new Date(s.fecha_fin).toLocaleDateString('es')}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${cfg.color}`}>
                              <Icon className="w-3 h-3" />{cfg.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
