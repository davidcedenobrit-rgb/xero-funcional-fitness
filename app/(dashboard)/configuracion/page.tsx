'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Settings, Save, CheckCircle } from 'lucide-react'

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    nombre_sistema: 'XERO Funcional Fitness',
    moneda: '$',
    ruc: '',
    direccion: '',
    telefono: '',
  })

  useEffect(() => {
    const fetchConfig = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('configuracion').select('*').eq('id', 1).single()
      if (data) setForm({
        nombre_sistema: data.nombre_sistema || 'XERO Funcional Fitness',
        moneda: data.moneda || '$',
        ruc: data.ruc || '',
        direccion: data.direccion || '',
        telefono: data.telefono || '',
      })
      setLoading(false)
    }
    fetchConfig()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('configuracion').upsert([{ id: 1, ...form }])
    setSuccess(true)
    setSaving(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#5B8A3C] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-4xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          Configuración <span className="text-[#5B8A3C]">del Sistema</span>
        </h1>
        <p className="text-[#6B7A6B] text-sm mt-1">Datos generales de XERO Funcional Fitness</p>
      </div>

      {success && (
        <div className="bg-[#5B8A3C]/10 border border-[#5B8A3C]/30 rounded-xl px-4 py-3 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-[#5B8A3C]" />
          <p className="text-[#5B8A3C] text-sm">¡Configuración guardada correctamente!</p>
        </div>
      )}

      <div className="bg-[#141614] border border-[#1E261E] rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#5B8A3C]/10 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#5B8A3C]" />
          </div>
          <div>
            <p className="text-white font-bold">Información del Gimnasio</p>
            <p className="text-[#6B7A6B] text-xs">Esta info aparece en reportes y comprobantes</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: 'Nombre del Sistema', name: 'nombre_sistema', placeholder: 'XERO Funcional Fitness' },
            { label: 'Símbolo de Moneda', name: 'moneda', placeholder: '$' },
            { label: 'RUC / NIT / RFC', name: 'ruc', placeholder: '12345678901' },
            { label: 'Teléfono', name: 'telefono', placeholder: '+1 999 123 456' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">{f.label}</label>
              <input name={f.name} value={(form as any)[f.name]} onChange={handleChange} placeholder={f.placeholder}
                className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors" />
            </div>
          ))}
          <div>
            <label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Dirección</label>
            <textarea name="direccion" value={form.direccion} onChange={handleChange} rows={2}
              placeholder="Av. Principal 123, Ciudad"
              className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors resize-none" />
          </div>

          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#5B8A3C] hover:bg-[#4A7230] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-wider"
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </form>
      </div>

      {/* Logo preview */}
      <div className="bg-[#141614] border border-[#1E261E] rounded-2xl p-6">
        <p className="text-[#6B7A6B] text-xs uppercase tracking-widest mb-4">Logo actual</p>
        <img src="/xero-logo.png" alt="XERO Logo" className="h-12 object-contain" />
      </div>
    </div>
  )
}
