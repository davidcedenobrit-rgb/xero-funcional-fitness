-- XERO Funcional Fitness — Schema completo
-- Ejecutar en Supabase SQL Editor

-- Socios (Miembros)
CREATE TABLE IF NOT EXISTS socios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  dni TEXT NOT NULL UNIQUE,
  telefono TEXT,
  email TEXT,
  fecha_nacimiento DATE,
  direccion TEXT,
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Planes
CREATE TABLE IF NOT EXISTS planes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio NUMERIC(10,2) NOT NULL,
  duracion_dias INTEGER NOT NULL,
  descripcion TEXT,
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suscripciones (con forma_pago)
CREATE TABLE IF NOT EXISTS suscripciones (
  id SERIAL PRIMARY KEY,
  socio_id INTEGER REFERENCES socios(id),
  plan_id INTEGER REFERENCES planes(id),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado TEXT DEFAULT 'activa',
  monto_pagado NUMERIC(10,2),
  forma_pago TEXT DEFAULT 'efectivo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cajas
CREATE TABLE IF NOT EXISTS cajas (
  id SERIAL PRIMARY KEY,
  usuario_id UUID,
  fecha_apertura TIMESTAMPTZ DEFAULT NOW(),
  fecha_cierre TIMESTAMPTZ,
  monto_inicial NUMERIC(10,2) DEFAULT 0,
  monto_final NUMERIC(10,2),
  total_ventas NUMERIC(10,2) DEFAULT 0,
  total_gastos NUMERIC(10,2) DEFAULT 0,
  diferencia NUMERIC(10,2),
  estado TEXT DEFAULT 'abierta',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Movimientos de caja (con forma_pago)
CREATE TABLE IF NOT EXISTS movimientos_caja (
  id SERIAL PRIMARY KEY,
  caja_id INTEGER REFERENCES cajas(id),
  tipo TEXT NOT NULL, -- 'ingreso' | 'egreso'
  descripcion TEXT,
  monto NUMERIC(10,2) NOT NULL,
  forma_pago TEXT DEFAULT 'efectivo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gastos
CREATE TABLE IF NOT EXISTS gastos (
  id SERIAL PRIMARY KEY,
  descripcion TEXT NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  categoria TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asistencias
CREATE TABLE IF NOT EXISTS asistencias (
  id SERIAL PRIMARY KEY,
  socio_id INTEGER REFERENCES socios(id),
  fecha DATE DEFAULT CURRENT_DATE,
  hora_entrada TIME DEFAULT CURRENT_TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuracion
CREATE TABLE IF NOT EXISTS configuracion (
  id INTEGER PRIMARY KEY DEFAULT 1,
  nombre_sistema TEXT DEFAULT 'XERO Funcional Fitness',
  moneda TEXT DEFAULT '$',
  ruc TEXT,
  direccion TEXT,
  telefono TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE socios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cajas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias   ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas (acceso total a usuarios autenticados)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all' AND tablename = 'socios') THEN
    CREATE POLICY auth_all ON socios FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all' AND tablename = 'planes') THEN
    CREATE POLICY auth_all ON planes FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all' AND tablename = 'suscripciones') THEN
    CREATE POLICY auth_all ON suscripciones FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all' AND tablename = 'cajas') THEN
    CREATE POLICY auth_all ON cajas FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all' AND tablename = 'movimientos_caja') THEN
    CREATE POLICY auth_all ON movimientos_caja FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all' AND tablename = 'gastos') THEN
    CREATE POLICY auth_all ON gastos FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all' AND tablename = 'asistencias') THEN
    CREATE POLICY auth_all ON asistencias FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'auth_all' AND tablename = 'configuracion') THEN
    CREATE POLICY auth_all ON configuracion FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ALTER TABLE para agregar columna si ya existe la tabla (migracion)
ALTER TABLE suscripciones   ADD COLUMN IF NOT EXISTS forma_pago TEXT DEFAULT 'efectivo';
ALTER TABLE movimientos_caja ADD COLUMN IF NOT EXISTS forma_pago TEXT DEFAULT 'efectivo';

-- Datos de ejemplo
INSERT INTO planes (nombre, precio, duracion_dias, descripcion) VALUES
  ('Plan Mensual',   50.00, 30,  'Acceso completo por 1 mes'),
  ('Plan Quincenal', 30.00, 15,  'Acceso completo por 15 días'),
  ('Plan Semanal',   15.00, 7,   'Acceso completo por 7 días'),
  ('Plan Trimestral',130.00, 90, 'Acceso completo por 3 meses')
ON CONFLICT DO NOTHING;

INSERT INTO configuracion (id, nombre_sistema) VALUES (1, 'XERO Funcional Fitness')
ON CONFLICT (id) DO NOTHING;

-- Migración gastos: agregar forma_pago y referencia a movimiento de caja
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS forma_pago TEXT DEFAULT 'efectivo';
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS caja_movimiento_id INTEGER REFERENCES movimientos_caja(id) ON DELETE SET NULL;
