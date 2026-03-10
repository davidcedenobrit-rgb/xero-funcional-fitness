'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Socio } from '@/lib/types'
import { UserPlus, Search, CheckCircle, XCircle, Edit } from 'lucide-react'

export default function MiembrosPage() {
  const [miembros, setMiembros] = useState<Socio[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchMiembros = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('socios').select('*').order('nombre')
    setMiembros(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchMiembros() }, [])

  const toggleEstado = async (id: number, estado: string) => {
    const supabase = createClient()
    await supabase.from('socios').update({ estado: estado === 'activo' ? 'inactivo' : 'activo' }).eq('id', id)
    fetchMiembros()
  }

  const filtered = miembros.filter(s =>
    s.nombre.toLowerCase().includes(search.toLowerCase()) ||
    s.dni.includes(search) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Miembros <span className="text-[#5B8A3C]">Registrados</span>
          </h1>
          <p className="text-[#6B7A6B] text-sm mt-1">{miembros.filter(s => s.estado === 'activo').length} activos de {miembros.length} total</p>
        </div>
        <Link href="/miembros/nuevo"
          className="inline-flex items-center gap-2 bg-[#5B8A3C] hover:bg-[#4A7230] text-white font-bold px-5 py-3 rounded-xl transition-colors uppercase tracking-wider text-sm"
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          <UserPlus className="w-4 h-4" /> Nuevo Miembro
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
        <input type="text" placeholder="Buscar por nombre, DNI o email..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#141614] border border-[#1E261E] rounded-xl pl-11 pr-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors"
        />
      </div>

      <div className="bg-[#141614] border border-[#1E261E] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-[#5B8A3C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#444]"><p>No se encontraron miembros</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E261E]">
                  {['Miembro', 'DNI', 'Teléfono', 'Email', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-[#6B7A6B] text-xs uppercase tracking-widest font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(miembro => (
                  <tr key={miembro.id} className="border-b border-[#1E261E] last:border-0 hover:bg-[#1E261E]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#5B8A3C]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#5B8A3C] text-sm font-bold">{miembro.nombre.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{miembro.nombre}</p>
                          <p className="text-[#444] text-xs">{new Date(miembro.created_at).toLocaleDateString('es')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#6B7A6B] text-sm">{miembro.dni}</td>
                    <td className="px-6 py-4 text-[#6B7A6B] text-sm">{miembro.telefono || '—'}</td>
                    <td className="px-6 py-4 text-[#6B7A6B] text-sm">{miembro.email || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${
                        miembro.estado === 'activo' ? 'bg-[#5B8A3C]/10 text-[#5B8A3C]' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {miembro.estado === 'activo' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {miembro.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/miembros/${miembro.id}/editar`}
                          className="p-2 text-[#6B7A6B] hover:text-white hover:bg-[#1E261E] rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => toggleEstado(miembro.id, miembro.estado)}
                          className="p-2 text-[#6B7A6B] hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">
                          {miembro.estado === 'activo' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
