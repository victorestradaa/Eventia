'use client';

import { Calendar, Users, Wallet, ChevronRight, Star, Clock, X, Loader2, Trash2, History } from 'lucide-react';
import { formatearMoneda } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { createEvento } from '@/lib/actions/eventActions';
import { useRouter } from 'next/navigation';
import ArchiveEventModal from '@/components/cliente/dashboard/ArchiveEventModal';

interface DashboardClientProps {
  initialEventos: any[];
  perfil: any;
  proveedoresRecomendados: any[];
}

export default function DashboardClient({ initialEventos, perfil, proveedoresRecomendados }: DashboardClientProps) {
  const router = useRouter();
  const [eventos, setEventos] = useState(initialEventos);
  const [loading, setLoading] = useState(false);
  
  const usuario = {
    plan: perfil?.cliente?.plan || 'FREE',
  };

  const isPlanner = usuario.plan === 'PLANNER';
  const isOro = usuario.plan === 'ORO';
  const isFree = usuario.plan === 'FREE';

  const [eventoId, setEventoId] = useState(eventos.length > 0 ? eventos[0].id : null);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [eventToArchive, setEventToArchive] = useState<{ id: string; nombre: string } | null>(null);
  
  // States para el nuevo evento
  const [nuevoEvento, setNuevoEvento] = useState({
    nombre: '',
    invitados: '',
    fecha: '',
    presupuesto: '',
    tipo: 'Boda'
  });

  const eventTypes = ['Boda', 'XV Años', 'Fiesta Infantil', 'Graduación', 'Fiesta', 'Bautizo'];

  const proximoEvento = eventos.find(e => e.id === eventoId) || eventos[0] || null;
  
  // Cálculo de vigencia del evento
  const mesesVigencia = isFree ? 3 : (isOro ? 12 : Infinity);
  
  let fechaExpiracion = new Date();
  if (proximoEvento) {
    fechaExpiracion = new Date(proximoEvento.creadoEn);
    if (mesesVigencia !== Infinity) {
      fechaExpiracion.setMonth(fechaExpiracion.getMonth() + mesesVigencia);
    }
  }

  const handleCrearEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoEvento.nombre.trim() || !nuevoEvento.invitados || !nuevoEvento.tipo) return;

    setLoading(true);
    const res = await createEvento({
      clienteId: perfil.cliente?.id || '',
      nombre: nuevoEvento.nombre,
      tipo: nuevoEvento.tipo,
      fecha: nuevoEvento.fecha || undefined,
      presupuesto: parseFloat(nuevoEvento.presupuesto) || 0,
      invitados: parseInt(nuevoEvento.invitados) || 0,
    });

    if (res.success) {
      // En lugar de actualizar el estado local, refrescamos la página para que el Server Component vuelva a traer todo
      router.refresh();
      setIsNewEventModalOpen(false);
      setNuevoEvento({ nombre: '', invitados: '', fecha: '', presupuesto: '', tipo: 'Boda' });
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  // Estado vacío: sin eventos
  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--color-fondo-hover)] flex items-center justify-center text-3xl">🎉</div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">¡Bienvenido a Gestor de Eventos!</h2>
          <p className="text-[var(--color-texto-suave)] max-w-md">Empieza creando tu primer evento para organizar cada detalle de tu gran día.</p>
        </div>
        <button 
          onClick={() => setIsNewEventModalOpen(true)}
          className="btn-oro px-8 py-4 font-bold shadow-xl"
        >
          Crear mi primer evento
        </button>

        {/* Modal siempre se renderiza aquí cuando está abierto */}
        {isNewEventModalOpen && renderModal()}
      </div>
    );
  }

  function renderModal() {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--color-fondo)]/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] max-w-xl w-full p-8 space-y-8 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif italic text-[var(--color-texto)]">Nuevo Evento</h2>
              <button onClick={() => setIsNewEventModalOpen(false)} className="p-2 hover:bg-[var(--color-fondo-hover)] rounded-full text-[var(--color-texto-muted)]" disabled={loading}><X size={20} /></button>
           </div>
           <form onSubmit={handleCrearEvento} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Nombre del Evento *</label>
                  <input 
                    type="text" required autoFocus
                    value={nuevoEvento.nombre}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, nombre: e.target.value})}
                    placeholder="Ej: Boda de Laura y David"
                    className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl px-4 py-3 outline-none focus:border-[#d4af37] transition-all text-sm" 
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Tipo de Evento *</label>
                  <select 
                    required
                    value={nuevoEvento.tipo}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, tipo: e.target.value})}
                    className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl px-4 py-3 outline-none focus:border-[#d4af37] transition-all text-sm"
                    disabled={loading}
                  >
                    {eventTypes.map(t => <option key={t} value={t} className="bg-[#1a1a1a]">{t}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Nº de Invitados *</label>
                  <input 
                    type="number" required min="1"
                    value={nuevoEvento.invitados}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, invitados: e.target.value})}
                    placeholder="Ej: 150"
                    className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl px-4 py-3 outline-none focus:border-[#d4af37] transition-all text-sm" 
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] flex justify-between">
                    Fecha del Evento <span className="text-[8px] opacity-40 font-normal italic">(Opcional)</span>
                  </label>
                  <input 
                    type="date"
                    value={nuevoEvento.fecha}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                    className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl px-4 py-3 outline-none focus:border-[#d4af37] transition-all text-sm" 
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] flex justify-between">
                    Presupuesto Estimado <span className="text-[8px] opacity-40 font-normal italic">(Opcional)</span>
                  </label>
                  <input 
                    type="number"
                    value={nuevoEvento.presupuesto}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, presupuesto: e.target.value})}
                    placeholder="Ej: 50000"
                    className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl px-4 py-3 outline-none focus:border-[#d4af37] transition-all text-sm" 
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-[var(--color-borde-suave)]">
                 <button type="button" onClick={() => setIsNewEventModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-[var(--color-texto-muted)] hover:text-[var(--color-texto)] transition-colors" disabled={loading}>Cancelar</button>
                 <button type="submit" className="btn-oro flex-1 py-4 font-bold shadow-xl flex items-center justify-center gap-2" disabled={loading}>
                   {loading ? <Loader2 className="animate-spin" size={20} /> : 'Crear Evento'}
                 </button>
              </div>
           </form>
        </div>
      </div>
    );
  }

  // Prevenir errores si no hay evento activo (pero hay eventos en la lista)
  if (!proximoEvento) return null;

  // Calculamos días restantes reales si hay fecha
  const hoy = new Date();
  const fechaEvt = proximoEvento.fecha ? new Date(proximoEvento.fecha) : null;
  const diasRestantes = fechaEvt ? Math.max(0, Math.ceil((fechaEvt.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))) : 0;

  // --- LÓGICA DE SINCRONIZACIÓN FINANCIERA (Igual a EventoDetailClient) ---
  const lineasPresupuesto = proximoEvento.lineasPresupuesto || [];
  const reservas = proximoEvento.reservas || [];

  const lineasSinReserva = lineasPresupuesto.filter((l: any) => !l.servicioId);
  const lineasConReservas = [
    ...lineasSinReserva,
    ...reservas.map((r: any) => {
      const transacciones = r.transacciones || [];
      const pagado = transacciones
        .filter((t: any) => t.estado === 'PAGADO')
        .reduce((sum: number, t: any) => sum + Number(t.monto), 0);
      
      const penalizaciones = transacciones
        .filter((t: any) => t.tipo === 'PENALIZACION')
        .reduce((sum: number, t: any) => sum + Number(t.monto), 0);

      const subtotal = Number(r.montoTotal) + penalizaciones;

      return {
        id: `res-${r.id}`,
        descripcion: r.servicio?.nombre || 'Servicio',
        categoria: r.servicio?.categoria || 'Contratado',
        montoTotal: subtotal,
        montoPagado: pagado,
        esReserva: true,
        proveedorNombre: r.proveedor?.nombre,
        notas: r.notas,
        fechaEvento: r.fechaEvento,
        metodoPagoSugerido: r.metodoPagoSugerido
      };
    })
  ];

  const totalPagadoReal = lineasConReservas.reduce((acc: number, l: any) => acc + Number(l.montoPagado), 0);
  const totalContratadoReal = lineasConReservas.reduce((acc: number, l: any) => acc + Number(l.montoTotal), 0);
  const porcentajePresupuesto = totalContratadoReal > 0 ? (totalPagadoReal / totalContratadoReal) * 100 : 0;
  const numProveedoresContratados = reservas.length;
  const numInvitadosConfirmados = proximoEvento._count?.invitados || 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto md:px-4">
      {/* Event Selection (Solo para Planner) */}
      {isPlanner && (
        <section className="flex items-center gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-style">
          <div className="flex items-center gap-2 mr-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#7A5E1D] whitespace-nowrap">
              Mis Eventos:
            </h2>
            <Link href="/cliente/historial" className="flex items-center gap-1 text-[10px] bg-[var(--color-fondo-hover)] hover:bg-[var(--color-fondo-input)] px-2 py-1 rounded-md text-[var(--color-texto-muted)] transition-colors">
              <History size={12} /> Historial
            </Link>
          </div>
          {eventos.map((evt) => (
            <button 
              key={evt.id}
              onClick={() => setEventoId(evt.id)}
              className={`px-4 py-1.5 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${
                evt.id === proximoEvento.id 
                ? 'bg-gradient-to-b from-[#eadeba] to-[#c79a3b] text-black shadow-lg border-[#f5e3ba]' 
                : 'bg-white border-[#d5a754] text-[#7a5e1d] hover:bg-[#fef6e3]'
              }`}
            >
              {evt.nombre}
            </button>
          ))}
          <button 
            onClick={() => setIsNewEventModalOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-dashed border-[#c79a3b] text-[#c79a3b] text-sm font-bold hover:bg-[#c79a3b]/10 transition-all whitespace-nowrap"
          >
            <span>+</span> Nuevo Evento
          </button>
        </section>
      )}
      {!isPlanner && (
        <section className="flex justify-end">
           <Link href="/cliente/historial" className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-texto-suave)] hover:text-[var(--color-texto)] transition-colors bg-[var(--color-fondo-card)] px-3 py-1.5 rounded-full border border-[var(--color-borde-suave)] shadow-sm">
            <History size={14} /> Ver Historial
          </Link>
        </section>
      )}

      {/* Hero / Banner Refinado */}
      <section className="relative overflow-hidden rounded-[1rem] bg-[#111] shadow-[0_4px_20px_rgba(212,175,55,0.15)] flex flex-col md:flex-row min-h-[180px] p-[1.5px] group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#eadeba] via-[#d4af37] to-[#111] rounded-[1rem] opacity-30"></div>
        <div className="relative w-full h-full bg-[#111] rounded-[15px] flex flex-col md:flex-row overflow-hidden border border-[#D4AF37]/20">
          {/* Background Image Right Side - dinámico por tipo de evento */}
          {(() => {
            // Picsum photos con seed fijo por tipo, imágenes siempre disponibles
            const bgImages: Record<string, string> = {
              'Boda':          'https://picsum.photos/seed/wedding/800/600',
              'XV Años':       'https://picsum.photos/seed/quinceanera/800/600',
              'Fiesta Infantil':'https://picsum.photos/seed/kids-party/800/600',
              'Graduación':    'https://picsum.photos/seed/graduation/800/600',
              'Fiesta':        'https://picsum.photos/seed/party/800/600',
              'Bautizo':       'https://picsum.photos/seed/baptism/800/600',
            };
            const bgImg = bgImages[proximoEvento.tipo] || bgImages['Fiesta'];

            return (
              <div
                className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#111] before:via-[#111]/80 before:to-transparent z-0"
                style={{
                  backgroundImage: `url(${bgImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.9,
                }}
              />
            );
          })()}
          
          {/* Hexagon Pattern */}
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'100\' viewBox=\'0 0 60 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg stroke=\'%23D4AF37\' stroke-width=\'1\' fill=\'none\'%3E%3Cpath d=\'M30 0l30 17v33L30 67 0 50V17z\'/%3E%3Cpath d=\'M30 100l30-17V50L30 33 0 50v33z\'/%3E%3C/g%3E%3C/svg%3E")' }} />

          <div className="relative z-10 w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-between min-h-[220px]">
            <div>
               <div className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#B89645] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                  PRÓXIMO GRAN EVENTO - <span className="text-[#D4AF37] ml-1">PLAN {usuario.plan}</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 drop-shadow-lg">
                 {proximoEvento.nombre}
               </h1>
               
               <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                 <span className="text-gray-200 text-sm font-medium drop-shadow-md">
                   {fechaEvt ? new Date(fechaEvt.getTime() + fechaEvt.getTimezoneOffset() * 60000).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Fecha por definir'}
                 </span>
                 <span className="bg-[#B8860B]/70 backdrop-blur-sm border border-[#D4AF37]/40 text-stone-100 text-[10px] sm:text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                   {diasRestantes} DÍAS FALTAN PARA EL GRAN DÍA
                 </span>
               </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto border-t border-white/10 pt-4">
               <span className="text-gray-400 text-[11px] sm:text-xs tracking-widest uppercase mb-2 sm:mb-0 flex items-center">
                 VIGENCIA GESTIÓN <span className="text-white font-medium ml-2">{mesesVigencia === Infinity ? '∞' : fechaExpiracion.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '')}</span>
               </span>
               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setEventToArchive({ id: proximoEvento.id, nombre: proximoEvento.nombre })}
                   className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                   title="Quitar Evento"
                 >
                   <Trash2 size={20} />
                 </button>
                 <Link href={`/cliente/evento/${proximoEvento.id}`}>
                   <button className="bg-gradient-to-b from-[#eadeba] to-[#c79a3b] text-black px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#c79a3b]/20 hover:brightness-110 transition-all border border-[#f5e3ba]">
                     Gestionar Mi Evento
                   </button>
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Presupuesto */}
        <div className="relative rounded-xl bg-gradient-to-b from-[#FDEBB6] via-[#D5A754] to-[#B38332] p-[1.5px] shadow-[0_8px_20px_rgba(213,167,84,0.15)] hover:-translate-y-1 transition-transform group">
          <div className="bg-gradient-to-b from-[#FDF6E1] to-[#e4bc6d] h-full rounded-[10px] p-5 flex items-start gap-4 shadow-[inset_0_2px_10px_rgba(255,255,255,0.4)]">
            <div className="text-[#966b22] drop-shadow-sm mt-1">
              <Wallet size={38} className="fill-current text-current" strokeWidth={1} />
            </div>
            <div className="flex flex-col flex-1 justify-center relative">
              <p className="text-stone-900 text-[13px] font-semibold mb-1">Presupuesto Pagado</p>
              <p className="text-sm font-bold text-black tracking-tight mb-3">
                {formatearMoneda(totalPagadoReal)} <span className="font-normal text-xs text-stone-800">de {formatearMoneda(totalContratadoReal || proximoEvento.presupuestoTotal)}</span>
              </p>
              <div className="w-[90%] h-1.5 bg-[#B88C41]/20 rounded-full overflow-hidden mb-3 shadow-inner">
                <div className="h-full bg-[#fdfaf2] shadow-[0_0_5px_rgba(255,255,255,0.8)]" style={{ width: `${Math.min(100, porcentajePresupuesto)}%` }} />
              </div>
              <Link href={`/cliente/evento/${proximoEvento.id}`} className="text-xs font-semibold text-[#8a682c] hover:text-[#5e451b] italic underline block w-max transition-colors">Ver más</Link>
            </div>
          </div>
        </div>

        {/* Card 2: Confirmados */}
        <div className="relative rounded-xl bg-gradient-to-b from-[#FDEBB6] via-[#D5A754] to-[#B38332] p-[1.5px] shadow-[0_8px_20px_rgba(213,167,84,0.15)] hover:-translate-y-1 transition-transform group">
          <div className="bg-gradient-to-b from-[#FDF6E1] to-[#e4bc6d] h-full rounded-[10px] p-5 flex items-start gap-4 shadow-[inset_0_2px_10px_rgba(255,255,255,0.4)]">
            <div className="text-[#966b22] drop-shadow-sm mt-1">
              <Users size={38} className="fill-current text-current" strokeWidth={1} />
            </div>
            <div className="flex flex-col flex-1 justify-between h-full min-h-[105px]">
               <div className="mt-1">
                 <p className="text-[14px] text-stone-900 mb-1 font-medium">
                   <span className="font-bold text-black text-[15px]">{numInvitadosConfirmados}/{proximoEvento.numInvitados || 0}</span> Confirmados <span className="text-[12px] font-bold">({proximoEvento.numInvitados > 0 ? Math.round((numInvitadosConfirmados / proximoEvento.numInvitados) * 100) : 0}%)</span>
                 </p>
               </div>
               <Link href={`/cliente/evento/${proximoEvento.id}`} className="text-xs font-semibold text-[#8a682c] hover:text-[#5e451b] italic underline block w-max transition-colors mt-auto">Ver más</Link>
            </div>
          </div>
        </div>

        {/* Card 3: Contratados */}
        <div className="relative rounded-xl bg-gradient-to-b from-[#FDEBB6] via-[#D5A754] to-[#B38332] p-[1.5px] shadow-[0_8px_20px_rgba(213,167,84,0.15)] hover:-translate-y-1 transition-transform group">
          <div className="bg-gradient-to-b from-[#FDF6E1] to-[#e4bc6d] h-full rounded-[10px] p-5 flex items-start gap-4 shadow-[inset_0_2px_10px_rgba(255,255,255,0.4)]">
            <div className="text-[#966b22] drop-shadow-sm mt-1">
              <Star size={38} className="fill-current text-current" strokeWidth={1} />
            </div>
            <div className="flex flex-col flex-1 justify-between h-full min-h-[105px]">
               <div className="mt-1">
                 <p className="text-[14px] font-bold text-black mb-0.5">{numProveedoresContratados} Contratados</p>
                 <p className="text-[12px] text-stone-800 font-medium mb-1">{numProveedoresContratados > 0 ? '¡Sigue buscando!' : '¡Empieza a buscar!'}</p>
               </div>
               <Link href="/cliente/explorar" className="text-xs font-semibold text-[#8a682c] hover:text-[#5e451b] italic underline block w-max transition-colors mt-auto">Ver más</Link>
            </div>
          </div>
        </div>

      </div>

      {/* Mis Favoritos Section */}
      <section className="pt-4 space-y-4">
        <div className="flex items-center gap-2 px-1">
           <Star className="text-[#D5A754] fill-[#D5A754]" size={22} />
           <h2 className="text-[18px] font-bold text-black tracking-tight">Mis Favoritos (0)</h2>
        </div>

        <div className="relative bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-[14px] p-10 md:p-12 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center text-center overflow-hidden">
           
           {/* Decoración: Estrellas en esquina inferior izquierda */}
           <div className="absolute -bottom-4 -left-4 md:bottom-0 md:left-6 flex items-end drop-shadow-2xl opacity-40 pointer-events-none grayscale">
              <Star size={70} className="text-[#D4AF37] fill-[#D4AF37] -mr-6 drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] z-10 transform -rotate-12" />
              <Star size={110} className="text-[#E8C37D] fill-[#E8C37D] drop-shadow-[0_8px_16px_rgba(0,0,0,0.2)] z-20" />
              <Star size={60} className="text-[#B8860B] fill-[#B8860B] -ml-6 drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] z-10 transform rotate-12" />
           </div>

           <div className="relative z-30 max-w-md mx-auto space-y-2 text-[var(--color-texto)] pt-2">
             <p className="text-[15px] font-semibold">Aún no hay proveedores registrados.</p>
             <p className="text-[13px] font-medium mb-6 text-[var(--color-texto-suave)] leading-relaxed max-w-[280px] mx-auto">Próximamente encontrarás los mejores proveedores para tu evento.</p>
             <div className="mt-8 pt-4">
               <Link href="/cliente/explorar">
                 <button className="bg-gradient-to-b from-[#222] to-[#000] text-white px-14 py-3 rounded-full text-sm font-semibold shadow-[0_8px_20px_rgba(0,0,0,0.2)] border border-[#333] hover:scale-105 transition-transform inline-flex">
                   Explorar
                 </button>
               </Link>
             </div>
           </div>
        </div>
      </section>

      {/* MODAL NUEVO EVENTO (Reutilizado) */}
      {isNewEventModalOpen && renderModal()}

      {/* MODAL ARCHIVAR EVENTO */}
      {eventToArchive && (
        <ArchiveEventModal 
          evento={eventToArchive} 
          onClose={() => setEventToArchive(null)} 
          onSuccess={() => router.refresh()} 
        />
      )}
    </div>
  );
}
