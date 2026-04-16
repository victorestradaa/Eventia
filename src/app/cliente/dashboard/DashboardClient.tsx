'use client';

import { Calendar, Users, Wallet, ChevronRight, Star, Clock, X, Loader2 } from 'lucide-react';
import { formatearMoneda } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { createEvento } from '@/lib/actions/eventActions';
import { useRouter } from 'next/navigation';

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
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-3xl">🎉</div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">¡Bienvenido a Gestor de Eventos!</h2>
          <p className="text-[var(--color-texto-suave)] max-w-md">Empieza creando tu primer evento para organizar cada detalle de tu gran día.</p>
        </div>
        <button 
          onClick={() => setIsNewEventModalOpen(true)}
          className="btn btn-primario px-8 py-4 font-bold shadow-lg shadow-violet-500/20"
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="card max-w-xl w-full p-8 space-y-8 animate-in zoom-in-95 duration-300">
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold uppercase italic tracking-tighter decoration-[var(--color-primario-claro)] underline underline-offset-8">Nuevo Evento</h2>
              <button onClick={() => setIsNewEventModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full" disabled={loading}><X size={20} /></button>
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
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" 
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Tipo de Evento *</label>
                  <select 
                    required
                    value={nuevoEvento.tipo}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, tipo: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all"
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
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" 
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
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" 
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
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" 
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                 <button type="button" onClick={() => setIsNewEventModalOpen(false)} className="btn btn-secundario flex-1 py-4" disabled={loading}>Cancelar</button>
                 <button type="submit" className="btn btn-primario flex-1 py-4 font-bold shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2" disabled={loading}>
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
    <div className="space-y-10">
      {/* Event Selection (Solo para Planner) */}
      {isPlanner && (
        <section className="flex items-center gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-style">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-texto-muted)] whitespace-nowrap mr-2">
            Mis Eventos (Planner):
          </h2>
          {eventos.map((evt) => (
            <button 
              key={evt.id}
              onClick={() => setEventoId(evt.id)}
              className={`px-4 py-2 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${
                evt.id === proximoEvento.id 
                ? 'bg-[var(--color-primario)] border-[var(--color-primario)] text-white shadow-lg' 
                : 'bg-[var(--color-fondo-input)] border-[var(--color-borde-suave)] text-[var(--color-texto-suave)] hover:border-[var(--color-primario-claro)] hover:text-white'
              }`}
            >
              {evt.nombre}
            </button>
          ))}
          <button 
            onClick={() => setIsNewEventModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-[var(--color-primario-claro)] text-[var(--color-primario-claro)] text-sm font-bold hover:bg-[var(--color-primario)]/10 transition-all whitespace-nowrap"
          >
            <span>+</span> Nuevo Evento
          </button>
        </section>
      )}

      {/* Hero / Countdown Refinado */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#8b7355] via-[#1c1917] to-[#8b7355] p-10 md:p-20 text-white shadow-gold-heavy border border-yellow-500/20 group">
        {/* Geometric Pattern Overlay Refinado */}
        <div className="absolute inset-0 bg-pattern-dots opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-10">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <span className="inline-block px-5 py-1.5 rounded-full bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500/80 border border-yellow-500/10">
                Próximo Gran Evento — Plan {usuario.plan}
              </span>
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
            </div>
            <h1 className="text-7xl md:text-9xl font-serif tracking-tighter drop-shadow-2xl">
              {proximoEvento.nombre}
            </h1>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            {/* Fecha Elegante */}
            <div className="flex flex-col items-center px-8 py-3 rounded-2xl bg-stone-950/40 backdrop-blur-xl border border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1">Tu Gran Día</span>
              <span className="text-2xl font-serif text-stone-100">
                {fechaEvt ? (
                  (() => {
                    return new Date(fechaEvt.getTime() + fechaEvt.getTimezoneOffset() * 60000).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                  })()
                ) : 'Fecha por definir'}
              </span>
            </div>

            {/* Countdown Circular */}
            <div className="relative w-28 h-28 flex flex-col items-center justify-center bg-yellow-500 rounded-full text-stone-950 shadow-[0_0_50px_rgba(234,179,8,0.3)] ring-4 ring-yellow-500/20">
               <span className="text-4xl font-black leading-none">{diasRestantes}</span>
               <span className="text-[8px] font-black uppercase tracking-tighter text-stone-900/60 mt-1 text-center">Días para<br/>el evento</span>
            </div>

            {/* Vigencia */}
            <div className="flex flex-col items-center px-8 py-3 rounded-2xl bg-stone-950/40 backdrop-blur-xl border border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1">Vigencia Gestión</span>
              <span className="text-2xl font-serif text-stone-100">
                {mesesVigencia === Infinity ? '∞' : fechaExpiracion.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '')}
              </span>
            </div>
          </div>

          <Link href={`/cliente/evento/${proximoEvento.id}`}>
            <button className="gold-metallic text-stone-950 px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all duration-500 shadow-2xl">
              Gestionar Mi Evento
            </button>
          </Link>
        </div>
        
        {/* Luxury Light Effects */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-yellow-500/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-yellow-500/5 to-transparent pointer-events-none" />
      </section>

      {/* Tarjetas de Resumen Refinadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="relative group bg-gradient-to-br from-white via-stone-50 to-white border border-stone-200 rounded-[1.5rem] p-7 shadow-elite-gold hover:-translate-y-2 transition-all duration-700 overflow-hidden">
          <div className="absolute inset-0 bg-marble opacity-[0.03] pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-4 rounded-2xl bg-yellow-500 shadow-[inset_0_0_10px_rgba(255,255,255,0.4)] text-stone-950 gold-metallic">
              <Wallet size={24} />
            </div>
            <Link href={`/cliente/evento/${proximoEvento.id}`} className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-yellow-600 transition-colors border-b border-stone-200">Ver más</Link>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Presupuesto Pagado</p>
          <div className="flex items-baseline gap-2 mb-4">
            <h3 className="text-3xl font-serif text-stone-900">{formatearMoneda(totalPagadoReal)}</h3>
            <span className="text-[10px] font-bold text-stone-400 uppercase">de {formatearMoneda(totalContratadoReal || proximoEvento.presupuestoTotal)}</span>
          </div>
          <div className="relative w-full h-3 bg-stone-100 rounded-full overflow-hidden shadow-inner ring-4 ring-yellow-500/5">
            <div 
              className="h-full gold-metallic transition-all duration-1000 relative" 
              style={{ width: `${Math.min(100, porcentajePresupuesto)}%` }}
            >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        <div className="relative group bg-gradient-to-br from-white via-stone-50 to-white border border-stone-200 rounded-[1.5rem] p-7 shadow-elite-gold hover:-translate-y-2 transition-all duration-700 overflow-hidden">
          <div className="absolute inset-0 bg-marble opacity-[0.03] pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-4 rounded-2xl bg-yellow-500 shadow-[inset_0_0_10px_rgba(255,255,255,0.4)] text-stone-950 gold-metallic">
              <Users size={24} />
            </div>
            <Link href={`/cliente/evento/${proximoEvento.id}`} className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-yellow-600 transition-colors border-b border-stone-200">Lista completa</Link>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Asistencia</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-serif text-stone-900">{numInvitadosConfirmados} / {proximoEvento.numInvitados || 0}</h3>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Confirmados</span>
          </div>
          <p className="text-[10px] text-yellow-600 font-black uppercase tracking-widest mt-2">{proximoEvento.numInvitados > 0 ? Math.round((numInvitadosConfirmados / proximoEvento.numInvitados) * 100) : 0}% de avance</p>
        </div>

        <div className="relative group bg-gradient-to-br from-white via-stone-50 to-white border border-stone-200 rounded-[1.5rem] p-7 shadow-elite-gold hover:-translate-y-2 transition-all duration-700 overflow-hidden">
          <div className="absolute inset-0 bg-marble opacity-[0.03] pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-4 rounded-2xl bg-yellow-500 shadow-[inset_0_0_10px_rgba(255,255,255,0.4)] text-stone-950 gold-metallic">
              <Star size={24} />
            </div>
            <Link href="/cliente/explorar" className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-yellow-600 transition-colors border-b border-stone-200">Buscar más</Link>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Proveedores</p>
          <h3 className="text-3xl font-serif text-stone-900 mb-2">{numProveedoresContratados} Contratados</h3>
          <p className="text-[10px] text-yellow-600 font-black uppercase tracking-widest">{numProveedoresContratados > 0 ? '¡Experiencia Creciente!' : '¡Inicia tu búsqueda!'}</p>
        </div>
      </div>

      {/* Cuerpo Central Refinado */}
      <section className="pt-10 space-y-8">
        <div className="flex items-center gap-4">
           <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-600 shadow-inner">
             <Star size={28} fill="currentColor" strokeWidth={1} />
           </div>
           <h2 className="text-3xl font-serif text-stone-900">Mis Favoritos (0)</h2>
           <div className="flex-1 h-px bg-stone-200" />
        </div>

        <div className="relative overflow-hidden bg-white border border-stone-200 rounded-[3rem] p-20 text-center shadow-2xl shadow-stone-900/5">
           <div className="absolute inset-0 bg-marble opacity-[0.05] pointer-events-none" />
           <div className="relative z-10 space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-stone-50 flex items-center justify-center text-stone-300 border border-stone-100 shadow-inner">
                <Star size={40} strokeWidth={1} />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-serif text-stone-900">Aún no hay proveedores registrados</p>
                <p className="text-sm text-stone-400 max-w-sm mx-auto">Próximamente encontrarás los mejores proveedores premium seleccionados especialmente para tu gran día.</p>
              </div>
              <Link href="/cliente/explorar">
                <button className="bg-gradient-to-r from-stone-950 via-yellow-700 to-stone-950 text-white px-16 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl hover:shadow-yellow-500/20 border border-yellow-500/20">
                  Explorar
                </button>
              </Link>
           </div>
        </div>
      </section>

      {/* MODAL NUEVO EVENTO (Reutilizado) */}
      {isNewEventModalOpen && renderModal()}
    </div>
  );
}
