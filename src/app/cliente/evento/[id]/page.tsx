'use client';

import { 
  Users, 
  Wallet, 
  MapPin, 
  Calendar as CalendarIcon, 
  Plus, 
  Download, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ArrowLeft,
  LayoutGrid,
  Edit,
  X
} from 'lucide-react';
import { useState } from 'react';
import { formatearMoneda, formatearFechaCorta, cn } from '@/lib/utils';
import Link from 'next/link';

export default function EventDetailPage() {
  const [tabActiva, setTabActiva] = useState('resumen');

  // Mock data del evento
  const [evento, setEvento] = useState({
    id: 'E-789',
    nombre: 'Mi Boda Mágica',
    fecha: '2024-12-15',
    presupuestoTotal: 150000,
    personas: 150,
    clima: 'Despejado',
    location: 'Jardín Las Rosas, CDMX',
    tipo: 'Boda'
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempEvento, setTempEvento] = useState(evento);

  const eventTypes = ['Boda', 'XV Años', 'Fiesta Infantil', 'Graduación', 'Fiesta', 'Bautizo'];

  const proveedoresContratados = [
    { id: 1, nombre: 'Jardín Las Rosas', categoria: 'Salón', total: 45000, pagado: 25000, pendiente: 20000, estado: 'Liquidado Parcial' },
    { id: 2, nombre: 'DJ SoundWave', categoria: 'Música', total: 8500, pagado: 8500, pendiente: 0, estado: 'Liquidado' },
    { id: 3, nombre: 'Banquete Elegance', categoria: 'Comida', total: 65000, pagado: 10000, pendiente: 55000, estado: 'Anticipo Pendiente' },
  ];

  const invitados = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@gmail.com', rsvp: 'CONFIRMADO', plusOne: true },
    { id: 2, nombre: 'María García', email: 'maria@gmail.com', rsvp: 'PENDIENTE', plusOne: false },
    { id: 3, nombre: 'Pedro Ortiz', email: 'pedro@gmail.com', rsvp: 'RECHAZADO', plusOne: false },
  ];

  const subtotalContratado = proveedoresContratados.reduce((acc, p) => acc + p.total, 0);
  const totalPagado = proveedoresContratados.reduce((acc, p) => acc + p.pagado, 0);

  return (
    <div className="space-y-10">
      {/* Header con navegación de regreso */}
      <div className="flex flex-col gap-4">
        <Link href="/cliente/dashboard" className="flex items-center gap-2 text-sm text-[var(--color-texto-muted)] hover:text-white transition-colors w-fit">
          <ArrowLeft size={16} /> Volver a mis eventos
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
             <div className="flex items-center gap-4">
                <h1 className="text-4xl font-extrabold">{evento.nombre}</h1>
                <button 
                  onClick={() => {
                    setTempEvento(evento);
                    setIsEditModalOpen(true);
                  }}
                  className="p-2 rounded-full hover:bg-white/5 text-[var(--color-texto-muted)] hover:text-white transition-all"
                >
                  <Edit size={18} />
                </button>
             </div>
            <div className="flex flex-wrap items-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm text-[var(--color-texto-suave)]">
                <CalendarIcon size={16} className="text-[var(--color-primario-claro)]" />
                {formatearFechaCorta(evento.fecha)}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-texto-suave)]">
                <MapPin size={16} className="text-[var(--color-acento-claro)]" />
                {evento.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-texto-suave)]">
                <Users size={16} className="text-blue-400" />
                {evento.personas} Invitados
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             <button className="btn btn-fantasma gap-2"><Download size={18} /> Exportar Reporte</button>
             <button className="btn btn-primario gap-2"><Plus size={18} /> Nuevo Proveedor</button>
          </div>
        </div>
      </div>

      {/* Tabs de Navegación del Evento */}
      <div className="flex border-b border-[var(--color-borde-suave)] gap-8 overflow-x-auto no-scrollbar">
        {['resumen', 'proveedores', 'invitados', 'mesas', 'invitacion'].map((tab) => (
          <button
            key={tab}
            onClick={() => setTabActiva(tab)}
            className={cn(
              "pb-4 text-sm font-bold capitalize transition-all relative whitespace-nowrap",
              tabActiva === tab ? "text-white" : "text-[var(--color-texto-muted)] hover:text-white"
            )}
          >
            {tab}
            {tabActiva === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-primario)] rounded-t-full shadow-[0_0_10px_var(--color-primario)]" />
            )}
          </button>
        ))}
      </div>

      {/* Renderizado Condicional de TABS */}
      {tabActiva === 'resumen' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="card bg-gradient-to-br from-[var(--color-fondo-card)] to-transparent">
              <h2 className="text-xl font-bold mb-6">Estado del Presupuesto</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                   <p className="text-xs font-bold text-[var(--color-texto-muted)] uppercase mb-1">Presupuesto</p>
                   <p className="text-2xl font-black">{formatearMoneda(evento.presupuestoTotal)}</p>
                </div>
                <div>
                   <p className="text-xs font-bold text-[var(--color-texto-muted)] uppercase mb-1">Contratado</p>
                   <p className="text-2xl font-black text-amber-400">{formatearMoneda(subtotalContratado)}</p>
                </div>
                <div>
                   <p className="text-xs font-bold text-[var(--color-texto-muted)] uppercase mb-1">Restante</p>
                   <p className="text-2xl font-black text-emerald-400">{formatearMoneda(evento.presupuestoTotal - subtotalContratado)}</p>
                </div>
              </div>
              <div className="mt-8 space-y-2">
                 <div className="flex justify-between text-xs font-bold">
                    <span className="text-[var(--color-texto-suave)]">PROGRESO DE PAGOS</span>
                    <span>{Math.round((totalPagado/subtotalContratado)*100)}%</span>
                 </div>
                 <div className="w-full h-3 bg-[var(--color-fondo-input)] rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300" style={{ width: `${(totalPagado/subtotalContratado)*100}%` }} />
                 </div>
                 <p className="text-[10px] text-[var(--color-texto-muted)] italic">
                    Has pagado {formatearMoneda(totalPagado)} de {formatearMoneda(subtotalContratado)} contratados.
                 </p>
              </div>
            </div>
            {/* Proveedores */}
            <div className="card overflow-hidden p-0">
               <div className="p-6 border-b border-[var(--color-borde-suave)] flex justify-between items-center">
                  <h3 className="font-bold">Proveedores del Evento</h3>
                  <button onClick={() => setTabActiva('proveedores')} className="text-xs text-[var(--color-primario-claro)] hover:underline">Gestionar todo</button>
               </div>
               <table className="tabla">
                  <thead>
                    <tr><th>Servicio</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {proveedoresContratados.map((p) => (
                      <tr key={p.id}>
                        <td className="font-bold">{p.nombre} <span className="block text-[10px] font-normal text-[var(--color-texto-muted)]">{p.categoria}</span></td>
                        <td>{formatearMoneda(p.total)}</td>
                        <td className="text-emerald-400">{formatearMoneda(p.pagado)}</td>
                        <td className="text-red-400">{formatearMoneda(p.pendiente)}</td>
                        <td><span className={cn("badge text-[10px]", p.estado === 'Liquidado' ? "badge-liquidado" : "badge-apartado")}>{p.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
          {/* Sidebar Resume */}
          <div className="space-y-8">
             <div className="card text-center relative overflow-hidden">
                <h3 className="font-bold mb-4 flex items-center justify-between">Invitados <span className="text-xs text-[var(--color-texto-muted)]">{invitados.length} total</span></h3>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase mb-4">
                   <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20">45 Confirmados</div>
                   <div className="bg-red-500/10 text-red-400 p-2 rounded-lg border border-red-500/20">12 Cancelados</div>
                   <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg border border-blue-500/20">93 Pendientes</div>
                </div>
                <button onClick={() => setTabActiva('invitados')} className="btn btn-secundario w-full text-xs">Gestionar Lista</button>
             </div>
             <Link href="/cliente/invitaciones">
                <div className="card bg-[var(--color-fondo-input)] relative overflow-hidden group cursor-pointer">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-white/10 rounded-lg flex items-center justify-center text-white/20"><Mail size={32} /></div>
                      <div><h4 className="font-bold text-sm">Invitación Digital</h4><p className="text-xs text-[var(--color-texto-muted)]">Aún no se han enviado envíos.</p></div>
                   </div>
                   <ChevronRight className="absolute top-1/2 -translate-y-1/2 right-4 text-[var(--color-texto-muted)] group-hover:text-white transition-all" />
                </div>
             </Link>
             <button className="btn btn-fantasma w-full gap-2 text-[var(--color-acento-claro)] border-[var(--color-acento-claro)]/30 hover:bg-[var(--color-acento-claro)]/10"><AlertCircle size={16} /> Cancelar este evento</button>
          </div>
        </div>
      )}

      {/* TABS CONTENIDO */}
      {tabActiva === 'proveedores' && (
        <div className="space-y-6">
           <h2 className="text-2xl font-bold">Proveedores Contratados</h2>
           <div className="card p-0 overflow-hidden">
             <table className="tabla">
                <thead><tr><th>Servicio</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>Estado</th></tr></thead>
                <tbody>
                  {proveedoresContratados.map((p) => (
                    <tr key={p.id}>
                      <td className="font-bold">{p.nombre} <span className="block text-[10px] font-normal text-[var(--color-texto-muted)]">{p.categoria}</span></td>
                      <td>{formatearMoneda(p.total)}</td>
                      <td className="text-emerald-400">{formatearMoneda(p.pagado)}</td>
                      <td className="text-red-400">{formatearMoneda(p.pendiente)}</td>
                      <td><span className={cn("badge text-[10px]", p.estado === 'Liquidado' ? "badge-liquidado" : "badge-apartado")}>{p.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>
      )}

      {tabActiva === 'mesas' && (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 card border-dashed border-2">
           <div className="p-6 rounded-full bg-violet-500/10 text-violet-400"><LayoutGrid size={48} /></div>
           <div><h2 className="text-2xl font-bold">Organizador de Mesas</h2><p className="text-[var(--color-texto-suave)] max-w-sm mx-auto mt-2">Utiliza nuestra herramienta visual para organizar a tus invitados y optimizar el espacio de tu evento.</p></div>
           <Link href="/cliente/mesas"><button className="btn btn-primario px-10">Abrir Plano Interactivo</button></Link>
        </div>
      )}

      {tabActiva === 'invitados' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold">Gestión de Invitados</h2>
             <div className="flex gap-2">
                <button className="btn btn-secundario text-xs px-4">Importar CSV</button>
                <button className="btn btn-primario text-xs px-4"><Plus size={14} className="mr-1" /> Nuevo Invitado</button>
             </div>
          </div>
          <div className="card p-0 overflow-hidden">
             <table className="tabla">
                <thead><tr><th>Nombre</th><th>Email</th><th>Acompañante</th><th>Estado RSVP</th><th className="text-right">Acciones</th></tr></thead>
                <tbody>
                  {invitados.map((i) => (
                    <tr key={i.id}>
                      <td className="font-medium">{i.nombre}</td>
                      <td className="text-[var(--color-texto-suave)] text-xs">{i.email}</td>
                      <td>{i.plusOne ? 'Sí (+1)' : 'No'}</td>
                      <td><span className={cn("badge text-[9px] uppercase tracking-tighter", i.rsvp === 'CONFIRMADO' ? "badge-liquidado" : i.rsvp === 'PENDIENTE' ? "badge-apartado" : "badge-cancelado")}>{i.rsvp}</span></td>
                      <td className="text-right"><button className="p-2 hover:bg-white/5 rounded-full"><MoreVertical size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {/* MODAL EDITAR EVENTO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="card max-w-xl w-full p-8 space-y-8 animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold italic tracking-tighter uppercase">Configuración del Evento</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Nombre del Evento</label>
                  <input type="text" value={tempEvento.nombre} onChange={(e) => setTempEvento({...tempEvento, nombre: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] flex justify-between">Tipo de Evento {proveedoresContratados.length > 0 && <span className="text-[8px] text-amber-500 uppercase flex items-center gap-1"><Clock size={10} /> BLOQUEADO</span>}</label>
                  <select disabled={proveedoresContratados.length > 0} value={tempEvento.tipo} onChange={(e) => setTempEvento({...tempEvento, tipo: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all disabled:opacity-40">
                    {eventTypes.map(t => <option key={t} value={t} className="bg-[#1a1a1a]">{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] flex justify-between">Fecha del Evento {proveedoresContratados.length > 0 && <span className="text-[8px] text-amber-500 uppercase flex items-center gap-1"><Clock size={10} /> BLOQUEADO</span>}</label>
                  <input type="date" disabled={proveedoresContratados.length > 0} value={tempEvento.fecha} onChange={(e) => setTempEvento({...tempEvento, fecha: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all disabled:opacity-40" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Invitados ({tempEvento.personas})</label>
                  <input type="range" min="10" max="1000" step="10" value={tempEvento.personas} onChange={(e) => setTempEvento({...tempEvento, personas: parseInt(e.target.value)})} className="w-full accent-[var(--color-primario-claro)]" />
                </div>
             </div>
             <div className="flex gap-4 pt-4">
                <button onClick={() => setIsEditModalOpen(false)} className="btn btn-secundario flex-1 py-4">Cancelar</button>
                <button onClick={() => { setEvento(tempEvento); setIsEditModalOpen(false); }} className="btn btn-primario flex-1 py-4 font-bold shadow-lg shadow-violet-500/20">Guardar Cambios</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
