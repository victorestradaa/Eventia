'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, Calendar, MapPin, Users } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">
        <Loader2 className="animate-spin text-violet-500" size={48} />
      </div>
    );
  }

  if (status === 'ERROR' || !evento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-6 text-center">
        <div className="space-y-4">
          <XCircle size={64} className="mx-auto text-red-500" />
          <h1 className="text-2xl font-bold italic uppercase tracking-tighter">Invitación no encontrada</h1>
          <p className="text-slate-400">El enlace podría estar vencido o ser incorrecto.</p>
        </div>
      </div>
    );
  }

  if (status === 'SUCCESS') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-6 text-center">
        <div className="max-w-md w-full space-y-8 animate-in zoom-in-95 duration-500">
          <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
             
             {response === 'CONFIRMADO' ? (
                <>
                  <CheckCircle2 size={80} className="mx-auto text-emerald-500 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                  <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4">¡Confirmado!</h1>
                  <p className="text-slate-300 leading-relaxed">
                    Muchas gracias <span className="text-white font-bold">{invitado.nombre}</span>, hemos registrado tu asistencia para <span className="text-[var(--color-primario-claro)] font-bold">{evento.nombre}</span>.
                  </p>
                  <p className="mt-4 text-sm text-slate-500 italic">¡Te esperamos pronto!</p>
                </>
             ) : (
                <>
                   <XCircle size={80} className="mx-auto text-slate-500 mb-6" />
                   <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Entendido</h1>
                   <p className="text-slate-300 leading-relaxed">
                     Lamentamos que no puedas acompañarnos <span className="text-white font-bold">{invitado.nombre}</span> en esta ocasión. Tu respuesta ha sido enviada.
                   </p>
                </>
             )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 blur-[120px] rounded-full" />

      <div className="max-w-md w-full space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Header / Invitation card */}
        <div className="text-center space-y-6">
           <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-2">
              Invitación Especial
           </div>
           <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
             {evento.nombre}
           </h1>
           <div className="h-0.5 w-24 mx-auto bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
        </div>

        <div className="p-10 rounded-[48px] bg-white/[0.03] border border-white/5 backdrop-blur-xl shadow-2xl space-y-10 relative group">
           <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.05] to-transparent rounded-[48px] pointer-events-none" />
           
           <div className="text-center space-y-4">
              <p className="text-slate-400 text-sm tracking-wide uppercase font-bold opacity-80">Hola,</p>
              <h2 className="text-3xl font-black text-white">{invitado.nombre}</h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-[280px] mx-auto">
                Nos encantaría contar con tu presencia en este momento tan especial.
              </p>
           </div>

           <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
              <div className="text-center space-y-1">
                 <Calendar size={20} className="mx-auto text-violet-400 mb-1" />
                 <p className="text-[10px] font-black uppercase text-slate-500">Fecha</p>
                 <p className="text-sm font-bold">{evento.fecha ? new Date(evento.fecha).toLocaleDateString() : 'Por confirmar'}</p>
              </div>
              <div className="text-center space-y-1">
                 <Users size={20} className="mx-auto text-violet-400 mb-1" />
                 <p className="text-[10px] font-black uppercase text-slate-500">Lugar</p>
                 <p className="text-sm font-bold truncate px-2">Sede del Evento</p>
              </div>
           </div>

           <div className="space-y-4 pt-4">
              <p className="text-[10px] font-black uppercase text-slate-500 text-center tracking-widest">¿Podrás acompañarnos?</p>
              
              <div className="grid grid-cols-1 gap-4">
                 <button 
                   onClick={() => handleRSVP('CONFIRMADO')}
                   disabled={status === 'SAVING'}
                   className={cn(
                     "relative overflow-hidden group/btn px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-xs transition-all duration-300",
                     "bg-emerald-500 text-emerald-950 shadow-[0_10px_40px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95",
                     status === 'SAVING' && "opacity-50 grayscale pointer-events-none"
                   )}
                 >
                    {status === 'SAVING' ? <Loader2 className="animate-spin mx-auto" /> : "Sí, asistiré"}
                 </button>

                 <button 
                   onClick={() => handleRSVP('RECHAZADO')}
                   disabled={status === 'SAVING'}
                   className={cn(
                     "px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-xs transition-all duration-300",
                     "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white",
                     status === 'SAVING' && "opacity-20 pointer-events-none"
                   )}
                 >
                    No podré asistir
                 </button>
              </div>
           </div>
        </div>

        <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em] opacity-50">
           Eventia · Gestión de Eventos
        </p>
      </div>
    </div>
  );
}
