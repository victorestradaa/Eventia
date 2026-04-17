'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Heart, 
  CheckCircle2, 
  XCircle,
  CalendarPlus,
  Loader2,
  Gift,
  ExternalLink,
  Shirt,
  GlassWater,
  Images,
  QrCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

interface PremiumInvitationViewProps {
  evento: any;
  invitado: any;
  status: 'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR';
  onRSVP: (estado: 'CONFIRMADO' | 'RECHAZADO') => void;
  isPreview?: boolean;
}

export default function PremiumInvitationView({ evento, invitado, status, onRSVP, isPreview = false }: PremiumInvitationViewProps) {
  const config = evento.invitacion?.configWeb || {};
  const tema = config.tema || 'dark';

  // --- STATE NAVEGACIÓN ---
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Countdown Logic
  const [timeLeft, setTimeLeft] = useState<{d:number, h:number, m:number, s:number} | null>(null);

  useEffect(() => {
    if (!config.fechaEventoExacta || !config.mostrarContador) return;

    const timer = setInterval(() => {
      const target = new Date(config.fechaEventoExacta).getTime();
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config.fechaEventoExacta, config.mostrarContador]);

  // Color map based on theme
  const themeStyles = {
    dark: {
      bg: 'bg-[#0a0a0b]',
      card: 'bg-zinc-900/50 border-zinc-800/50 backdrop-blur-xl',
      text: 'text-white',
      muted: 'text-zinc-500',
      accent: 'text-[var(--color-acento)]',
      btn: 'bg-[var(--color-acento)] text-white hover:shadow-[0_0_30px_rgba(189,155,101,0.3)]'
    },
    light: {
      bg: 'bg-[#faf9f6]',
      card: 'bg-white/80 border-stone-200 backdrop-blur-xl',
      text: 'text-stone-900',
      muted: 'text-stone-400',
      accent: 'text-[#d4a373]',
      btn: 'bg-[#d4a373] text-white hover:shadow-[0_0_30px_rgba(212,163,115,0.3)]'
    },
    minimal: {
      bg: 'bg-white',
      card: 'bg-white border-zinc-100',
      text: 'text-zinc-900',
      muted: 'text-zinc-400',
      accent: 'text-zinc-900',
      btn: 'bg-zinc-900 text-white hover:shadow-[0_0_30px_rgba(0,0,0,0.1)]'
    },
    gold: {
      bg: 'bg-[#050505]',
      card: 'bg-[#0a0a0a] border-[#bd9b65]/30 backdrop-blur-xl',
      text: 'text-[#bd9b65]',
      muted: 'text-[#bd9b65]/40',
      accent: 'text-[#bd9b65]',
      btn: 'bg-gradient-to-r from-[#bd9b65] to-[#f3e5ab] text-black hover:shadow-[0_0_40px_rgba(189,155,101,0.4)]'
    }
  }[tema as keyof typeof themeStyles] || themeStyles.dark;

  // --- LÓGICA DE NAVEGACIÓN ---
  const defaultModules = ['mostrarContador', 'mostrarCeremonia', 'mostrarCelebracion', 'mostrarDressCode', 'mostrarGaleria', 'mostrarMapa', 'mostrarRegalos', 'mostrarRSVP', 'mostrarAlbumQR'];
  const currentOrder = config.ordenModulos 
    ? [...config.ordenModulos, ...defaultModules.filter(m => !config.ordenModulos.includes(m))]
    : defaultModules;
    
  // Lista de secciones: Hero + Módulos activos
  const activeModules = currentOrder.filter(id => config[id]);
  const sections = ['hero', ...activeModules];

  const navigateTo = (index: number) => {
    if (index < 0 || index >= sections.length || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentPage(index);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 10) return;
      if (e.deltaY > 0) navigateTo(currentPage + 1);
      else navigateTo(currentPage - 1);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') navigateTo(currentPage + 1);
      else if (e.key === 'ArrowUp') navigateTo(currentPage - 1);
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, sections.length, isTransitioning]);

  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.targetTouches[0].clientY;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) navigateTo(currentPage + 1);
      else navigateTo(currentPage - 1);
      setTouchStart(null);
    }
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(evento.nombre);
    const date = new Date(config.fechaEventoExacta || evento.fecha).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${date}&details=Invitación via Eventia`;
    window.open(url, '_blank');
  };

  // --- RENDERIZADO POR MÓDULOS ---
  const renderModulo = (id: string) => {
    switch(id) {
      case 'hero':
        return (
          <section className="relative w-full h-full flex items-center justify-center overflow-hidden">
             <div 
               className="absolute inset-0 z-0 scale-110"
               style={{ 
                 backgroundImage: `url(${config.coverUrl || evento.invitacion?.fondoUrl})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundAttachment: 'fixed'
               }}
             >
                <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
             </div>

             <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-6 animate-in fade-in duration-1000">
                <div className="space-y-4 max-w-2xl">
                   <p className={cn("text-xs font-black uppercase tracking-[0.5em] mb-4 opacity-70", themeStyles.accent)}>
                      Estás cordialmente invitado
                   </p>
                    <h1 className={cn(
                      "font-black italic uppercase tracking-tighter leading-[1.1] drop-shadow-2xl",
                      isPreview ? "text-[12cqi]" : "text-[clamp(2.5rem,14vw,6rem)]"
                    )}>
                      {evento.nombre}
                   </h1>
                   <div className="h-1 text-center w-24 bg-current mx-auto opacity-20" />
                   <p className={cn(
                     "font-medium tracking-wide opacity-80 backdrop-blur-sm bg-black/10 inline-block px-4 py-2 rounded-full",
                     isPreview ? "text-[3cqi]" : "text-lg md:text-xl"
                   )}>
                      {evento.fecha ? (
                        (() => {
                          const date = new Date(evento.fecha);
                          // Bypass UTC shift by adding offset or using UTC methods
                          return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
                        })()
                      ) : 'Próximamente'}
                   </p>
                </div>
             </div>
          </section>
        );

      case 'mostrarCeremonia':
        const fechaCer = config.ceremoniaFecha ? new Date(config.ceremoniaFecha) : (evento.fecha ? new Date(evento.fecha) : null);
        const nombreLugar = config.ceremoniaNombre || evento.invitacion?.lugarTexto || 'Lugar por asignar';
        const bgColor = config.ceremoniaBgColor || '#fafafa';
        const textColor = config.ceremoniaTextColor || '#8b7355';
        
        return (
          <div className="w-[min(96cqi,500px)] mx-auto px-4 py-8 flex flex-col items-center justify-center h-full">
            <section className={cn("card-premium p-8 md:p-12 rounded-[2.5rem] border text-center flex flex-col items-center bg-zinc-900/20 border-dashed border-zinc-700 w-full space-y-8", themeStyles.card)}>
                 <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full border-2 border-[#bd9b65]/20 p-1 mx-auto">
                      <div className="w-full h-full bg-[#bd9b65]/10 rounded-full flex items-center justify-center">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full border-2 border-[#bd9b65] absolute -left-3 top-0 rotate-12" />
                          <div className="w-8 h-8 rounded-full border-2 border-[#bd9b65] absolute -left-1 top-1 -rotate-12" />
                        </div>
                      </div>
                    </div>
                    <h2 className="font-black italic tracking-tighter uppercase text-[#bd9b65] text-[8cqi]">Ceremonia</h2>
                 </div>

                 <div className="space-y-4 w-full flex flex-col items-center">
                    <div className="space-y-1 w-full flex flex-col items-center">
                      <p 
                        style={{ textAlign: 'center' }}
                        className="text-[3cqi] font-black uppercase tracking-[0.4em] opacity-40 text-center !text-center"
                      >
                         {fechaCer ? (
                           new Date(fechaCer.getTime() + fechaCer.getTimezoneOffset() * 60000).toLocaleDateString('es-MX', { month: 'long' }).toUpperCase()
                         ) : 'MES'}
                      </p>
                      <div className="flex items-center justify-center gap-4 w-full">
                         <div className="flex-1 h-[1px] bg-[#bd9b65]/20" />
                         <div className="flex items-center gap-4">
                            <span className="text-[3cqi] font-black uppercase tracking-widest leading-none opacity-40">
                              {fechaCer ? (
                                new Date(fechaCer.getTime() + fechaCer.getTimezoneOffset() * 60000).toLocaleDateString('es-MX', { weekday: 'long' }).toUpperCase()
                              ) : 'SÁBADO'}
                            </span>
                            <span className="font-black leading-none text-[12cqi] text-[#bd9b65]">
                              {fechaCer ? (
                                new Date(fechaCer.getTime() + fechaCer.getTimezoneOffset() * 60000).getDate()
                              ) : '27'}
                            </span>
                            <span className="text-[3cqi] font-black uppercase tracking-widest leading-none opacity-40">
                              {fechaCer ? (
                                 fechaCer.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true })
                              ) : '5:00 P.M.'}
                            </span>
                         </div>
                         <div className="flex-1 h-[1px] bg-[#bd9b65]/20" />
                      </div>
                    </div>

                    <div className="space-y-4 w-full flex flex-col items-center text-center">
                       <p 
                         style={{ textAlign: 'center' }}
                         className="font-black italic leading-tight text-[6cqi] text-white !text-center w-full"
                       >
                          {nombreLugar}
                       </p>
                        {config.ceremoniaDireccion && (
                          <p 
                            style={{ textAlign: 'center' }}
                            className="text-[3cqi] font-bold uppercase tracking-widest opacity-60 w-full max-w-[90%] mx-auto leading-relaxed !text-center"
                          >
                            {config.ceremoniaDireccion}
                          </p>
                        )}
                    </div>

                     <a 
                       href={config.ceremoniaMapsUrl ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.ceremoniaDireccion)}` : '#'}
                       target="_blank"
                       style={{ backgroundColor: '#bd9b65', color: '#000' }}
                       className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[3.5cqi] shadow-xl hover:scale-105 active:scale-95 transition-all w-full justify-center"
                     >
                        ¿Cómo llegar?
                     </a>
                 </div>
            </section>
          </div>
        );

      case 'mostrarCelebracion':
        const fechaCel = config.celebracionFecha ? new Date(config.celebracionFecha) : (evento.fecha ? new Date(evento.fecha) : null);
        const nombreCel = config.celebracionNombre || evento.invitacion?.lugarTexto || 'Hacienda / Salón';
        
        return (
          <div className="w-[min(96cqi,500px)] mx-auto px-4 py-8 flex flex-col items-center justify-center h-full">
            <section className={cn("card-premium p-8 md:p-12 rounded-[2.5rem] border text-center flex flex-col items-center bg-zinc-900/20 border-dashed border-zinc-700 w-full space-y-8", themeStyles.card)}>
                 <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full border-2 border-[#bd9b65]/20 p-1 mx-auto">
                      <div className="w-full h-full bg-[#bd9b65]/10 rounded-full flex items-center justify-center">
                        <Calendar size={28} className="text-[#bd9b65]" />
                      </div>
                    </div>
                    <h2 className="font-black italic tracking-tighter uppercase text-[#bd9b65] text-[8cqi]">Recepción</h2>
                 </div>

                 <div className="space-y-4 w-full flex flex-col items-center">
                    <div className="space-y-1 w-full flex flex-col items-center">
                      <p className="text-[3cqi] font-black uppercase tracking-[0.4em] opacity-40 text-center">
                         {fechaCel ? (
                           new Date(fechaCel.getTime() + fechaCel.getTimezoneOffset() * 60000).toLocaleDateString('es-MX', { month: 'long' }).toUpperCase()
                         ) : 'MES'}
                      </p>
                      <div className="flex items-center justify-center gap-4 w-full">
                         <div className="flex-1 h-[1px] bg-[#bd9b65]/20" />
                         <div className="flex items-center gap-4">
                            <span className="text-[3cqi] font-black uppercase tracking-widest leading-none opacity-40">
                              {fechaCel ? (
                                new Date(fechaCel.getTime() + fechaCel.getTimezoneOffset() * 60000).toLocaleDateString('es-MX', { weekday: 'long' }).toUpperCase()
                              ) : 'SÁBADO'}
                            </span>
                            <span className="font-black leading-none text-[12cqi] text-[#bd9b65]">
                              {fechaCel ? (
                                new Date(fechaCel.getTime() + fechaCel.getTimezoneOffset() * 60000).getDate()
                              ) : '27'}
                            </span>
                            <span className="text-[3cqi] font-black uppercase tracking-widest leading-none opacity-40">
                              {fechaCel ? (
                                 fechaCel.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true })
                              ) : '8:00 P.M.'}
                            </span>
                         </div>
                         <div className="flex-1 h-[1px] bg-[#bd9b65]/20" />
                      </div>
                    </div>

                    <div className="space-y-4 w-full flex flex-col items-center text-center">
                       <p 
                         style={{ textAlign: 'center' }}
                         className="font-black italic leading-tight text-[6cqi] text-white !text-center w-full"
                       >
                          {nombreCel}
                       </p>
                        {config.celebracionDireccion && (
                          <p 
                            style={{ textAlign: 'center' }}
                            className="text-[3cqi] font-bold uppercase tracking-widest opacity-60 w-full max-w-[90%] mx-auto leading-relaxed !text-center"
                          >
                            {config.celebracionDireccion}
                          </p>
                        )}
                    </div>

                     <a 
                       href={config.celebracionMapsUrl ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.celebracionDireccion)}` : '#'}
                       target="_blank"
                       style={{ backgroundColor: '#bd9b65', color: '#000' }}
                       className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[3.5cqi] shadow-xl hover:scale-105 active:scale-95 transition-all w-full justify-center"
                     >
                        ¿Cómo llegar?
                     </a>
                 </div>
            </section>
          </div>
        );

      case 'mostrarDressCode':
        return (
          <div className="w-[min(96cqi,650px)] mx-auto px-2 py-8 flex flex-col items-center justify-center h-full">
            <section className={cn("card-premium px-8 py-12 rounded-[2.5rem] border text-center space-y-6 w-full shadow-2xl", themeStyles.card)}>
                <div className="w-16 h-16 bg-[var(--color-acento)]/10 rounded-full flex items-center justify-center mx-auto">
                    <Shirt size={28} className={themeStyles.accent} />
                </div>
                 <div className="space-y-4 w-full flex flex-col items-center text-center">
                      <h2 className="font-black uppercase italic tracking-tighter text-[var(--color-acento)] text-[8cqi]">Código de Vestimenta</h2>
                     <p 
                       style={{ color: '#ffffff', textAlign: 'center' }}
                       className="font-black italic text-[6cqi] !text-white !text-center w-full"
                     >
                       {config.dressCodeTexto || evento.invitacion?.vestimenta || 'Formal / Gala'}
                     </p>
                 </div>
            </section>
          </div>
        );

      case 'mostrarGaleria':
        const fotosArr = config.galeriaFotos || [];
        if (fotosArr.length === 0) return null;
        
        return (
          <div className="w-full h-full flex flex-col items-center justify-center py-12">
            <section className="space-y-8">
               <div className="flex items-center justify-between px-8 w-[min(90vw,600px)] mx-auto">
                  <h2 className="font-black uppercase italic tracking-tighter text-[8cqi]">Nuestra Galería</h2>
                  <Images size={20} className="opacity-20" />
               </div>
               
               <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-8 pb-4">
                  {fotosArr.map((foto: string, idx: number) => (
                    <div key={idx} className="flex-none w-[80%] aspect-[3/4] rounded-[2.5rem] overflow-hidden snap-center shadow-2xl border border-white/10">
                       <img src={foto} className="w-full h-full object-cover" />
                    </div>
                  ))}
               </div>
               <p className="text-[3cqi] font-black uppercase tracking-widest opacity-20 text-center">Desliza para ver más</p>
            </section>
          </div>
        );

      case 'mostrarContador':
        if (!timeLeft) return null;
        return (
          <div className="w-[min(96cqi,800px)] mx-auto px-2 py-8 flex flex-col items-center justify-center h-full">
            <section className="text-center animate-in slide-in-from-bottom-8 duration-700 space-y-12">
               <div className="space-y-4">
                  <h2 className="font-black uppercase italic tracking-tighter text-[8cqi]">Cuenta Regresiva</h2>
                  <p className="font-bold uppercase tracking-widest opacity-60 text-[3cqi]">Solo falta un poco para encontrarnos</p>
               </div>
               <div className="grid grid-cols-4 gap-2">
                  {Object.entries(timeLeft).map(([key, value]) => (
                    <div key={key} className={cn("card-premium border transition-all hover:scale-105 flex flex-col items-center justify-center py-4 px-1 rounded-xl", themeStyles.card)}>
                       <span className="font-black tabular-nums block mb-1 text-[10cqi]">{value.toString().padStart(2, '0')}</span>
                       <span className={cn("text-[clamp(6px,2vw,10px)] font-black uppercase tracking-widest opacity-40")}>
                          {key === 'd' ? 'Días' : key === 'h' ? 'Horas' : key === 'm' ? 'Minutos' : 'Segs'}
                       </span>
                    </div>
                  ))}
               </div>
            </section>
          </div>
        );

      case 'mostrarMapa':
        return (
          <div className="w-[min(96cqi,800px)] mx-auto px-2 py-8 flex flex-col items-center justify-center h-full">
            <section className="grid lg:grid-cols-2 gap-8 items-center w-full">
               <div className="space-y-8 flex flex-col items-center">
                  <div className="space-y-4 text-center">
                     <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto", themeStyles.card)}>
                        <MapPin size={32} className={themeStyles.accent} />
                     </div>
                     <h2 className="font-black uppercase italic tracking-tighter text-[8cqi]">Ubicación</h2>
                     <p className="opacity-60 leading-relaxed max-w-sm mx-auto text-[3.5cqi]">
                        Nos encantaría que nos acompañes en este lugar tan especial para nosotros.
                     </p>
                  </div>
                  
                  <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                     <button 
                       onClick={handleAddToCalendar}
                       className={cn("btn gap-3 py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 text-[3cqi]", themeStyles.btn)}
                     >
                        <CalendarPlus size={18} /> Agregar al Calendario
                     </button>
                     <a 
                       href={config.direccion 
                         ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.direccion)}` 
                         : evento.invitacion?.direccion 
                           ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evento.invitacion.direccion)}` 
                           : '#'} 
                       target="_blank"
                       className={cn("btn bg-white/5 border border-white/10 gap-3 py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all text-center flex items-center justify-center text-[3cqi]", themeStyles.text)}
                     >
                        Ver en Google Maps <ExternalLink size={14} />
                     </a>
                  </div>
               </div>

               <div className={cn("aspect-square md:aspect-video rounded-[2.5rem] overflow-hidden border shadow-2xl w-full", themeStyles.card)}>
                  {config.mapsUrl ? (
                    <iframe 
                      src={config.mapsUrl}
                      className="w-full h-full grayscale-[0.2] contrast-[1.1]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-center p-12">
                       <MapPin size={48} className="text-white/10 mb-4 mx-auto" />
                       <p className="text-xs font-bold uppercase opacity-20 tracking-widest">Mapa no configurado</p>
                    </div>
                  )}
               </div>
            </section>
          </div>
        );

      case 'mostrarRegalos':
        return (
          <div className="w-[min(96cqi,650px)] mx-auto px-2 py-8 flex flex-col items-center justify-center h-full">
            <section className={cn("card-premium p-10 rounded-[2.5rem] border text-center space-y-8", themeStyles.card)}>
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <Gift size={28} className="text-emerald-400" />
                </div>
                <div className="space-y-4 w-full flex flex-col items-center text-center">
                    <h2 className="font-black uppercase italic tracking-tighter text-[8cqi]">Mesa de Regalos</h2>
                    <p 
                      style={{ textAlign: 'center' }}
                      className="opacity-60 leading-relaxed max-w-sm mx-auto text-[3.5cqi] !text-center"
                    >
                      Su presencia es el mejor regalo, pero si desean obsequiarnos algo, aquí tienen nuestras sugerencias.
                    </p>
                 <div className="grid grid-cols-1 gap-4 w-full">
                    {config.regaloTipo === 'MESA' ? (
                      <a 
                        href={config.regaloMesaUrl} 
                        target="_blank"
                        className={cn("px-10 py-6 rounded-2xl bg-white/5 border border-white/10 font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-center text-[3.5cqi]", themeStyles.text)}
                      >
                        Ver Mesa de Regalos
                      </a>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 w-full">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(config.regaloBanco);
                            alert('Banco copiado: ' + config.regaloBanco);
                          }}
                          className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center hover:bg-white/10 transition-all active:scale-95 group relative"
                        >
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-40 transition-opacity">
                              <ExternalLink size={14} />
                            </div>
                            <p className="font-black uppercase opacity-40 mb-2 text-[2.5cqi]">Banco</p>
                            <p className="font-black uppercase tracking-widest text-[5cqi]">{config.regaloBanco}</p>
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(config.regaloClabe);
                            alert('CLABE copiada: ' + config.regaloClabe);
                          }}
                          className="bg-white/5 p-8 rounded-2xl border border-white/10 flex flex-col items-center hover:bg-white/10 transition-all active:scale-95 group relative"
                        >
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-40 transition-opacity">
                              <ExternalLink size={14} />
                            </div>
                            <p className="font-black uppercase opacity-40 mb-2 text-[2.5cqi]">CLABE Interbancaria</p>
                            <p className="font-black tracking-[0.1em] text-[5cqi] break-all max-w-[280px]">{config.regaloClabe}</p>
                        </button>
                      </div>
                    )}
                </div>
                </div>
            </section>
          </div>
        );

      case 'mostrarRSVP':
        return (
          <div className="w-full mx-auto px-4 py-8 flex flex-col items-center justify-center h-full">
            <section className="w-full max-w-[550px] flex flex-col items-center text-center space-y-10">
               <div className="space-y-6 w-full flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-[var(--color-acento)]/20 p-2 mx-auto">
                     <div className="w-full h-full bg-gradient-to-br from-[var(--color-acento)] to-[var(--color-acento-claro)] rounded-full flex items-center justify-center shadow-xl">
                        <Heart size={28} className="text-white" fill="white" />
                     </div>
                  </div>
                  <h2 className="font-black uppercase italic tracking-tighter text-[8cqi] w-full text-center">¿Nos acompañas?</h2>
                   <p 
                     style={{ textAlign: 'center' }}
                     className="font-black uppercase tracking-widest opacity-60 w-full max-w-[90%] mx-auto text-[4.5cqi] !text-center leading-relaxed"
                   >
                     Hola <span className="text-[var(--color-acento)]" style={{ textAlign: 'center' }}>{invitado?.nombre}</span>, confirma tu asistencia para ayudarnos a organizar este día.
                  </p>
                <div className="flex flex-row justify-center gap-4 w-full max-w-[500px] mx-auto px-4">
                  <button
                    onClick={() => onRSVP('CONFIRMADO')}
                    disabled={status === 'SAVING'}
                    className={cn(
                      'flex-1 py-16 rounded-3xl font-black uppercase tracking-[0.15em] transition-all active:scale-95 shadow-2xl flex flex-col items-center justify-center gap-3',
                      'bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-50 text-[6cqi]'
                    )}
                  >
                    {status === 'SAVING' ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={48} /> Acepto</>}
                  </button>

                  <button
                    onClick={() => onRSVP('RECHAZADO')}
                    disabled={status === 'SAVING'}
                    className={cn(
                      'flex-1 py-16 rounded-3xl font-black uppercase tracking-[0.15em] transition-all active:scale-95 flex flex-col items-center justify-center gap-3',
                      'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60 disabled:opacity-20 text-[6cqi]'
                    )}
                  >
                    {status === 'SAVING' ? <Loader2 className="animate-spin" /> : <><XCircle size={48} /> No podré</>}
                  </button>
               </div>
               </div>
            </section>
          </div>
        );

      case 'mostrarAlbumQR':
        const album = evento.album;
        const albumUrl = typeof window !== 'undefined' 
          ? `${window.location.origin}/album/${album?.slug || ''}`
          : '';

        return (
          <div className="w-[min(96cqi,500px)] mx-auto px-4 py-8 flex flex-col items-center justify-center h-full">
            <section className={cn("card-premium p-8 md:p-12 rounded-[2.5rem] border text-center flex flex-col items-center bg-zinc-900/20 border-dashed border-zinc-700", themeStyles.card, "space-y-12")}>
                 <div className="space-y-4 w-full flex flex-col items-center text-center">
                    <h2 className="font-black uppercase italic tracking-tighter text-[8cqi]">Álbum Compartido</h2>
                    <p 
                      style={{ textAlign: 'center' }}
                      className="opacity-60 leading-relaxed w-full max-w-[90%] mx-auto text-[4.5cqi] !text-center"
                    >
                      Escanea este código para subir tus fotos y videos de nuestro gran día.
                    </p>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-2xl flex items-center justify-center w-[50cqi] h-[50cqi]">
                    {album ? (
                      <QRCodeSVG 
                        value={albumUrl}
                        size={256}
                        style={{ width: '100%', height: '100%' }}
                        level="H"
                        includeMargin={false}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-zinc-400">
                         <QrCode size={40} className="opacity-20" />
                         <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Álbum no configurado</span>
                      </div>
                    )}
                </div>

                <div className="inline-block px-6 py-3 rounded-full border border-[var(--color-acento)]/20 bg-[var(--color-acento)]/5 mt-4">
                   <span className={cn("font-black uppercase tracking-[0.3em] text-[var(--color-acento)] text-[3cqi]")}>
                      ¡Comparte tus capturas!
                   </span>
                </div>
            </section>
          </div>
        );
      
      default: return null;
    }
  };

  return (
    <div 
      className={cn(
        "h-screen w-full selection:bg-[var(--color-acento)]/30 overflow-hidden relative", 
        themeStyles.bg, 
        themeStyles.text
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
       <style dangerouslySetInnerHTML={{ __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .font-title { font-family: 'Playfair Display', serif; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
       `}} />
       
       <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,900;1,400;1,900&display=swap" rel="stylesheet" />

       {/* --- FONDO GLOBAL TENUE --- */}
       <div 
         className="fixed inset-0 z-0 opacity-[0.16] blur-[2px] pointer-events-none transition-opacity duration-1000"
         style={{ 
           backgroundImage: `url(${config.coverUrl || evento.invitacion?.fondoUrl})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
         }}
       />

       {/* --- NAVEGACIÓN POR CAPAS (DESVANECIDO) --- */}
       <div className="relative w-full h-full z-10">
          {sections.map((sectionId, idx) => (
            <div 
              key={sectionId}
              className={cn(
                "absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out flex flex-col items-center justify-center",
                currentPage === idx 
                  ? "opacity-100 z-10 scale-100 translate-y-0" 
                  : "opacity-0 z-0 scale-95 pointer-events-none"
              )}
            >
               {renderModulo(sectionId)}
               
               {/* --- INDICADOR DESLIZA GLOBAL --- */}
               {idx < sections.length - 1 && (
                 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
                    <p className="text-[10px] font-black uppercase tracking-widest">Desliza</p>
                    <div className="w-px h-8 bg-current" />
                 </div>
               )}
            </div>
          ))}
       </div>

       {/* --- INDICADORES LATERALES (DOTS) --- */}
       <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
          {sections.map((_, idx) => (
            <button
              key={idx}
              onClick={() => navigateTo(idx)}
              className={cn(
                "w-1.5 transition-all duration-500 rounded-full",
                currentPage === idx 
                  ? "h-8 bg-[var(--color-acento)] shadow-[0_0_10px_var(--color-acento)]" 
                  : "h-2 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
       </div>

       {/* --- FOOTER (FIJO O EN LA ÚLTIMA PÁGINA) --- */}
       <div className={cn(
         "fixed bottom-4 left-0 w-full text-center transition-opacity duration-500 z-40",
         currentPage === sections.length - 1 ? "opacity-20" : "opacity-0"
       )}>
          <p className="text-[8px] font-black uppercase tracking-[0.5em]">Eventia · 2026</p>
       </div>
    </div>
  );
}
