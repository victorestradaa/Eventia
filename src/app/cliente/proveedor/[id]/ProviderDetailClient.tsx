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
  Map as MapIcon
} from 'lucide-react';
import { useState } from 'react';
import { cn, formatearMoneda } from '@/lib/utils';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getReservasCalendario } from '@/lib/actions/providerActions';
import { useEffect } from 'react';

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
}

export default function ProviderDetailClient({ data }: ProviderDetailClientProps) {
  const [imgActiva, setImgActiva] = useState(0);
  const [reservado, setReservado] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [confirmarReserva, setConfirmarReserva] = useState(false);
  const [zoomLogo, setZoomLogo] = useState(false);
  const [reservas, setReservas] = useState<any[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

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

  // Convertir reservas a eventos de calendario
  const calendarEvents = reservas.map(r => ({
    title: r.esManual ? 'No disponible' : 'Reservado',
    start: new Date(r.fechaEvento),
    end: new Date(r.fechaEvento),
    allDay: r.tipoReserva === 'DIA_COMPLETO',
  }));
  
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-[var(--color-primario)]" size={48} />
        <p>Cargando información real...</p>
      </div>
    );
  }

  const p = data;

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Navigation */}
      <div className="flex items-center justify-between">
         <Link href="/cliente/explorar" className="flex items-center gap-2 text-sm text-[var(--color-texto-muted)] hover:text-white transition-colors">
            <ArrowLeft size={18} /> Volver a buscar
         </Link>
         <div className="flex gap-4">
            <button className="p-3 rounded-full bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] hover:text-red-500 transition-colors">
              <Heart size={20} />
            </button>
            <button className="p-3 rounded-full bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] hover:text-[var(--color-primario-claro)] transition-colors">
              <Share2 size={20} />
            </button>
         </div>
      </div>

      {/* Hero Gallery Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Main large image */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden group min-h-[400px] bg-[var(--color-fondo-input)]">
           {/* Filtrar imágenes para NO mostrar el logo como parte de la galería principal */}
           {p.imagenes.filter((img: string) => img !== p.logoUrl).length > 0 ? (
             <>
               {(() => {
                 const galeriaSinLogo = p.imagenes.filter((img: string) => img !== p.logoUrl);
                 return (
                   <>
                     <img 
                       src={galeriaSinLogo[imgActiva % galeriaSinLogo.length]} 
                       alt={p.nombre} 
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                     />
                     {galeriaSinLogo.length > 1 && (
                       <>
                         <button 
                           onClick={() => setImgActiva((imgActiva - 1 + galeriaSinLogo.length) % galeriaSinLogo.length)}
                           className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                           <ChevronLeft size={24} />
                         </button>
                         <button 
                           onClick={() => setImgActiva((imgActiva + 1) % galeriaSinLogo.length)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                           <ChevronRight size={24} />
                         </button>
                       </>
                     )}
                   </>
                 );
               })()}
             </>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-texto-muted)] gap-4">
               <CalendarIcon size={64} strokeWidth={1} />
               <p className="text-sm font-bold uppercase tracking-widest">Sin imágenes disponibles</p>
             </div>
           )}
        </div>
        
        {/* Sidebar thumbnails */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           {(() => {
              const galeriaSinLogo = p.imagenes.filter((img: string) => img !== p.logoUrl);
              return (
                <>
                  <div className="flex-1 rounded-3xl overflow-hidden relative border border-white/5 bg-[var(--color-fondo-input)] hover:border-[var(--color-primario)]/30 transition-all cursor-pointer" onClick={() => setImgActiva(1)}>
                     {galeriaSinLogo[1] ? (
                       <img src={galeriaSinLogo[1]} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <Star className="text-white/10" />
                       </div>
                     )}
                     <div className="absolute inset-0 bg-black/10" />
                  </div>
                  <div className="flex-1 rounded-3xl overflow-hidden relative border border-white/5 group bg-[var(--color-fondo-input)] hover:border-[var(--color-primario)]/30 transition-all cursor-pointer" onClick={() => setImgActiva(2)}>
                     {galeriaSinLogo[2] ? (
                       <img src={galeriaSinLogo[2]} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <Star className="text-white/10" />
                       </div>
                     )}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center flex-col gap-2 cursor-pointer group-hover:bg-black/20 transition-all">
                        <span className="text-2xl font-bold">+{galeriaSinLogo.length > 3 ? galeriaSinLogo.length - 3 : 0}</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-[var(--color-texto-muted)]">Ver todas</span>
                     </div>
                  </div>
                </>
              );
           })()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Content (Details) */}
        <div className="lg:col-span-2 space-y-10">
           <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                 {/* Logo con zoom */}
                 <div className="relative shrink-0">
                    <div 
                      onClick={() => setZoomLogo(true)}
                      className="w-20 h-20 rounded-full border-4 border-[var(--color-fondo-card)] bg-[var(--color-fondo-input)] shadow-xl overflow-hidden cursor-pointer hover:scale-110 transition-transform active:scale-95 group"
                    >
                       {p.logoUrl ? (
                         <img src={p.logoUrl} alt="Logo" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-[var(--color-primario-claro)]">
                            <Star size={24} />
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex items-center gap-2">
                       <span className="badge badge-premium">{p.categoria}</span>
                       <div className="flex items-center gap-1 text-amber-400 font-bold ml-2">
                          <Star size={16} fill="currentColor" /> {p.calificacion} 
                          <span className="text-[var(--color-texto-muted)] font-normal ml-1">({p.reseñasCount} reseñas)</span>
                       </div>
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tighter uppercase italic">{p.nombre}</h1>
                    <div className="flex items-center gap-2 text-[var(--color-texto-suave)]">
                       <MapPin size={18} className="text-[var(--color-acento-claro)]" />
                       {p.ubicacion}
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-4 border-t border-[var(--color-borde-suave)] pt-8">
              <h2 className="text-2xl font-bold italic tracking-tighter uppercase">Acerca del servicio</h2>
              <p className="text-lg text-[var(--color-texto-suave)] leading-relaxed italic border-l-4 border-[var(--color-primario)] pl-6 py-2">
                {p.descripcion || 'Sin descripción detallada disponible.'}
              </p>
           </div>

           {/* Reseñas (Si hubiera) */}
           {p.resenas.length > 0 && (
             <div className="space-y-6 pt-10 border-t border-[var(--color-borde-suave)]">
                <h2 className="text-2xl font-bold italic tracking-tighter uppercase">Lo que dicen los clientes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {p.resenas.map((r: any) => (
                     <div key={r.id} className="card bg-[var(--color-fondo-input)]/50 p-6 border-none shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[var(--color-primario)]/20 flex items-center justify-center font-black text-[var(--color-primario-claro)] text-sm">
                                {r.nombre.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-bold text-sm uppercase tracking-tight">{r.nombre}</p>
                                 <p className="text-[10px] text-[var(--color-texto-muted)] font-bold">{new Date(r.creadoEn).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="flex items-center text-amber-400">
                              {Array.from({length: 5}).map((_, i) => (
                                <Star key={i} size={10} fill={i < r.calificacion ? "currentColor" : "none"} />
                              ))}
                           </div>
                        </div>
                        <p className="text-sm text-[var(--color-texto-suave)] leading-relaxed italic">
                          "{r.comentario || 'Sin comentario.'}"
                        </p>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {/* Nueva Sección: Ubicación Movida al Final de la columna de contenido */}
           {p.latitud && p.longitud && (
             <div className="space-y-6 pt-10 border-t border-[var(--color-borde-suave)] pb-10">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-bold italic tracking-tighter uppercase flex items-center gap-2">
                      <MapIcon size={24} className="text-[var(--color-primario-claro)]" /> Dónde encontrarnos
                   </h2>
                   <span className="text-[10px] text-[var(--color-texto-muted)] uppercase font-black tracking-widest bg-white/5 px-3 py-1 rounded-full">{p.ciudad}, {p.estado}</span>
                </div>
                
                <div className="rounded-[2.5rem] overflow-hidden border-4 border-[var(--color-fondo-card)] shadow-2xl">
                   <GooglePublicMap lat={p.latitud} lng={p.longitud} businessName={p.nombre} />
                </div>
                
                <div className="flex items-start gap-4 p-6 rounded-3xl bg-gradient-to-r from-[var(--color-primario)]/10 to-transparent border border-white/5">
                   <div className="p-3 rounded-full bg-[var(--color-primario)]/20 text-[var(--color-primario-claro)]">
                      <MapPin size={24} />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-white mb-1 uppercase tracking-tighter">Dirección Física</p>
                      <p className="text-xs text-[var(--color-texto-suave)] uppercase font-black tracking-widest">{p.direccion}</p>
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Right Sidebar (Booking / Action) */}
        <div className="space-y-6">
           <div className="card sticky top-32 p-8 border-t-4 border-t-[var(--color-primario)] shadow-2xl">
              <div className="space-y-6">
                 <div>
                    <p className="text-xs font-bold text-[var(--color-texto-muted)] uppercase tracking-widest mb-1">Precios desde</p>
                    <h3 className="text-4xl font-black gradient-texto">{formatearMoneda(p.servicios[0]?.precio || 0)}</h3>
                 </div>

                 <div className="space-y-3">
                    <p className="text-sm font-bold">Servicios Disponibles</p>
                    {p.servicios.map((s: any) => (
                       <div key={s.id} className="p-4 rounded-xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-input)] hover:border-[var(--color-primario)]/50 transition-all cursor-pointer group">
                          <div className="flex justify-between items-center mb-1">
                             <span className="font-bold text-sm">{s.nombre}</span>
                             <span className="text-[var(--color-primario-claro)] text-sm font-bold">{formatearMoneda(s.precio)}</span>
                          </div>
                          <p className="text-[10px] text-[var(--color-texto-muted)] leading-tight">{s.desc}</p>
                       </div>
                    ))}
                    {p.servicios.length === 0 && <p className="text-xs text-[var(--color-texto-muted)] italic">No hay servicios específicos listados todavía.</p>}
                 </div>

                 <hr className="border-[var(--color-borde-suave)]" />

                  <div className="space-y-4">
                     <button 
                       onClick={() => setMostrarCalendario(true)}
                       className="btn btn-secundario w-full font-bold text-sm py-4 flex items-center justify-center gap-2"
                     >
                        <CalendarIcon size={18} />
                        Verificar disponibilidad
                     </button>

                     <button 
                       onClick={() => setConfirmarReserva(true)}
                       className="btn btn-primario w-full font-bold text-sm py-4 shadow-lg shadow-violet-500/20"
                     >
                        Reservar Fecha Ahora
                     </button>
                  </div>

                 <div className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/20">
                       <ShieldCheck size={14} /> Tu pago está protegido por Gestor Eventos
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--color-texto-muted)]">
                       <Info size={14} /> No se requieren pagos adicionales fuera de la app
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Modal de Confirmación de Reserva */}
      {confirmarReserva && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="card max-w-md w-full p-8 text-center space-y-6 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] scale-in-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 mb-2">
                 <ShieldCheck size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Confirmar Intención de Reserva</h3>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                   <p className="text-sm font-bold leading-relaxed">
                     ¡Atención! Tienes un máximo de <span className="text-white font-black underline decoration-amber-500 underline-offset-4">48 horas</span> para completar el proceso con el anticipo para asegurar tu fecha.
                   </p>
                </div>
                <p className="text-xs text-[var(--color-texto-suave)] pt-2">
                  Al confirmar, le enviaremos una notificación a **{p.nombre}** para que esté pendiente de tu contratación. No se realizarán cargos en este momento.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                 <button 
                   onClick={() => setConfirmarReserva(false)}
                   className="btn btn-secundario py-4 text-xs font-black uppercase tracking-widest"
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={() => {
                     setConfirmarReserva(false);
                     setReservado(true);
                   }}
                   className="btn btn-primario py-4 text-[10px] font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-600 border-amber-600 shadow-amber-500/20"
                 >
                   Confirmar Intención
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Modal de Éxito Mock */}
      {reservado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="card max-w-sm w-full text-center space-y-6 py-12 border-[var(--color-primario)]/50 shadow-[0_0_50px_rgba(124,58,237,0.3)] scale-in-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                 <CheckCircle2 size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h3>
                <p className="text-sm text-[var(--color-texto-suave)] px-4">
                  Hemos enviado tu solicitud a **{p.nombre}**. El proveedor tiene 24 horas para confirmar.
                </p>
              </div>
              <div className="space-y-3 pt-4 px-6">
                <button 
                  onClick={() => setReservado(false)}
                  className="btn btn-fantasma w-full text-xs"
                >
                  Seguir Explorando
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Modal de Calendario Pantalla Completa */}
      {mostrarCalendario && (
        <div className="fixed inset-0 z-[120] bg-[var(--color-fondo)] animate-in slide-in-from-bottom duration-500 flex flex-col">
           <header className="p-6 border-b border-[var(--color-borde-suave)] flex items-center justify-between bg-[var(--color-fondo-card)]">
              <div className="flex items-center gap-4">
                 <div className="p-2 rounded-xl bg-[var(--color-primario)]/10 text-[var(--color-primario-claro)]">
                    <CalendarIcon size={32} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Agenda de {p.nombre}</h2>
                    <p className="text-xs text-[var(--color-texto-suave)] font-bold tracking-widest uppercase">Disponibilidad real sincronizada</p>
                 </div>
              </div>
              <button 
                onClick={() => setMostrarCalendario(false)}
                className="p-3 rounded-full hover:bg-white/5 transition-colors border border-white/5"
              >
                <X size={24} />
              </button>
           </header>

           <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto h-full bg-[var(--color-fondo-card)] p-8 rounded-[2.5rem] border border-[var(--color-borde-suave)] shadow-2xl overflow-hidden relative">
                 {loadingCalendar ? (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--color-fondo-card)]/80 backdrop-blur-md gap-4">
                       <Loader2 className="animate-spin text-[var(--color-primario)]" size={48} />
                       <p className="font-bold uppercase text-xs tracking-widest">Cargando disponibilidad...</p>
                    </div>
                 ) : (
                    <div className="h-full min-h-[600px] text-white">
                       <style>{`
                         .rbc-calendar { background: transparent; border: none; font-family: inherit; }
                         .rbc-header { border-bottom: 2px solid var(--color-borde-suave) !important; padding: 15px !important; font-weight: 800 !important; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em; color: var(--color-texto-muted); }
                         .rbc-month-view { border: none !important; border-radius: 20px; overflow: hidden; }
                         .rbc-day-bg { border-left: 1px solid var(--color-borde-suave) !important; transition: background 0.3s; }
                         .rbc-day-bg:hover { background: rgba(255,255,255,0.02); }
                         .rbc-off-range-bg { background: rgba(0,0,0,0.2) !important; }
                         .rbc-month-row { border-top: 1px solid var(--color-borde-suave) !important; }
                         .rbc-today { background: rgba(124, 58, 237, 0.05) !important; }
                         .rbc-event { background: var(--color-primario) !important; border: none !important; border-radius: 8px !important; font-size: 10px !important; font-weight: 800 !important; padding: 4px 8px !important; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); }
                         .rbc-show-more { background: transparent !important; color: var(--color-primario-claro) !important; font-weight: 900 !important; font-size: 10px; }
                         .rbc-toolbar { margin-bottom: 30px !important; display: flex !important; flex-direction: row-reverse !important; justify-content: space-between !important; align-items: center !important; }
                         .rbc-toolbar button { background: var(--color-fondo-input) !important; border: 1px solid var(--color-borde-suave) !important; color: white !important; font-weight: 900; border-radius: 12px; padding: 10px 20px; transition: all 0.3s; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
                         .rbc-toolbar button:hover { background: var(--color-primario) !important; border-color: var(--color-primario) !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4); }
                         .rbc-toolbar button:active { transform: translateY(0); }
                         .rbc-toolbar button.rbc-active { background: var(--color-primario) !important; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4); }
                         .rbc-btn-group { display: flex; gap: 8px; }
                         .rbc-toolbar-label { font-size: 32px !important; font-weight: 900 !important; text-transform: capitalize; color: white !important; font-style: italic; letter-spacing: -0.02em; }
                       `}</style>
                       <Calendar
                          localizer={localizer}
                          events={calendarEvents}
                          startAccessor="start"
                          endAccessor="end"
                          culture="es"
                          selectable={true}
                          onSelectSlot={(slot) => console.log('Seleccionado:', slot)}
                          messages={{
                            next: "Siguiente",
                            previous: "Anterior",
                            today: "Hoy",
                            month: "Mes",
                            week: "Semana",
                            day: "Día",
                            showMore: total => `+ Ver ${total} más`
                          }}
                       />
                    </div>
                 )}
              </div>
           </div>
           
           <footer className="p-8 border-t border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] flex justify-center">
              <button 
                onClick={() => setMostrarCalendario(false)}
                className="btn btn-primario px-12 py-4 rounded-2xl shadow-xl shadow-violet-500/20 font-black uppercase tracking-widest"
              >
                Regresar al perfil
              </button>
           </footer>
        </div>
      )}
      {/* Modal de Zoom del Logo */}
      {zoomLogo && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 cursor-zoom-out"
          onClick={() => setZoomLogo(false)}
        >
           <div className="relative max-w-2xl w-full p-4 flex items-center justify-center">
              <button className="absolute top-0 right-0 p-4 text-white hover:text-red-400 transition-colors">
                <X size={32} />
              </button>
              <img 
                src={p.logoUrl || '/logo.png'} 
                alt="Logo Enlarged" 
                className="max-w-full max-h-[80vh] rounded-3xl shadow-2xl scale-in-center object-contain"
              />
           </div>
        </div>
      )}
    </div>
  );
}
