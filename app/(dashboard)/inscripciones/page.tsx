'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
  ClipboardList, Search, CheckCircle, XCircle, Clock,
  AlertCircle, ChevronRight, X, Phone, Mail, Calendar,
  Dumbbell, User, FileText, RefreshCw, MessageCircle
} from 'lucide-react'

/* ── Types ─────────────────────────────────────────── */
type Estado = 'pendiente' | 'aprobado' | 'rechazado' | 'en_espera'

interface Inscripcion {
  id: string; created_at: string; updated_at: string; estado: Estado
  notas_admin: string | null
  nombre: string; edad: number | null; sexo: string | null
  telefono: string; correo: string | null; ocupacion: string | null; motivo: string | null
  plan: string | null; horario: string | null; comentario: string | null
  enfermedad: string | null; enfermedad_det: string | null
  cirugia: string | null; cirugia_det: string | null
  medicamento: string | null; medicamento_det: string | null
  alergia: string | null; alergia_det: string | null
  antecedentes: string | null; antecedentes_det: string | null
  actividad: string | null; actividad_det: string | null
  ultimos6: string | null; preferencias: string[] | null
  evitar: string | null; exp_negativa: string | null; exp_negativa_det: string | null
}

/* ── Constants ──────────────────────────────────────── */
const ESTADOS: { value: Estado; label: string; color: string; bg: string; icon: React.ReactNode }[] = [
  { value: 'pendiente',  label: 'Pendiente',  color: 'text-amber-400',  bg: 'bg-amber-400/10',  icon: <Clock className="w-3 h-3" /> },
  { value: 'aprobado',   label: 'Aprobado',   color: 'text-[#5B8A3C]',  bg: 'bg-[#5B8A3C]/10',  icon: <CheckCircle className="w-3 h-3" /> },
  { value: 'en_espera',  label: 'En espera',  color: 'text-blue-400',   bg: 'bg-blue-400/10',   icon: <AlertCircle className="w-3 h-3" /> },
  { value: 'rechazado',  label: 'Rechazado',  color: 'text-red-400',    bg: 'bg-red-400/10',    icon: <XCircle className="w-3 h-3" /> },
]

const PLAN_LABELS: Record<string, string> = {
  grupal: 'Grupales Semi-pers.', adulto_mayor: 'Adulto Mayor',
}

/* ── Helpers ────────────────────────────────────────── */
const estadoConf = (e: Estado) => ESTADOS.find(x => x.value === e) ?? ESTADOS[0]
const fmt = (d: string) => new Date(d).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
const fmtFull = (d: string) => new Date(d).toLocaleString('es-VE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const planLabel = (p: string | null) => p ? (PLAN_LABELS[p] ?? p) : '—'
const initials = (n: string) => n.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

/* ══════════════════════════════════════════════════════ */
export default function InscripcionesPage() {
  const [data, setData]       = useState<Inscripcion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filtroEstado, setFiltroEstado] = useState<Estado | 'all'>('all')
  const [selected, setSelected]         = useState<Inscripcion | null>(null)
  const [editEstado, setEditEstado]     = useState<Estado>('pendiente')
  const [editNotas, setEditNotas]       = useState('')
  const [saving, setSaving]             = useState(false)
  const [saveOk, setSaveOk]             = useState(false)

  const fetch = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: rows } = await supabase
      .from('xero_inscripciones')
      .select('*')
      .order('created_at', { ascending: false })
    setData(rows || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const filtered = data.filter(i => {
    if (filtroEstado !== 'all' && i.estado !== filtroEstado) return false
    if (search) {
      const q = search.toLowerCase()
      if (![i.nombre, i.correo, i.telefono].some(f => f?.toLowerCase().includes(q))) return false
    }
    return true
  })

  const stats = {
    total:     data.length,
    pendiente: data.filter(i => i.estado === 'pendiente').length,
    aprobado:  data.filter(i => i.estado === 'aprobado').length,
    en_espera: data.filter(i => i.estado === 'en_espera').length,
    rechazado: data.filter(i => i.estado === 'rechazado').length,
  }

  const openDetail = (i: Inscripcion) => {
    setSelected(i); setEditEstado(i.estado); setEditNotas(i.notas_admin ?? '')
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('xero_inscripciones')
      .update({ estado: editEstado, notas_admin: editNotas })
      .eq('id', selected.id)
    setSaving(false); setSaveOk(true)
    setTimeout(() => setSaveOk(false), 2000)
    setData(prev => prev.map(i => i.id === selected.id ? { ...i, estado: editEstado, notas_admin: editNotas } : i))
    setSelected(prev => prev ? { ...prev, estado: editEstado, notas_admin: editNotas } : null)
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Inscripciones <span className="text-[#5B8A3C]">Web</span>
          </h1>
          <p className="text-[#6B7A6B] text-sm mt-1">
            {stats.pendiente > 0
              ? `${stats.pendiente} pendiente${stats.pendiente > 1 ? 's' : ''} de revisión · ${stats.total} total`
              : `${stats.total} inscripciones registradas`}
          </p>
        </div>
        <button onClick={fetch}
          className="inline-flex items-center gap-2 border border-[#1E261E] hover:border-[#5B8A3C] text-[#6B7A6B] hover:text-white font-bold px-4 py-2.5 rounded-xl transition-all text-sm">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',      val: stats.total,     color: 'text-white',        bg: '' },
          { label: 'Pendientes', val: stats.pendiente, color: 'text-amber-400',    bg: 'border-amber-400/20' },
          { label: 'Aprobados',  val: stats.aprobado,  color: 'text-[#5B8A3C]',    bg: 'border-[#5B8A3C]/20' },
          { label: 'En espera',  val: stats.en_espera, color: 'text-blue-400',     bg: 'border-blue-400/20' },
        ].map(s => (
          <div key={s.label} className={`bg-[#141614] border ${s.bg || 'border-[#1E261E]'} rounded-2xl p-4`}>
            <p className={`text-3xl font-black ${s.color}`} style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>{s.val}</p>
            <p className="text-[#6B7A6B] text-xs uppercase tracking-wider mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
          <input type="text" placeholder="Buscar por nombre, teléfono o correo..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#141614] border border-[#1E261E] rounded-xl pl-11 pr-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...ESTADOS.map(e => e.value)].map(v => {
            const conf = v === 'all' ? null : estadoConf(v as Estado)
            const active = filtroEstado === v
            return (
              <button key={v} onClick={() => setFiltroEstado(v as Estado | 'all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                  active
                    ? `${conf?.bg ?? 'bg-white/10'} ${conf?.color ?? 'text-white'} ${conf ? 'border-current' : 'border-white/20'}`
                    : 'border-[#1E261E] text-[#6B7A6B] hover:border-[#5B8A3C] hover:text-white'
                }`}>
                {v === 'all' ? 'Todos' : conf?.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main content: list + detail ── */}
      <div className="flex gap-4 min-h-[400px]">

        {/* List */}
        <div className={`bg-[#141614] border border-[#1E261E] rounded-2xl overflow-hidden transition-all ${selected ? 'hidden xl:flex xl:flex-col xl:flex-1' : 'flex flex-col flex-1'}`}>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-[#5B8A3C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="w-10 h-10 text-[#1E261E] mx-auto mb-3" />
              <p className="text-[#444] text-sm">No hay inscripciones con ese filtro.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1E261E]">
                    {['Persona', 'Plan', 'Horario', 'Fecha', 'Estado', ''].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-[#6B7A6B] text-xs uppercase tracking-widest font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(i => {
                    const st = estadoConf(i.estado)
                    const isActive = selected?.id === i.id
                    return (
                      <tr key={i.id} onClick={() => openDetail(i)}
                        className={`border-b border-[#1E261E] last:border-0 cursor-pointer transition-colors ${isActive ? 'bg-[#5B8A3C]/10' : 'hover:bg-[#1E261E]/50'}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#5B8A3C]/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-[#5B8A3C] text-xs font-bold">{initials(i.nombre)}</span>
                            </div>
                            <div>
                              <p className="text-white text-sm font-semibold">{i.nombre}</p>
                              <p className="text-[#444] text-xs">{i.telefono}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#6B7A6B] text-sm">{planLabel(i.plan)}</td>
                        <td className="px-5 py-4 text-[#6B7A6B] text-sm whitespace-nowrap">
                          {i.horario?.replace(/[^\w\s:]/g, '').trim() ?? '—'}
                        </td>
                        <td className="px-5 py-4 text-[#6B7A6B] text-sm whitespace-nowrap">{fmt(i.created_at)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${st.bg} ${st.color}`}>
                            {st.icon} {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <ChevronRight className="w-4 h-4 text-[#444]" />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="flex-1 xl:flex-none xl:w-[420px] bg-[#141614] border border-[#1E261E] rounded-2xl overflow-hidden flex flex-col">
            {/* Panel header */}
            <div className="p-5 border-b border-[#1E261E] sticky top-0 bg-[#141614] z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#5B8A3C]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#5B8A3C] font-bold">{initials(selected.nombre)}</span>
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg leading-tight">{selected.nombre}</h2>
                    <p className="text-[#444] text-xs">{fmtFull(selected.created_at)}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)}
                  className="p-1.5 text-[#6B7A6B] hover:text-white hover:bg-[#1E261E] rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contact actions */}
              <div className="flex gap-2 mb-4">
                <a href={`https://wa.me/${selected.telefono?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1E3D1E] hover:bg-[#2a5a2a] text-[#5B8A3C] text-xs font-bold py-2.5 rounded-xl transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                {selected.correo && (
                  <a href={`mailto:${selected.correo}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1E261E] hover:bg-[#252d25] text-[#6B7A6B] hover:text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </a>
                )}
              </div>

              {/* Estado */}
              <p className="text-[#6B7A6B] text-xs uppercase tracking-widest font-medium mb-2">Estado</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {ESTADOS.map(e => (
                  <button key={e.value} onClick={() => setEditEstado(e.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      editEstado === e.value
                        ? `${e.bg} ${e.color} border-current`
                        : 'border-[#1E261E] text-[#6B7A6B] hover:border-[#5B8A3C]'
                    }`}>
                    {e.icon} {e.label}
                  </button>
                ))}
              </div>

              {/* Notas */}
              <p className="text-[#6B7A6B] text-xs uppercase tracking-widest font-medium mb-2">Notas internas</p>
              <textarea value={editNotas} onChange={e => setEditNotas(e.target.value)}
                rows={2} placeholder="Añade notas sobre esta inscripción…"
                className="w-full bg-[#0F130F] border border-[#1E261E] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors resize-none mb-3"
              />

              <button onClick={handleSave} disabled={saving}
                className="w-full bg-[#5B8A3C] hover:bg-[#4A7230] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wider"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                {saving ? 'Guardando…' : saveOk ? '✓ Guardado' : 'Guardar cambios'}
              </button>
            </div>

            {/* Scrollable detail */}
            <div className="overflow-y-auto p-5 space-y-5 flex-1">

              {/* Datos generales */}
              <DetailSection title="Datos Generales" icon={<User className="w-3.5 h-3.5" />}>
                <DetailRow label="Teléfono"   val={selected.telefono} icon={<Phone className="w-3 h-3" />} />
                <DetailRow label="Correo"     val={selected.correo}   icon={<Mail className="w-3 h-3" />} />
                <DetailRow label="Edad"       val={selected.edad ? `${selected.edad} años` : null} />
                <DetailRow label="Sexo"       val={selected.sexo} />
                <DetailRow label="Ocupación"  val={selected.ocupacion} />
                {selected.motivo && (
                  <div className="pt-2">
                    <p className="text-[#444] text-xs mb-1">Motivo</p>
                    <p className="text-[#9CA3AF] text-sm leading-relaxed">{selected.motivo}</p>
                  </div>
                )}
              </DetailSection>

              {/* Plan & Horario */}
              <DetailSection title="Plan & Horario" icon={<Calendar className="w-3.5 h-3.5" />}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0F130F] border border-[#1E261E] rounded-xl p-3">
                    <p className="text-[#444] text-xs mb-1">Plan</p>
                    <p className="text-white text-sm font-semibold">{planLabel(selected.plan)}</p>
                    <p className="text-[#5B8A3C] text-sm font-bold">$40/mes</p>
                  </div>
                  <div className="bg-[#0F130F] border border-[#1E261E] rounded-xl p-3">
                    <p className="text-[#444] text-xs mb-1">Horario</p>
                    <p className="text-white text-sm font-semibold">{selected.horario?.replace(/[^\w\s:]/g, '').trim() || '—'}</p>
                  </div>
                </div>
                {selected.comentario && (
                  <div className="pt-1">
                    <p className="text-[#444] text-xs mb-1">Comentario</p>
                    <p className="text-[#9CA3AF] text-sm">{selected.comentario}</p>
                  </div>
                )}
              </DetailSection>

              {/* Historial Médico */}
              <DetailSection title="Historial Médico" icon={<FileText className="w-3.5 h-3.5" />}>
                {[
                  { label: 'Enfermedades',     val: selected.enfermedad,    det: selected.enfermedad_det },
                  { label: 'Cirugías',          val: selected.cirugia,       det: selected.cirugia_det },
                  { label: 'Medicamentos',      val: selected.medicamento,   det: selected.medicamento_det },
                  { label: 'Alergias',          val: selected.alergia,       det: selected.alergia_det },
                  { label: 'Antec. familiares', val: selected.antecedentes,  det: selected.antecedentes_det },
                ].map(r => <MedicoRow key={r.label} label={r.label} val={r.val} det={r.det} />)}
              </DetailSection>

              {/* Historial Físico */}
              <DetailSection title="Historial Físico" icon={<Dumbbell className="w-3.5 h-3.5" />}>
                <MedicoRow label="Actividad actual" val={selected.actividad} det={selected.actividad_det} />
                <DetailRow label="Entrenó últimos 6m" val={selected.ultimos6 === 'si' ? 'Sí' : selected.ultimos6 === 'no' ? 'No' : null} />
                {selected.preferencias && selected.preferencias.length > 0 && (
                  <div>
                    <p className="text-[#444] text-xs mb-2">Preferencias</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.preferencias.map(p => (
                        <span key={p} className="px-2.5 py-1 bg-[#5B8A3C]/10 text-[#5B8A3C] text-xs rounded-lg font-medium border border-[#5B8A3C]/20">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selected.evitar && <DetailRow label="Evitar" val={selected.evitar} />}
                <MedicoRow label="Exp. negativa" val={selected.exp_negativa} det={selected.exp_negativa_det} />
              </DetailSection>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────── */
function DetailSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[#5B8A3C]">{icon}</span>
        <p className="text-[#6B7A6B] text-xs uppercase tracking-widest font-medium">{title}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function DetailRow({ label, val, icon }: { label: string; val: string | null | undefined; icon?: React.ReactNode }) {
  if (!val) return null
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-[#1E261E] last:border-0">
      <span className="text-[#444] text-xs flex items-center gap-1.5">{icon}{label}</span>
      <span className="text-[#9CA3AF] text-sm text-right font-medium">{val}</span>
    </div>
  )
}

function MedicoRow({ label, val, det }: { label: string; val: string | null; det: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-[#1E261E] last:border-0">
      <span className="text-[#444] text-xs">{label}</span>
      <div className="text-right">
        {val === 'si'
          ? <span className="text-red-400 text-xs font-semibold">Sí{det ? ` — ${det}` : ''}</span>
          : val === 'no'
          ? <span className="text-[#444] text-xs">No</span>
          : <span className="text-[#444] text-xs">—</span>}
      </div>
    </div>
  )
}
