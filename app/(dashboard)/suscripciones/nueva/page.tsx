'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, CreditCard, CheckCircle, Zap } from 'lucide-react'

const FORMAS_PAGO = [
  { value: 'efectivo',     label: '💵 Efectivo' },
  { value: 'zelle',        label: '💙 Zelle' },
  { value: 'usdt',         label: '🪙 USDT' },
  { value: 'pagomovil',    label: '📱 Pago Móvil' },
  { value: 'transferencia',label: '🏦 Transferencia Bancaria' },
]

export default function NuevaSuscripcionPage() {
  const router = useRouter()
  const [socios, setSocios] = useState<any[]>([])
  const [planes, setPlanes] = useState<any[]>([])
  const [socioId, setSocioId] = useState('')
  const [planId, setPlanId] = useState('')
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0])
  const [formaPago, setFormaPago] = useState('efectivo')
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from('socios').select('id, nombre, dni').eq('estado', 'activo').order('nombre'),
        supabase.from('planes').select('*').eq('estado', 'activo').order('precio'),
      ])
      setSocios(s || [])
      setPlanes(p || [])
    }
    fetchData()
  }, [])

  useEffect(() => {
    const plan = planes.find(p => p.id == planId)
    setSelectedPlan(plan || null)
  }, [planId, planes])

  const fechaFin = selectedPlan
    ? new Date(new Date(fechaInicio).getTime() + selectedPlan.duracion_dias * 86400000).toISOString().split('T')[0]
    : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan) return
    setLoading(true)
    setError('')
    const supabase = createClient()

    // 1. Crear suscripción con forma de pago
    const { data: susc, error: e1 } = await supabase.from('suscripciones').insert([{
      socio_id: parseInt(socioId),
      plan_id: parseInt(planId),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      estado: 'activa',
      monto_pagado: selectedPlan.precio,
      forma_pago: formaPago,
    }]).select().single()

    if (e1) { setError(e1.message); setLoading(false); return }

    // 2. Registrar en movimientos de caja si hay caja abierta
    const { data: caja } = await supabase.from('cajas').select('id').eq('estado', 'abierta').single()
    if (caja) {
      await supabase.from('movimientos_caja').insert([{
        caja_id: caja.id,
        tipo: 'ingreso',
        descripcion: `Suscripción: ${socios.find(s => s.id == socioId)?.nombre} — ${selectedPlan.nombre}`,
        monto: selectedPlan.precio,
        forma_pago: formaPago,
      }])
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-[#5B8A3C]/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-[#5B8A3C]" />
          </div>
          <h2 className="text-3xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            ¡Pago <span className="text-[#5B8A3C]">Registrado!</span>
          </h2>
          <p className="text-[#6B7A6B]">Suscripción creada · Forma de pago: <span className="text-white font-medium">{FORMAS_PAGO.find(f => f.value === formaPago)?.label}</span></p>
          <div className="flex gap-3 justify-center pt-2">
            <Link href="/suscripciones" className="px-5 py-3 border border-[#1E261E] text-[#6B7A6B] hover:text-white rounded-xl transition-colors text-sm">Ver Suscripciones</Link>
            <button onClick={() => { setSuccess(false); setSocioId(''); setPlanId(''); setFormaPago('efectivo') }}
              className="px-5 py-3 bg-[#5B8A3C] text-white font-bold rounded-xl text-sm uppercase">
              Nuevo Pago
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <div className="flex items-center gap-4">
        <Link href="/suscripciones" className="p-2 text-[#6B7A6B] hover:text-white hover:bg-[#1E261E] rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-4xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Registrar <span className="text-[#5B8A3C]">Pago</span>
          </h1>
          <p className="text-[#6B7A6B] text-sm">Crea suscripción y registra el ingreso automáticamente</p>
        </div>
      </div>

      <div className="bg-[#141614] border border-[#1E261E] rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Socio */}
          <div>
            <label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Miembro *</label>
            <select value={socioId} onChange={e => setSocioId(e.target.value)} required
              className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5B8A3C] transition-colors">
              <option value="">— Selecciona un miembro —</option>
              {socios.map(s => <option key={s.id} value={s.id}>{s.nombre} (DNI: {s.dni})</option>)}
            </select>
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Plan *</label>
            <select value={planId} onChange={e => setPlanId(e.target.value)} required
              className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5B8A3C] transition-colors">
              <option value="">— Selecciona un plan —</option>
              {planes.map(p => <option key={p.id} value={p.id}>{p.nombre} — ${p.precio} ({p.duracion_dias} días)</option>)}
            </select>
          </div>

          {/* Fecha inicio */}
          <div>
            <label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Fecha de Inicio</label>
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
              className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5B8A3C] transition-colors" />
          </div>

          {/* Forma de pago */}
          <div>
            <label className="block text-sm text-[#6B7A6B] mb-3 uppercase tracking-wider">Forma de Pago *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FORMAS_PAGO.map(fp => (
                <button key={fp.value} type="button" onClick={() => setFormaPago(fp.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    formaPago === fp.value
                      ? 'bg-[#5B8A3C]/20 border-[#5B8A3C] text-[#5B8A3C]'
                      : 'bg-[#0A0C0A] border-[#1E261E] text-[#6B7A6B] hover:border-[#5B8A3C]/50'
                  }`}>
                  {fp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resumen */}
          {selectedPlan && (
            <div className="bg-[#0A0C0A] border border-[#5B8A3C]/20 rounded-xl p-5 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#5B8A3C]" />
                <span className="text-xs text-[#6B7A6B] uppercase tracking-widest">Resumen del Cobro</span>
              </div>
              {[
                { label: 'Plan', value: selectedPlan.nombre },
                { label: 'Duración', value: `${selectedPlan.duracion_dias} días` },
                { label: 'Vencimiento', value: new Date(fechaFin).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'Forma de pago', value: FORMAS_PAGO.find(f => f.value === formaPago)?.label },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-[#6B7A6B]">{r.label}</span>
                  <span className="text-white">{r.value}</span>
                </div>
              ))}
              <div className="border-t border-[#1E261E] pt-3 flex justify-between">
                <span className="text-[#6B7A6B] font-medium">Total a Cobrar</span>
                <span className="text-2xl font-black text-[#5B8A3C]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  ${selectedPlan.precio}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/suscripciones" className="flex-1 text-center py-3 border border-[#1E261E] text-[#6B7A6B] hover:text-white rounded-xl transition-colors text-sm">Cancelar</Link>
            <button type="submit" disabled={loading || !selectedPlan || !socioId}
              className="flex-1 flex items-center justify-center gap-2 bg-[#5B8A3C] hover:bg-[#4A7230] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-wider text-sm"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              <CreditCard className="w-4 h-4" />
              {loading ? 'Procesando...' : 'Cobrar y Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
