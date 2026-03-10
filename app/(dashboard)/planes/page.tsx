'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Plan } from '@/lib/types'
import { Plus, Layers, Edit, ToggleLeft, ToggleRight } from 'lucide-react'

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editPlan, setEditPlan] = useState<Plan | null>(null)
  const [form, setForm] = useState({ nombre: '', precio: '', duracion_dias: '', descripcion: '' })

  const fetchPlanes = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('planes').select('*').order('precio')
    setPlanes(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchPlanes() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const payload = { ...form, precio: parseFloat(form.precio), duracion_dias: parseInt(form.duracion_dias), estado: 'activo' }
    if (editPlan) {
      await supabase.from('planes').update(payload).eq('id', editPlan.id)
    } else {
      await supabase.from('planes').insert([payload])
    }
    setShowForm(false)
    setEditPlan(null)
    setForm({ nombre: '', precio: '', duracion_dias: '', descripcion: '' })
    fetchPlanes()
  }

  const startEdit = (p: Plan) => {
    setEditPlan(p)
    setForm({ nombre: p.nombre, precio: p.precio.toString(), duracion_dias: p.duracion_dias.toString(), descripcion: p.descripcion })
    setShowForm(true)
  }

  const toggleEstado = async (p: Plan) => {
    const supabase = createClient()
    await supabase.from('planes').update({ estado: p.estado === 'activo' ? 'inactivo' : 'activo' }).eq('id', p.id)
    fetchPlanes()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Planes de <span className="text-[#5B8A3C]">Membresía</span>
          </h1>
          <p className="text-[#6B7A6B] text-sm mt-1">{planes.filter(p => p.estado === 'activo').length} planes activos</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditPlan(null); setForm({ nombre: '', precio: '', duracion_dias: '', descripcion: '' }) }}
          className="inline-flex items-center gap-2 bg-[#5B8A3C] hover:bg-[#4A7230] text-white font-bold px-5 py-3 rounded-xl transition-colors uppercase tracking-wider text-sm"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          <Plus className="w-4 h-4" /> Nuevo Plan
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[#141614] border border-[#5B8A3C]/30 rounded-2xl p-6 animate-fade-in">
          <h2 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">{editPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Nombre del Plan', name: 'nombre', placeholder: 'Ej: Mensual Premium' },
              { label: 'Precio ($)', name: 'precio', placeholder: '49.99' },
              { label: 'Duración (días)', name: 'duracion_dias', placeholder: '30' },
              { label: 'Descripción', name: 'descripcion', placeholder: 'Acceso completo...' },
            ].map(f => (
              <div key={f.name} className={f.name === 'descripcion' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs text-[#6B7A6B] mb-2 uppercase tracking-wider">{f.label}</label>
                <input
                  name={f.name} value={(form as any)[f.name]} required
                  onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-2.5 text-white placeholder-[#555] focus:outline-none focus:border-[#5B8A3C] transition-colors text-sm"
                />
              </div>
            ))}
            <div className="sm:col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-[#1E261E] text-[#6B7A6B] hover:text-white rounded-xl transition-colors text-sm">Cancelar</button>
              <button type="submit" className="flex-1 bg-[#5B8A3C] hover:bg-[#4A7230] text-white font-bold py-2.5 rounded-xl transition-colors text-sm uppercase">{editPlan ? 'Actualizar' : 'Crear Plan'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-[#5B8A3C] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {planes.map(plan => (
            <div key={plan.id} className={`bg-[#141614] border rounded-2xl p-6 transition-all ${plan.estado === 'activo' ? 'border-[#1E261E] hover:border-[#5B8A3C]/50' : 'border-[#1E261E] opacity-50'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#5B8A3C]/10 rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[#5B8A3C]" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${plan.estado === 'activo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {plan.estado}
                </span>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{plan.nombre}</h3>
              <p className="text-[#6B7A6B] text-xs mb-4">{plan.descripcion || 'Sin descripción'}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-[#5B8A3C]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>${plan.precio}</p>
                  <p className="text-[#444] text-xs">{plan.duracion_dias} días</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(plan)} className="p-2 text-[#6B7A6B] hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => toggleEstado(plan)} className="p-2 text-[#6B7A6B] hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">
                    {plan.estado === 'activo' ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
