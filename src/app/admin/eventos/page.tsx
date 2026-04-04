'use client';

import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { formatearMoneda, cn } from '@/lib/utils';
import { useState } from 'react';

const EVENTOS_MOCK = [
  { 
    id: 'EVT-001', 
    cliente: 'Laura & David', 
    tipo: 'Boda', 
    fecha: '15 Dic 2024', 
    plan: 'ORO', 
    presupuesto: 150000, 
    gastado: 45000, 
    estado: 'En Proceso',
    icon: Clock,
    color: 'text-blue-400'
  },
  { 
    id: 'EVT-002', 
    cliente: 'Sofía Estrada', 
    tipo: 'Bautizo', 
    fecha: '20 May 2025', 
    plan: 'FREE', 
    presupuesto: 50000, 
    gastado: 5000, 
    estado: 'Iniciado',
    icon: AlertCircle,
    color: 'text-amber-400'
  },
  { 
    id: 'EVT-003', 
    cliente: 'Corporativo Omega', 
    tipo: 'Graduación', 
    fecha: '10 Jul 2024', 
    plan: 'PLANNER', 
    presupuesto: 300000, 
    gastado: 280000, 
    estado: 'Finalizado',
    icon: CheckCircle2,
    color: 'text-emerald-400'
  },
  { 
    id: 'EVT-004', 
    cliente: 'Regina XV', 
    tipo: 'XV Años', 
    fecha: '05 Ene 2025', 
    plan: 'ORO', 
    presupuesto: 85000, 
    gastado: 12000, 
    estado: 'En Proceso',
    icon: Clock,
    color: 'text-blue-400'
  }
];

export default function AdminEventos() {
  const [termino, setTermino] = useState('');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Monitoreo Global de Eventos</h1>
          <p className="text-[var(--color-texto-suave)]">Supervición de todos los proyectos activos en la plataforma.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" size={18} />
             <input 
               type="text" 
               placeholder="Buscar por cliente o ID..."
               className="bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-[var(--color-primario-claro)] transition-all w-64"
               value={termino}
               onChange={(e) => setTermino(e.target.value)}
             />
           </div>
           <button className="btn btn-secundario px-4 py-2 flex items-center gap-2 text-sm">
             <Filter size={16} /> Filtros
           </button>
        </div>
      </div>

      {/* Grid de Resumen Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { l: 'Total Eventos', v: '156', c: 'text-white' },
          { l: 'En Proceso', v: '94', c: 'text-blue-400' },
          { l: 'Próximos 30 días', v: '12', c: 'text-amber-400' },
          { l: 'Finalizados', v: '50', c: 'text-emerald-400' },
        ].map((s, i) => (
          <div key={i} className="card p-4 border-none bg-white/5">
            <p className="text-[10px] uppercase font-black tracking-widest text-[var(--color-texto-muted)] mb-1">{s.l}</p>
            <p className={cn("text-2xl font-black", s.c)}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="tabla w-full">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 py-4 text-left">ID & Cliente</th>
                <th className="px-6 py-4 text-left">Tipo</th>
                <th className="px-6 py-4 text-left">Plan</th>
                <th className="px-6 py-4 text-left">Fecha</th>
                <th className="px-6 py-4 text-left">Presupuesto</th>
                <th className="px-6 py-4 text-right">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {EVENTOS_MOCK.map((evt) => (
                <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold">{evt.cliente}</div>
                    <div className="text-[10px] text-[var(--color-texto-muted)] font-mono uppercase">{evt.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge badge-premium text-[10px]">{evt.tipo}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded",
                      evt.plan === 'PLANNER' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 
                      evt.plan === 'ORO' ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' : 'bg-gray-400/20 text-gray-400'
                    )}>
                      {evt.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{evt.fecha}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold">{formatearMoneda(evt.presupuesto)}</div>
                    <div className="w-24 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                       <div className="h-full bg-[var(--color-primario)]" style={{ width: `${(evt.gastado / evt.presupuesto) * 100}%` }} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={cn("flex items-center justify-end gap-1.5 text-xs font-bold", evt.color)}>
                       <evt.icon size={14} />
                       {evt.estado}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[var(--color-primario-claro)]" title="Ver Detalles">
                         <Eye size={18} />
                       </button>
                       <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[var(--color-texto-muted)]">
                         <MoreVertical size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
