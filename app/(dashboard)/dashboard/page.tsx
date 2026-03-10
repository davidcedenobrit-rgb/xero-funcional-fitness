'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import StatsCard from '@/components/StatsCard'
import { Users, TrendingUp, TrendingDown, Zap, Clock, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#5B8A3C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

export default function DashboardPage() {
  const [stats, setStats] = useState({ socios: 0, ingresos: 0, gastos: 0 })
  const [ventasMes, setVentasMes] = useState<{ mes: string; total: number }[]>([])
  const [planesData, setPlanesData] = useState<{ nombre: string; cantidad: number }[]>([])
  const [vencimientos, setVencimientos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      // Socios activos
      const { count: sociosCount } = await supabase
        .from('socios').select('*', { count: 'exact', head: true }).eq('estado', 'activo')

      // Ingresos del mes (suscripciones)
      const { data: suscs } = await supabase
        .from('suscripciones').select('monto_pagado').gte('created_at', firstDay)
      const ingresos = suscs?.reduce((s, r) => s + (r.monto_pagado || 0), 0) || 0

      // Gastos del mes
      const { data: gastos } = await supabase
        .from('gastos').select('monto').gte('fecha', firstDay.split('T')[0])
      const totalGastos = gastos?.reduce((s, r) => s + (r.monto || 0), 0) || 0

      // Ventas últimos 6 meses
      const meses = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const inicio = d.toISOString()
        const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString()
        const { data } = await supabase.from('suscripciones').select('monto_pagado')
          .gte('created_at', inicio).lte('created_at', fin)
        const total = data?.reduce((s, r) => s + (r.monto_pagado || 0), 0) || 0
        meses.push({ mes: d.toLocaleString('es', { month: 'short' }).toUpperCase(), total })
      }

      // Planes más vendidos
      const { data: planes } = await supabase
        .from('suscripciones').select('planes(nombre)').not('plan_id', 'is', null)
      const planesCount: Record<string, number> = {}
      planes?.forEach((s: any) => {
        const n = s.planes?.nombre || 'Sin plan'
        planesCount[n] = (planesCount[n] || 0) + 1
      })
      const planesArr = Object.entries(planesCount).map(([nombre, cantidad]) => ({ nombre, cantidad }))

      // Vencimientos próximos
      const en7dias = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
      const { data: venc } = await supabase.from('suscripciones')
        .select('*, socios(nombre), planes(nombre)')
        .eq('estado', 'activa').lte('fecha_fin', en7dias).order('fecha_fin', { ascending: true }).limit(5)

      setStats({ socios: sociosCount || 0, ingresos, gastos: totalGastos })
      setVentasMes(meses)
      setPlanesData(planesArr)
      setVencimientos(venc || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const utilidad = stats.ingresos - stats.gastos

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#5B8A3C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-black uppercase text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          Panel de <span className="text-[#5B8A3C]">Control</span>
        </h1>
        <p className="text-[#6B7A6B] text-sm mt-1">
          {new Date().toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Miembros Activos" value={stats.socios.toString()} icon={Users} color="gray" subtitle="Membresías vigentes" />
        <StatsCard title="Ingresos del Mes" value={`$${stats.ingresos.toFixed(2)}`} icon={TrendingUp} color="green" subtitle="Suscripciones cobradas" />
        <StatsCard title="Gastos del Mes" value={`$${stats.gastos.toFixed(2)}`} icon={TrendingDown} color="red" subtitle="Egresos registrados" />
        <StatsCard title="Utilidad Neta" value={`$${utilidad.toFixed(2)}`} icon={Zap} color={utilidad >= 0 ? 'green' : 'red'} subtitle={utilidad >= 0 ? 'Rentable este mes' : 'Mes en pérdida'} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-[#141614] border border-[#1E261E] rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Tendencia de Ventas</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ventasMes}>
              <XAxis dataKey="mes" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="total" fill="#5B8A3C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#141614] border border-[#1E261E] rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Planes Populares</h2>
          {planesData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={planesData} dataKey="cantidad" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                    {planesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {planesData.slice(0, 4).map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-[#6B7A6B] text-xs">{p.nombre}</span>
                    </div>
                    <span className="text-white text-xs font-bold">{p.cantidad}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[#444] text-sm text-center mt-10">Sin datos aún</p>
          )}
        </div>
      </div>

      {/* Vencimientos */}
      <div className="bg-[#141614] border border-[#1E261E] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <h2 className="text-white font-bold uppercase tracking-wider text-sm">Vencimientos Próximos</h2>
          <span className="ml-auto bg-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded-lg">{vencimientos.length} próximos 7 días</span>
        </div>
        {vencimientos.length === 0 ? (
          <p className="text-[#444] text-sm">¡Sin vencimientos esta semana! 🎉</p>
        ) : (
          <div className="space-y-2">
            {vencimientos.map(v => (
              <div key={v.id} className="flex items-center justify-between py-3 border-b border-[#1E261E] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{v.socios?.nombre}</p>
                    <p className="text-[#6B7A6B] text-xs">{v.planes?.nombre}</p>
                  </div>
                </div>
                <span className="text-amber-400 text-xs font-medium">
                  {new Date(v.fecha_fin).toLocaleDateString('es')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
