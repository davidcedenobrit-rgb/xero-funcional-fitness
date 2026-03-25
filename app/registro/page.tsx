'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function RegistroPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (!nombre.trim()) { setError('El nombre completo es obligatorio.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { nombre_completo: nombre } } })
    if (signUpError) {
      setError(signUpError.message.includes('already registered') ? 'Este correo ya está registrado.' : signUpError.message)
      setLoading(false)
      return
    }
    if (data?.user) { setSuccess(true); setTimeout(() => { router.push('/login') }, 2500) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0C0A] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#5B8A3C] opacity-5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#5B8A3C] opacity-5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#1E261E]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-[#1E261E]" />
      </div>
      <div className="relative w-full max-w-md px-6 animate-fade-in">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6"><img src="/xero-logo.png" alt="XERO Funcional Fitness" className="h-16 object-contain" /></div>
          <p className="text-[#6B7A6B] text-xs tracking-widest uppercase">Crear Nueva Cuenta</p>
        </div>
        <div className="bg-[#141614] border border-[#1E261E] rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6"><div className="w-1.5 h-4 bg-[#5B8A3C] rounded-full" /><span className="text-sm text-[#6B7A6B] uppercase tracking-widest">Registro</span></div>
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#5B8A3C]/20 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-[#5B8A3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
              <h2 className="text-white text-lg font-semibold mb-2">¡Cuenta creada!</h2>
              <p className="text-[#6B7A6B] text-sm">Redirigiendo al inicio de sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleRegistro} className="space-y-5">
              <div><label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Nombre Completo</label><input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Ej: José Rojas" className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors" /></div>
              <div><label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="correo@ejemplo.com" className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors" /></div>
              <div><label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Contraseña</label><div className="relative"><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors pr-12" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] hover:text-white transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
              <div><label className="block text-sm text-[#6B7A6B] mb-2 uppercase tracking-wider">Confirmar Contraseña</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} placeholder="Repite tu contraseña" className="w-full bg-[#0A0C0A] border border-[#1E261E] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#5B8A3C] transition-colors" /></div>
              {error && (<div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"><p className="text-red-400 text-sm">{error}</p></div>)}
              <button type="submit" disabled={loading} className="w-full bg-[#5B8A3C] hover:bg-[#4A7230] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-widest text-sm" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>{loading ? 'Creando cuenta...' : 'Crear Cuenta'}</button>
              <div className="text-center pt-2"><p className="text-[#444] text-sm">¿Ya tienes cuenta?{' '}<Link href="/login" className="text-[#5B8A3C] hover:text-[#7BAF5C] font-semibold transition-colors">Inicia sesión</Link></p></div>
            </form>
          )}
        </div>
        <p className="text-center text-[#333] text-xs mt-6">© {new Date().getFullYear()} XERO Funcional Fitness · Todos los derechos reservados</p>
      </div>
    </div>
  )
}
