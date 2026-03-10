'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, UserPlus } from 'lucide-react'

export default function NuevoMiembroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre: '', dni: '', telefono: '', email: '',
    fecha_nacimiento: '', direccion: '', estado: 'activo'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from('socios').insert([form])
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/miembros')
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/miembros" className="p-2 text-[#6B7A6B] hover:text-white hover:bg-[#1E261E] rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-4xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Nuevo <span className="text-[#5B8A3C]">Miembro</span>
          </h1>
          <p className="text-[#6B7A6B] text-sm">Registra un nuevo miembro de XERO</p>
        </div>
      </div>

      <div className="bg-[#141614] border border-[#1E261E] rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Nombre Completo *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Juan Pérez"
                className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors" />
            </div>
            {[
              { label: 'DNI / Documento', name: 'dni', placeholder: '12345678', required: true },
              { label: 'Teléfono', name: 'telefono', placeholder: '+1 999 123 456' },
              { label: 'Email', name: 'email', placeholder: 'juan@email.com', type: 'email' },
              { label: 'Fecha de Nacimiento', name: 'fecha_nacimiento', type: 'date' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">{f.label}{f.required ? ' *' : ''}</label>
                <input name={f.name} type={f.type || 'text'} value={(form as any)[f.name]}
                  onChange={handleChange} required={f.required} placeholder={f.placeholder}
                  className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Dirección</label>
              <textarea name="direccion" value={form.direccion} onChange={handleChange} rows={2}
                placeholder="Calle Principal 123"
                className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors resize-none" />
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
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#5B8A3C] hover:bg-[#4A7230] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-wider text-sm"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              <UserPlus className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Registrar Miembro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
