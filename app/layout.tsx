import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'XERO Funcional Fitness — Panel de Administración',
  description: 'Sistema de gestión para XERO Funcional Fitness',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
