'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Music, 
  Utensils, 
  PartyPopper, 
  Camera, 
  Palette, 
  Gift, 
  Armchair 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/cliente';
import { registrarUsuario } from '@/lib/actions/authActions';
import { cn } from '@/lib/utils';
import Logo from '@/components/common/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MEXICO_LOCATIONS } from '@/lib/constants/locations';

export default function RegisterPage() {
  const [rol, setRol] = useState<'CLIENTE' | 'PROVEEDOR'>('CLIENTE');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [estado, setEstado] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!nombre.trim() || !cleanEmail || !password || !telefono.trim() || !estado || !municipio) return;
    
    if (!aceptaTerminos || !aceptaPrivacidad) {
      setError('Debes aceptar los términos y confirmar la lectura del aviso de privacidad.');
      return;
    }
    
    if (rol === 'PROVEEDOR' && !categoria) {
      setError('Por favor selecciona una categoría para tu servicio.');
      return;
    }
    
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
        options: {
          data: {
            rol,
            nombre: nombre.trim(),
            categoria: rol === 'PROVEEDOR' ? categoria : null,
            telefono: telefono.trim(),
            estado,
            municipio
          }
        }
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('rate limit')) {
          throw new Error('Supabase Rate Limit: Has intentados demasiados registros. Espera unos minutos.');
        }
        if (authError.message.toLowerCase().includes('already registered')) {
          throw new Error('Este correo ya tiene una cuenta activa en Supabase Auth. Intenta otro correo o recupera tu contraseña.');
        }
        throw new Error(authError.message);
      }

      // 2. Registramos en Prisma (con timeout de seguridad para evitar "stuck")
      const registrationPromise = registrarUsuario({ 
        email: cleanEmail, 
        nombre: nombre.trim(), 
        rol,
        categoria: categoria as any,
        telefono: telefono.trim(),
        estado,
        municipio
      });
      
      // Timeout de 15 segundos para la DB
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('La base de datos (Prisma) no respondió a tiempo. AWS Lambda podría estar saturada o la URL es inválida.')), 15000)
      );

      const res: any = await Promise.race([registrationPromise, timeoutPromise]);
      
      if (!res.success) {
        throw new Error(res.error);
      }

      // 3. Redireccionar de forma forzada para evitar bloqueos de sesión en Next.js
      if (rol === 'CLIENTE') {
        window.location.href = '/cliente/perfil';
      } else {
        window.location.href = '/proveedor/configuracion';
      }
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.message || 'Error inesperado al crear la cuenta.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <Link href="/" className="inline-block transition-transform hover:scale-105" title="Volver al inicio">
              <Logo width={280} height={100} />
            </Link>
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

          <div>
            <label className="label">Teléfono / Celular</label>
            <input 
              type="tel" 
              className="input" 
              placeholder="10 dígitos" 
              value={telefono}
              onChange={e => setTelefono(e.target.value.replace(/\D/g, ''))}
              maxLength={10}
              required 
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Estado</label>
              <select 
                className="input cursor-pointer"
                value={estado}
                onChange={e => {
                  setEstado(e.target.value);
                  setMunicipio('');
                }}
                required
                disabled={loading}
              >
                <option value="">Selecciona...</option>
                {Object.keys(MEXICO_LOCATIONS).map(est => (
                  <option key={est} value={est}>{est}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Municipio / Ciudad</label>
              <select 
                className="input cursor-pointer"
                value={municipio}
                onChange={e => setMunicipio(e.target.value)}
                required
                disabled={!estado || loading}
              >
                <option value="">Selecciona...</option>
                {estado && MEXICO_LOCATIONS[estado]?.map(mun => (
                  <option key={mun} value={mun}>{mun}</option>
                ))}
              </select>
            </div>
          </div>
          
          {rol === 'PROVEEDOR' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <label className="label block">Categoría de Servicio *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'SALON',      label: 'Salones',      icon: Building2,   color: 'text-blue-500 dark:text-blue-400' },
                  { id: 'MUSICA',     label: 'Música',       icon: Music,       color: 'text-purple-500 dark:text-purple-400' },
                  { id: 'COMIDA',     label: 'Banquetes',    icon: Utensils,    color: 'text-orange-500 dark:text-orange-400' },
                  { id: 'ANIMACION',  label: 'Animación',    icon: PartyPopper, color: 'text-pink-500 dark:text-pink-400' },
                  { id: 'FOTOGRAFIA', label: 'Foto & Video', icon: Camera,      color: 'text-teal-500 dark:text-teal-400' },
                  { id: 'DECORACION', label: 'Decoración',   icon: Palette,     color: 'text-yellow-500 dark:text-yellow-400' },
                  { id: 'RECUERDOS',  label: 'Recuerdos',    icon: Gift,        color: 'text-rose-500 dark:text-rose-400' },
                  { id: 'MOBILIARIO', label: 'Inmobiliario', icon: Armchair,    color: 'text-amber-600 dark:text-amber-500' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategoria(item.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all group",
                      categoria === item.id 
                        ? "bg-[var(--color-primario)]/10 border-[var(--color-primario)] shadow-lg shadow-violet-500/10" 
                        : "bg-[var(--color-fondo-input)] border-[var(--color-borde-suave)] hover:border-[var(--color-primario-claro)]"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors",
                      categoria === item.id ? "bg-[var(--color-primario)] text-white" : `bg-[var(--color-fondo-card)] ${item.color} group-hover:scale-110`
                    )}>
                      <item.icon size={20} strokeWidth={1.5} />
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest text-center leading-tight",
                      categoria === item.id ? "text-[var(--color-primario)]" : "text-[var(--color-texto-suave)]"
                    )}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CHECKBOXES LEGALES OBLIGATORIOS */}
          <div className="space-y-3 pt-4 border-t border-[var(--color-borde-suave)]">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="mt-1 rounded border-[var(--color-borde-suave)] text-[var(--color-primario)] focus:ring-[var(--color-primario)]"
                checked={aceptaTerminos}
                onChange={e => setAceptaTerminos(e.target.checked)}
                disabled={loading}
              />
              <span className="text-xs text-[var(--color-texto-suave)] group-hover:text-[var(--color-texto)] transition-colors leading-relaxed">
                Acepto los <Link href="/terminos" className="text-[var(--color-primario-claro)] hover:underline font-bold" target="_blank">Términos y Condiciones</Link> de Eventia.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="mt-1 rounded border-[var(--color-borde-suave)] text-[var(--color-primario)] focus:ring-[var(--color-primario)]"
                checked={aceptaPrivacidad}
                onChange={e => setAceptaPrivacidad(e.target.checked)}
                disabled={loading}
              />
              <span className="text-xs text-[var(--color-texto-suave)] group-hover:text-[var(--color-texto)] transition-colors leading-relaxed">
                Confirmo que he leído y acepto el <Link href="/privacidad" className="text-[var(--color-primario-claro)] hover:underline font-bold" target="_blank">Aviso de Privacidad</Link>.
              </span>
            </label>
          </div>

          <button 
            type="submit"
            disabled={loading || !aceptaTerminos || !aceptaPrivacidad}
            className="btn btn-primario w-full mt-4 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
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

      <div className="fixed top-6 right-6">
        <ThemeToggle />
      </div>
    </div>
  );
}
