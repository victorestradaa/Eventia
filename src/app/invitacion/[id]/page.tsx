'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  MessageCircle, 
  Users,
  Calendar,
  MapPin,
  Heart,
  PartyPopper,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInvitadoRSVPDetail, updateInvitadoRSVP } from '@/lib/actions/eventActions';
import InvitationCanvas from '@/components/cliente/invitaciones/InvitationCanvas';

export default function InvitacionPublica() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [invitado, setInvitado] = useState<any>(null);
  const [evento, setEvento] = useState<any>(null);
  const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [response, setResponse] = useState<string | null>(null);
  const [showRSVPModal, setShowRSVPModal] = useState(false);

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
        setShowRSVPModal(false);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-white">
        <Loader2 className="animate-spin text-[var(--color-primario)] mb-4" size={48} />
        <p className="text-xs uppercase tracking-widest font-bold opacity-40">Cargando Invitación...</p>
      </div>
    );
  }

  if (status === 'ERROR' || !evento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-6 text-center text-white">
        <div className="space-y-4 max-w-xs">
          <XCircle size={64} className="mx-auto text-red-500 opacity-50" />
          <h1 className="text-2xl font-bold uppercase tracking-tighter italic">Invitación no válida</h1>
          <p className="text-white/40 text-sm">El enlace podría haber expirado o la invitación ya no está disponible.</p>
        </div>
      </div>
    );
  }

  if (status === 'SUCCESS') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-6 text-center text-white">
        <div className="max-w-md w-full animate-in zoom-in-95 duration-700">
          <div className="p-10 rounded-[48px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden shadow-2xl">
             {response === 'CONFIRMADO' ? (
                <>
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                  </div>
                  <h1 className="text-4xl font-black uppercase mb-4 italic tracking-tighter">¡Confirmado!</h1>
                  <p className="leading-relaxed text-white/60 text-sm italic">
                    Muchas gracias <span className="font-bold text-white uppercase">{invitado.nombre}</span>, hemos registrado tu asistencia para <span className="font-bold text-[var(--color-primario-claro)]">{evento.nombre}</span>.
                  </p>
                </>
             ) : (
                <>
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                     <XCircle size={48} className="text-white/30" />
                   </div>
                   <h1 className="text-4xl font-black uppercase mb-4 italic tracking-tighter text-white/40">Entendido</h1>
                   <p className="leading-relaxed text-white/40 text-sm italic">
                     Lamentamos que no puedas acompañarnos <span className="font-bold text-white/60 uppercase">{invitado.nombre}</span>. ¡Esperamos verte en la próxima!
                   </p>
                </>
             )}
             
             <div className="mt-10 pt-10 border-t border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-20">Eventia · 2026</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Parsear estilos de la invitación
  let estilos = {};
  try {
    estilos = JSON.parse(evento.invitacion?.colorTexto || "{}");
  } catch (e) {
    console.error("Error parsing estilos", e);
  }

  const texto = {
    titulo: evento.invitacion?.titulo || 'Invitación',
    nombres: evento.nombre || '',
    mensaje: evento.invitacion?.mensaje || '',
    vestimenta: evento.invitacion?.vestimenta || '',
    lugar: evento.invitacion?.lugarTexto || '',
    direccion: evento.invitacion?.direccion || '',
    regaloTipo: evento.invitacion?.regaloTipo || 'MESA',
    regaloMesaUrl: evento.invitacion?.regaloMesaUrl || '',
    regaloBanco: evento.invitacion?.regaloBanco || '',
    regaloClabe: evento.invitacion?.regaloClabe || ''
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-white/10 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-primario)]/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-acento)]/10 blur-[120px] rounded-full delay-1000 animate-pulse" />
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 py-12 lg:p-12">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Columna 1: Invitación Digital */}
          <div className="flex justify-center order-2 lg:order-1">
            <div className="relative group perspective-1000">
               <div className="absolute -inset-4 bg-gradient-to-br from-white/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
               <InvitationCanvas 
                estilos={estilos} 
                texto={texto} 
                fondoUrlActivo={evento.invitacion?.fondoUrl}
                evento={evento}
                modoPropia={evento.invitacion?.isInvitacionPropia}
                archivoAdjuntoPropio={evento.invitacion?.archivoAdjunto}
                onRSVPClick={() => setShowRSVPModal(true)}
               />
               
               {/* Floating Tip para móvil */}
               <div className="lg:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                  <ChevronDown className="text-white/20" />
               </div>
            </div>
          </div>

          {/* Columna 2: Bienvenida e Información */}
          <div className="space-y-10 order-1 lg:order-2 text-center lg:text-left">
            <div className="space-y-4">
               <p className="text-[var(--color-primario-claro)] font-black uppercase tracking-[0.4em] text-xs">Invitación Especial</p>
               <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] flex flex-col">
                  <span className="opacity-40">Hola,</span>
                  <span className="text-white drop-shadow-2xl">{invitado.nombre.split(' ')[0]}</span>
               </h1>
            </div>

            <p className="text-white/40 text-lg leading-relaxed max-w-md italic mx-auto lg:mx-0">
               "Es un honor para nosotros invitarte a compartir la alegría de este día tan esperado."
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[var(--color-primario)] transition-colors">
                     <Calendar className="text-[var(--color-primario-claro)]" />
                  </div>
                  <div>
                     <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Fecha y Hora</p>
                     <p className="font-bold">{evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Por confirmar'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[var(--color-acento)] transition-colors">
                     <MapPin className="text-[var(--color-acento-claro)]" />
                  </div>
                  <div>
                     <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Ubicación</p>
                     <p className="font-bold truncate max-w-[150px]">{texto.lugar || 'Sede del Evento'}</p>
                  </div>
               </div>
            </div>

            <div className="pt-8">
               <button 
                onClick={() => setShowRSVPModal(true)}
                className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full overflow-hidden hover:scale-105 transition-transform"
               >
                  <span className="relative z-10 flex items-center gap-3">
                    <Heart size={16} fill="black" /> Confirmar Asistencia
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-acento)] opacity-0 group-hover:opacity-100 transition-opacity" />
               </button>
            </div>
          </div>
        </div>
      </main>

      {/* RSVP Modal */}
      {showRSVPModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowRSVPModal(false)} />
           <div className="relative bg-[#0f0f12] border border-white/10 rounded-[40px] p-8 max-w-sm w-full shadow-3xl animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-4 mb-10">
                 <div className="w-16 h-16 bg-[var(--color-primario)]/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="text-[var(--color-primario-claro)]" />
                 </div>
                 <h2 className="text-2xl font-black uppercase italic italic tracking-tighter">¿Nos acompañas?</h2>
                 <p className="text-white/40 text-sm italic italic leading-relaxed">Confirma tu asistencia para ayudarnos a organizar mejor este día especial.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <button 
                  onClick={() => handleRSVP('CONFIRMADO')}
                  disabled={status === 'SAVING'}
                  className="w-full py-5 bg-[var(--color-primario)] text-white font-black uppercase tracking-widest text-xs rounded-3xl shadow-lg hover:shadow-[var(--color-primario)]/20 transition-all active:scale-95 disabled:opacity-50"
                 >
                    {status === 'SAVING' ? <Loader2 className="animate-spin mx-auto" /> : "Sí, asistiré"}
                 </button>
                 <button 
                  onClick={() => handleRSVP('RECHAZADO')}
                  disabled={status === 'SAVING'}
                  className="w-full py-5 bg-white/5 border border-white/10 text-white/50 font-black uppercase tracking-widest text-xs rounded-3xl hover:bg-white/10 transition-all active:scale-95 disabled:opacity-20"
                 >
                    No podré asistir
                 </button>
                 <button 
                  onClick={() => setShowRSVPModal(false)}
                  className="w-full py-2 text-[10px] uppercase font-bold text-white/20 hover:text-white/40 transition-colors"
                 >
                    Quizás más tarde
                 </button>
              </div>
           </div>
        </div>
      )}
      
      {/* RSVP Fixed Banner para móviles al final */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 z-40 lg:hidden pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
             <button 
              onClick={() => setShowRSVPModal(true)}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-tighter rounded-2xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
             >
                Confirmar RSVP
             </button>
          </div>
      </footer>
    </div>
  );
}
