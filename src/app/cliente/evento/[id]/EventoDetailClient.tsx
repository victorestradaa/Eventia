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
  X,
  Loader2,
  Trash2
} from 'lucide-react';
import { useState } from 'react';
import { formatearMoneda, formatearFechaCorta, cn } from '@/lib/utils';
import Link from 'next/link';
import { updateEvento, addInvitado } from '@/lib/actions/eventActions';
import { useRouter } from 'next/navigation';

interface EventoDetailClientProps {
  evento: any;
}

export default function EventoDetailClient({ evento: initialEvento }: EventoDetailClientProps) {
  const router = useRouter();
  const [evento, setEvento] = useState(initialEvento);
  const [tabActiva, setTabActiva] = useState('resumen');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tempEvento, setTempEvento] = useState({
    nombre: evento.nombre,
    fecha: evento.fecha ? new Date(evento.fecha).toISOString().split('T')[0] : '',
    tipo: evento.tipo,
    numInvitados: evento.numInvitados || 0,
    presupuestoTotal: Number(evento.presupuestoTotal) || 0,
  });
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [newGuest, setNewGuest] = useState({
    nombre: '',
    email: '',
    telefono: '',
    lado: '',
    categoria: 'AMIGOS'
  });

  const eventTypes = ['Boda', 'XV Años', 'Fiesta Infantil', 'Graduación', 'Fiesta', 'Bautizo'];

  // Datos reales del evento
  const invitados = evento.invitados || [];
  const lineasPresupuesto = evento.lineasPresupuesto || [];
  const reservas = evento.reservas || [];

  // Cálculos reales
  const subtotalContratado = lineasPresupuesto.reduce((acc: number, l: any) => acc + Number(l.montoTotal), 0);
  const totalPagado = lineasPresupuesto.reduce((acc: number, l: any) => acc + Number(l.montoPagado), 0);
  const presupuestoTotal = Number(evento.presupuestoTotal) || 0;

  const invitadosConfirmados = invitados.filter((i: any) => i.rsvpEstado === 'CONFIRMADO').length;
  const invitadosPendientes = invitados.filter((i: any) => i.rsvpEstado === 'PENDIENTE').length;
  const invitadosRechazados = invitados.filter((i: any) => i.rsvpEstado === 'RECHAZADO').length;

  const fechaFormateada = evento.fecha ? formatearFechaCorta(evento.fecha) : 'Sin fecha';

  const handleSaveEvento = async () => {
    setSaving(true);
    const res = await updateEvento(evento.id, {
      nombre: tempEvento.nombre,
      fecha: tempEvento.fecha || null,
      tipo: tempEvento.tipo,
      numInvitados: tempEvento.numInvitados,
      presupuestoTotal: tempEvento.presupuestoTotal,
    });
    if (res.success) {
      setIsEditModalOpen(false);
      router.refresh();
    } else {
      alert(res.error);
    }
    setSaving(false);
  };

  const handleAddGuest = async () => {
    if (!newGuest.nombre) return alert('El nombre es obligatorio');
    setSaving(true);
    const res = await addInvitado({
      eventoId: evento.id,
      ...newGuest,
      // Si no es boda, el lado es null
      lado: evento.tipo === 'Boda' ? newGuest.lado : undefined
    });

    if (res.success) {
      setIsAddGuestModalOpen(false);
      setNewGuest({ nombre: '', email: '', telefono: '', lado: '', categoria: 'AMIGOS' });
      router.refresh();
    } else {
      alert(res.error);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
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
                    setTempEvento({
                      nombre: evento.nombre,
                      fecha: evento.fecha ? new Date(evento.fecha).toISOString().split('T')[0] : '',
                      tipo: evento.tipo,
                      numInvitados: evento.numInvitados || 0,
                      presupuestoTotal: Number(evento.presupuestoTotal) || 0,
                    });
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
                {fechaFormateada}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-texto-suave)]">
                <Users size={16} className="text-blue-400" />
                {evento.numInvitados || 0} Invitados esperados
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-texto-suave)]">
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase">{evento.tipo}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             <Link href="/cliente/explorar">
               <button className="btn btn-primario gap-2"><Plus size={18} /> Buscar Proveedores</button>
             </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-borde-suave)] gap-8 overflow-x-auto no-scrollbar">
        {[
          { key: 'resumen', label: 'Resumen' },
          { key: 'proveedores', label: 'Proveedores' },
          { key: 'invitados', label: 'Invitados' },
          { key: 'mesas', label: 'Mesas' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTabActiva(tab.key)}
            className={cn(
              "pb-4 text-sm font-bold transition-all relative whitespace-nowrap",
              tabActiva === tab.key ? "text-[var(--color-primario)]" : "text-[var(--color-texto-muted)] hover:text-[var(--color-texto)]"
            )}
          >
            {tab.label}
            {tabActiva === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-primario)] rounded-t-full shadow-[0_0_10px_var(--color-primario)]" />
            )}
          </button>
        ))}
      </div>

      {/* TAB: Resumen */}
      {tabActiva === 'resumen' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Presupuesto */}
            <div className="card bg-gradient-to-br from-[var(--color-fondo-card)] to-transparent">
              <h2 className="text-xl font-bold mb-6">Estado del Presupuesto</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                   <p className="text-xs font-bold text-[var(--color-texto-muted)] uppercase mb-1">Presupuesto</p>
                   <p className="text-2xl font-black">{formatearMoneda(presupuestoTotal)}</p>
                </div>
                <div>
                   <p className="text-xs font-bold text-[var(--color-texto-muted)] uppercase mb-1">Contratado</p>
                   <p className="text-2xl font-black text-amber-400">{formatearMoneda(subtotalContratado)}</p>
                </div>
                <div>
                   <p className="text-xs font-bold text-[var(--color-texto-muted)] uppercase mb-1">Restante</p>
                   <p className="text-2xl font-black text-emerald-400">{formatearMoneda(presupuestoTotal - subtotalContratado)}</p>
                </div>
              </div>
              {subtotalContratado > 0 && (
                <div className="mt-8 space-y-2">
                   <div className="flex justify-between text-xs font-bold">
                      <span className="text-[var(--color-texto-suave)]">PROGRESO DE PAGOS</span>
                      <span>{Math.round((totalPagado / subtotalContratado) * 100)}%</span>
                   </div>
                   <div className="w-full h-3 bg-[var(--color-fondo-input)] rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300" style={{ width: `${(totalPagado / subtotalContratado) * 100}%` }} />
                   </div>
                   <p className="text-[10px] text-[var(--color-texto-muted)] italic">
                      Has pagado {formatearMoneda(totalPagado)} de {formatearMoneda(subtotalContratado)} contratados.
                   </p>
                </div>
              )}
              {subtotalContratado === 0 && (
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-dashed border-white/10 text-center text-sm text-[var(--color-texto-muted)]">
                  Aún no tienes proveedores contratados. <Link href="/cliente/explorar" className="text-[var(--color-primario-claro)] hover:underline">Explora proveedores</Link>
                </div>
              )}
            </div>

            {/* Proveedores contratados */}
            {lineasPresupuesto.length > 0 && (
              <div className="card overflow-hidden p-0">
                 <div className="p-6 border-b border-[var(--color-borde-suave)] flex justify-between items-center">
                    <h3 className="font-bold">Proveedores del Evento</h3>
                    <button onClick={() => setTabActiva('proveedores')} className="text-xs text-[var(--color-primario-claro)] hover:underline">Gestionar todo</button>
                 </div>
                 <table className="tabla">
                    <thead>
                      <tr><th>Servicio</th><th>Total</th><th>Pagado</th><th>Saldo</th></tr>
                    </thead>
                    <tbody>
                      {lineasPresupuesto.map((l: any) => (
                        <tr key={l.id}>
                          <td className="font-bold">
                            {l.descripcion}
                            {l.servicio?.proveedor && (
                              <span className="block text-[10px] font-normal text-[var(--color-texto-muted)]">{l.servicio.proveedor.nombre}</span>
                            )}
                          </td>
                          <td>{formatearMoneda(l.montoTotal)}</td>
                          <td className="text-emerald-400">{formatearMoneda(l.montoPagado)}</td>
                          <td className="text-red-400">{formatearMoneda(Number(l.montoTotal) - Number(l.montoPagado))}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            )}

            {lineasPresupuesto.length === 0 && (
              <div className="card p-8 text-center border-dashed border-2">
                <Wallet size={32} className="mx-auto text-[var(--color-texto-muted)] mb-3" />
                <p className="font-bold text-lg">Sin proveedores aún</p>
                <p className="text-sm text-[var(--color-texto-muted)] mb-4">Explora y contrata proveedores para tu evento.</p>
                <Link href="/cliente/explorar">
                  <button className="btn btn-primario text-sm">Explorar Proveedores</button>
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
             <div className="card text-center relative overflow-hidden">
                <h3 className="font-bold mb-4 flex items-center justify-between">Invitados <span className="text-xs text-[var(--color-texto-muted)]">{invitados.length} total</span></h3>
                {invitados.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase mb-4">
                       <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20">{invitadosConfirmados} Confirmados</div>
                       <div className="bg-red-500/10 text-red-400 p-2 rounded-lg border border-red-500/20">{invitadosRechazados} Rechazados</div>
                       <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg border border-blue-500/20">{invitadosPendientes} Pendientes</div>
                    </div>
                    <button onClick={() => setTabActiva('invitados')} className="btn btn-secundario w-full text-xs">Gestionar Lista</button>
                  </>
                ) : (
                  <div className="text-sm text-[var(--color-texto-muted)] py-4">
                    <p className="mb-3">No has agregado invitados aún.</p>
                    <button onClick={() => setTabActiva('invitados')} className="btn btn-secundario w-full text-xs">Agregar Invitados</button>
                  </div>
                )}
             </div>
             <Link href="/cliente/invitaciones">
                <div className="card bg-[var(--color-fondo-input)] relative overflow-hidden group cursor-pointer">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-white/10 rounded-lg flex items-center justify-center text-white/20"><Mail size={32} /></div>
                      <div><h4 className="font-bold text-sm">Invitación Digital</h4><p className="text-xs text-[var(--color-texto-muted)]">Envía invitaciones a tus invitados.</p></div>
                   </div>
                   <ChevronRight className="absolute top-1/2 -translate-y-1/2 right-4 text-[var(--color-texto-muted)] group-hover:text-white transition-all" />
                </div>
             </Link>
          </div>
        </div>
      )}

      {/* TAB: Proveedores */}
      {tabActiva === 'proveedores' && (
        <div className="space-y-6">
           <h2 className="text-2xl font-bold">Proveedores Contratados</h2>
           {lineasPresupuesto.length > 0 ? (
             <div className="card p-0 overflow-hidden">
               <table className="tabla">
                  <thead><tr><th>Servicio</th><th>Total</th><th>Pagado</th><th>Saldo</th></tr></thead>
                  <tbody>
                    {lineasPresupuesto.map((l: any) => (
                      <tr key={l.id}>
                        <td className="font-bold">
                          {l.descripcion}
                          {l.servicio?.proveedor && (
                            <span className="block text-[10px] font-normal text-[var(--color-texto-muted)]">{l.servicio.proveedor.nombre}</span>
                          )}
                        </td>
                        <td>{formatearMoneda(l.montoTotal)}</td>
                        <td className="text-emerald-400">{formatearMoneda(l.montoPagado)}</td>
                        <td className="text-red-400">{formatearMoneda(Number(l.montoTotal) - Number(l.montoPagado))}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           ) : (
             <div className="card p-12 text-center border-dashed border-2">
               <Wallet size={48} className="mx-auto text-[var(--color-texto-muted)] mb-4" />
               <p className="font-bold text-xl mb-2">Sin proveedores contratados</p>
               <p className="text-sm text-[var(--color-texto-muted)] mb-6">Busca y contrata proveedores para comenzar a organizar tu evento.</p>
               <Link href="/cliente/explorar">
                 <button className="btn btn-primario">Explorar Proveedores</button>
               </Link>
             </div>
           )}
        </div>
      )}

      {/* TAB: Invitados */}
      {tabActiva === 'invitados' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold italic tracking-tighter uppercase">Gestión de Invitados ({invitados.length})</h2>
             <button 
               onClick={() => setIsAddGuestModalOpen(true)}
               className="btn btn-primario gap-2"
             >
                <Plus size={18} /> Agregar Invitado
             </button>
          </div>
          {invitados.length > 0 ? (
            <div className="card p-0 overflow-hidden">
               <table className="tabla">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Información</th>
                      {evento.tipo === 'Boda' && <th>Lado</th>}
                      <th>Categoría</th>
                      <th>Estado RSVP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitados.map((i: any) => (
                      <tr key={i.id}>
                        <td className="font-bold text-sm uppercase tracking-tight">{i.nombre}</td>
                        <td>
                           <div className="text-[10px] text-[var(--color-texto-suave)] font-bold italic">{i.email || 'Sin email'}</div>
                           <div className="text-[10px] text-[var(--color-texto-muted)]">{i.telefono || ''}</div>
                        </td>
                        {evento.tipo === 'Boda' && (
                          <td>
                            {i.lado ? (
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                i.lado === 'NOVIO' ? "bg-blue-500/20 border-blue-500/30 text-blue-300" : "bg-pink-500/20 border-pink-500/30 text-pink-300"
                              )}>
                                {i.lado === 'NOVIO' ? 'Novio' : 'Novia'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-[var(--color-texto-muted)] italic font-bold">Sin asignar</span>
                            )}
                          </td>
                        )}
                        <td>
                           <span className={cn(
                             "px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest",
                             i.categoria === 'FAMILIA' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                             i.categoria === 'AMIGOS' ? "bg-purple-500/10 border-purple-500/30 text-purple-400" :
                             i.categoria === 'TRABAJO' ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                             "bg-white/5 border-white/10 text-[var(--color-texto-muted)]"
                           )}>
                              {i.categoria || 'General'}
                           </span>
                        </td>
                        <td>
                          <span className={cn(
                            "badge text-[9px] uppercase tracking-tighter", 
                            i.rsvpEstado === 'CONFIRMADO' ? "badge-liquidado" : 
                            i.rsvpEstado === 'PENDIENTE' ? "badge-apartado" : "badge-cancelado"
                          )}>
                            {i.rsvpEstado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          ) : (
            <div className="card p-12 text-center border-dashed border-2">
              <Users size={48} className="mx-auto text-[var(--color-texto-muted)] mb-4" />
              <p className="font-bold text-xl mb-2">Sin invitados registrados</p>
              <p className="text-sm text-[var(--color-texto-muted)]">Agrega invitados desde la sección de Invitaciones.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB: Mesas */}
      {tabActiva === 'mesas' && (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 card border-dashed border-2">
           <div className="p-6 rounded-full bg-violet-500/10 text-violet-400"><LayoutGrid size={48} /></div>
           <div><h2 className="text-2xl font-bold">Organizador de Mesas</h2><p className="text-[var(--color-texto-suave)] max-w-sm mx-auto mt-2">Utiliza nuestra herramienta visual para organizar a tus invitados y optimizar el espacio de tu evento.</p></div>
           <Link href="/cliente/mesas"><button className="btn btn-primario px-10">Abrir Plano Interactivo</button></Link>
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
                  <input type="text" value={tempEvento.nombre} onChange={(e) => setTempEvento({...tempEvento, nombre: e.target.value})} className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-[var(--color-texto)] rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Tipo de Evento</label>
                  <select value={tempEvento.tipo} onChange={(e) => setTempEvento({...tempEvento, tipo: e.target.value})} className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-[var(--color-texto)] rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all">
                    {eventTypes.map(t => <option key={t} value={t} className="bg-[var(--color-fondo-card)] text-[var(--color-texto)]">{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Fecha del Evento</label>
                  <input type="date" value={tempEvento.fecha} onChange={(e) => setTempEvento({...tempEvento, fecha: e.target.value})} className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-[var(--color-texto)] rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Nº Invitados</label>
                  <input type="number" value={tempEvento.numInvitados} onChange={(e) => setTempEvento({...tempEvento, numInvitados: parseInt(e.target.value) || 0})} className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-[var(--color-texto)] rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Presupuesto Total</label>
                  <input type="number" value={tempEvento.presupuestoTotal} onChange={(e) => setTempEvento({...tempEvento, presupuestoTotal: parseFloat(e.target.value) || 0})} className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-[var(--color-texto)] rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" />
                </div>
             </div>
             <div className="flex gap-4 pt-4">
                <button onClick={() => setIsEditModalOpen(false)} className="btn btn-secundario flex-1 py-4" disabled={saving}>Cancelar</button>
                <button onClick={handleSaveEvento} className="btn btn-primario flex-1 py-4 font-bold shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2" disabled={saving}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : 'Guardar Cambios'}
                </button>
             </div>
          </div>
        </div>
      )}
      {/* MODAL AGREGAR INVITADO */}
      {isAddGuestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="card max-w-xl w-full p-8 space-y-8 animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-xl bg-[var(--color-primario)]/10 text-[var(--color-primario-claro)]">
                      <Users size={24} />
                   </div>
                   <h2 className="text-2xl font-bold italic tracking-tighter uppercase">Nuevo Invitado</h2>
                </div>
                <button onClick={() => setIsAddGuestModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Nombre Completo</label>
                  <input type="text" value={newGuest.nombre} onChange={(e) => setNewGuest({...newGuest, nombre: e.target.value})} className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-[var(--color-texto)] rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" placeholder="Ej. Juan Pérez" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Correo Electrónico</label>
                  <input type="email" value={newGuest.email} onChange={(e) => setNewGuest({...newGuest, email: e.target.value})} className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-[var(--color-texto)] rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" placeholder="juan@email.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Teléfono (WhatsApp)</label>
                  <input type="text" value={newGuest.telefono} onChange={(e) => setNewGuest({...newGuest, telefono: e.target.value})} className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-[var(--color-texto)] rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" placeholder="+52 ..." />
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Categoría</label>
                   <select 
                     value={newGuest.categoria} 
                     onChange={(e) => setNewGuest({...newGuest, categoria: e.target.value})} 
                     className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-[var(--color-texto)] rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all uppercase text-xs font-bold"
                   >
                     <option value="FAMILIA" className="bg-[var(--color-fondo-card)] text-[var(--color-texto)]">Familia</option>
                     <option value="AMIGOS" className="bg-[var(--color-fondo-card)] text-[var(--color-texto)]">Amigos</option>
                     <option value="TRABAJO" className="bg-[var(--color-fondo-card)] text-[var(--color-texto)]">Trabajo</option>
                     <option value="OTRO" className="bg-[var(--color-fondo-card)] text-[var(--color-texto)]">Otro</option>
                   </select>
                </div>

                {evento.tipo === 'Boda' && (
                  <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Lado del Evento</label>
                     <select 
                       value={newGuest.lado} 
                       onChange={(e) => setNewGuest({...newGuest, lado: e.target.value})} 
                       className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-[var(--color-texto)] rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all uppercase text-xs font-bold"
                     >
                       <option value="" className="bg-[var(--color-fondo-card)] text-[var(--color-texto)]">Seleccionar...</option>
                       <option value="NOVIO" className="bg-[var(--color-fondo-card)] text-[var(--color-texto)]">Novio</option>
                       <option value="NOVIA" className="bg-[var(--color-fondo-card)] text-[var(--color-texto)]">Novia</option>
                     </select>
                  </div>
                )}
             </div>

             <div className="flex gap-4 pt-4">
                <button onClick={() => setIsAddGuestModalOpen(false)} className="btn btn-secundario flex-1 py-4 uppercase font-black tracking-widest text-xs" disabled={saving}>Cancelar</button>
                <button onClick={handleAddGuest} className="btn btn-primario flex-1 py-4 font-black uppercase tracking-widest text-xs shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2" disabled={saving}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Registro'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
