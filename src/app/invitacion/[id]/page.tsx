'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, Calendar, MapPin, Users, Heart, Star, Sparkles, Gift, Baby, GraduationCap, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInvitadoRSVPDetail, updateInvitadoRSVP } from '@/lib/actions/eventActions';

export default function InvitacionPublica() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [invitado, setInvitado] = useState<any>(null);
  const [evento, setEvento] = useState<any>(null);
  const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [response, setResponse] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const res = await getInvitadoRSVPDetail(id);
        if (res.success) {
          setInvitado(res.invitado);
          setEvento(res.evento);
        } else {
          setStatus('ERROR');
        }
      } catch (err) {
        setStatus('ERROR');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleRSVP = async (estado: 'CONFIRMADO' | 'RECHAZADO') => {
    setStatus('SAVING');
    try {
      const res = await updateInvitadoRSVP(id, estado);
      if (res.success) {
        setStatus('SUCCESS');
        setResponse(estado);
      } else {
        alert("Ocurrió un error al guardar tu respuesta.");
        setStatus('IDLE');
      }
    } catch (err) {
      alert("Error de conexión.");
      setStatus('IDLE');
    }
  };

  // Configuración de temas
  const getTheme = (plantilla: string) => {
    switch (plantilla) {
      case 'BODA':
        return {
          bg: 'bg-[#faf9f6]',
          card: 'bg-white border-[#C5A059]/20 shadow-[0_20px_50px_rgba(197,160,89,0.1)]',
          accent: 'text-[#C5A059]',
          btnPrimary: 'bg-[#C5A059] text-white hover:bg-[#A68648]',
          textMain: 'text-[#2c2c2c]',
          textMuted: 'text-[#5c5c5c]',
          icon: <Heart size={40} className="text-[#C5A059] mx-auto mb-4" />,
          decor: <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />,
          font: 'font-serif'
        };
      case 'XV_ANOS':
        return {
          bg: 'bg-[#fff5f8]',
          card: 'bg-white border-pink-200 shadow-[0_20px_50px_rgba(236,72,153,0.1)]',
          accent: 'text-pink-500',
          btnPrimary: 'bg-pink-500 text-white hover:bg-pink-600',
          textMain: 'text-[#333]',
          textMuted: 'text-[#666]',
          icon: <Sparkles size={40} className="text-pink-400 mx-auto mb-4" />,
          decor: <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300" />
        };
      case 'INFANTIL':
        return {
          bg: 'bg-[#f0f9ff]',
          card: 'bg-white border-blue-200 rounded-[3rem] shadow-xl',
          accent: 'text-blue-500',
          btnPrimary: 'bg-yellow-400 text-blue-900 hover:bg-yellow-500 font-black rounded-full',
          textMain: 'text-blue-900',
          textMuted: 'text-blue-700/60',
          icon: <Gift size={40} className="text-blue-400 mx-auto mb-4" />
        };
      case 'GRADUACION':
        return {
          bg: 'bg-[#0f172a]',
          card: 'bg-slate-900 border-yellow-500/30 shadow-2xl',
          accent: 'text-yellow-500',
          btnPrimary: 'bg-yellow-600 text-white hover:bg-yellow-700',
          textMain: 'text-white',
          textMuted: 'text-slate-400',
          icon: <GraduationCap size={40} className="text-yellow-500 mx-auto mb-4" />
        };
       case 'BAUTIZO':
        return {
          bg: 'bg-[#f8fafc]',
          card: 'bg-white border-blue-100 shadow-md rounded-[2rem]',
          accent: 'text-blue-300',
          btnPrimary: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
          textMain: 'text-slate-700',
          textMuted: 'text-slate-400',
          icon: <Baby size={40} className="text-blue-200 mx-auto mb-4" />
        };
      default: // FIESTA / GENERAL
        return {
          bg: 'bg-[#09090b]',
          card: 'bg-white/[0.03] border-white/5 backdrop-blur-xl shadow-2xl',
          accent: 'text-violet-400',
          btnPrimary: 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-[0_10px_40px_rgba(16,185,129,0.3)]',
          textMain: 'text-white',
          textMuted: 'text-slate-400',
          icon: <PartyPopper size={40} className="text-violet-400 mx-auto mb-1" />
        };
    }
  };

  const currentTheme = getTheme(evento?.invitacion?.plantilla || 'FIESTA');

  if (loading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", currentTheme.bg)}>
        <Loader2 className="animate-spin text-[var(--color-primario)]" size={48} />
      </div>
    );
  }

  if (status === 'ERROR' || !evento) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center p-6 text-center", currentTheme.bg, currentTheme.textMain)}>
        <div className="space-y-4">
          <XCircle size={64} className="mx-auto text-red-500" />
          <h1 className="text-2xl font-bold uppercase tracking-tighter">Invitación no encontrada</h1>
          <p className={currentTheme.textMuted}>El enlace podría estar vencido o ser incorrecto.</p>
        </div>
      </div>
    );
  }

  if (status === 'SUCCESS') {
    return (
      <div className={cn("min-h-screen flex items-center justify-center p-6 text-center", currentTheme.bg)}>
        <div className="max-w-md w-full animate-in zoom-in-95 duration-500">
          <div className={cn("p-8 rounded-[40px] border relative overflow-hidden", currentTheme.card)}>
             {response === 'CONFIRMADO' ? (
                <>
                  <CheckCircle2 size={80} className="mx-auto text-emerald-500 mb-6" />
                  <h1 className={cn("text-3xl font-black uppercase mb-4", currentTheme.textMain)}>¡Confirmado!</h1>
                  <p className={cn("leading-relaxed", currentTheme.textMuted)}>
                    Muchas gracias <span className={cn("font-bold", currentTheme.textMain)}>{invitado.nombre}</span>, hemos registrado tu asistencia para <span className={cn("font-bold", currentTheme.accent)}>{evento.nombre}</span>.
                  </p>
                </>
             ) : (
                <>
                   <XCircle size={80} className="mx-auto text-slate-500 mb-6" />
                   <h1 className={cn("text-3xl font-black uppercase mb-4", currentTheme.textMain)}>Entendido</h1>
                   <p className={cn("leading-relaxed", currentTheme.textMuted)}>
                     Lamentamos que no puedas acompañarnos <span className={cn("font-bold", currentTheme.textMain)}>{invitado.nombre}</span>.
                   </p>
                </>
             )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden", currentTheme.bg, currentTheme.font)}>
      {/* Decorative elements */}
      {currentTheme.decor}
      
      <div className="max-w-md w-full space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center space-y-4">
           {currentTheme.icon}
           <h1 className={cn("text-5xl font-black uppercase tracking-tighter leading-tight", currentTheme.textMain)}>
             {evento.nombre}
           </h1>
           <div className={cn("h-1 w-24 mx-auto rounded-full", currentTheme.accent.replace('text', 'bg'))} />
        </div>

        <div className={cn("p-10 rounded-[48px] border shadow-2xl space-y-8 relative", currentTheme.card)}>
           <div className="text-center space-y-2">
              <p className={cn("text-xs tracking-widest uppercase font-bold opacity-60", currentTheme.textMuted)}>Hola,</p>
              <h2 className={cn("text-3xl font-black", currentTheme.textMain)}>{invitado.nombre}</h2>
              <p className={cn("text-sm leading-relaxed max-w-[280px] mx-auto", currentTheme.textMuted)}>
                Nos encantaría contar con tu presencia en este momento tan especial.
              </p>
           </div>

           <div className="grid grid-cols-2 gap-4 py-8 border-y border-black/5 dark:border-white/5">
              <div className="text-center space-y-1">
                 <Calendar size={20} className={cn("mx-auto mb-1", currentTheme.accent)} />
                 <p className={cn("text-[10px] font-black uppercase opacity-40", currentTheme.textMuted)}>Fecha</p>
                 <p className={cn("text-sm font-bold", currentTheme.textMain)}>{evento.fecha ? new Date(evento.fecha).toLocaleDateString() : 'Por confirmar'}</p>
              </div>
              <div className="text-center space-y-1">
                 <Users size={20} className={cn("mx-auto mb-1", currentTheme.accent)} />
                 <p className={cn("text-[10px] font-black uppercase opacity-40", currentTheme.textMuted)}>Lugar</p>
                 <p className={cn("text-sm font-bold truncate px-2", currentTheme.textMain)}>Sede del Evento</p>
              </div>
           </div>

           <div className="space-y-4">
              <p className={cn("text-[10px] font-black uppercase text-center tracking-widest opacity-60", currentTheme.textMuted)}>¿Podrás acompañarnos?</p>
              
              <div className="flex flex-col gap-3">
                 <button 
                   onClick={() => handleRSVP('CONFIRMADO')}
                   disabled={status === 'SAVING'}
                   className={cn(
                     "px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-xs transition-all duration-300",
                     currentTheme.btnPrimary,
                     status === 'SAVING' && "opacity-50 pointer-events-none"
                   )}
                 >
                    {status === 'SAVING' ? <Loader2 className="animate-spin mx-auto" /> : "Sí, asistiré"}
                 </button>

                 <button 
                   onClick={() => handleRSVP('RECHAZADO')}
                   disabled={status === 'SAVING'}
                   className={cn(
                     "px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-xs transition-all duration-300",
                     "bg-black/5 text-slate-400 border border-black/10 hover:bg-black/10",
                     status === 'SAVING' && "opacity-20 pointer-events-none"
                   )}
                 >
                    No podré asistir
                 </button>
              </div>
           </div>
        </div>

        <p className={cn("text-center text-[10px] font-bold uppercase tracking-[0.4em] opacity-30", currentTheme.textMuted)}>
           Eventia · Gestión de Eventos
        </p>
      </div>
    </div>
  );
}
