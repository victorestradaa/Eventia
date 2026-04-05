'use client';

import { 
  User, 
  Settings, 
  Bell, 
  CreditCard, 
  Calendar, 
  Star, 
  ChevronRight, 
  LogOut, 
  Edit,
  Camera,
  Heart,
  Wallet
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { cerrarSesion } from '@/lib/actions/authActions';

interface PerfilClientProps {
  perfil: any;
  conteoEventos: number;
}

export default function PerfilClient({ perfil, conteoEventos }: PerfilClientProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const user = {
    nombre: perfil.nombre || 'Usuario',
    email: perfil.email,
    avatar: perfil.avatarUrl || '',
    miembroDesde: perfil.creadoEn ? new Date(perfil.creadoEn).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }) : '—',
    eventos: conteoEventos,
    favoritos: 0,
    pagoPendiente: 0
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    
    try {
      // 1. Client-side sign out
      const { createClient } = await import('@/lib/supabase/cliente');
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // 2. Server-side sign out
      await cerrarSesion();
      
      // 3. Fallback
      window.location.href = '/login';
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
      window.location.href = '/login';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-48 rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
           <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="px-8 -mt-16 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            <div className="relative group">
               <div className="w-32 h-32 rounded-full border-4 border-[var(--color-fondo)] bg-[#1a1a1a] flex items-center justify-center overflow-hidden shadow-2xl">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-violet-500/20 text-violet-400">
                      <User size={64} />
                    </div>
                  )}
               </div>
            </div>
            <div className="pb-2">
               <h1 className="text-4xl font-black tracking-tighter uppercase italic">{user.nombre}</h1>
               <p className="text-[var(--color-texto-suave)] text-sm font-bold flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Miembro desde {user.miembroDesde}
               </p>
            </div>
          </div>
          <div className="flex gap-4 pb-2">
             <button className="btn btn-primario gap-2 py-3 px-6 shadow-lg shadow-violet-500/20"><Edit size={16}/> Editar Perfil</button>
             <button className="btn btn-fantasma border-white/5 p-3 rounded-xl"><Settings size={20}/></button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'Eventos Creados', value: user.eventos, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
           { label: 'Proveedores Favoritos', value: user.favoritos, icon: Heart, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
           { label: 'Saldo Pendiente', value: `$${user.pagoPendiente.toLocaleString()}`, icon: Wallet, color: 'text-amber-400', bg: 'bg-amber-500/10' },
           { label: 'Valoraciones dadas', value: 0, icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
         ].map((stat, i) => (
           <div key={i} className="card p-6 flex flex-col items-center justify-center text-center space-y-2 border-white/5 bg-white/[0.02]">
              <div className={cn("p-3 rounded-2xl mb-2", stat.bg, stat.color)}>
                 <stat.icon size={24} />
              </div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-[10px] uppercase font-bold text-[var(--color-texto-muted)] tracking-widest">{stat.label}</p>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Menu */}
        <div className="space-y-4">
           <h3 className="font-black text-xs uppercase tracking-widest text-[var(--color-texto-muted)] ml-2">Configuración de Cuenta</h3>
           <div className="card p-2 space-y-1">
              {[
                { label: 'Información Personal', icon: User, href: '#' },
                { label: 'Notificaciones', icon: Bell, href: '#', badge: null },
                { label: 'Métodos de Pago', icon: CreditCard, href: '#' },
                { label: 'Seguridad', icon: Settings, href: '#' },
              ].map((item, i) => (
                <Link key={i} href={item.href} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--color-texto-suave)] group-hover:text-white transition-colors">
                         <item.icon size={18} />
                      </div>
                      <span className="font-bold text-sm">{item.label}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      {item.badge && <span className="bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{item.badge}</span>}
                      <ChevronRight size={16} className="text-[var(--color-texto-muted)]" />
                   </div>
                </Link>
              ))}
              <hr className="border-white/5 my-2" />
              <button 
                type="button" 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-4 p-4 rounded-xl text-red-400 hover:bg-red-400/10 transition-all text-left disabled:opacity-50"
              >
                  <div className="w-10 h-10 rounded-lg bg-red-400/10 flex items-center justify-center">
                    <LogOut size={18} />
                  </div>
                  <span className="font-bold text-sm tracking-tight">
                    {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                  </span>
              </button>
           </div>
        </div>

        {/* Right Column: Support */}
        <div className="lg:col-span-2 space-y-8">
           <div className="card bg-violet-600 shadow-xl shadow-violet-600/10 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-4">
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">¿Necesitas ayuda con tu evento?</h3>
                    <p className="text-violet-100 text-sm mt-2 max-w-sm">Habla con uno de nuestros Wedding Planners certificados ahora mismo.</p>
                 </div>
                 <button className="btn bg-white text-violet-600 font-black px-8 py-4 rounded-2xl hover:bg-violet-50 transition-colors shadow-2xl">Contactar Soporte</button>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
           </div>
        </div>
      </div>
    </div>
  );
}
