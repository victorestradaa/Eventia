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
  const { metricas, detalleIngresos, ingresosPorTiempo } = data;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* MONETARY HEADER ONLY */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">Reporte de Ingresos</h1>
           <p className="text-[#d4af37] text-sm font-bold tracking-widest uppercase mt-1">Métricas Financieras Globales (MXN)</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] text-[10px] font-black uppercase tracking-widest hover:bg-[#d4af37]/10 transition-all">
           <Download size={14} /> Exportar Reporte
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card group relative overflow-hidden bg-gradient-to-br from-[#d4af37]/10 to-transparent">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] mb-4 border border-[#d4af37]/20">
              <DollarSign size={24} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)] mb-1">Comisiones Totales</h3>
            <p className="text-4xl font-black text-[#d4af37] tracking-tighter">{formatearMoneda(metricas.comisionesTotales)}</p>
          </div>
        </div>

        <div className="stat-card group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-transparent">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20">
              <Package size={24} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)] mb-1">Volumen de Negocio</h3>
            <p className="text-4xl font-black text-blue-400 tracking-tighter">{formatearMoneda(metricas.ingresosTotales)}</p>
          </div>
        </div>

        <div className="stat-card group relative overflow-hidden bg-gradient-to-br from-rose-500/10 to-transparent">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-4 border border-rose-500/20">
              <TrendingDown size={24} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)] mb-1">Ajustes / Devoluciones</h3>
            <p className="text-4xl font-black text-rose-400 tracking-tighter">{formatearMoneda(metricas.devoluciones)}</p>
          </div>
        </div>
      </div>

      {/* Main Income Chart */}
      <div className="card p-8 space-y-6 bg-gradient-to-br from-emerald-500/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Tendencia de Ingresos Mensuales</h3>
              <p className="text-xs text-[var(--color-texto-muted)]">Crecimiento monetario bruto acumulado (MXN)</p>
            </div>
          </div>
        </div>
        <div className="h-[400px] w-full mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ingresosPorTiempo || []}>
              <defs>
                <linearGradient id="colorIngreso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={11} axisLine={false} tickLine={false} dy={10} />
              <YAxis 
                stroke="#52525b" 
                fontSize={11} 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(val) => `$${val/1000}k`}
              />
              <Tooltip 
                formatter={(val: number) => [formatearMoneda(val), 'Ingresos']}
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', fontSize: '12px' }}
                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="total" stroke="#10b981" fillOpacity={1} fill="url(#colorIngreso)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
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
