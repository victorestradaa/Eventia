'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Heart,
  Users,
  Check,
  User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInvitadoRSVPDetail } from '@/lib/actions/eventActions';
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

  // Group RSVP state: track which members are checked
  const [grupoSeleccionados, setGrupoSeleccionados] = useState<Set<string>>(new Set());

  // Calcular escala para que el canvas llene la pantalla
  useEffect(() => {
    const updateScale = () => {
      const scaleW = window.innerWidth / CANVAS_W;
      const scaleH = window.innerHeight / CANVAS_H;
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

          // Pre-seleccionar a todos los miembros del grupo (incluyendo el titular)
          if (res.invitado) {
            const allIds = new Set<string>([res.invitado.id]);
            (res.invitado.grupoMiembros || []).forEach((m: any) => allIds.add(m.id));
            setGrupoSeleccionados(allIds);
          }
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

  const isGrupo = invitado?.grupoMiembros && invitado.grupoMiembros.length > 0;

  // Confirm attendance: individual (original) or group
  const handleRSVP = async (decisionGlobal: 'CONFIRMADO' | 'RECHAZADO', confirmadosIdsFromPremium?: string[]) => {
    setStatus('SAVING');
    try {
      let res: any;

      // PremiumInvitationView may pass confirmadosIds directly
      const idsToUse = confirmadosIdsFromPremium !== undefined
        ? confirmadosIdsFromPremium
        : (isGrupo && decisionGlobal === 'CONFIRMADO' ? Array.from(grupoSeleccionados) : null);

      if (isGrupo && idsToUse !== null) {
        const response = await fetch(`/api/invitado/${invitado.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirmadosIds: idsToUse })
        });
        res = await response.json();
      } else {
        // Individual RSVP (original behavior)
        const response = await fetch(`/api/invitado/${invitado.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rsvpStatus: decisionGlobal })
        });
        res = await response.json();
      }

      if (res.success) {
        setStatus('SUCCESS');
        const anyConfirmed = idsToUse ? idsToUse.length > 0 : decisionGlobal === 'CONFIRMADO';
        setResponse(anyConfirmed ? 'CONFIRMADO' : 'RECHAZADO');
      } else {
        alert('Ocurrió un error al guardar tu respuesta.');
        setStatus('IDLE');
      }
    } catch {
      alert('Error de conexión.');
      setStatus('IDLE');
    }
  };

  const toggleMiembro = (id: string) => {
    setGrupoSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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

  // ── Confirmados (éxito) ───────────────────────────────────────────────────
  if (status === 'SUCCESS') {
    const numConfirmados = isGrupo ? grupoSeleccionados.size : (response === 'CONFIRMADO' ? 1 : 0);
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
                  Muchas gracias <span className="font-bold text-white uppercase">{invitado.nombre}</span>
                  {isGrupo && numConfirmados > 1 && (
                    <>, hemos registrado la asistencia de <span className="font-bold text-emerald-400">{numConfirmados} personas</span> de tu grupo.</>
                  )}
                  {(!isGrupo || numConfirmados === 1) && <>, hemos registrado tu asistencia. ¡Te esperamos!</>}
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
                  Lamentamos que no puedan acompañarnos. ¡Esperamos verlos en la próxima!
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
      <div className="bg-black/90 min-h-screen w-full flex items-center justify-center">
        <div className="w-full h-dvh sm:h-[90dvh] max-w-[420px] bg-black sm:rounded-[40px] sm:border-[8px] sm:border-zinc-800 shadow-2xl overflow-hidden relative [container-type:inline-size]">
          <div className="w-full h-full overflow-y-auto overflow-x-hidden relative scroll-smooth scrollbar-none">
            <PremiumInvitationView 
              evento={evento}
              invitado={invitado}
              status={status}
              onRSVP={handleRSVP}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Grupo familiar: lista de miembros ─────────────────────────────────────
  const grupoCompleto = isGrupo
    ? [{ id: invitado.id, nombre: invitado.nombre, tipoPersona: invitado.tipoPersona }, ...invitado.grupoMiembros]
    : [];

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
            
            {/* Header */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-[var(--color-acento)]/10 border border-[var(--color-acento)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                {isGrupo
                  ? <Users size={36} className="text-[var(--color-acento)]" />
                  : <Heart size={36} className="text-[var(--color-acento)]" fill="currentColor" />
                }
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-3">¿Nos acompañas?</h2>
              {isGrupo ? (
                <p className="text-white/40 text-sm">
                  Selecciona quiénes de tu grupo asistirán a este día tan especial.
                </p>
              ) : (
                <p className="text-white/40 text-sm">Confirma tu asistencia para este día tan especial.</p>
              )}
            </div>

            {/* ── GRUPO FAMILIAR: checklist ─────────────────────────────── */}
            {isGrupo && (
              <div className="mb-8 text-left space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                  Tu grupo ({grupoCompleto.length} personas)
                </p>
                {grupoCompleto.map((miembro: any) => {
                  const checked = grupoSeleccionados.has(miembro.id);
                  return (
                    <button
                      key={miembro.id}
                      onClick={() => toggleMiembro(miembro.id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98]",
                        checked
                          ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                          : "bg-white/5 border-white/10 text-white/40"
                      )}
                    >
                      {/* Checkbox visual */}
                      <div className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                        checked ? "bg-emerald-500 border-emerald-500" : "border-white/20"
                      )}>
                        {checked && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                      {/* Avatar */}
                      <div className={cn(
                        "w-9 h-9 rounded-full border flex items-center justify-center shrink-0",
                        checked ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5"
                      )}>
                        <UserIcon size={18} className={checked ? "text-emerald-400" : "text-white/20"} />
                      </div>
                      {/* Nombre */}
                      <span className="text-sm font-bold truncate flex-1 text-left">{miembro.nombre}</span>
                    </button>
                  );
                })}

                {/* Quick select all / none */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setGrupoSeleccionados(new Set(grupoCompleto.map((m: any) => m.id)))}
                    className="flex-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 py-2 transition-colors"
                  >
                    Todos
                  </button>
                  <div className="w-px bg-white/10" />
                  <button
                    onClick={() => setGrupoSeleccionados(new Set())}
                    className="flex-1 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/50 py-2 transition-colors"
                  >
                    Ninguno
                  </button>
                </div>
              </div>
            )}

            {/* ── BOTONES RSVP ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-4">
              {isGrupo ? (
                <>
                  <button
                    onClick={() => handleRSVP('CONFIRMADO')}
                    disabled={status === 'SAVING' || grupoSeleccionados.size === 0}
                    className="w-full py-6 rounded-3xl font-black uppercase tracking-widest text-xs bg-emerald-500 text-white shadow-xl hover:bg-emerald-400 disabled:opacity-50 transition-all"
                  >
                    {status === 'SAVING'
                      ? <Loader2 className="animate-spin mx-auto" size={20} />
                      : `Confirmar ${grupoSeleccionados.size > 0 ? `(${grupoSeleccionados.size} persona${grupoSeleccionados.size > 1 ? 's' : ''})` : ''}`
                    }
                  </button>
                  <button
                    onClick={() => handleRSVP('RECHAZADO')}
                    disabled={status === 'SAVING'}
                    className="w-full py-5 rounded-3xl font-black uppercase tracking-widest text-xs bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition-all"
                  >
                    No podremos asistir
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
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
