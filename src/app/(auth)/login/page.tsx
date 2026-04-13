'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/cliente';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [rol, setRol] = useState<'CLIENTE' | 'PROVEEDOR'>('CLIENTE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return;

    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        // Show the real Supabase error message
        const msg = authError.message || 'Error de autenticación';
        if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
          setError('Correo o contraseña incorrectos. Verifica tus datos.');
        } else if (msg.toLowerCase().includes('rate limit')) {
          setError('Demasiados intentos. Por favor espera unos minutos antes de intentar de nuevo.');
        } else {
          setError(`Error: ${msg}`);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Redirigimos a la raíz para que el Middleware de servidor evalúe
        // su rol real (Admin/Cliente/Proveedor) en Prisma y lo enrute correcto.
        window.location.href = '/';
      }
    } catch (err: any) {
      // Show the real exception message for debugging
      const msg = err?.message || String(err);
      setError(`Error: ${msg}`);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-fondo)' }}>
      <div className="card w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4">
            <Image src="/logo.png" alt="Eventia Logo" width={400} height={160} className="w-auto h-28 object-contain" priority />
          </div>
          <h1 className="text-3xl font-bold mb-2">Iniciar Sesión</h1>
          <p className="text-[var(--color-texto-suave)]">Bienvenido de vuelta</p>
        </div>

        {/* Role selector */}
        <div className="flex gap-2 p-1 bg-[var(--color-fondo-input)] rounded-full mb-8">
          <button
            type="button"
            onClick={() => setRol('CLIENTE')}
            className={`flex-1 btn btn-sm transition-all ${rol === 'CLIENTE' ? 'btn-primario' : 'btn-fantasma border-none'}`}
          >
            Cliente
          </button>
          <button
            type="button"
            onClick={() => setRol('PROVEEDOR')}
            className={`flex-1 btn btn-sm transition-all ${rol === 'PROVEEDOR' ? 'btn-primario' : 'btn-fantasma border-none'}`}
          >
            Proveedor
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Error message */}
          {error && (
            <div className="p-3 rounded-xl text-sm font-medium text-red-600 bg-red-50 border border-red-200">
              {error}
            </div>
          )}

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
              autoComplete="email"
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
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div className="text-right">
            <Link href="/reset-password" className="text-xs text-[var(--color-primario-claro)] hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primario w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[var(--color-texto-suave)]">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" className="text-[var(--color-primario-claro)] hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
