'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, CheckCircle2, MapPin, Star } from 'lucide-react';
import { formatearMoneda } from '@/lib/utils';
import { solicitarReserva } from '@/lib/actions/providerActions';

interface ReservaHecha {
  servicioId: string;
  servicioNombre: string;
  proveedorNombre: string;
  precio: number;
  categoriaLabel: string;
  categoriaEmoji: string;
}

interface Props {
  categoria: { id: string; label: string; emoji: string };
  servicios: any[];
  esFallback: boolean;
  ciudadEvento: string;
  eventoId: string;
  clienteId: string;
  fechaEvento: string;
  onReservado: (reserva: ReservaHecha) => void;
  onSaltar: () => void;
}

export default function WizardStep_ServiceGallery({
  categoria,
  servicios,
  esFallback,
  ciudadEvento,
  eventoId,
  clienteId,
  fechaEvento,
  onReservado,
  onSaltar,
}: Props) {
  const [servicioActivo, setServicioActivo] = useState<any | null>(null);
  const [galIdx, setGalIdx] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [reservadoOk, setReservadoOk] = useState(false);
  const [error, setError] = useState('');

  const galeriaActiva = servicioActivo
    ? [...(servicioActivo.imagenes || []), ...(servicioActivo.portafolio || [])].filter(Boolean)
    : [];

  const abrirServicio = (s: any) => {
    setServicioActivo(s);
    setGalIdx(0);
    setConfirmando(false);
    setReservadoOk(false);
    setError('');
  };

  const cerrarModal = () => {
    setServicioActivo(null);
    setConfirmando(false);
    setReservadoOk(false);
  };

  const handleReservar = async () => {
    if (!servicioActivo) return;
    setReservando(true);
    setError('');
    const res = await solicitarReserva({
      clienteId,
      proveedorId: servicioActivo.proveedorId,
      servicioId: servicioActivo.id,
      eventoId,
      fechaEvento,
      montoTotal: servicioActivo.precio,
    });
    if (res.success) {
      setReservadoOk(true);
      setConfirmando(false);
    } else {
      setError(res.error || 'Ocurrió un error al reservar.');
    }
    setReservando(false);
  };

  const handleContinuar = () => {
    if (servicioActivo && reservadoOk) {
      onReservado({
        servicioId: servicioActivo.id,
        servicioNombre: servicioActivo.nombre,
        proveedorNombre: servicioActivo.proveedorNombre,
        precio: servicioActivo.precio,
        categoriaLabel: categoria.label,
        categoriaEmoji: categoria.emoji,
      });
    }
    cerrarModal();
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="text-4xl">{categoria.emoji}</div>
        <h2 className="text-xl font-bold text-[var(--color-texto)]">
          Elige tu {categoria.label}
        </h2>
        {esFallback && (
          <p className="text-[10px] text-[var(--color-texto-muted)] flex items-center justify-center gap-1">
            <MapPin size={10} />
            No encontramos en {ciudadEvento}, mostrando disponibles cercanos
          </p>
        )}
        {!esFallback && ciudadEvento && (
          <p className="text-[10px] text-[var(--color-texto-muted)] flex items-center justify-center gap-1">
            <MapPin size={10} className="text-emerald-400" />
            Proveedores en {ciudadEvento}
          </p>
        )}
      </div>

      {servicios.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="text-5xl">🔍</div>
          <p className="text-[var(--color-texto-suave)] font-bold">No hay proveedores disponibles aún</p>
          <p className="text-xs text-[var(--color-texto-muted)]">Puedes explorar manualmente desde tu panel.</p>
          <button
            onClick={onSaltar}
            className="mt-4 px-6 py-3 rounded-2xl border border-[var(--color-borde-suave)] text-sm font-bold text-[var(--color-texto-suave)] hover:text-[var(--color-texto)] transition-colors"
          >
            Continuar sin elegir →
          </button>
        </div>
      ) : (
        <>
          {/* Grid de servicios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {servicios.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => abrirServicio(s)}
                className="group relative rounded-3xl overflow-hidden border-2 border-[var(--color-borde-suave)] hover:border-[#d4af37] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left bg-[var(--color-fondo-card)]"
              >
                {/* Imagen principal */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-fondo-input)]">
                  {s.imagenes?.[0] ? (
                    <img
                      src={s.imagenes[0]}
                      alt={s.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
                      {categoria.emoji}
                    </div>
                  )}
                  {/* Badge premium */}
                  {s.premium && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#d4af37] text-black text-[9px] font-black uppercase tracking-wider">
                      ⭐ Premium
                    </div>
                  )}
                  {/* Overlay con botón ver más */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="text-white text-xs font-black uppercase tracking-widest">
                      Ver galería →
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-black text-sm text-[var(--color-texto)] leading-tight">{s.nombre}</p>
                      <p className="text-[10px] text-[var(--color-texto-muted)]">{s.proveedorNombre}</p>
                    </div>
                    {s.calificacion > 0 && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 flex-shrink-0">
                        <Star size={10} fill="currentColor" />
                        <span className="text-[10px] font-black">{s.calificacion}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[var(--color-borde-suave)]">
                    <span className="text-sm font-black text-[var(--color-texto)]">{formatearMoneda(s.precio)}</span>
                    <span className="text-[10px] text-[var(--color-texto-muted)] flex items-center gap-0.5">
                      <MapPin size={9} /> {s.ciudad}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Saltar */}
          <button
            onClick={onSaltar}
            className="block w-full text-center text-xs font-bold text-[var(--color-texto-muted)] hover:text-[var(--color-texto)] transition-colors underline underline-offset-4"
          >
            Ninguno me convence, continuar →
          </button>
        </>
      )}

      {/* ─── Modal de galería / detalle ─── */}
      {servicioActivo && (
        <div className="fixed inset-0 z-[300] flex flex-col animate-in fade-in duration-200"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
        >
          <div className="max-w-2xl w-full mx-auto flex flex-col h-full p-4 md:p-6 gap-3">
            {/* Header modal */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-lg">
                  {categoria.emoji}
                </div>
                <div>
                  <p className="font-black text-white text-base leading-tight">{servicioActivo.nombre}</p>
                  <p className="text-white/50 text-xs">{servicioActivo.proveedorNombre}</p>
                </div>
              </div>
              <button
                onClick={cerrarModal}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Galería */}
            <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden bg-black/30 border border-white/10">
              {galeriaActiva.length > 0 ? (
                <>
                  <img
                    key={galIdx}
                    src={galeriaActiva[galIdx]}
                    alt="Galería"
                    className="w-full h-full object-cover animate-in fade-in duration-300"
                  />
                  {/* Overlay gradiente inferior */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  {galeriaActiva.length > 1 && (
                    <>
                      <button
                        onClick={() => setGalIdx(i => (i - 1 + galeriaActiva.length) % galeriaActiva.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setGalIdx(i => (i + 1) % galeriaActiva.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                      >
                        <ChevronRight size={20} />
                      </button>
                      {/* Indicadores */}
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {galeriaActiva.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setGalIdx(i)}
                            className={`h-1.5 rounded-full transition-all ${i === galIdx ? 'bg-white w-5' : 'bg-white/40 w-1.5'}`}
                          />
                        ))}
                      </div>
                      {/* Contador */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold">
                        {galIdx + 1} / {galeriaActiva.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <div className="text-5xl opacity-30">{categoria.emoji}</div>
                  <p className="text-white/30 text-sm">Sin imágenes disponibles</p>
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-4 space-y-2">
              {servicioActivo.descripcion && (
                <p className="text-white/70 text-sm leading-relaxed line-clamp-2">{servicioActivo.descripcion}</p>
              )}
              {servicioActivo.ciudad && (
                <p className="text-white/40 text-xs flex items-center gap-1">
                  <MapPin size={10} /> {servicioActivo.ciudad}
                </p>
              )}
            </div>

            {/* Footer de acción */}
            <div className="space-y-3 pb-2">
              {error && (
                <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                  {error}
                </div>
              )}

              {/* Estado: success */}
              {reservadoOk ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle2 size={24} className="text-emerald-400" />
                    <div>
                      <p className="text-emerald-400 font-black text-sm">¡Reservado con éxito!</p>
                      <p className="text-emerald-400/60 text-xs">El proveedor se pondrá en contacto contigo.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleContinuar}
                    className="w-full py-4 rounded-2xl font-black uppercase text-sm tracking-widest text-black bg-gradient-to-b from-[#eadeba] to-[#c79a3b] shadow-lg hover:brightness-110 transition-all"
                  >
                    Continuar →
                  </button>
                </div>
              ) : confirmando ? (
                /* Estado: confirmar */
                <div className="space-y-3">
                  <div className="text-center rounded-2xl bg-white/5 border border-white/10 py-4 px-6">
                    <p className="text-white/70 font-bold text-sm">¿Confirmas la reserva de</p>
                    <p className="text-[#d4af37] font-black text-2xl">{formatearMoneda(servicioActivo.precio)}</p>
                    <p className="text-white/40 text-xs">con {servicioActivo.proveedorNombre}?</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setConfirmando(false)}
                      disabled={reservando}
                      className="py-4 rounded-2xl bg-white/10 text-white font-black text-sm hover:bg-white/20 transition-colors disabled:opacity-50 border border-white/10"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleReservar}
                      disabled={reservando}
                      className="py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {reservando ? <Loader2 size={18} className="animate-spin" /> : '✅ Sí, reservar'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Estado: botón principal */
                <div className="flex gap-3 items-center rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
                  <div className="flex-1">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Precio</p>
                    <p className="text-2xl font-black text-white">{formatearMoneda(servicioActivo.precio)}</p>
                  </div>
                  <button
                    onClick={() => setConfirmando(true)}
                    className="py-4 px-6 rounded-2xl font-black uppercase text-sm tracking-widest text-black bg-gradient-to-b from-[#eadeba] to-[#c79a3b] shadow-lg hover:brightness-110 hover:scale-105 transition-all"
                  >
                    🔖 ¡RESERVAR!
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
