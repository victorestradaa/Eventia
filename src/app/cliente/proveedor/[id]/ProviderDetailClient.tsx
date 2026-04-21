'use client';

import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Users, 
  Calendar as CalendarIcon, 
  Heart, 
  Share2, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  Map as MapIcon,
  ShoppingBag
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn, formatearMoneda, parseFechaLocal } from '@/lib/utils';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getReservasCalendario, solicitarReserva } from '@/lib/actions/providerActions';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const GooglePublicMap = dynamic(() => import('@/components/GooglePublicMap'), { ssr: false });

interface ProviderDetailClientProps {
  data: any;
  activeEvent?: any;
}

export default function ProviderDetailClient({ data, activeEvent }: ProviderDetailClientProps) {
  const [imgActiva, setImgActiva] = useState(0);
  const [reservado, setReservado] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [confirmarReserva, setConfirmarReserva] = useState(false);
  const [zoomLogo, setZoomLogo] = useState(false);
  const [reservas, setReservas] = useState<any[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [errorDisponibilidad, setErrorDisponibilidad] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(data?.servicios?.[0]?.id || null);
  const [solicitando, setSolicitando] = useState(false);
  const [errorSolicitud, setErrorSolicitud] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<any>('month');

  useEffect(() => {
    if (mostrarCalendario) {
      const loadReservas = async () => {
        setLoadingCalendar(true);
        const res = await getReservasCalendario(data.id);
        if (res.success) {
          setReservas(res.data || []);
        }
        setLoadingCalendar(false);
      };
      loadReservas();
    }
  }, [mostrarCalendario, data.id]);

  if (!data) return null;

  const p = data;
  const selectedService = p.servicios.find((s: any) => s.id === selectedServiceId) || p.servicios[0];
  
  // Fotos dinámicas del paquete. Fallback al banner si no hay fotos.
  const galeriaReal = (selectedService?.imagenes && selectedService.imagenes.length > 0) 
    ? selectedService.imagenes 
    : (p.bannerUrl ? [p.bannerUrl] : []);

  // Convertir reservas a eventos de calendario
  const calendarEvents = reservas.map(r => ({
    title: r.esManual ? 'No disponible' : 'Reservado',
    start: parseFechaLocal(r.fechaEvento),
    end: parseFechaLocal(r.fechaEvento),
    allDay: r.tipoReserva === 'DIA_COMPLETO',
  }));

  const handleConfirmarBooking = async () => {
    if (!activeEvent || !activeEvent.fecha) {
      setErrorSolicitud("Debes configurar un evento y fecha primero en tu panel de cliente.");
      return;
    }

    setSolicitando(true);
    setErrorSolicitud(null);

    const res = await solicitarReserva({
      clienteId: activeEvent.clienteId,
      proveedorId: data.id,
      servicioId: selectedService.id,
      eventoId: activeEvent.id,
      fechaEvento: activeEvent.fecha,
      montoTotal: selectedService.precio
    });

    if (res.success) {
      setConfirmarReserva(false);
      setReservado(true);
    } else {
      setErrorSolicitud(res.error || "Ocurrió un error al procesar la reserva.");
    }
    setSolicitando(false);
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Redes y Volver */}
      <div className="flex items-center justify-between pt-4">
         <Link href="/cliente/explorar" className="flex items-center gap-2 text-sm text-[var(--color-texto-muted)] hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full">
            <ArrowLeft size={18} /> Volver a explorar
         </Link>
         <div className="flex gap-3">
            <button className="p-3 rounded-full bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] hover:text-red-500 transition-colors shadow-lg">
              <Heart size={20} />
            </button>
            <button className="p-3 rounded-full bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] hover:text-[var(--color-primario-claro)] transition-colors shadow-lg">
              <Share2 size={20} />
            </button>
         </div>
      </div>

      {/* --- SECCIÓN GALERÍA (IMAGEN 3: ZONA VERDE) --- */}
      <section className="relative rounded-[3rem] overflow-hidden group h-[550px] bg-[var(--color-fondo-input)] border-4 border-[var(--color-fondo-card)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
         {galeriaReal.length > 0 ? (
           <>
              <img 
                src={galeriaReal[imgActiva % galeriaReal.length]} 
                alt={selectedService?.nombre} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              {galeriaReal.length > 1 && (
                <>
                  <button 
                    onClick={() => setImgActiva((imgActiva - 1 + galeriaReal.length) % galeriaReal.length)}
                    className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-[var(--color-primario)] hover:border-[var(--color-primario)] transition-all z-20 shadow-2xl"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button 
                    onClick={() => setImgActiva((imgActiva + 1) % galeriaReal.length)}
                    className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-[var(--color-primario)] hover:border-[var(--color-primario)] transition-all z-20 shadow-2xl"
                  >
                    <ChevronRight size={32} />
                  </button>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                     {galeriaReal.map((_, i) => (
                       <button 
                        key={i} 
                        onClick={() => setImgActiva(i)}
                        className={cn("h-1.5 rounded-full transition-all duration-500", (imgActiva % galeriaReal.length) === i ? "bg-[var(--color-primario)] w-12" : "bg-white/40 w-4 hover:bg-white/60")} 
                       />
                     ))}
                  </div>
                </>
              )}
           </>
         ) : (
           <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 gap-6">
              <div className="p-8 rounded-full bg-white/5 border border-white/10">
                <Star size={80} strokeWidth={1} className="text-white/20 animate-pulse" />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-white/30">Sin imagen de este producto</p>
           </div>
         )}
         
         <div className="absolute top-8 left-8 z-20">
            <span className="bg-[var(--color-primario)] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl italic">Paquete Premium</span>
         </div>
      </section>

      {/* --- GRID PRINCIPAL (IMAGEN 3: ZONA ROJA Y AZUL) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* --- COLUMNA IZQUIERDA: INFO PRODUCTO (ZONA ROJA) --- */}
        <div className="lg:col-span-8 space-y-8">
           <div className="card bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] p-12 shadow-2xl relative overflow-hidden">
              {/* Decoración de fondo */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--color-primario)]/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

              <div className="space-y-10 relative z-10">
                 {/* Rating y Categoría */}
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-amber-500/10 text-amber-500 px-5 py-2 rounded-full border border-amber-500/10 active:scale-95 transition-transform">
                       <Star size={20} fill="currentColor" />
                       <span className="font-black text-xl italic">{p.calificacion}</span>
                    </div>
                    <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
                    <span className="text-xs font-black uppercase tracking-widest text-[var(--color-texto-muted)]">{p.categoria}</span>
                 </div>

                 {/* Títulos */}
                 <div className="space-y-4">
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">{selectedService?.nombre}</h1>
                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 mt-4 backdrop-blur-sm">
                       <p className="text-base text-[var(--color-texto-suave)] leading-relaxed italic">
                         "{selectedService?.desc || 'Sin descripción detallada para este paquete.'}"
                       </p>
                    </div>
                 </div>

                 {/* Precio */}
                 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-[var(--color-texto-muted)] uppercase tracking-[0.3em] ml-1">Inversión del servicio</p>
                       <h3 className="text-6xl font-black gradient-texto tracking-tighter italic leading-none">{formatearMoneda(selectedService?.precio || 0)}</h3>
                    </div>
                 </div>

                 {/* Selector de otros paquetes */}
                 <div className="pt-8 border-t border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-texto-muted)]">Explorar otros paquetes</h4>
                       <span className="text-[10px] text-white/20 uppercase font-bold">{p.servicios.length} opciones disponibles</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                       {p.servicios.map((s: any) => (
                          <button 
                            key={s.id}
                            onClick={() => {
                              setSelectedServiceId(s.id);
                              setErrorDisponibilidad(null);
                              setImgActiva(0);
                            }}
                            className={cn(
                              "px-8 py-5 rounded-[1.5rem] border-2 transition-all duration-300 font-black text-xs uppercase tracking-tighter",
                              selectedServiceId === s.id 
                                ? "border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_15px_30px_-10px_rgba(245,158,11,0.3)] scale-105" 
                                : "border-[var(--color-borde-suave)] bg-[var(--color-fondo-input)] hover:border-white/20 hover:scale-105"
                            )}
                          >
                             {s.nombre}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Botones de Acción */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-10">
                    {errorDisponibilidad && (
                        <div className="md:col-span-2 p-6 rounded-3xl bg-red-500/10 border-2 border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest animate-bounce flex items-center gap-4 text-center">
                           <X className="shrink-0" />
                           {errorDisponibilidad}
                        </div>
                    )}

                    <button 
                      onClick={() => setMostrarCalendario(true)}
                      className="btn bg-white/5 border border-white/10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3 italic"
                    >
                       <CalendarIcon size={18} />
                       Consultar Agenda
                    </button>
                    
                    <button 
                      onClick={() => {
                         const diasPermitidos = selectedService?.diasDisponibles || [];
                         if (!activeEvent || !activeEvent.fecha) {
                            setErrorDisponibilidad("⚠️ NO TIENES UN EVENTO ACTIVO. Crea un evento en tu panel para reservar.");
                            return;
                         }

                         // Robust day calculation: ensure we get the local day of the week for the event date without shifting
                         const fechaLocal = parseFechaLocal(activeEvent.fecha);
                         const diaEvento = fechaLocal.getDay(); 
                         
                         if (diasPermitidos.length > 0 && !diasPermitidos.includes(diaEvento)) {
                            const diasNombres = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
                            const diasPermNombres = diasPermitidos.map((d:number) => diasNombres[d]).join(', ');
                            setErrorDisponibilidad(`🚫 DÍA NO PERMITIDO. Este paquete solo se habilita para: ${diasPermNombres}. Tu evento es un ${diasNombres[diaEvento]}.`);
                            return;
                         }
                         
                         setErrorDisponibilidad(null);
                         setConfirmarReserva(true);
                      }}
                      className="btn btn-primario py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(124,58,237,0.4)] active:scale-95 transition-all italic border-t-2 border-white/20"
                    >
                       Apartar Paquete Ahora
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* --- COLUMNA DERECHA: PERFIL PROVEEDOR (ZONA AZUL) --- */}
        <aside className="lg:col-span-4 space-y-6">
           {/* Perfil del Vendedor */}
           <div className="card bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] p-10 shadow-2xl relative overflow-hidden sticky top-32">
              <div className="flex flex-col items-center text-center space-y-6">
                 {/* Logo mini discreto con Zoom */}
                 <div className="relative group/logo">
                   <div 
                    onClick={() => setZoomLogo(true)}
                    className="w-24 h-24 rounded-full border-4 border-white/5 bg-[var(--color-fondo-input)] shadow-2xl overflow-hidden p-1.5 cursor-zoom-in transition-all group-hover/logo:scale-110"
                   >
                      {p.logoUrl ? (
                        <img src={p.logoUrl} alt={p.nombre} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-primario-claro)] bg-white/5 rounded-full">
                           <Users size={32} />
                        </div>
                      )}
                   </div>
                   <div className="absolute -bottom-2 right-0 bg-[var(--color-primario)] text-white p-2 rounded-full shadow-lg border-2 border-[var(--color-fondo-card)]">
                      <ShieldCheck size={14} />
                   </div>
                 </div>

                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-[var(--color-texto-muted)] uppercase tracking-[0.4em]">Propiedad de</p>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none">{p.nombre}</h2>
                    <div className="pt-2 flex items-center justify-center gap-1.5 text-amber-500 font-black text-sm">
                       <Star size={16} fill="currentColor" /> {p.calificacion}
                    </div>
                 </div>

                 {/* Stats Rápidos */}
                 <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                       <ShoppingBag size={20} className="mx-auto mb-2 text-[var(--color-primario-claro)]" />
                       <p className="text-[10px] font-bold text-[var(--color-texto-muted)] uppercase tracking-widest leading-none mb-1">Pedidos</p>
                       <p className="text-xl font-black">{p.pedidosCount || '0'}</p>
                    </div>
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                       <Star size={20} className="mx-auto mb-2 text-amber-500" />
                       <p className="text-[10px] font-bold text-[var(--color-texto-muted)] uppercase tracking-widest leading-none mb-1">Puntos</p>
                       <p className="text-xl font-black">4.9</p>
                    </div>
                 </div>

                 {/* Ubicación y Mapa */}
                 <div className="w-full space-y-4 pt-4">
                    <div className="rounded-[2rem] overflow-hidden border-2 border-white/10 h-44 shadow-inner grayscale group-hover:grayscale-0 transition-all cursor-pointer">
                        {p.latitud && p.longitud ? (
                           <GooglePublicMap lat={p.latitud} lng={p.longitud} businessName={p.nombre} />
                        ) : (
                           <div className="h-full w-full bg-white/5 flex items-center justify-center italic text-xs text-white/20">Mapa no disponible</div>
                        )}
                    </div>
                    <div className="flex items-start gap-4 p-5 rounded-3xl bg-[var(--color-fondo-input)] border border-white/5 text-left">
                       <MapPin size={20} className="text-[var(--color-primario-claro)] shrink-0 mt-1" />
                       <div>
                          <p className="text-[10px] font-black text-[var(--color-texto-muted)] uppercase tracking-widest mb-1">Zona de servicio</p>
                          <p className="text-[11px] text-[var(--color-texto-suave)] font-black uppercase tracking-widest leading-relaxed">
                            {p.direccion || p.ubicacion}
                          </p>
                       </div>
                    </div>
                 </div>

                 <div className="pt-6 w-full opacity-40 hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                       <ShieldCheck size={16} /> Contratación Protegida
                    </div>
                 </div>
              </div>
           </div>
        </aside>
      </div>

      {/* --- MODALES --- */}

      {confirmarReserva && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className="card max-w-md w-full p-12 text-center border-amber-500/30 shadow-[0_0_80px_rgba(245,158,11,0.2)] scale-in-center overflow-hidden">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="mx-auto w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 mb-8 border-4 border-amber-500/20 shadow-2xl relative">
                 <ShieldCheck size={56} />
              </div>
              <div className="space-y-6">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter">¿Asegurar este paquete?</h3>
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-2xl border-b-4 border-amber-700/50">
                   <p className="text-sm font-black leading-tight uppercase tracking-tighter">
                     IMPORTANTE: Tienes <span className="underline underline-offset-8 decoration-amber-900/50 text-black">48 HORAS</span> para liquidar el anticipo.
                   </p>
                </div>
                <p className="text-xs text-[var(--color-texto-suave)] px-6 leading-relaxed italic">
                  Notificaremos a **{p.nombre}** sobre tu intención de reserva para **{selectedService?.nombre}**.
                </p>

                {errorSolicitud && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase italic">
                    {errorSolicitud}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-10">
                 <button onClick={() => setConfirmarReserva(false)} className="btn bg-white/5 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10" disabled={solicitando}>Cancelar</button>
                 <button 
                   onClick={handleConfirmarBooking} 
                   className="btn bg-amber-500 hover:bg-amber-600 py-5 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg border-t border-white/20 flex items-center justify-center gap-2"
                   disabled={solicitando}
                 >
                   {solicitando ? <Loader2 className="animate-spin" size={18} /> : 'Confirmar'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {reservado && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className="card max-w-sm w-full text-center space-y-8 py-14 border-emerald-500/40 shadow-[0_0_80px_rgba(16,185,129,0.2)] scale-in-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 border-4 border-emerald-500/20">
                 <CheckCircle2 size={56} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">¡Solicitud Exitosa!</h3>
                <p className="text-sm text-[var(--color-texto-suave)] px-10 leading-relaxed italic">
                  Estamos procesando tu reservación. El proveedor responderá en breve.
                </p>
              </div>
              <div className="px-12 pt-4">
                <button 
                  onClick={() => setReservado(false)}
                  className="btn btn-primario w-full font-black text-xs uppercase tracking-widest py-5 rounded-2xl shadow-xl italic"
                >
                  Seguir Explorando
                </button>
              </div>
           </div>
        </div>
      )}

      {mostrarCalendario && (
        <div className="fixed inset-0 z-[250] bg-[var(--color-fondo)] animate-in slide-in-from-bottom-10 duration-500 flex flex-col">
           <header className="px-12 py-8 border-b border-[var(--color-borde-suave)] flex items-center justify-between bg-[var(--color-fondo-card)] shadow-2xl">
              <div className="flex items-center gap-8">
                 <div className="p-4 rounded-3xl bg-[var(--color-primario)]/10 text-[var(--color-primario-claro)] shadow-inner">
                    <CalendarIcon size={48} />
                 </div>
                 <div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">Agenda de Disponibilidad</h2>
                    <p className="text-xs text-[var(--color-texto-suave)] font-extrabold tracking-[0.3em] uppercase mt-1">Paquete activo: {selectedService?.nombre}</p>
                 </div>
              </div>
              <button onClick={() => setMostrarCalendario(false)} className="p-4 rounded-full hover:bg-white/5 transition-all border border-white/5 shadow-xl active:scale-90">
                <X size={32} />
              </button>
           </header>

           <div className="flex-1 p-10 overflow-auto bg-black/40">
              <div className="max-w-7xl mx-auto h-full bg-[var(--color-fondo-card)] p-12 rounded-[4rem] border-2 border-[var(--color-borde-suave)] shadow-3xl overflow-hidden relative">
                 {loadingCalendar ? (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-fondo-card)]/90 backdrop-blur-2xl gap-6">
                       <Loader2 className="animate-spin text-[var(--color-primario)]" size={80} />
                       <p className="font-black uppercase text-sm tracking-[0.5em] italic text-white/50">Cargando Disponibilidad Real</p>
                    </div>
                 ) : (
                    <div className="h-full min-h-[600px] text-white">
                       <style>{`
                         .rbc-calendar { background: transparent; border: none; font-family: inherit; }
                         .rbc-header { border-bottom: 2px solid var(--color-borde-suave) !important; padding: 25px !important; font-weight: 950 !important; text-transform: uppercase; font-size: 11px; letter-spacing: 0.3em; color: var(--color-texto-muted); }
                         .rbc-month-view { border: none !important; border-radius: 40px; overflow: hidden; }
                         .rbc-day-bg { border-left: 2px solid var(--color-borde-suave) !important; transition: background 0.4s ease; }
                         .rbc-day-bg:hover { background: rgba(124, 58, 237, 0.05) !important; }
                         .rbc-off-range-bg { background: rgba(0,0,0,0.4) !important; }
                         .rbc-month-row { border-top: 2px solid var(--color-borde-suave) !important; }
                         .rbc-today { background: rgba(124, 58, 237, 0.1) !important; }
                         .rbc-event { background: var(--color-primario) !important; border: 2px solid rgba(255,255,255,0.2) !important; border-radius: 12px !important; font-size: 10px !important; font-weight: 900 !important; padding: 6px 14px !important; box-shadow: 0 8px 15px rgba(0,0,0,0.3); }
                         .rbc-toolbar-label { font-size: 48px !important; font-weight: 950 !important; text-transform: uppercase; color: white !important; font-style: italic; letter-spacing: -0.05em; }
                         .rbc-toolbar button { background: var(--color-fondo-input) !important; border: 2px solid var(--color-borde-suave) !important; color: white !important; font-weight: 900; border-radius: 20px; padding: 14px 32px; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-transform: uppercase; font-size: 11px; letter-spacing: 0.2em; }
                         .rbc-toolbar button:hover { border-color: var(--color-primario) !important; transform: translateY(-5px); box-shadow: 0 15px 30px rgba(124, 58, 237, 0.3); }
                       `}</style>
                       <Calendar
                          localizer={localizer}
                          events={calendarEvents}
                          startAccessor="start"
                          endAccessor="end"
                          culture="es"
                           date={calendarDate}
                           view={calendarView}
                           onNavigate={(date) => setCalendarDate(date)}
                           onView={(view) => setCalendarView(view)}
                          messages={{
                            next: "Siguiente",
                            previous: "Anterior",
                            today: "Hoy",
                            month: "Mes",
                            week: "Semana",
                            agenda: "Agenda",
                             day: "Día",
                            showMore: (total: number) => `+ Ver ${total} más`
                          }}
                       />
                    </div>
                 )}
              </div>
           </div>
           
           <footer className="p-12 border-t border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] flex justify-center">
              <button 
                onClick={() => setMostrarCalendario(false)}
                className="btn btn-primario px-20 py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(124,58,237,0.3)] font-black uppercase tracking-widest text-xs italic"
              >
                Regresar al Paquete
              </button>
           </footer>
        </div>
      )}

      {zoomLogo && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/98 backdrop-blur-3xl animate-in fade-in duration-700 cursor-zoom-out" onClick={() => setZoomLogo(false)}>
           <div className="relative max-w-3xl w-full p-4 flex flex-col items-center gap-10">
              <button className="absolute -top-24 right-0 p-4 text-white/40 hover:text-white transition-all hover:scale-110"><X size={64} /></button>
              <img src={p.logoUrl || '/logo.png'} alt={p.nombre} className="max-w-full max-h-[70vh] rounded-[4rem] shadow-[0_0_120px_rgba(255,255,255,0.15)] scale-in-center object-contain border-8 border-white/5" />
              <div className="text-center space-y-2">
                 <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">{p.nombre}</h2>
                 <p className="text-xs font-black uppercase tracking-[1em] text-white/30">{p.categoria}</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
