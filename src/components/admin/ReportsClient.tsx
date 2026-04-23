'use client';

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { formatearMoneda, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, MapPin, Package, Download, ChevronUp } from 'lucide-react';

const COLORS = ['#d4af37', '#b89547', '#f3cf6d', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#F43F5E'];

interface ReportsClientProps {
  data: {
    serviciosPorTiempo: any[];
    serviciosPorCategoria: any[];
    reservasPorTiempo: any[];
    reservasPorEstado: any[];
    ubicacionProveedores: any[];
    metricas: {
      comisionesTotales: number;
      ingresosTotales: number;
      devoluciones: number;
    };
    detalleIngresos: any[];
  }
}

export default function ReportsClient({ data }: ReportsClientProps) {
  const { metricas, detalleIngresos } = data;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header section consistent with Admin Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37] mb-1">Métricas Financieras</p>
           <h1 className="text-3xl font-black italic tracking-tighter uppercase">Reportes de Ingresos</h1>
           <p className="text-[var(--color-texto-suave)] text-sm">Monitoreo global de transacciones y comisiones</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-[#d4af37] transition-all shadow-xl">
           <Download size={16} /> Exportar Datos
        </button>
      </div>

      {/* Financial Overview Cards - Premium Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] mb-4 border border-[#d4af37]/20">
              <DollarSign size={24} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)] mb-1">Comisiones Totales</h3>
            <p className="text-4xl font-serif text-[#d4af37] italic tracking-tight">{formatearMoneda(metricas.comisionesTotales)}</p>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase text-emerald-400">
               <TrendingUp size={14} /> 15% vs mes pasado
            </div>
          </div>
        </div>

        <div className="stat-card group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20">
              <Package size={24} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)] mb-1">Volumen de Negocio</h3>
            <p className="text-4xl font-serif text-blue-400 italic tracking-tight">{formatearMoneda(metricas.ingresosTotales)}</p>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase text-blue-400">
               <TrendingUp size={14} /> 8.2% vs mes pasado
            </div>
          </div>
        </div>

        <div className="stat-card group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-4 border border-rose-500/20">
              <TrendingDown size={24} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)] mb-1">Ajustes / Devoluciones</h3>
            <p className="text-4xl font-serif text-rose-400 italic tracking-tight">{formatearMoneda(metricas.devoluciones)}</p>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase text-rose-400">
               <TrendingDown size={14} /> 0% incidencias
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart: Services Growth */}
        <div className="card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/10">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Crecimiento de Servicios</h3>
            </div>
          </div>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.serviciosPorTiempo}>
                <defs>
                  <linearGradient id="colorServicio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#d4af37' }}
                />
                <Area type="monotone" dataKey="total" stroke="#d4af37" fillOpacity={1} fill="url(#colorServicio)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Reservations over Time */}
        <div className="card p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
              <Package size={20} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Histórico de Contrataciones</h3>
          </div>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.reservasPorTiempo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#10B981' }}
                />
                <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart: Services by Category (Pie) */}
        <div className="card p-8 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-3">
             <Briefcase size={18} className="text-[#d4af37]" /> Servicios por Categoría
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.serviciosPorCategoria}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.serviciosPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4">
             {data.serviciosPorCategoria.slice(0, 4).map((entry, i) => (
               <div key={entry.name} className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                 <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-texto-muted)] truncate">{entry.name}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Chart: Provider Locations (Bar) */}
        <div className="lg:col-span-2 card p-8 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-3">
             <MapPin size={18} className="text-[#d4af37]" /> Geografía de Proveedores
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ubicacionProveedores} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#fff" fontSize={10} width={100} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.03)'}}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#d4af37" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detail Table - Premium Aesthetic */}
      <div className="card p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-2xl font-bold tracking-tight">Detalle de Ingresos Recientes</h3>
           <div className="bg-[#d4af37]/10 text-[#d4af37] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#d4af37]/20">Actualizado hace 1 min</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)]">Proveedor</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)] text-center">Categoría</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)]">Monto Total</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)]">Comisión (10%)</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)] text-right pr-4">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/50">
              {detalleIngresos.map((item, i) => (
                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-6 font-bold text-base tracking-tight text-white">{item.proveedor}</td>
                  <td className="py-6 text-center">
                    <span className="px-3 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-[#d4af37]">
                      {item.evento}
                    </span>
                  </td>
                  <td className="py-6 text-lg font-black tracking-tighter text-white">{formatearMoneda(item.total)}</td>
                  <td className="py-6">
                    <div className="flex items-center gap-2">
                       <span className="text-lg font-black tracking-tighter text-emerald-400">{formatearMoneda(item.comision)}</span>
                       <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500"><ChevronUp size={12} /></div>
                    </div>
                  </td>
                  <td className="py-6 text-right pr-4">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] group-hover:text-white transition-colors">
                      {item.fecha}
                    </span>
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
