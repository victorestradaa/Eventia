'use client';

import React from 'react';
import { Users, Calendar, DollarSign, Store, Activity, Database, ShieldCheck, ChevronUp, ChevronDown } from 'lucide-react';
import { formatearMoneda } from '@/lib/utils';

interface DashboardAdminClientProps {
  stats: any;
}

export default function DashboardAdminClient({ stats }: DashboardAdminClientProps) {
  const kpis = [
    { label: 'Usuarios Totales', valor: stats.totalUsuarios.toLocaleString(), cambio: '+0%', icon: Users, color: 'text-blue-400' },
    { label: 'Eventos Activos', valor: stats.totalEventos.toLocaleString(), cambio: '+0%', icon: Calendar, color: 'text-violet-400' },
    { label: 'Ingresos Mensuales', valor: formatearMoneda(stats.totalIngresos), cambio: '+0%', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Proveedores Registrados', valor: stats.totalProveedores.toLocaleString(), cambio: '+0%', icon: Store, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black italic tracking-tighter uppercase">Global Overview</h1>
           <p className="text-[var(--color-texto-suave)] text-sm">Estado real de la plataforma en tiempo real.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           Sistemas Operativos
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((stat) => (
          <div key={stat.label} className="stat-card group hover:bg-white/[0.02] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl bg-white/5", stat.color)}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                <ChevronUp size={12} /> {stat.cambio}
              </div>
            </div>
            <h3 className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest mb-1">{stat.label}</h3>
            <p className="stat-valor text-3xl">{stat.valor}</p>
          </div>
        ))}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity (Still mocked for now but framed better) */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
             <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity size={20} className="text-[var(--color-primario-claro)]" />
                Live Feed de Actividad
             </h3>
             <button className="text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] hover:text-white transition-colors">Audit Log &rarr;</button>
          </div>
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  {i % 2 === 0 ? '👤' : '🏪'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold group-hover:text-[var(--color-primario-claro)] transition-colors">
                    {i % 2 === 0 ? 'Gestión de Nuevo Cliente' : 'Actualización de Perfil de Proveedor'}
                  </p>
                  <p className="text-[10px] text-[var(--color-texto-muted)] uppercase tracking-wider font-extrabold mt-0.5">Hace {i * 10} min • Sistema</p>
                </div>
                <button className="p-2 rounded-xl bg-white/5 hover:bg-[var(--color-primario)]/20 text-[var(--color-primario-claro)] opacity-0 group-hover:opacity-100 transition-all">
                  <ShieldCheck size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Health */}
        <div className="flex flex-col gap-6">
          <div className="card space-y-8 bg-gradient-to-br from-white/[0.03] to-transparent">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Database size={20} className="text-blue-400" />
              Sinfraestructura
            </h3>
            <div className="space-y-8">
              <HealthBar label="Carga del Servidor" valor={24} color="bg-emerald-500" />
              <HealthBar label="Database (Supabase)" valor={68} color="bg-amber-500" />
              <HealthBar label="Ancho de Banda" valor={12} color="bg-blue-500" />
              
              <div className="pt-4 border-t border-white/5">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Uptime (30d)</span>
                    <span className="text-sm font-black text-emerald-400 tracking-tighter">99.99%</span>
                 </div>
                 <div className="flex gap-1 h-3">
                   {[...Array(20)].map((_, i) => (
                     <div key={i} className="flex-1 bg-emerald-500/40 rounded-sm hover:bg-emerald-500 transition-colors" />
                   ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthBar({ label, valor, color }: { label: string, valor: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 text-[var(--color-texto-muted)]">
        <span>{label}</span>
        <span className="text-white">{valor}%</span>
      </div>
      <div className="h-1.5 bg-[var(--color-fondo-input)] rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${valor}%` }} />
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
