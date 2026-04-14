'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInvitadoRSVPDetail, updateInvitadoRSVP } from '@/lib/actions/eventActions';
import InvitationCanvas from '@/components/cliente/invitaciones/InvitationCanvas';
import PremiumInvitationView from '@/components/cliente/invitaciones/PremiumInvitationView';

type View = 'INVITATION' | 'RSVP';

// Tamaño base del canvas
const CANVAS_W = 400;
const CANVAS_H = 700;

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
  const [scale, setScale] = useState(1);

  // Calcular escala para que el canvas llene la pantalla
  useEffect(() => {
    const updateScale = () => {
      const scaleW = window.innerWidth / CANVAS_W;
      const scaleH = window.innerHeight / CANVAS_H;
      // "cover": el eje que más crece gana → el canvas llena toda la pantalla
      setScale(Math.max(scaleW, scaleH));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

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
      } catch {
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
      // Usamos invitado.id (ID real en BD), no el token de la URL
      const res = await updateInvitadoRSVP(invitado.id, estado);
      if (res.success) {
        setStatus('SUCCESS');
        setResponse(estado);
      } else {
        alert('Ocurrió un error al guardar tu respuesta.');
        setStatus('IDLE');
      }
    } catch {
      alert('Error de conexión.');
      setStatus('IDLE');
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#09090b] text-white">
        <Loader2 className="animate-spin text-[var(--color-acento)] mb-4" size={48} />
        <p className="text-xs uppercase tracking-widest font-bold opacity-40">Cargando Invitación...</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (status === 'ERROR' || !evento) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] p-6 text-center text-white">
        <div className="space-y-4 max-w-xs">
          <XCircle size={64} className="mx-auto text-red-500 opacity-50" />
          <h1 className="text-2xl font-bold uppercase tracking-tighter italic">Invitación no válida</h1>
          <p className="text-white/40 text-sm">El enlace podría haber expirado o la invitación ya no está disponible.</p>
        </div>
      </div>
    );
  }

  // ── Éxito ─────────────────────────────────────────────────────────────────
  if (status === 'SUCCESS') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] p-6 text-center text-white">
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

  // ── Parsear datos ─────────────────────────────────────────────────────────
  let estilos: any = {};
  try { estilos = JSON.parse(evento.invitacion?.colorTexto || '{}'); } catch {}

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

  const isPremium = evento.invitacion?.tipoInvitacion === 'PREMIUM';

  if (isPremium) {
    return (
      <PremiumInvitationView 
        evento={evento}
        invitado={invitado}
        status={status}
        onRSVP={handleRSVP}
      />
    );
  }

  return (
    <div className="bg-[#050508] text-white">
      {/* ── PANTALLA 1: Invitación a pantalla completa ── */}
      <div className="relative" style={{ minHeight: '100dvh' }}>
        {/* Canvas escalado para llenar toda la pantalla */}
        <div
          className="fixed inset-0 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#050508' }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
          >
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

        {/* Overlay: Saludo encima de la invitación */}
        {view === 'INVITATION' && (
          <div
            className="fixed top-0 left-0 right-0 z-50 text-center px-4 pt-10 pb-6 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(5,5,8,0.85) 0%, rgba(5,5,8,0) 100%)',
            }}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--color-acento)] mb-1">
              Invitación Especial
            </p>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-tight">
              Hola, {invitado.nombre.split(' ')[0]}
            </h1>
          </div>
        )}

        {/* Spacer para hacer scroll hacia RSVP */}
        <div style={{ height: '100dvh' }} />
      </div>

      {/* ── PANTALLA 2: RSVP ── */}
      {view === 'RSVP' && (
        <div
          ref={rsvpRef}
          className="relative z-50 min-h-dvh flex items-center justify-center px-6 py-16 animate-in slide-in-from-bottom-8 duration-700"
          style={{
            backgroundImage: evento.invitacion?.fondoUrl ? `url(${evento.invitacion.fondoUrl})` : 'none',
            backgroundColor: evento.invitacion?.fondoUrl ? 'transparent' : '#050508',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm mx-auto text-center">
            <div className="mb-10">
              <div className="w-20 h-20 bg-[var(--color-acento)]/10 border border-[var(--color-acento)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={36} className="text-[var(--color-acento)]" fill="currentColor" />
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-3">¿Nos acompañas?</h2>
              <p className="text-white/40 text-sm">Confirma tu asistencia para este día tan especial.</p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleRSVP('CONFIRMADO')}
                disabled={status === 'SAVING'}
                className="w-full py-6 rounded-3xl font-black uppercase tracking-widest text-xs bg-emerald-500 text-white shadow-xl hover:bg-emerald-400 disabled:opacity-50 transition-all font-black"
              >
                {status === 'SAVING' ? <Loader2 className="animate-spin mx-auto" /> : 'Sí, asistiré con gusto'}
              </button>
              <button
                onClick={() => handleRSVP('RECHAZADO')}
                disabled={status === 'SAVING'}
                className="w-full py-6 rounded-3xl font-black uppercase tracking-widest text-xs bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition-all font-black"
              >
                No podré asistir
              </button>
              <button
                onClick={() => { setView('INVITATION'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-[10px] uppercase font-bold text-white/20 tracking-widest mt-4"
              >
                ← Volver a la invitación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
