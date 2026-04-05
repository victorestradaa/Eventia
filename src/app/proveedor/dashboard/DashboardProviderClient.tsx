'use client';

import { 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign,
  Package,
  ChevronRight,
  ExternalLink,
  Zap,
  Star,
  Crown,
  Gem
} from 'lucide-react';
import { formatearMoneda, cn } from '@/lib/utils';
import Link from 'next/link';

interface DashboardProviderClientProps {
  resumen: any;
  perfil: any;
}

export default function DashboardProviderClient({ resumen, perfil }: DashboardProviderClientProps) {
  if (!perfil || !perfil.proveedor) {
    return <div className="p-10 text-red-500 font-bold">Error Crítico: Perfil de Proveedor incompleto en el sistema.</div>;
  }
  
  const proveedor = perfil.proveedor;
  
  // Proveer valores por defecto en caso de datos nulos para evitar caídas de React
  const nombre = proveedor.nombre || 'Proveedor';
  const categoriaStr = typeof proveedor.categoria === 'string' ? proveedor.categoria.toLowerCase() : 'servicio';
  const estadoNegocio = proveedor.activo ? 'activo' : 'pausado';
  
  const stats = [
    { 
      label: 'Ingresos Totales', 
      valor: formatearMoneda(resumen.ingresosTotales), 
      icon: DollarSign, 
      trend: `${resumen.totalReservas} ventas totales` 
    },
    { 
      label: 'Próximas Fechas', 
      valor: resumen.reservas.length.toString(), 
      icon: CalendarIcon, 
      trend: 'Agenda activa' 
    },
    { 
      label: 'Servicios Activos', 
      valor: resumen.servicios.length.toString(), 
      icon: Package, 
      trend: 'En tu catálogo' 
    },
    { 
      label: 'Calificación', 
      valor: '0.0', 
      icon: TrendingUp, 
      trend: 'Sin reseñas aún' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold italic">Bienvenido, {nombre}</h1>
          <p className="text-[var(--color-texto-suave)]">Tu negocio de {categoriaStr} está {estadoNegocio}.</p>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest leading-none mb-1">Ubicación</p>
           <p className="text-sm font-bold">{proveedor.ciudad || 'N/A'}, {proveedor.estado || 'N/A'}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card hover:bg-white/[0.02] transition-colors cursor-default group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-[var(--color-texto-muted)] uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="p-2 rounded-xl bg-[var(--color-primario)]/10 text-[var(--color-primario-claro)] group-hover:scale-110 transition-transform">
                <stat.icon size={18} />
              </div>
            </div>
            <div className="stat-valor text-2xl">{stat.valor}</div>
            <p className="text-[10px] font-bold text-[var(--color-texto-suave)] mt-2 italic">
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Próximos Eventos Reales */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h3 className="text-xl font-bold flex items-center gap-2">
               <CalendarIcon size={20} className="text-[var(--color-primario-claro)]" />
               Agenda Reciente
            </h3>
            <Link href="/proveedor/calendario" className="text-xs font-bold text-[var(--color-primario-claro)] hover:underline flex items-center gap-1">
              Calendario completo <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="tabla w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-left">Cliente / Evento</th>
                  <th className="px-6 py-4 text-left">Fecha</th>
                  <th className="px-6 py-4 text-left">Estado</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {resumen.reservas.length > 0 ? (
                  resumen.reservas.map((res: any) => (
                    <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold flex items-center gap-2">
                          {res.esManual ? (res.nombreClienteExterno || 'Cliente Externo') : (res.cliente?.usuario?.nombre || 'N/A')}
                          {res.esManual && <span className="text-[8px] uppercase font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Manual</span>}
                        </div>
                        <div className="text-[10px] text-[var(--color-texto-muted)]">ID: {res.id.slice(-8).toUpperCase()}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(res.fechaEvento).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          res.estado === 'LIQUIDADO' ? 'badge-liquidado' : 
                          res.estado === 'APARTADO' ? 'badge-apartado' : 'badge-temporal'
                        }`}>
                          {res.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        {formatearMoneda(res.montoTotal)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-texto-suave)] italic">
                      No tienes reservas registradas aún. ¡Publica tus servicios para empezar!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nivel de Exposición Dynamic */}
        <div className="flex flex-col gap-6">
          <div className="card text-center p-8 space-y-6 relative overflow-hidden group">
            {/* Fondo decorativo sutil basado en el plan */}
            <div className={cn(
              "absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10",
              proveedor.plan === 'ELITE' ? "bg-emerald-500" :
              proveedor.plan === 'PREMIUM' ? "bg-amber-500" :
              proveedor.plan === 'INTERMEDIO' ? "bg-blue-500" : "bg-white"
            )} />

            <h3 className="text-xl font-bold relative z-10">Tu Visibilidad</h3>
            <div className="flex flex-col items-center relative z-10">
              <div className={cn(
                "relative w-36 h-36 flex items-center justify-center rounded-3xl border-2 transition-all p-1",
                proveedor.plan === 'ELITE' ? "border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]" :
                proveedor.plan === 'PREMIUM' ? "border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]" :
                proveedor.plan === 'INTERMEDIO' ? "border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]" : "border-white/20"
              )}>
                <div className="w-full h-full rounded-[20px] overflow-hidden bg-[var(--color-fondo-input)] flex items-center justify-center border border-white/5">
                  {proveedor.logoUrl ? (
                    <img src={proveedor.logoUrl} alt={nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                       <p className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-1">Tu Logo</p>
                       <Package size={24} className="mx-auto text-white/20" />
                    </div>
                  )}
                </div>

                {/* Badge de Plan Dinámico */}
                <div className={cn(
                  "absolute -top-3 -right-3 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform",
                  proveedor.plan === 'ELITE' ? "bg-emerald-500 text-white shadow-emerald-500/40" :
                  proveedor.plan === 'PREMIUM' ? "bg-amber-500 text-white shadow-amber-500/40" :
                  proveedor.plan === 'INTERMEDIO' ? "bg-blue-500 text-white shadow-blue-500/40" : "bg-gray-600 text-white"
                )}>
                   {proveedor.plan === 'ELITE' ? <Gem size={20} /> :
                    proveedor.plan === 'PREMIUM' ? <Crown size={20} /> :
                    proveedor.plan === 'INTERMEDIO' ? <Star size={20} /> : <Zap size={20} />}
                </div>
              </div>
              
              <div className="mt-6 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)]">Nivel de Exposición</p>
                <p className={cn(
                  "text-xl font-black uppercase",
                  proveedor.plan === 'ELITE' ? "text-emerald-400" :
                  proveedor.plan === 'PREMIUM' ? "text-amber-400" :
                  proveedor.plan === 'INTERMEDIO' ? "text-blue-400" : "text-white"
                )}>
                  {proveedor.plan === 'GRATIS' ? 'Básico' : proveedor.plan}
                </p>
              </div>

              <p className="mt-4 text-xs text-[var(--color-texto-suave)] leading-relaxed min-h-[40px]">
                {proveedor.plan === 'ELITE' ? 'Socio prioritario. Tienes la máxima relevancia y 0% de comisiones.' :
                 proveedor.plan === 'PREMIUM' ? 'Dominio total. Tu negocio aparece en los primeros resultados de búsqueda.' :
                 proveedor.plan === 'INTERMEDIO' ? 'Visibilidad aumentada. Tu perfil destaca entre la competencia.' : 
                 'Mejora tu plan para aparecer en las primeras posiciones y recibir más cotizaciones.'}
              </p>

              <Link href="/proveedor/planes" className="w-full mt-6">
                <button className={cn(
                  "btn w-full font-bold shadow-lg transition-all",
                  proveedor.plan === 'ELITE' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20" :
                  proveedor.plan === 'PREMIUM' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20" :
                  "btn-primario shadow-violet-500/20"
                )}>
                  {proveedor.plan === 'ELITE' ? 'Ver Beneficios' : 'Siguiente Nivel'}
                </button>
              </Link>
            </div>
          </div>

          <div className="card bg-[var(--color-primario)]/5 border-dashed border-[var(--color-primario-claro)]/30 p-6">
             <h4 className="font-bold flex items-center gap-2 mb-2 text-sm">
                <Package size={16} className="text-[var(--color-primario-claro)]" />
                Sugerencia de Crecimiento
             </h4>
             <p className="text-xs text-[var(--color-texto-suave)] leading-relaxed">
                Completa tu catálogo con al menos 5 servicios para aumentar tu probabilidad de contratación en un **35%**.
             </p>
             <Link href="/proveedor/catalogo" className="inline-block mt-4 text-[10px] font-black uppercase text-[var(--color-primario-claro)] hover:underline">
                Ir al Catálogo &rarr;
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
