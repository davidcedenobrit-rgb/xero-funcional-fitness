'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ClipboardCheck, Search, UserCheck } from 'lucide-react'

export default function AsistenciaPage() {
  const [asistencias, setAsistencias] = useState<any[]>([])
  const [socios, setSocios] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchData = async () => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const [{ data: a }, { data: s }] = await Promise.all([
      supabase.from('asistencias').select('*, socios(nombre, dni)').gte('fecha_hora', today).order('fecha_hora', { ascending: false }),
      supabase.from('socios').select('id, nombre, dni').eq('estado', 'activo').order('nombre'),
    ])
    setAsistencias(a || [])
    setSocios(s || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const filteredSocios = socios.filter(s =>
    s.nombre.toLowerCase().includes(search.toLowerCase()) || s.dni.includes(search)
  )

  const registrarAsistencia = async (socio_id: number, nombre: string) => {
    setRegistering(true)
    const supabase = createClient()
    await supabase.from('asistencias').insert([{ socio_id }])
    setMsg(`✅ ${nombre} registrado`)
    setTimeout(() => setMsg(''), 3000)
    fetchData()
    setSearch('')
    setRegistering(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          Control de <span className="text-[#5B8A3C]">Asistencia</span>
        </h1>
        <p className="text-[#6B7A6B] text-sm mt-1">{asistencias.length} ingresos registrados hoy</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de registro */}
        <div className="bg-[#141614] border border-[#1E261E] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-5 h-5 text-[#5B8A3C]" />
            <h2 className="text-white font-bold uppercase tracking-wider text-sm">Registrar Ingreso</h2>
          </div>

          {msg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4 animate-fade-in">
              <p className="text-emerald-400 text-sm">{msg}</p>
            </div>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
            <input
              type="text" placeholder="Buscar por nombre o DNI..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl pl-11 pr-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#5B8A3C] transition-colors"
            />
          </div>

          {search && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredSocios.length === 0 ? (
                <p className="text-[#444] text-sm text-center py-4">Sin resultados</p>
              ) : filteredSocios.slice(0, 8).map(s => (
                <button key={s.id} onClick={() => registrarAsistencia(s.id, s.nombre)} disabled={registering}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#0A0C0A] border border-[#1E261E] hover:border-[#5B8A3C] rounded-xl transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#5B8A3C]/10 rounded-lg flex items-center justify-center">
                      <span className="text-[#5B8A3C] text-sm font-bold">{s.nombre.charAt(0)}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-white text-sm">{s.nombre}</p>
                      <p className="text-[#444] text-xs">{s.dni}</p>
                    </div>
                  </div>
                  <span className="text-[#5B8A3C] text-xs opacity-0 group-hover:opacity-100 transition-opacity">Registrar →</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de hoy */}
        <div className="bg-[#141614] border border-[#1E261E] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-white font-bold uppercase tracking-wider text-sm">Ingresos de Hoy</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-[#5B8A3C] border-t-transparent rounded-full animate-spin" /></div>
          ) : asistencias.length === 0 ? (
            <p className="text-[#444] text-sm text-center py-10">Sin registros hoy</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {asistencias.map(a => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3 bg-[#0A0C0A] rounded-xl">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 text-sm font-bold">{a.socios?.nombre?.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{a.socios?.nombre}</p>
                    <p className="text-[#444] text-xs">{a.socios?.dni}</p>
                  </div>
                  <span className="text-[#6B7A6B] text-xs">{new Date(a.fecha_hora).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
