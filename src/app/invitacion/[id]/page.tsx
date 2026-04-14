'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Heart,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInvitadoRSVPDetail, updateInvitadoRSVP } from '@/lib/actions/eventActions';
import InvitationCanvas from '@/components/cliente/invitaciones/InvitationCanvas';

type View = 'INVITATION' | 'RSVP';

export default function InvitacionPublica() {
  const params = useParams();
  const id = params.id as string;
  const rsvpRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [invitado, setInvitado] = useState<any>(null);
  const [evento, setEvento] = useState<any>(null);
  const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [response, setResponse] = useState<string | null>(null);
  const [view, setView] = useState<View>('INVITATION');

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

  const handleOpenRSVP = () => {
    setView('RSVP');
    setTimeout(() => {
      rsvpRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

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

  // ── Estados de carga / error / éxito ──────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-white">
        <Loader2 className="animate-spin text-[var(--color-acento)] mb-4" size={48} />
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
        <div className="max-w-xs w-full animate-in zoom-in-95 duration-700 space-y-6">
          {response === 'CONFIRMADO' ? (
            <>
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={56} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-3">¡Confirmado!</h1>
                <p className="text-white/50 text-sm leading-relaxed">
                  Muchas gracias <span className="font-bold text-white uppercase">{invitado.nombre}</span>, hemos registrado tu asistencia. ¡Te esperamos!
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <XCircle size={56} className="text-white/30" />
              </div>
              <div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white/40 mb-3">Entendido</h1>
                <p className="text-white/30 text-sm leading-relaxed">
                  Lamentamos que no puedas acompañarnos <span className="font-bold text-white/50 uppercase">{invitado.nombre}</span>. ¡Esperamos verte en la próxima!
                </p>
              </div>
            </>
          )}
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-20 pt-6">Eventia · 2026</p>
        </div>
      </div>
    );
  }

  // ── Parsear estilos ────────────────────────────────────────────────────────

  let estilos: any = {};
  try {
    estilos = JSON.parse(evento.invitacion?.colorTexto || "{}");
  } catch (e) {}

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
    <div className="bg-[#050508] text-white min-h-screen overflow-x-hidden">

      {/* ── Vista de la Invitación ── */}
      <section className="min-h-screen flex flex-col items-center justify-center relative py-8 px-4">

        {/* Fondo decorativo suave */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-[var(--color-acento)]/5 blur-[160px] rounded-full" />
          <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-[var(--color-primario)]/10 blur-[160px] rounded-full" />
        </div>

        {/* Saludo pequeño y elegante encima */}
        {!view.startsWith('RSVP') && (
          <div className="relative z-10 mb-6 text-center animate-in fade-in slide-in-from-top-4 duration-700">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--color-acento)] opacity-80 mb-1">Invitación Especial</p>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white/90">
              Hola, <span className="text-white">{invitado.nombre.split(' ')[0]}</span>
            </h1>
          </div>
        )}

        {/* Canvas en grande */}
        <div className="relative z-10 animate-in fade-in zoom-in-95 duration-700 delay-200 w-full flex justify-center">
          <div className="relative">
            {/* Resplandor detrás de la invitación */}
            <div className="absolute -inset-6 bg-gradient-radial from-white/5 to-transparent rounded-[60px] blur-xl" />
            <InvitationCanvas 
              estilos={estilos}
              texto={texto}
              fondoUrlActivo={evento.invitacion?.fondoUrl}
              evento={evento}
              modoPropia={evento.invitacion?.isInvitacionPropia}
              archivoAdjuntoPropio={evento.invitacion?.archivoAdjunto}
              onRSVPClick={handleOpenRSVP}
            />
          </div>
        </div>

        {/* Indicador de scroll suave (si el RSVP no está aún visible) */}
        {view === 'INVITATION' && (
          <div className="relative z-10 mt-8 animate-bounce opacity-40">
            <ChevronDown size={24} className="text-white" />
          </div>
        )}
      </section>

      {/* ── Vista RSVP (aparece al hacer clic en Confirmar) ── */}
      {view === 'RSVP' && (
        <section 
          ref={rsvpRef}
          className="min-h-screen flex items-center justify-center px-6 py-16 relative animate-in slide-in-from-bottom-8 duration-700"
        >
          <div className="w-full max-w-sm mx-auto">

            {/* Cabecera */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-[var(--color-acento)]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--color-acento)]/20 shadow-[0_0_40px_var(--color-acento)]/10">
                <Heart size={36} className="text-[var(--color-acento)]" fill="currentColor" />
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-3">¿Nos acompañas?</h2>
              <p className="text-white/40 text-sm leading-relaxed">
                Confirma tu asistencia para ayudarnos a organizar este día tan especial.
              </p>
            </div>

            {/* Botones RSVP */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleRSVP('CONFIRMADO')}
                disabled={status === 'SAVING'}
                className={cn(
                  "w-full py-6 rounded-3xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 shadow-2xl",
                  "bg-gradient-to-r from-[var(--color-acento)] to-[var(--color-acento-claro)] text-white",
                  "hover:shadow-[0_10px_40px_rgba(189,155,101,0.4)] hover:scale-[1.02]",
                  "disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                )}
              >
                {status === 'SAVING' ? (
                  <Loader2 className="animate-spin mx-auto" size={20} />
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <CheckCircle2 size={20} /> Sí, asistiré con gusto
                  </span>
                )}
              </button>

              <button
                onClick={() => handleRSVP('RECHAZADO')}
                disabled={status === 'SAVING'}
                className={cn(
                  "w-full py-6 rounded-3xl font-black uppercase tracking-widest text-sm transition-all active:scale-95",
                  "bg-white/5 border border-white/10 text-white/50",
                  "hover:bg-white/10 hover:text-white/70",
                  "disabled:opacity-20"
                )}
              >
                No podré asistir
              </button>

              <button
                onClick={() => setView('INVITATION')}
                className="w-full py-3 text-[11px] uppercase font-bold text-white/20 hover:text-white/40 transition-colors tracking-widest"
              >
                ← Volver a la invitación
              </button>
            </div>

            <p className="text-center text-[10px] font-bold uppercase tracking-[0.5em] opacity-15 mt-12">
              Eventia · 2026
            </p>
          </div>
        </section>
      )}

    </div>
  );
}
