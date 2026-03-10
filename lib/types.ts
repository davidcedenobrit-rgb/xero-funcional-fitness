export type Socio = {
  id: number
  nombre: string
  dni: string
  telefono: string
  email: string
  fecha_nacimiento: string
  direccion: string
  foto_url?: string
  estado: 'activo' | 'inactivo'
  created_at: string
}

export type Plan = {
  id: number
  nombre: string
  precio: number
  duracion_dias: number
  descripcion: string
  estado: 'activo' | 'inactivo'
}

export type Suscripcion = {
  id: number
  socio_id: number
  plan_id: number
  fecha_inicio: string
  fecha_fin: string
  estado: 'activa' | 'vencida' | 'cancelada'
  monto_pagado: number
  created_at: string
  socios?: Socio
  planes?: Plan
}

export type Asistencia = {
  id: number
  socio_id: number
  fecha_hora: string
  socios?: Socio
}

export type Caja = {
  id: number
  usuario_id: string
  monto_inicial: number
  monto_final: number
  total_ventas: number
  total_gastos: number
  diferencia: number
  fecha_apertura: string
  fecha_cierre?: string
  estado: 'abierta' | 'cerrada'
}

export type Gasto = {
  id: number
  caja_id: number
  descripcion: string
  monto: number
  categoria: string
  fecha: string
}

export type Configuracion = {
  id: number
  nombre_sistema: string
  moneda: string
  ruc: string
  direccion: string
  telefono: string
}

export type DashboardStats = {
  totalSocios: number
  ingresosMes: number
  gastosMes: number
  utilidad: number
  ventasUltimosMeses: { mes: string; total: number }[]
  planesMasVendidos: { nombre: string; cantidad: number }[]
  vencimientosProximos: (Suscripcion & { socios: Socio; planes: Plan })[]
}
