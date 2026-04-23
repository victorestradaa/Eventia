'use client';

import React from 'react';
import { Users, Calendar, DollarSign, Store, Activity, Database, ChevronUp, BarChart2, PieChart as PieChartIcon, MapPin, Package, Clock } from 'lucide-react';
import { formatearMoneda, cn } from '@/lib/utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
  PieChart, Pie, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';

interface DashboardAdminClientProps {
  stats: any;
  analytics?: {
    userTrends: any[];
    eventTrends: any[];
    catStats: any[];
    typeStats: any[];
    reports: any;
  }
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

export default function DashboardAdminClient({ stats, analytics }: DashboardAdminClientProps) {
  const kpis = [
    { label: 'Usuarios Totales', valor: stats.totalUsuarios.toLocaleString(), cambio: '+0%', icon: Users, color: 'text-blue-400' },
    { label: 'Eventos Activos', valor: stats.totalEventos.toLocaleString(), cambio: '+0%', icon: Calendar, color: 'text-violet-400' },
    { label: 'Ingresos Mensuales', valor: formatearMoneda(stats.totalIngresos), cambio: '+0%', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Proveedores Registrados', valor: stats.totalProveedores.toLocaleString(), cambio: '+0%', icon: Store, color: 'text-amber-400' },
  ];

  const { 
    userTrends = [], 
    eventTrends = [], 
    catStats = [], 
    typeStats = [],
    reports = null
  } = analytics || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37] mb-1">Sistema de Gestión</p>
           <h1 className="text-3xl font-black italic tracking-tighter uppercase">Admin Panel</h1>
           <p className="text-[var(--color-texto-suave)] text-sm">Analítica y Control de Plataforma (Eventia)</p>
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

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Growth Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="mb-6 flex items-center justify-between">
             <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity size={20} className="text-blue-400" />
                Tendencia de Nuevos Registros (Últimos 30 días)
             </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCliente" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProveedor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} 
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" name="Clientes Nuevos" dataKey="CLIENTE" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCliente)" strokeWidth={3} />
                <Area type="monotone" name="Proveedores Nuevos" dataKey="PROVEEDOR" stroke="#f59e0b" fillOpacity={1} fill="url(#colorProveedor)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
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

      {/* NEW SECTION: Reports & Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Events Created */}
        <div className="card p-6">
           <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <BarChart2 size={20} className="text-violet-400" />
              Eventos Creados
           </h3>
           <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventTrends} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                <Bar name="Eventos" dataKey="Eventos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>

        {/* Services by Category */}
        <div className="card p-6">
           <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <PieChartIcon size={20} className="text-emerald-400" />
              Servicios por Categoría
           </h3>
           <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {catStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
           </div>
        </div>

        {/* Target Event Types */}
        <div className="card p-6">
           <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-center justify-center">
              Target (Tipos de Evento)
           </h3>
           <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={typeStats}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} />
                <Radar name="Servicios Afines" dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* EXTRA ROW: Services Time and Reservations (Contratados) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Services over Time */}
        <div className="card p-6">
           <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Clock size={20} className="text-amber-400" />
              Servicios Creados por Tiempo
           </h3>
           <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reports?.serviciosPorTiempo || []}>
                <defs>
                  <linearGradient id="colorServ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="total" stroke="#f59e0b" fillOpacity={1} fill="url(#colorServ)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
           </div>
        </div>

        {/* Bookings (Contratados) */}
        <div className="card p-6">
           <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Package size={20} className="text-emerald-400" />
              Tendencia de Servicios Contratados
           </h3>
           <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports?.reservasPorTiempo || []}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                <Bar name="Contrataciones" dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* FINAL ROW: Location of Providers */}
      <div className="grid grid-cols-1 gap-8">
        <div className="card p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                 <MapPin size={24} className="text-red-400" />
                 Distribución Geográfica de Proveedores
              </h3>
              <p className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-[0.2em]">Top 10 Ciudades</p>
           </div>
           <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={reports?.ubicacionProveedores || []} layout="vertical">
                 <XAxis type="number" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis dataKey="name" type="category" stroke="#fff" fontSize={10} width={120} tickLine={false} axisLine={false} />
                 <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                 <Bar dataKey="count" fill="#d4af37" radius={[0, 10, 10, 0]} barSize={30} />
               </BarChart>
             </ResponsiveContainer>
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
