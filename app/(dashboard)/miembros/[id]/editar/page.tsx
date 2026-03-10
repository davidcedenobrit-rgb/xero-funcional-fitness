'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Save, CheckCircle } from 'lucide-react'

export default function EditarMiembroPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre: '', dni: '', telefono: '', email: '',
    fecha_nacimiento: '', direccion: '', estado: 'activo'
  })

  useEffect(() => {
    const fetchMiembro = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('socios').select('*').eq('id', id).single()
      if (data) {
        setForm({
          nombre: data.nombre || '',
          dni: data.dni || '',
          telefono: data.telefono || '',
          email: data.email || '',
          fecha_nacimiento: data.fecha_nacimiento || '',
          direccion: data.direccion || '',
          estado: data.estado || 'activo',
        })
      }
      setLoading(false)
    }
    fetchMiembro()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from('socios').update(form).eq('id', id)
    if (error) { setError(error.message); setSaving(false) }
    else {
      setSuccess(true)
      setTimeout(() => router.push('/miembros'), 1500)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#5B8A3C] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/miembros" className="p-2 text-[#6B7A6B] hover:text-white hover:bg-[#1E261E] rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-4xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Editar <span className="text-[#5B8A3C]">Miembro</span>
          </h1>
          <p className="text-[#6B7A6B] text-sm">Actualiza los datos del miembro</p>
        </div>
      </div>

      {success && (
        <div className="bg-[#5B8A3C]/10 border border-[#5B8A3C]/30 rounded-xl px-4 py-3 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-[#5B8A3C]" />
          <p className="text-[#5B8A3C] text-sm">¡Miembro actualizado correctamente! Redirigiendo...</p>
        </div>
      )}

      <div className="bg-[#141614] border border-[#1E261E] rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Nombre Completo *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} required
                className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5B8A3C] transition-colors" />
            </div>
            {[
              { label: 'DNI / Documento', name: 'dni', required: true },
              { label: 'Teléfono', name: 'telefono' },
              { label: 'Email', name: 'email', type: 'email' },
              { label: 'Fecha de Nacimiento', name: 'fecha_nacimiento', type: 'date' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">{f.label}</label>
                <input name={f.name} type={f.type || 'text'} value={(form as any)[f.name]}
                  onChange={handleChange} required={f.required}
                  className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5B8A3C] transition-colors" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Dirección</label>
              <textarea name="direccion" value={form.direccion} onChange={handleChange} rows={2}
                className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5B8A3C] transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange}
                className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5B8A3C] transition-colors">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"><p className="text-red-400 text-sm">{error}</p></div>}

          <div className="flex gap-3 pt-2">
            <Link href="/miembros" className="flex-1 text-center py-3 border border-[#1E261E] text-[#6B7A6B] hover:text-white rounded-xl transition-colors text-sm">Cancelar</Link>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-[#5B8A3C] hover:bg-[#4A7230] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-wider text-sm"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
