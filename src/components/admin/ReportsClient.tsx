'use client';

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { formatearMoneda } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, MapPin, Package } from 'lucide-react';

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
    <div className="space-y-10 pb-10">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden p-8 rounded-[2rem] bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] shadow-xl group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] mb-4">
              <DollarSign size={24} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)] mb-2">Comisiones Totales</h3>
            <p className="text-4xl font-serif text-[#d4af37] italic">{formatearMoneda(metricas.comisionesTotales)}</p>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase text-emerald-500">
               <TrendingUp size={14} /> 15% vs mes anterior
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden p-8 rounded-[2rem] bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] shadow-xl group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
              <Package size={24} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)] mb-2">Volumen de Negocio</h3>
            <p className="text-4xl font-serif text-blue-400 italic">{formatearMoneda(metricas.ingresosTotales)}</p>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase text-blue-400">
               <TrendingUp size={14} /> 8.2% vs mes anterior
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden p-8 rounded-[2rem] bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] shadow-xl group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
              <TrendingDown size={24} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)] mb-2">Ajustes / Devoluciones</h3>
            <p className="text-4xl font-serif text-red-400 italic">{formatearMoneda(metricas.devoluciones)}</p>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase text-red-400">
               <TrendingDown size={14} /> 2.1% vs mes anterior
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart: Services Growth */}
        <div className="p-8 rounded-[2.5rem] bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-lg font-serif italic font-bold">Crecimiento de Servicios</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.serviciosPorTiempo}>
                <defs>
                  <linearGradient id="colorServicio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="name" stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#d4af37' }}
                />
                <Area type="monotone" dataKey="total" stroke="#d4af37" fillOpacity={1} fill="url(#colorServicio)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Reservations over Time */}
        <div className="p-8 rounded-[2.5rem] bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] shadow-xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Package size={20} />
            </div>
            <h3 className="text-lg font-serif italic font-bold">Histórico de Contrataciones</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.reservasPorTiempo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="name" stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#10B981' }}
                />
                <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart: Services by Category (Pie) */}
        <div className="p-8 rounded-[2.5rem] bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] shadow-xl space-y-6">
          <h3 className="text-base font-serif italic font-bold flex items-center gap-3">
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
                >
                  {data.serviciosPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
             {data.serviciosPorCategoria.slice(0, 4).map((entry, i) => (
               <div key={entry.name} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                 <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-texto-muted)]">{entry.name}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Chart: Provider Locations (Bar) */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] shadow-xl space-y-6">
          <h3 className="text-base font-serif italic font-bold flex items-center gap-3">
             <MapPin size={18} className="text-[#d4af37]" /> Geografía de Proveedores
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ubicacionProveedores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
                <XAxis type="number" stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#fff" fontSize={10} width={100} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#2a2a2a'}}
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#d4af37" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="p-8 rounded-[2.5rem] bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] shadow-xl">
        <h3 className="text-xl font-serif italic font-bold mb-8">Detalle de Ingresos Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-borde-suave)]">
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)]">Proveedor</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)]">Categoría</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)]">Monto Total</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)]">Comisión (10%)</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)]">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-borde-suave)]">
              {detalleIngresos.map((item, i) => (
                <tr key={i} className="group hover:bg-[#d4af37]/5 transition-colors">
                  <td className="py-4 font-serif italic text-white">{item.proveedor}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-[9px] font-black uppercase tracking-widest text-[var(--color-texto-muted)]">
                      {item.evento}
                    </span>
                  </td>
                  <td className="py-4 font-bold text-white">{formatearMoneda(item.total)}</td>
                  <td className="py-4">
                    <span className="font-bold text-[#d4af37]">{formatearMoneda(item.comision)}</span>
                  </td>
                  <td className="py-4 text-xs font-black uppercase tracking-widest text-[var(--color-texto-muted)]">
                    {item.fecha}
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
