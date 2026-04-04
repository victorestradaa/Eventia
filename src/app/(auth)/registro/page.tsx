'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/cliente';
import { registrarUsuario } from '@/lib/actions/authActions';

export default function RegisterPage() {
  const [rol, setRol] = useState<'CLIENTE' | 'PROVEEDOR'>('CLIENTE');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!nombre.trim() || !cleanEmail || !password) return;
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      
      // 1. Registramos en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('rate limit')) {
          throw new Error('Haz alcanzado el límite de intentos o registros por hora que permite Supabase. Espera un momento o desactívalo desde el Dashboard local.');
        }
        throw new Error(authError.message);
      }

      // 2. Registramos en Prisma
      const res = await registrarUsuario({ email: cleanEmail, nombre: nombre.trim(), rol });
      
      if (!res.success) {
        throw new Error(res.error);
      }

      // 3. Redireccionar al dashboard correspondiente
      if (rol === 'CLIENTE') {
        router.push('/cliente/dashboard');
      } else {
        router.push('/proveedor/dashboard');
      }
      router.refresh();
      
    } catch (err: any) {
      setError(err?.message || 'Error al crear la cuenta.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <Image src="/logo.png" alt="Eventia Logo" width={400} height={160} className="w-auto h-28 object-contain" priority />
          </div>
          <h1 className="text-3xl font-bold mb-2">Crear Cuenta</h1>
          <p className="text-[var(--color-texto-suave)]">Únete a la mejor red de eventos</p>
        </div>

        <div className="flex gap-2 p-1 bg-[var(--color-fondo-input)] rounded-full mb-8">
          <button 
            onClick={() => setRol('CLIENTE')}
            className={`flex-1 btn btn-sm transition-all ${rol === 'CLIENTE' ? 'btn-primario' : 'btn-fantasma border-none'}`}
            type="button"
          >
            Soy Cliente
          </button>
          <button 
            onClick={() => setRol('PROVEEDOR')}
            className={`flex-1 btn btn-sm transition-all ${rol === 'PROVEEDOR' ? 'btn-primario' : 'btn-fantasma border-none'}`}
            type="button"
          >
            Soy Proveedor
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 rounded-xl text-sm font-medium text-red-600 bg-red-50 border border-red-200">
              {error}
            </div>
          )}
          <div>
            <label className="label">Nombre completo</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Ej. Juan Pérez" 
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required 
              disabled={loading}
            />
          </div>
          <div>
            <label className="label">Correo electrónico</label>
            <input 
              type="email" 
              className="input" 
              placeholder="correo@ejemplo.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
              disabled={loading}
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
              minLength={6}
              disabled={loading}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="btn btn-primario w-full mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[var(--color-texto-suave)]">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[var(--color-primario-claro)] hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
