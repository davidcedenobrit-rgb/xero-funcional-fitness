'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { TrendingDown, Plus, Trash2, Lock, X, AlertTriangle } from 'lucide-react'

const CATEGORIAS = ['Servicios', 'Equipamiento', 'Mantenimiento', 'Sueldos', 'Alquiler', 'Marketing', 'Otros']

const FORMAS_PAGO = [
  { value: 'efectivo',      label: '💵 Efectivo' },
  { value: 'zelle',         label: '💙 Zelle' },
  { value: 'usdt',          label: '🪙 USDT' },
  { value: 'pagomovil',     label: '📱 Pago Móvil' },
  { value: 'transferencia', label: '🏦 Transferencia' },
]

const CLAVE_ELIMINAR = 'XERO*g'

export default function GastosPage() {
  const [gastos, setGastos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Modal eliminar
  const [gastoAEliminar, setGastoAEliminar] = useState<any>(null)
  const [claveInput, setClaveInput] = useState('')
  const [claveError, setClaveError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    descripcion: '', monto: '', categoria: 'Servicios',
    forma_pago: 'efectivo',
    fecha: new Date().toISOString().split('T')[0]
  })

  const fetchGastos = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('gastos').select('*').order('fecha', { ascending: false }).limit(100)
    setGastos(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchGastos() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    // 1. Crear gasto
    const { data: gasto } = await supabase.from('gastos')
      .insert([{ ...form, monto: parseFloat(form.monto) }])
      .select().single()

    // 2. Si hay caja abierta, registrar egreso automáticamente
    const { data: caja } = await supabase.from('cajas').select('id').eq('estado', 'abierta').single()
    if (caja && gasto) {
      const { data: mov } = await supabase.from('movimientos_caja').insert([{
        caja_id: caja.id,
        tipo: 'egreso',
        descripcion: `Gasto: ${form.descripcion} (${CATEGORIAS.includes(form.categoria) ? form.categoria : 'Otros'})`,
        monto: parseFloat(form.monto),
        forma_pago: form.forma_pago,
      }]).select().single()

      // Guardar referencia al movimiento en el gasto
      if (mov) {
        await supabase.from('gastos').update({ caja_movimiento_id: mov.id }).eq('id', gasto.id)
      }
    }

    setShowForm(false)
    setForm({ descripcion: '', monto: '', categoria: 'Servicios', forma_pago: 'efectivo', fecha: new Date().toISOString().split('T')[0] })
    fetchGastos()
  }

  const abrirModalEliminar = (gasto: any) => {
    setGastoAEliminar(gasto)
    setClaveInput('')
    setClaveError('')
  }

  const confirmarEliminar = async () => {
    if (claveInput !== CLAVE_ELIMINAR) {
      setClaveError('Clave incorrecta. Intenta de nuevo.')
      return
    }
    setDeleting(true)
    const supabase = createClient()

    // Eliminar movimiento de caja si existe
    if (gastoAEliminar.caja_movimiento_id) {
      await supabase.from('movimientos_caja').delete().eq('id', gastoAEliminar.caja_movimiento_id)
    }

    // Eliminar gasto
    await supabase.from('gastos').delete().eq('id', gastoAEliminar.id)

    setGastoAEliminar(null)
    setClaveInput('')
    setDeleting(false)
    fetchGastos()
  }

  const totalMes = gastos.filter(g => {
    const now = new Date()
    const d = new Date(g.fecha)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((s, g) => s + g.monto, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Control de <span className="text-[#5B8A3C]">Gastos</span>
          </h1>
          <p className="text-[#6B7A6B] text-sm mt-1">
            Total este mes: <span className="text-red-400 font-bold">${totalMes.toFixed(2)}</span>
            <span className="text-[#444] ml-2">· Se registran automáticamente en caja</span>
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-[#5B8A3C] hover:bg-[#4A7230] text-white font-bold px-5 py-3 rounded-xl transition-colors uppercase tracking-wider text-sm"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          <Plus className="w-4 h-4" /> Nuevo Gasto
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-[#141614] border border-[#5B8A3C]/30 rounded-2xl p-6 animate-fade-in">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-[#6B7A6B] mb-2 uppercase tracking-wider">Descripción *</label>
              <input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} required
                placeholder="Ej: Pago de luz y agua del mes"
                className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#6B7A6B] mb-2 uppercase tracking-wider">Monto ($) *</label>
              <input type="number" step="0.01" value={form.monto}
                onChange={e => setForm({ ...form, monto: e.target.value })} required placeholder="150.00"
                className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#6B7A6B] mb-2 uppercase tracking-wider">Categoría</label>
              <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}
                className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5B8A3C] transition-colors">
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#6B7A6B] mb-2 uppercase tracking-wider">Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })}
                className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5B8A3C] transition-colors" />
            </div>

            {/* Forma de pago */}
            <div className="sm:col-span-2">
              <label className="block text-xs text-[#6B7A6B] mb-3 uppercase tracking-wider">Forma de Pago *</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {FORMAS_PAGO.map(fp => (
                  <button key={fp.value} type="button" onClick={() => setForm({ ...form, forma_pago: fp.value })}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      form.forma_pago === fp.value
                        ? 'bg-[#5B8A3C]/20 border-[#5B8A3C] text-[#5B8A3C]'
                        : 'bg-[#0A0C0A] border-[#1E261E] text-[#6B7A6B] hover:border-[#5B8A3C]/50'
                    }`}>
                    {fp.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-[#1E261E] text-[#6B7A6B] hover:text-white rounded-xl transition-colors text-sm">
                Cancelar
              </button>
              <button type="submit"
                className="flex-1 bg-[#5B8A3C] hover:bg-[#4A7230] text-white font-bold py-2.5 rounded-xl transition-colors text-sm uppercase">
                Registrar Gasto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-[#141614] border border-[#1E261E] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-[#5B8A3C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : gastos.length === 0 ? (
          <div className="text-center py-16">
            <TrendingDown className="w-12 h-12 text-[#333] mx-auto mb-3" />
            <p className="text-[#444]">Sin gastos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E261E]">
                  {['Descripción', 'Categoría', 'Forma Pago', 'Monto', 'Fecha', 'Caja', 'Eliminar'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-[#6B7A6B] text-xs uppercase tracking-widest font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gastos.map(g => (
                  <tr key={g.id} className="border-b border-[#1E261E] last:border-0 hover:bg-[#1E261E]/40 transition-colors">
                    <td className="px-6 py-4 text-white text-sm">{g.descripcion}</td>
                    <td className="px-6 py-4">
                      <span className="bg-[#1E261E] text-[#6B7A6B] text-xs px-3 py-1 rounded-lg">{g.categoria}</span>
                    </td>
                    <td className="px-6 py-4 text-[#6B7A6B] text-xs">
                      {FORMAS_PAGO.find(f => f.value === g.forma_pago)?.label || '—'}
                    </td>
                    <td className="px-6 py-4 text-red-400 font-bold text-sm">-${g.monto.toFixed(2)}</td>
                    <td className="px-6 py-4 text-[#6B7A6B] text-sm">{new Date(g.fecha).toLocaleDateString('es')}</td>
                    <td className="px-6 py-4">
                      {g.caja_movimiento_id
                        ? <span className="text-xs bg-[#5B8A3C]/10 text-[#5B8A3C] px-2 py-1 rounded-lg">✓ En caja</span>
                        : <span className="text-xs bg-[#1E261E] text-[#444] px-2 py-1 rounded-lg">Sin caja abierta</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => abrirModalEliminar(g)}
                        className="p-2 text-[#6B7A6B] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal eliminar con clave */}
      {gastoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setGastoAEliminar(null)} />
          <div className="relative bg-[#141614] border border-red-500/30 rounded-2xl p-8 w-full max-w-sm animate-fade-in">
            <button onClick={() => setGastoAEliminar(null)}
              className="absolute top-4 right-4 text-[#6B7A6B] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold uppercase tracking-wider">Eliminar Gasto</h3>
                <p className="text-[#6B7A6B] text-xs">Esta acción no se puede deshacer</p>
              </div>
            </div>

            {/* Resumen del gasto */}
            <div className="bg-[#0A0C0A] rounded-xl p-4 mb-5 space-y-1">
              <p className="text-white text-sm font-medium">{gastoAEliminar.descripcion}</p>
              <p className="text-red-400 font-bold">${gastoAEliminar.monto?.toFixed(2)}</p>
              {gastoAEliminar.caja_movimiento_id && (
                <p className="text-amber-400 text-xs mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  También se eliminará el movimiento de caja
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#6B7A6B] mb-2 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Ingresa la clave de seguridad
                </label>
                <input
                  type="password"
                  value={claveInput}
                  onChange={e => { setClaveInput(e.target.value); setClaveError('') }}
                  placeholder="••••••"
                  autoFocus
                  className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-red-500/50 transition-colors tracking-widest text-center text-lg"
                />
                {claveError && <p className="text-red-400 text-xs mt-1">{claveError}</p>}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setGastoAEliminar(null)}
                  className="flex-1 py-2.5 border border-[#1E261E] text-[#6B7A6B] hover:text-white rounded-xl transition-colors text-sm">
                  Cancelar
                </button>
                <button onClick={confirmarEliminar} disabled={deleting || !claveInput}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 disabled:opacity-50 text-red-400 font-bold py-2.5 rounded-xl transition-colors text-sm uppercase">
                  {deleting ? 'Eliminando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
