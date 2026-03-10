'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { DollarSign, Lock, Unlock, TrendingUp, TrendingDown } from 'lucide-react'

const FORMAS_PAGO = [
  { value: 'efectivo',      label: '💵 Efectivo',             color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
  { value: 'zelle',         label: '💙 Zelle',                color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  { value: 'usdt',          label: '🪙 USDT',                 color: 'text-teal-400',    bg: 'bg-teal-500/10' },
  { value: 'pagomovil',     label: '📱 Pago Móvil',           color: 'text-purple-400',  bg: 'bg-purple-500/10' },
  { value: 'transferencia', label: '🏦 Transferencia',        color: 'text-sky-400',     bg: 'bg-sky-500/10' },
]

export default function CajaPage() {
  const [cajaAbierta, setCajaAbierta] = useState<any>(null)
  const [historial, setHistorial] = useState<any[]>([])
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [montoInicial, setMontoInicial] = useState('')
  const [montoFisico, setMontoFisico] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState('')

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)

    const { data: caja } = await supabase.from('cajas').select('*').eq('estado', 'abierta').single()
    setCajaAbierta(caja || null)

    if (caja) {
      const { data: movs } = await supabase.from('movimientos_caja')
        .select('*').eq('caja_id', caja.id).order('created_at', { ascending: false })
      setMovimientos(movs || [])
    }

    const { data: hist } = await supabase.from('cajas').select('*')
      .eq('estado', 'cerrada').order('fecha_apertura', { ascending: false }).limit(5)
    setHistorial(hist || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const abrirCaja = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('cajas').insert([{ usuario_id: userId, monto_inicial: parseFloat(montoInicial), estado: 'abierta' }])
    setMontoInicial('')
    setSaving(false)
    fetchData()
  }

  const cerrarCaja = async () => {
    if (!cajaAbierta || !montoFisico) return
    setSaving(true)
    const supabase = createClient()
    const totalVentas = movimientos.filter(m => m.tipo === 'ingreso').reduce((s: number, m: any) => s + m.monto, 0)
    const totalGastos = movimientos.filter(m => m.tipo === 'egreso').reduce((s: number, m: any) => s + m.monto, 0)
    const saldoEsperado = cajaAbierta.monto_inicial + totalVentas - totalGastos
    const diferencia = parseFloat(montoFisico) - saldoEsperado
    await supabase.from('cajas').update({
      estado: 'cerrada', monto_final: parseFloat(montoFisico),
      total_ventas: totalVentas, total_gastos: totalGastos,
      diferencia, fecha_cierre: new Date().toISOString()
    }).eq('id', cajaAbierta.id)
    setMontoFisico('')
    setSaving(false)
    fetchData()
  }

  // Totales generales
  const totalVentas = movimientos.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0)
  const totalGastos = movimientos.filter(m => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0)
  const saldoEsperado = cajaAbierta ? cajaAbierta.monto_inicial + totalVentas - totalGastos : 0

  // Sumatoria por forma de pago (solo ingresos)
  const totalesPorFormaPago = FORMAS_PAGO.map(fp => ({
    ...fp,
    total: movimientos
      .filter(m => m.tipo === 'ingreso' && m.forma_pago === fp.value)
      .reduce((s, m) => s + m.monto, 0)
  })).filter(fp => fp.total > 0)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#5B8A3C] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          Control de <span className="text-[#5B8A3C]">Caja</span>
        </h1>
        <p className="text-[#6B7A6B] text-sm mt-1">
          Estado: <span className={`font-bold ${cajaAbierta ? 'text-[#5B8A3C]' : 'text-red-400'}`}>
            {cajaAbierta ? '🟢 Caja Abierta' : '🔴 Caja Cerrada'}
          </span>
        </p>
      </div>

      {!cajaAbierta ? (
        <div className="max-w-md space-y-6">
          {/* Apertura */}
          <div className="bg-[#141614] border border-[#1E261E] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#5B8A3C]/10 rounded-xl flex items-center justify-center">
                <Unlock className="w-6 h-6 text-[#5B8A3C]" />
              </div>
              <div>
                <h2 className="text-white font-bold uppercase tracking-wider">Apertura de Caja</h2>
                <p className="text-[#6B7A6B] text-sm">Monto inicial en efectivo</p>
              </div>
            </div>
            <form onSubmit={abrirCaja} className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Monto Inicial ($)</label>
                <input type="number" step="0.01" value={montoInicial} onChange={e => setMontoInicial(e.target.value)}
                  required placeholder="0.00"
                  className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors text-xl font-bold" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-[#5B8A3C] hover:bg-[#4A7230] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-wider"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                {saving ? 'Abriendo...' : 'Abrir Caja'}
              </button>
            </form>
          </div>

          {historial.length > 0 && (
            <div className="bg-[#141614] border border-[#1E261E] rounded-2xl p-6">
              <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Últimas Sesiones</h3>
              <div className="space-y-3">
                {historial.map(h => (
                  <div key={h.id} className="flex justify-between items-center py-2 border-b border-[#1E261E] last:border-0">
                    <div>
                      <p className="text-white text-sm">{new Date(h.fecha_apertura).toLocaleDateString('es')}</p>
                      <p className="text-[#6B7A6B] text-xs">Inicial: ${h.monto_inicial?.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${h.diferencia >= 0 ? 'text-[#5B8A3C]' : 'text-red-400'}`}>
                        {h.diferencia >= 0 ? '+' : ''}${h.diferencia?.toFixed(2)}
                      </p>
                      <p className="text-[#444] text-xs">diferencia</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Monto Inicial', value: `$${cajaAbierta.monto_inicial?.toFixed(2)}`, color: 'text-[#9CA89C]', bg: 'bg-[#9CA89C]/10', Icon: DollarSign },
              { label: 'Total Ingresos', value: `$${totalVentas.toFixed(2)}`, color: 'text-[#5B8A3C]', bg: 'bg-[#5B8A3C]/10', Icon: TrendingUp },
              { label: 'Total Egresos', value: `$${totalGastos.toFixed(2)}`, color: 'text-red-400', bg: 'bg-red-500/10', Icon: TrendingDown },
            ].map(k => (
              <div key={k.label} className="bg-[#141614] border border-[#1E261E] rounded-2xl p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${k.bg}`}>
                  <k.Icon className={`w-6 h-6 ${k.color}`} />
                </div>
                <div>
                  <p className="text-[#6B7A6B] text-xs uppercase tracking-wider">{k.label}</p>
                  <p className={`text-2xl font-black ${k.color}`} style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>{k.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Sumatoria por forma de pago */}
          {totalesPorFormaPago.length > 0 && (
            <div className="bg-[#141614] border border-[#1E261E] rounded-2xl p-6">
              <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-4">💳 Ingresos por Forma de Pago</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {FORMAS_PAGO.map(fp => {
                  const total = movimientos
                    .filter(m => m.tipo === 'ingreso' && m.forma_pago === fp.value)
                    .reduce((s, m) => s + m.monto, 0)
                  return (
                    <div key={fp.value} className={`rounded-xl p-4 border ${total > 0 ? 'border-[#1E261E] ' + fp.bg : 'border-[#1E261E] opacity-30'}`}>
                      <p className="text-xs text-[#6B7A6B] mb-1">{fp.label}</p>
                      <p className={`text-xl font-black ${total > 0 ? fp.color : 'text-[#444]'}`}
                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                        ${total.toFixed(2)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Movimientos */}
            <div className="lg:col-span-2 bg-[#141614] border border-[#1E261E] rounded-2xl p-6">
              <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Movimientos de esta sesión</h3>
              {movimientos.length === 0 ? (
                <p className="text-[#444] text-sm text-center py-8">Sin movimientos aún</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {movimientos.map(m => (
                    <div key={m.id} className="flex items-center justify-between px-4 py-3 bg-[#0A0C0A] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.tipo === 'ingreso' ? 'bg-[#5B8A3C]' : 'bg-red-400'}`} />
                        <div>
                          <p className="text-white text-sm">{m.descripcion}</p>
                          {m.forma_pago && (
                            <p className="text-[#444] text-xs">{FORMAS_PAGO.find(f => f.value === m.forma_pago)?.label}</p>
                          )}
                        </div>
                      </div>
                      <span className={`font-bold text-sm flex-shrink-0 ${m.tipo === 'ingreso' ? 'text-[#5B8A3C]' : 'text-red-400'}`}>
                        {m.tipo === 'ingreso' ? '+' : '-'}${m.monto?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cierre */}
            <div className="bg-[#141614] border border-[#1E261E] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-red-400" />
                <h3 className="text-white font-bold uppercase tracking-wider text-sm">Cerrar Caja</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-[#0A0C0A] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7A6B]">Saldo esperado</span>
                    <span className="text-white font-bold">${saldoEsperado.toFixed(2)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Monto físico en caja</label>
                  <input type="number" step="0.01" value={montoFisico} onChange={e => setMontoFisico(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors" />
                </div>
                {montoFisico && (
                  <div className={`rounded-xl p-3 text-center ${parseFloat(montoFisico) - saldoEsperado >= 0 ? 'bg-[#5B8A3C]/10' : 'bg-red-500/10'}`}>
                    <p className="text-[#6B7A6B] text-xs uppercase">Diferencia</p>
                    <p className={`text-2xl font-black ${parseFloat(montoFisico) - saldoEsperado >= 0 ? 'text-[#5B8A3C]' : 'text-red-400'}`}
                      style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                      {parseFloat(montoFisico) - saldoEsperado >= 0 ? '+' : ''}${(parseFloat(montoFisico) - saldoEsperado).toFixed(2)}
                    </p>
                  </div>
                )}
                <button onClick={cerrarCaja} disabled={saving || !montoFisico}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 disabled:opacity-50 text-red-400 font-bold py-3 rounded-xl transition-colors uppercase tracking-wider text-sm"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {saving ? 'Cerrando...' : 'Cerrar Caja'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
