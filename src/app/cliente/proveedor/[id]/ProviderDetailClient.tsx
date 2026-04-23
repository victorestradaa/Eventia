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
  ShoppingBag,
  Plus,
  Zap,
  Globe,
  Clock,
  Check,
  Maximize2,
  Award,
  TrendingUp,
  Search,
  CheckCircle
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn, formatearMoneda, parseFechaLocal } from '@/lib/utils';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const packageParam = searchParams.get('paquete');

  const [imgActiva, setImgActiva] = useState(0);
  const [prevImgIdx, setPrevImgIdx] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [reservado, setReservado] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [confirmarReserva, setConfirmarReserva] = useState(false);
  const [zoomLogo, setZoomLogo] = useState(false);
  const [reservas, setReservas] = useState<any[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [errorDisponibilidad, setErrorDisponibilidad] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(packageParam || data?.servicios?.[0]?.id || null);
  const [solicitando, setSolicitando] = useState(false);
  const [errorSolicitud, setErrorSolicitud] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<any>('month');
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (packageParam && data?.servicios?.some((s: any) => s.id === packageParam)) {
      setSelectedServiceId(packageParam);
    }
  }, [packageParam, data.servicios]);

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
  
  const galeriaReal = Array.from(new Set((selectedService?.imagenes && selectedService.imagenes.length > 0) 
    ? selectedService.imagenes 
    : (p.bannerUrl ? [p.bannerUrl] : [])));

  const changeImg = (nextIdx: number) => {
    if (isTransitioning) return;
    setPrevImgIdx(imgActiva);
    setImgActiva(nextIdx);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 1500); // Duración del desvanecido
  };

  const nextImg = () => changeImg((imgActiva + 1) % galeriaReal.length);
  const prevImg = () => changeImg((imgActiva - 1 + galeriaReal.length) % galeriaReal.length);

  useEffect(() => {
    if (galeriaReal.length <= 1) return;
    
    timerRef.current = setInterval(() => {
      nextImg();
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [galeriaReal, imgActiva, isTransitioning]);

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
      setErrorSolicitud(res.error || "Error.");
    }
    setSolicitando(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] pb-20 overflow-x-hidden transition-colors duration-300">
      
      {/* 1. TOP ACTIONS */}
      <div className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/cliente/explorar" className="group flex items-center gap-2 text-[var(--color-texto-muted)] hover:text-[var(--color-texto)] transition-all text-sm font-bold">
          <ArrowLeft size={16} /> Volver a explorar
        </Link>
        <div className="flex gap-4">
           <Heart size={20} className="text-[var(--color-texto-muted)] hover:text-red-500 cursor-pointer" />
           <Share2 size={20} className="text-[var(--color-texto-muted)]" />
        </div>
      </div>

      {/* 2. GALLERIA CON CROSS-FADE DE ALTA GAMA */}
      <section className="relative w-full overflow-hidden mb-16 select-none group/gallery">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="relative h-[400px] lg:h-[550px] flex items-center justify-center">
            
            {/* Imagen Lateral Izquierda */}
            <div onClick={prevImg} className="absolute left-0 w-[15%] lg:w-[22%] h-[65%] rounded-[3rem] overflow-hidden opacity-10 grayscale blur-[4px] transition-all duration-1000 cursor-pointer -translate-x-[12%]">
              <img src={galeriaReal[(imgActiva - 1 + galeriaReal.length) % galeriaReal.length]} className="w-full h-full object-cover" alt="Prev" />
            </div>

            {/* Contenedor Principal con Cross-Fade */}
            <div className="relative w-[100%] lg:w-[72%] h-full z-10 rounded-[4rem] overflow-hidden shadow-2xl border-4 border-[var(--color-fondo-card)] bg-[var(--color-fondo-card)]">
               
               {/* Imagen de Fondo (La que se va) */}
               {prevImgIdx !== null && (
                 <div className="absolute inset-0 z-0">
                    <img src={galeriaReal[prevImgIdx]} className="w-full h-full object-cover" alt="Outgoing" />
                 </div>
               )}

               {/* Imagen de Frente (La que entra con Fade) */}
               <div key={imgActiva} className="absolute inset-0 z-10 w-full h-full animate-fade-in-premium">
                  <img src={galeriaReal[imgActiva]} className="w-full h-full object-cover" alt="Incoming" />
               </div>

               {/* Overlays */}
               <button onClick={() => setShowGalleryModal(true)} className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-[var(--color-primario)] transition-all z-20">
                 <Maximize2 size={24} />
               </button>

               {/* Barra de Progreso */}
               <div className="absolute bottom-0 left-0 h-1.5 bg-[var(--color-acento)] w-full origin-left animate-progress-7 z-30" key={`bar-${imgActiva}`} />
               
               {/* Nav Manual */}
               <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between z-30 opacity-0 group-hover/gallery:opacity-100 transition-opacity pointer-events-none">
                  <button onClick={(e) => { e.stopPropagation(); prevImg(); }} className="w-14 h-14 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto hover:bg-black/40 transition-all">
                    <ChevronLeft size={32} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); nextImg(); }} className="w-14 h-14 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto hover:bg-black/40 transition-all">
                    <ChevronRight size={32} />
                  </button>
               </div>
            </div>

            {/* Imagen Lateral Derecha */}
            <div onClick={nextImg} className="absolute right-0 w-[15%] lg:w-[22%] h-[65%] rounded-[3rem] overflow-hidden opacity-10 grayscale blur-[4px] transition-all duration-1000 cursor-pointer translate-x-[12%]">
              <img src={galeriaReal[(imgActiva + 1) % galeriaReal.length]} className="w-full h-full object-cover" alt="Next" />
            </div>
          </div>
        </div>
      </section>

      {/* --- EL RESTO DEL CONTENIDO (IGUAL QUE ANTES) --- */}
      <div className="max-w-[1400px] mx-auto px-6">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-8 space-y-20">
               <section className="space-y-10">
                  <h2 className="text-2xl font-black uppercase text-[var(--color-texto)] tracking-[0.1em] italic">Detalles del Servicio</h2>
                  <p className="text-lg text-[var(--color-texto-suave)] font-medium leading-relaxed max-w-4xl italic">
                     {p.desc || "Ofrecemos servicios de alta gama para capturar momentos únicos."}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-16 gap-y-10 py-10 border-t border-[var(--color-borde-suave)]">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-acento)]/10 flex items-center justify-center text-[var(--color-acento)] shadow-sm"><Clock size={24} /></div>
                        <div><p className="text-[10px] font-black text-[var(--color-texto-muted)] uppercase tracking-widest leading-none mb-1">Respuesta</p><p className="text-base font-black text-[var(--color-texto)] italic">{"< 2 hrs"}</p></div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-acento)]/10 flex items-center justify-center text-[var(--color-acento)] shadow-sm"><MapPin size={24} /></div>
                        <div><p className="text-[10px] font-black text-[var(--color-texto-muted)] uppercase tracking-widest leading-none mb-1">Ubicación</p><p className="text-base font-black text-[var(--color-texto)] italic">{p.ciudad}</p></div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-acento)]/10 flex items-center justify-center text-[var(--color-acento)] shadow-sm"><CheckCircle size={24} /></div>
                        <div><p className="text-[10px] font-black text-[var(--color-texto-muted)] uppercase tracking-widest leading-none mb-1">Status</p><p className="text-base font-black text-[var(--color-texto)] italic">Verificado</p></div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-acento)]/10 flex items-center justify-center text-[var(--color-acento)] shadow-sm"><ShoppingBag size={24} /></div>
                        <div><p className="text-[10px] font-black text-[var(--color-texto-muted)] uppercase tracking-widest leading-none mb-1">Categoría</p><p className="text-base font-black text-[var(--color-texto)] italic">{p.categoria}</p></div>
                     </div>
                  </div>
               </section>

               <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pt-4">
                  <div className="md:col-span-8 space-y-8">
                     <h2 className="text-2xl font-black uppercase text-[var(--color-texto)] tracking-[0.1em] italic">Portafolio</h2>
                     <div className="columns-2 gap-6 space-y-6">
                        {p.portafolio?.map((item: any) => (
                           <div key={item.id} className="rounded-[2.5rem] overflow-hidden border border-[var(--color-borde-suave)] shadow-xl transition-all hover:-translate-y-1 bg-[var(--color-fondo-card)]">
                              <img src={item.url} className="w-full h-auto" alt="Work" />
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="md:col-span-4 space-y-8">
                     <h2 className="text-2xl font-black uppercase text-[var(--color-texto)] tracking-[0.1em] italic">Mapa</h2>
                     <div className="rounded-[3rem] overflow-hidden border-2 border-[var(--color-borde-suave)] h-[400px] relative shadow-2xl">
                        {p.latitud && p.longitud ? <GooglePublicMap lat={p.latitud} lng={p.longitud} businessName={p.nombre} /> : null}
                     </div>
                  </div>
               </div>
            </div>

            <aside className="lg:col-span-4 lg:sticky lg:top-[120px] space-y-16">
               <div className="flex flex-col gap-6">
                  <h2 className="text-sm font-black uppercase text-[var(--color-texto-muted)] tracking-[0.2em] italic px-2">Reserva</h2>
                  <div className="bg-[var(--color-fondo-card)] rounded-[3rem] p-10 space-y-10 shadow-3xl border border-[var(--color-borde-suave)] relative overflow-hidden group">
                     <div className="relative space-y-2 text-center">
                        <p className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest">Precio</p>
                        <h3 className="text-4xl font-black text-[var(--color-texto)] italic">{formatearMoneda(selectedService?.precio || 0)}</h3>
                     </div>
                     <div className="relative space-y-4">
                        {p.servicios.map((s: any) => (
                           <button key={s.id} onClick={() => setSelectedServiceId(s.id)} className={cn("w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all", selectedServiceId === s.id ? "bg-[var(--color-texto)] border-[var(--color-texto)] text-[var(--color-fondo)]" : "bg-[var(--color-fondo)] border-transparent text-[var(--color-texto)]")}>
                              <span className="text-xs font-black uppercase italic">{s.nombre}</span>
                              <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", selectedServiceId === s.id ? "border-[var(--color-acento)] bg-[var(--color-acento)]" : "border-[var(--color-borde)]")}>{selectedServiceId === s.id && <Check size={14} className="text-white" />}</div>
                           </button>
                        ))}
                     </div>
                     <button onClick={() => setConfirmarReserva(true)} className="w-full py-6 rounded-[2rem] bg-emerald-500 text-white font-black uppercase text-sm italic shadow-lg hover:scale-[1.02] transition-all">Apartar Ahora</button>
                  </div>
               </div>

               <div className="flex flex-col items-center gap-8">
                  <div className="w-36 h-36 rounded-full border-8 border-[var(--color-fondo-card)] bg-white p-1 shadow-2xl cursor-zoom-in" onClick={() => setZoomLogo(true)}>
                     <img src={p.logoUrl || '/logo.png'} className="w-full h-full object-contain rounded-full" alt="Logo" />
                  </div>
                  <div className="text-center space-y-2">
                     <h4 className="text-3xl font-black uppercase italic text-[var(--color-texto)] leading-none">{p.nombre}</h4>
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500 text-white rounded-full shadow-lg font-black italic text-sm"><Star size={14} fill="white" />{p.calificacion}</div>
                  </div>
               </div>
            </aside>
         </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInPremium {
          0% { opacity: 0; transform: scale(1.05); filter: blur(5px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        .animate-fade-in-premium {
          animation: fadeInPremium 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes progress7 {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .animate-progress-7 {
          animation: progress7 linear forwards;
          animation-duration: 7000ms;
        }
      `}</style>

      {/* MODALES TRUNCADOS POR ESPACIO PERO MANTENIDOS EN LÓGICA */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-[501] bg-black/95 flex flex-col p-10">
           <X size={48} className="text-white/40 hover:text-white cursor-pointer self-end mb-10" onClick={() => setShowGalleryModal(false)} />
           <div className="flex-1 relative flex items-center justify-center">
              <ChevronLeft size={80} className="text-white/10 hover:text-white cursor-pointer absolute left-0" onClick={prevImg} />
              <img key={imgActiva} src={galeriaReal[imgActiva]} className="max-w-full max-h-full object-contain rounded-[4rem] animate-fade-in-premium" alt="Full" />
              <ChevronRight size={80} className="text-white/10 hover:text-white cursor-pointer absolute right-0" onClick={nextImg} />
           </div>
        </div>
      )}

      {mostrarCalendario && (
        <div className="fixed inset-0 z-[600] bg-black/90 flex items-center justify-center p-6">
           <div className="bg-[var(--color-fondo-card)] w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col">
              <header className="p-10 border-b border-[var(--color-borde-suave)] flex justify-between items-center">
                 <h2 className="text-2xl font-black italic uppercase text-[var(--color-texto)]">Agenda</h2>
                 <X size={32} className="cursor-pointer" onClick={() => setMostrarCalendario(false)} />
              </header>
              <div className="flex-1 p-8 overflow-auto">
                 <div className="h-[500px]">
                    <Calendar localizer={localizer} events={calendarEvents} culture="es" date={calendarDate} onNavigate={d => setCalendarDate(d)} messages={{next: "Sig.", previous: "Ant.", today: "Hoy", month: "Mes", week: "Semana", day: "Día", agenda: "Agenda"}} />
                 </div>
              </div>
           </div>
        </div>
      )}

      {confirmarReserva && <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-6"><div className="bg-white p-16 rounded-[4rem] text-center max-w-md"><h3 className="text-3xl font-black uppercase italic mb-8">¿Confirmar Reserva?</h3><div className="grid grid-cols-2 gap-4"><button disabled={solicitando} onClick={() => setConfirmarReserva(false)} className="py-4 bg-gray-100 rounded-2xl font-black uppercase italic">No</button><button disabled={solicitando} onClick={handleConfirmarBooking} className="py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase italic">Sí</button></div></div></div>}
      {reservado && <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"><div className="bg-white p-16 rounded-[4rem] text-center"><CheckCircle2 size={64} className="mx-auto text-emerald-500 mb-6" /><h3 className="text-3xl font-black uppercase italic">¡Solicitud Enviada!</h3><button onClick={() => setReservado(false)} className="mt-8 px-12 py-4 bg-black text-white rounded-2xl font-black uppercase italic">Aceptar</button></div></div>}
    </div>
  );
}
