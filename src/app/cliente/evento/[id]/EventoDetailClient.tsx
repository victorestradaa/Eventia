'use client';

import { 
  ArrowLeft,
  ChevronRight,
  Edit,
  X,
  Loader2,
  AlertCircle,
  LayoutGrid,
  Check,
  MessageCircle,
  Baby,
  User as UserIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatearMoneda, formatearFechaCorta, cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateEvento, addInvitado, updateInvitadoRSVP } from '@/lib/actions/eventActions';

// Componente para los iconos de persona con diseño premium
const PersonIcon = ({ tipo, className = "w-8 h-8" }: { tipo: string, className?: string }) => {
  if (tipo === 'HOMBRE') {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <UserIcon className="w-full h-full" />
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[20%] h-[30%] bg-[#D4AF37] rounded-full" /> {/* Corbata simbólica */}
      </div>
    );
  }
  if (tipo === 'MUJER') {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <UserIcon className="w-full h-full" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[40%] border-t-4 border-pink-400 rounded-full" /> {/* Pelo simbólico */}
      </div>
    );
  }
  if (tipo === 'NINO') {
    return <Baby className={cn("text-blue-400", className)} />;
  }
  if (tipo === 'NINA') {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <Baby className="w-full h-full text-pink-400" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border border-white" /> {/* Moño simbólico */}
      </div>
    );
  }
  return <UserIcon className={className} />;
};

interface EventoDetailClientProps {
  evento: any;
}

export default function EventoDetailClient({ evento: initialEvento }: EventoDetailClientProps) {
  const router = useRouter();
  const evento = initialEvento;

  useEffect(() => {
    setTempEvento({
      nombre: initialEvento.nombre,
      fecha: initialEvento.fecha ? new Date(initialEvento.fecha).toISOString().split('T')[0] : '',
      tipo: initialEvento.tipo,
      numInvitados: initialEvento.numInvitados || 0,
      presupuestoTotal: Number(initialEvento.presupuestoTotal) || 0,
    });
  }, [initialEvento]);
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
    categoria: 'AMIGOS',
    tipoPersona: 'HOMBRE'
  });

  // UI Pagos
  const [showPagoModal, setShowPagoModal] = useState<any | null>(null);
  const [selectedTransaccionId, setSelectedTransaccionId] = useState<string | null>(null);
  const [montoAbono, setMontoAbono] = useState('');
  const [procesandoPago, setProcesandoPago] = useState(false);

  const eventTypes = ['Boda', 'XV Años', 'Fiesta Infantil', 'Graduación', 'Fiesta', 'Bautizo'];

  // Datos reales del evento
  const invitados = evento.invitados || [];
  const lineasPresupuesto = evento.lineasPresupuesto || [];
  const reservas = evento.reservas || [];

  const invitadosConfirmados = invitados.filter((i: any) => i.rsvpEstado === 'CONFIRMADO').length;
  const invitadosPendientes = invitados.filter((i: any) => i.rsvpEstado === 'PENDIENTE').length;
  const invitadosRechazados = invitados.filter((i: any) => i.rsvpEstado === 'RECHAZADO').length;

  // Combinar líneas de presupuesto con reservas que no tienen línea aún (Fix sincronización)
  const lineasConReservas = [...lineasPresupuesto].map((l:any) => {
    const res = reservas.find((r:any) => r.servicioId === l.servicioId);
    // Calculamos el monto pagado sumando las transacciones reales de esta reserva
    const totalPagadoReal = res?.transacciones
      ?.filter((t:any) => t.estado === 'PAGADO')
      .reduce((acc:number, t:any) => acc + Number(t.monto), 0) || 0;

    return { 
      ...l, 
      reservaId: res?.id,
      // Si hay reserva, usamos su total real de transacciones. Si no hay (y es línea manual), usamos l.montoPagado
      montoPagado: res ? totalPagadoReal : (l.montoPagado || 0),
      pagos: res?.transacciones || l.pagos || []
    };
  });
  
  reservas.forEach((res: any) => {
    const existeLinea = lineasPresupuesto.some((l: any) => l.servicioId === res.servicioId);
    if (!existeLinea && res.estado !== 'CANCELADO') {
      const totalPagadoReal = res.transacciones
        ?.filter((t:any) => t.estado === 'PAGADO')
        .reduce((acc:number, t:any) => acc + Number(t.monto), 0) || 0;

      lineasConReservas.push({
        id: `res-${res.id}`,
        reservaId: res.id,
        descripcion: res.servicio?.nombre || 'Servicio Apartado',
        montoTotal: res.montoTotal || 0,
        montoPagado: totalPagadoReal,
        montoSaldado: totalPagadoReal,
        servicio: res.servicio,
        proveedor: res.proveedor,
        isReserva: true,
        pagos: res.transacciones || []
      });
    }
  });

  // Cálculos reales basados en la unión
  const subtotalContratado = lineasConReservas.reduce((acc: number, l: any) => acc + Number(l.montoTotal), 0);
  const totalPagado = lineasConReservas.reduce((acc: number, l: any) => acc + Number(l.montoPagado), 0);
  const presupuestoTotal = Number(evento.presupuestoTotal) || 0;


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
      setNewGuest({ nombre: '', email: '', telefono: '', lado: '', categoria: 'AMIGOS', tipoPersona: 'HOMBRE' });
      router.refresh();
    } else {
      alert(res.error);
    }
    setSaving(false);
  };

  const handleUpdateRSVP = async (invitadoId: string, estado: any) => {
    setSaving(true);
    const res = await updateInvitadoRSVP(invitadoId, estado);
    if (!res.success) alert(res.error);
    else router.refresh();
    setSaving(false);
  };

  const handleSendWhatsApp = (invitado: any) => {
    if (!invitado.telefono) return alert('El invitado no tiene teléfono registrado');
    const msg = encodeURIComponent(`¡Hola ${invitado.nombre}! Te invitamos a nuestro evento: ${evento.nombre}. Por favor confirma tu asistencia aquí: ${window.location.origin}/rsvp?id=${invitado.id}`);
    window.open(`https://wa.me/${invitado.telefono}?text=${msg}`, '_blank');
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
          { key: 'pagos', label: 'Pagos' },
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
            {lineasConReservas.length > 0 && (
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
                      {lineasConReservas.map((l: any) => (
                        <tr key={l.id}>
                          <td className="font-bold">
                            {l.descripcion}
                            {(l.servicio?.proveedor || l.proveedor) && (
                              <span className="block text-[10px] font-normal text-[var(--color-texto-muted)]">
                                {(l.servicio?.proveedor?.nombre || l.proveedor?.nombre)}
                              </span>
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

            {lineasConReservas.length === 0 && (

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

      {/* TAB: Pagos */}
      {tabActiva === 'pagos' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-white/5 border-white/10 shadow-xl">
                 <p className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-1">Total Comprometido</p>
                 <p className="text-2xl font-black">{formatearMoneda(subtotalContratado)}</p>
              </div>
              <div className="card border-emerald-500/30 bg-emerald-500/5 shadow-xl">
                 <p className="text-[10px] font-black uppercase text-emerald-400 mb-1 font-black">Pagado / Cobrado</p>
                 <p className="text-2xl font-black text-emerald-400">{formatearMoneda(totalPagado)}</p>
              </div>
              <div className="card border-amber-500/40 bg-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
                 <p className="text-[10px] font-black uppercase text-amber-500 mb-1">Saldo por Liquidar</p>
                 <p className="text-2xl font-black text-amber-500">{formatearMoneda(subtotalContratado - totalPagado)}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2 italic uppercase tracking-tighter">
                   <CreditCard className="text-[var(--color-primario-claro)]" /> Pendientes de Pago
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                   {lineasConReservas.filter((l:any) => Number(l.montoTotal) - Number(l.montoPagado) > 0).map((l:any) => (

                     <div key={l.id} className="card hover:bg-white/[0.02] transition-all border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 group overflow-hidden">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primario)]/20 to-transparent flex items-center justify-center text-[var(--color-primario-claro)] shadow-lg transition-transform group-hover:scale-110">
                              <Wallet size={24} />
                           </div>
                           <div>
                               <h4 className="font-bold text-lg leading-tight uppercase italic tracking-tighter text-[var(--color-texto-fuerte)]">
                                 {l.servicio?.proveedor?.nombre || l.proveedor?.nombre} 
                                 {(l.servicio?.proveedor?.categoria || l.proveedor?.categoria) && (
                                   <span className="ml-2 text-[9px] font-normal text-[var(--color-texto-muted)] uppercase tracking-[0.2em] not-italic">
                                     ({l.servicio?.proveedor?.categoria || l.proveedor?.categoria})
                                   </span>
                                 )}
                               </h4>
                               <p className="text-xs text-[var(--color-texto-muted)] font-bold tracking-tight">{l.descripcion}</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
                            <div className="text-right">
                               <p className="text-[9px] font-black uppercase text-[var(--color-texto-muted)] mb-0.5 pr-1 tracking-widest leading-none">Saldo Pendiente</p>
                               <p className="text-xl font-black text-amber-500 tracking-tighter">{formatearMoneda(Number(l.montoTotal) - Number(l.montoPagado))}</p>
                            </div>
                            <button 
                              onClick={() => setShowPagoModal(l)}
                              className="btn btn-primario py-3 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-500/20 active:scale-95 transition-all w-full md:w-auto italic"
                            >
                               Abonar ahora
                            </button>
                         </div>
                     </div>
                   ))}
                   {lineasConReservas.filter((l:any) => Number(l.montoTotal) - Number(l.montoPagado) > 0).length === 0 && (

                     <div className="card p-16 text-center border-dashed border-2 border-emerald-500/20 bg-emerald-500/5">
                        <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                        <p className="font-black text-xl uppercase italic tracking-tighter">¡Felicidades!</p>
                        <p className="text-[var(--color-texto-suave)] text-sm">Has liquidado todos tus servicios contratados.</p>
                     </div>
                   )}
                </div>

                <h3 className="text-xl font-bold pt-8 flex items-center gap-2 italic uppercase tracking-tighter text-[var(--color-texto-muted)]">
                   <ClockIcon size={22} className="text-emerald-500/60" /> Historial de Pagos
                </h3>
                <div className="card p-0 overflow-hidden border border-white/5 shadow-2xl">
                   <div className="overflow-x-auto">
                     <table className="tabla w-full min-w-[600px]">
                        <thead className="bg-white/5">
                          <tr className="text-left text-[var(--color-texto-muted)] text-[10px] font-black uppercase tracking-widest">
                            <th className="px-6 py-5">Concepto</th>
                            <th className="px-6 py-5">Monto</th>
                            <th className="px-6 py-5">Fecha</th>
                            <th className="px-6 py-5 text-center">Estatus</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-medium">
                          {lineasConReservas.flatMap((l:any) => (l.pagos || []).map((p:any) => ({...p, targetDesc: l.descripcion, parentLine: l}))).sort((a:any, b:any) => new Date(b.fechaPago || b.fechaVencimiento || b.fecha).getTime() - new Date(a.fechaPago || a.fechaVencimiento || a.fecha).getTime()).map((p:any, idx:number) => {
                            const isPending = p.estado === 'PENDIENTE';
                            return (
                              <tr key={p.id || idx} className={cn("hover:bg-white/[0.01] transition-colors group", isPending && "bg-amber-500/[0.03]")}>
                                 <td className="px-6 py-5">
                                    <span className="font-bold group-hover:text-[var(--color-primario-claro)] transition-colors">
                                      {(p.tipo || 'ABONO').toUpperCase()} - {p.targetDesc}
                                    </span>
                                    {p.nota && <p className="text-[10px] text-[var(--color-texto-muted)] italic font-normal tracking-tight">{p.nota}</p>}
                                 </td>
                                 <td className="px-6 py-5 text-emerald-400 font-black text-lg">
                                   {formatearMoneda(p.monto)}
                                 </td>
                                 <td className="px-6 py-5">
                                   {isPending ? (
                                     <button 
                                       onClick={() => {
                                          setShowPagoModal(p.parentLine);
                                          setMontoAbono(p.monto.toString());
                                          setSelectedTransaccionId(p.id);
                                       }}
                                       className="flex flex-col items-start hover:scale-105 transition-transform text-left group/pay"
                                     >
                                       {(() => {
                                          const venceDate = new Date(p.fechaVencimiento || p.fecha);
                                          const hoy = new Date();
                                          hoy.setHours(0, 0, 0, 0);
                                          venceDate.setHours(0, 0, 0, 0);
                                          const diffTime = venceDate.getTime() - hoy.getTime();
                                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                          
                                          let label = "PENDIENTE";
                                          if (diffDays > 0) label = `VENCE EN ${diffDays} DIAS`;
                                          else if (diffDays === 0) label = "VENCE HOY";
                                          else label = "VENCIDO";

                                          return (
                                            <span className="text-[9px] text-red-500 font-black uppercase leading-none mb-1 opacity-90">{label}</span>
                                          );
                                       })()}
                                       <span className="text-xl font-black text-amber-500 leading-none group-hover:text-amber-400 transition-colors">PAGA HOY</span>
                                     </button>
                                   ) : (
                                     <span className="text-sm text-[var(--color-texto-suave)] font-bold">
                                       {new Date(p.fechaPago || p.fechaVencimiento || p.fecha).toLocaleDateString()}
                                     </span>
                                   )}
                                 </td>
                                 <td className="px-6 py-5 text-center">
                                    <span className={cn(
                                      "badge text-[9px] font-black shadow-sm tracking-widest",
                                      isPending ? "badge-apartado" : "badge-liquidado"
                                    )}>
                                      {(p.estado || 'PAGADO').toUpperCase()}
                                    </span>
                                 </td>
                              </tr>
                            );
                          })}
                        </tbody>
                     </table>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="card bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 shadow-xl p-8">
                    <h4 className="font-black uppercase tracking-tighter text-emerald-500 mb-4 flex items-center gap-2">
                       <DollarSign size={20} /> Progreso Financiero
                    </h4>
                    <p className="text-sm text-[var(--color-texto-suave)] leading-relaxed font-medium">
                       Llevas liquidado el <span className="text-emerald-400 font-black">{(subtotalContratado > 0 ? Math.round((totalPagado/subtotalContratado)*100) : 0)}%</span> de tus gastos. 
                    </p>
                    <div className="mt-4 w-full h-2 bg-emerald-500/10 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300" 
                         style={{ width: `${(subtotalContratado > 0 ? (totalPagado/subtotalContratado)*100 : 0)}%` }} 
                       />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

       {/* TAB: Proveedores */}
      {tabActiva === 'proveedores' && (
        <div className="space-y-6">
           <h2 className="text-2xl font-bold">Proveedores Contratados</h2>
           {lineasConReservas.length > 0 ? (
             <div className="card p-0 overflow-hidden">
               <table className="tabla">
                  <thead><tr><th>Servicio</th><th>Total</th><th>Pagado</th><th>Saldo</th></tr></thead>
                  <tbody>
                    {lineasConReservas.map((l: any) => (
                      <tr key={l.id}>
                        <td className="font-bold">
                          {l.descripcion}
                          {(l.servicio?.proveedor || l.proveedor) && (
                            <span className="block text-[10px] font-normal text-[var(--color-texto-muted)]">
                              {(l.servicio?.proveedor?.nombre || l.proveedor?.nombre)}
                            </span>
                          )}
                        </td>
                        <td>{formatearMoneda(l.montoTotal)}</td>
                        <td className="text-emerald-400">{formatearMoneda(l.montoPagado || 0)}</td>
                        <td className="text-red-400">{formatearMoneda(Number(l.montoTotal) - Number(l.montoPagado || 0))}</td>
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
                      <th>Invitado</th>
                      <th>Información</th>
                      {evento.tipo === 'Boda' && <th>Lado</th>}
                      <th>Categoría</th>
                      <th>Confirmación</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                      <tr key={i.id} className="group/row">
                        <td className="py-4">
                           <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-[var(--color-primario-claro)]",
                                i.tipoPersona === 'MUJER' && "border-pink-500/30 text-pink-400",
                                i.tipoPersona === 'NINO' && "border-blue-500/30 text-blue-400",
                                i.tipoPersona === 'NINA' && "border-pink-500/30 text-pink-400"
                              )}>
                                <PersonIcon tipo={i.tipoPersona} className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-bold text-sm uppercase tracking-tight">{i.nombre}</p>
                                <span className="text-[9px] font-black text-[var(--color-texto-muted)] uppercase tracking-widest">{i.tipoPersona || 'Asistente'}</span>
                              </div>
                           </div>
                        </td>
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
                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => handleUpdateRSVP(i.id, 'CONFIRMADO')}
                               className={cn(
                                 "p-2 rounded-lg transition-all",
                                 i.rsvpEstado === 'CONFIRMADO' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white/5 text-[var(--color-texto-muted)] hover:bg-emerald-500/20 hover:text-emerald-400"
                               )}
                               title="Confirmar"
                             >
                                <Check size={16} />
                             </button>
                             <button 
                               onClick={() => handleUpdateRSVP(i.id, 'RECHAZADO')}
                               className={cn(
                                 "p-2 rounded-lg transition-all",
                                 i.rsvpEstado === 'RECHAZADO' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/5 text-[var(--color-texto-muted)] hover:bg-red-500/20 hover:text-red-400"
                               )}
                               title="Rechazar"
                             >
                                <X size={16} />
                             </button>
                          </div>
                        </td>
                        <td className="text-right">
                           <button 
                             onClick={() => handleSendWhatsApp(i)}
                             className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all opacity-0 group-hover/row:opacity-100"
                             title="Enviar invitación por WhatsApp"
                           >
                             <MessageCircle size={18} />
                           </button>
                        </td>
                      </tr>
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
           <Link href={`/cliente/evento/${evento.id}/mesas`}><button className="btn btn-primario px-10">Abrir Plano Interactivo</button></Link>
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

                <div className="space-y-1 md:col-span-2">
                   <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Icono del Invitado</label>
                   <div className="grid grid-cols-4 gap-4 pt-2">
                      {[
                        { id: 'HOMBRE', label: 'Hombre' },
                        { id: 'MUJER', label: 'Mujer' },
                        { id: 'NINO', label: 'Niño' },
                        { id: 'NINA', label: 'Niña' }
                      ].map(tipo => (
                        <button
                          key={tipo.id}
                          onClick={() => setNewGuest({ ...newGuest, tipoPersona: tipo.id })}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                            newGuest.tipoPersona === tipo.id 
                              ? "border-[var(--color-primario)] bg-[var(--color-primario)]/10 text-white" 
                              : "border-white/5 bg-white/5 text-[var(--color-texto-muted)] hover:border-white/10 hover:bg-white/10"
                          )}
                        >
                          <PersonIcon tipo={tipo.id} className="w-8 h-8" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{tipo.label}</span>
                        </button>
                      ))}
                   </div>
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

      {/* Modal de Pago (Simulado) */}
      {showPagoModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className="card max-w-md w-full p-10 border-[var(--color-primario)]/30 shadow-[0_0_80px_rgba(139,92,246,0.15)] animate-in zoom-in-95 duration-300 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[var(--color-primario)] to-transparent" />
              
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter">Realizar Abono</h2>
                 <button onClick={() => setShowPagoModal(null)} className="p-2 rounded-full hover:bg-white/5 transition-colors"><X size={20} /></button>
              </div>

              <div className="p-6 rounded-3xl bg-[var(--color-fondo-input)] border border-white/5 space-y-4 mb-8 shadow-inner">
                 <p className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest leading-none">Servicio a Abonar</p>
                 <p className="text-xl font-black text-[var(--color-texto-fuerte)]">{showPagoModal.descripcion}</p>
                 <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-xs font-bold text-[var(--color-texto-muted)]">Pendiente:</span>
                    <span className="text-2xl font-black text-amber-500 tracking-tight">{formatearMoneda(Number(showPagoModal.montoTotal) - Number(showPagoModal.montoPagado))}</span>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest pl-2">Monto del Abono (MXN)</label>
                    <div className="relative group">
                       <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-[var(--color-primario-claro)] opacity-40">$</span>
                       <input 
                         type="number" 
                         value={montoAbono}
                         onChange={(e) => setMontoAbono(e.target.value)}
                         placeholder="0.00"
                         className="input w-full h-20 pl-12 text-3xl font-black text-[var(--color-primario-claro)] bg-white/5 border-2 border-white/5 focus:border-[var(--color-primario)]/50 transition-all placeholder:opacity-20"
                         autoFocus
                       />
                    </div>
                 </div>

                 <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
                    <AlertCircle size={20} className="text-amber-500 shrink-0" />
                    <p className="text-[10px] text-amber-200/70 font-medium italic">
                       PRUEBA: Este abono se autorizará automáticamente para sincronizar el presupuesto.
                    </p>
                 </div>

                 <button 
                   onClick={async () => {
                     if (!montoAbono || isNaN(Number(montoAbono))) return;
                     setProcesandoPago(true);
                     
                     const res = await registrarAbono({
                       reservaId: showPagoModal.reservaId || '',
                       monto: Number(montoAbono),
                       metodoPago: 'TARJETA (TEST)',
                       tipo: 'ABONO',
                       transaccionId: selectedTransaccionId || undefined,
                       esCliente: true
                     });

                      if (res.success) {
                        setMontoAbono('');
                        setSelectedTransaccionId(null);
                        setShowPagoModal(null);
                        router.refresh();
                      } else {
                        alert(res.error || "Error al procesar el abono. Verifica el monto.");
                        setProcesandoPago(false);
                      }
                   }}
                   disabled={procesandoPago || !montoAbono}
                   className={cn(
                     "btn btn-primario w-full py-6 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all shadow-violet-500/30",
                     (procesandoPago || !montoAbono) ? "opacity-50 grayscale" : "hover:scale-[1.03] active:scale-95"
                   )}
                 >
                   {procesandoPago ? <Loader2 className="animate-spin" size={20} /> : <><CreditCard size={20} /> Aplicar Abono</>}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
