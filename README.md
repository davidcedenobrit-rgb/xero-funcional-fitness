# 🏋️ GymSystem — Next.js + Supabase

Sistema de gestión para gimnasios construido con **Next.js 14**, **Supabase** y **Tailwind CSS**. Desplegable en **Vercel** gratis.

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) + React |
| Backend | Next.js API Routes (serverless) |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Estilos | Tailwind CSS |
| Gráficos | Recharts |
| Deploy | Vercel |

## 📦 Módulos incluidos

- ✅ **Dashboard** — KPIs, gráfico de ventas, planes populares, vencimientos
- ✅ **Socios** — CRUD completo de miembros
- ✅ **Planes** — Gestión de planes de membresía
- ✅ **Suscripciones** — Registro de pagos integrado con caja
- ✅ **Asistencia** — Control de ingresos diarios con búsqueda rápida
- ✅ **Gastos** — Registro de egresos por categoría
- ✅ **Autenticación** — Login seguro con Supabase Auth

---

## ⚙️ Configuración Paso a Paso

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. En **SQL Editor** → **New Query**, pega el contenido de `/supabase/schema.sql` y ejecuta

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:
- Ve a tu proyecto → **Settings** → **API**
- Copia `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copia `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Crear usuario administrador

En Supabase → **Authentication** → **Users** → **Add User**:
- Email: `admin@tugym.com`
- Password: tu contraseña segura

### 4. Instalar dependencias y correr localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy en Vercel

### Opción A — Desde GitHub (recomendado)

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) → **New Project**
3. Importa tu repositorio
4. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy** ✅

### Opción B — CLI de Vercel

```bash
npm i -g vercel
vercel
```

---

## 📁 Estructura del Proyecto

```
gym-nextjs/
├── app/
│   ├── login/           # Página de inicio de sesión
│   └── (dashboard)/     # Páginas protegidas
│       ├── dashboard/   # Panel principal
│       ├── socios/      # Gestión de socios
│       ├── planes/      # Planes de membresía
│       ├── suscripciones/ # Pagos y suscripciones
│       ├── asistencia/  # Control de ingresos
│       └── gastos/      # Registro de egresos
├── components/          # Componentes reutilizables
├── lib/
│   ├── supabase.ts      # Cliente Supabase (browser)
│   ├── supabase-server.ts # Cliente Supabase (servidor)
│   └── types.ts         # Tipos TypeScript
├── middleware.ts         # Protección de rutas
└── supabase/
    └── schema.sql       # Script de base de datos
```

---

## 🔐 Seguridad

- ✅ Row Level Security (RLS) habilitado en todas las tablas
- ✅ Solo usuarios autenticados pueden acceder a los datos
- ✅ Middleware protege todas las rutas del dashboard
- ✅ Variables sensibles en `.env.local` (nunca en el código)

---

## 📄 Licencia

MIT — Libre para uso comercial y personal.
