'use client';

import {
  Star,
  MapPin,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldCheck,
  Phone,
  ShoppingBag,
  CheckCircle,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { cn, formatearMoneda } from '@/lib/utils';
import {
  MobilePageShell,
  MobileSection,
  MobileCard,
} from '@/components/cliente/mobile/primitives';

interface Props {
  data: any;
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string) => void;
  selectedService: any;
  galeria: string[];
  canViewContact: boolean;
  activeEvent?: any;
  onSolicitarReserva: () => void;
  reservado: boolean;
  solicitando: boolean;
  errorSolicitud: string | null;
  /** Abre/cierra la vista de disponibilidad del proveedor (mismo estado que escritorio) */
  onToggleCalendario?: () => void;
}

export default function ProviderDetailMobile({
  data,
  selectedServiceId,
  setSelectedServiceId,
  selectedService,
  galeria,
  canViewContact,
  activeEvent,
  onSolicitarReserva,
  reservado,
  solicitando,
  errorSolicitud,
  onToggleCalendario,
}: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const p = data;
  const totalImgs = galeria.length || 1;
  const next = () => setImgIdx((i) => (i + 1) % totalImgs);
  const prev = () => setImgIdx((i) => (i - 1 + totalImgs) % totalImgs);

  const stats = [
    { icon: Clock, label: 'Respuesta', value: '< 2 hrs' },
    { icon: MapPin, label: 'Ubicación', value: p.ciudad || 'Sin definir' },
    { icon: ShoppingBag, label: 'Categoría', value: p.categoria },
    { icon: CheckCircle, label: 'Estado', value: 'Verificado' },
  ];

  return (
    <MobilePageShell withBottomNavSpacer={false}>
      {/* Top actions */}
      <div className="flex items-center justify-between mb-3">
        <Link
          href="/cliente/explorar"
          aria-label="Volver"
          className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full bg-[var(--color-fondo-card)] border border-[var(--color-borde)] text-[var(--color-texto)] shadow-sm active:scale-95 transition-all"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Favorito"
            className="w-10 h-10 rounded-full bg-[var(--color-fondo-card)] border border-[var(--color-borde)] text-[var(--color-texto)] shadow-sm flex items-center justify-center active:scale-95 transition-all"
          >
            <Heart size={17} />
          </button>
          <button
            type="button"
            aria-label="Compartir"
            className="w-10 h-10 rounded-full bg-[var(--color-fondo-card)] border border-[var(--color-borde)] text-[var(--color-texto)] shadow-sm flex items-center justify-center active:scale-95 transition-all"
          >
            <Share2 size={17} />
          </button>
        </div>
      </div>

      {/* Galería swipeable */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-[var(--color-fondo-hover)] shadow-sm border border-[var(--color-borde-suave)]">
        {galeria.length > 0 ? (
          <img src={galeria[imgIdx]} alt={p.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-texto-muted)]">Sin foto</div>
        )}
        {totalImgs > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--color-fondo-card)]/90 backdrop-blur text-[var(--color-texto)] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--color-fondo-card)]/90 backdrop-blur text-[var(--color-texto)] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {galeria.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all',
                    i === imgIdx ? 'bg-[var(--color-fondo-card)] w-4' : 'bg-[var(--color-fondo-card)]/50',
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4 px-1">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] shadow-sm overflow-hidden flex items-center justify-center shrink-0">
          <img src={p.logoUrl || '/logo.png'} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">{p.categoria}</p>
          <h1 className="text-[20px] font-bold text-[var(--color-texto)] leading-tight tracking-tight truncate">
            {p.nombre}
          </h1>
          <div className="flex items-center gap-3 text-[12px] text-[var(--color-texto-suave)] mt-0.5">
            <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
              <Star size={13} fill="currentColor" /> {p.calificacion ?? 0}
            </span>
            {p.ciudad && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} /> {p.ciudad}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Selector de paquete */}
      {p.servicios?.length > 0 && (
        <MobileSection title="Paquetes">
          <div className="-mx-1 px-1 overflow-x-auto no-scrollbar">
            <div className="inline-flex gap-2 min-w-max">
              {p.servicios.map((s: any) => {
                const active = s.id === selectedServiceId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedServiceId(s.id)}
                    className={cn(
                      'px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all active:scale-95 border',
                      active
                        ? 'bg-[var(--color-primario)] text-white border-[var(--color-primario)]'
                        : 'bg-[var(--color-fondo-card)] text-[var(--color-texto)] border-[var(--color-borde)]',
                    )}
                  >
                    {s.nombre}
                  </button>
                );
              })}
            </div>
          </div>
        </MobileSection>
      )}

      {/* Precio del paquete seleccionado + botón calendario */}
      <MobileCard className="p-4 mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)] mb-1">
              {selectedService?.nombre || 'Servicio'}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[var(--color-texto)] tracking-tight tabular-nums">
                {formatearMoneda(selectedService?.precio || 0)}
              </span>
              <span className="text-[12px] text-[var(--color-texto-suave)] font-medium">
                {p.categoria === 'Comida' ? '/ persona' : 'desde'}
              </span>
            </div>
            {(selectedService?.capacidadMin || selectedService?.capacidadMax) && (
              <p className="text-[12px] text-[var(--color-texto-suave)] mt-1">
                Capacidad {selectedService.capacidadMin || 0}–{selectedService.capacidadMax || '∞'} personas
              </p>
            )}
          </div>
          {onToggleCalendario && (
            <button
              type="button"
              onClick={onToggleCalendario}
              aria-label="Ver disponibilidad"
              className="shrink-0 flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl bg-[var(--color-fondo-hover)] border border-[var(--color-borde-suave)] text-[var(--color-acento-claro)] active:scale-95 transition-all"
            >
              <CalendarIcon size={20} />
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-texto-suave)]">Agenda</span>
            </button>
          )}
        </div>
      </MobileCard>

      {/* Descripción */}
      {p.desc && (
        <MobileSection title="Acerca de">
          <MobileCard className="p-4">
            <p className="text-[13.5px] text-[var(--color-texto)] leading-relaxed">{p.desc}</p>
          </MobileCard>
        </MobileSection>
      )}

      {/* Stats */}
      <MobileSection title="Detalles">
        <div className="grid grid-cols-2 gap-2">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl shadow-sm p-3 flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--color-fondo-hover)] flex items-center justify-center text-[var(--color-texto)] shrink-0">
                <Icon size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)] leading-none">
                  {label}
                </p>
                <p className="text-[12px] font-semibold text-[var(--color-texto)] truncate">{value}</p>
              </div>
            </div>
          ))}
          <div
            className={cn(
              'col-span-2 bg-[var(--color-fondo-card)] border rounded-2xl shadow-sm p-3 flex items-center gap-2',
              canViewContact ? 'border-emerald-100' : 'border-[var(--color-borde-suave)]',
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                canViewContact ? 'bg-emerald-50 text-emerald-700' : 'bg-[var(--color-fondo-hover)] text-[var(--color-texto-suave)]',
              )}
            >
              {canViewContact ? <Phone size={15} /> : <ShieldCheck size={15} />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)] leading-none">
                Contacto
              </p>
              <p
                className={cn(
                  'text-[13px] font-semibold truncate',
                  canViewContact ? 'text-[var(--color-texto)]' : 'text-[var(--color-texto-suave)] italic',
                )}
              >
                {canViewContact ? p.telefono || 'Sin asignar' : 'Reserva para verlo'}
              </p>
            </div>
          </div>
        </div>
      </MobileSection>

      {/* Portafolio */}
      {p.portafolio?.length > 0 && (
        <MobileSection title={`Portafolio (${p.portafolio.length})`}>
          <div className="grid grid-cols-2 gap-2">
            {p.portafolio.slice(0, 6).map((item: any) => (
              <div
                key={item.id}
                className="aspect-square rounded-2xl overflow-hidden bg-[var(--color-fondo-hover)] border border-[var(--color-borde-suave)] shadow-sm"
              >
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </MobileSection>
      )}

      {/* Reseñas resumen */}
      {(p.calificacion || p.numResenas) && (
        <MobileSection title="Reseñas">
          <MobileCard className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Star size={20} fill="currentColor" />
            </div>
            <div className="flex-1">
              <p className="text-[20px] font-bold text-[var(--color-texto)] leading-none">{p.calificacion ?? 0}</p>
              <p className="text-[12px] text-[var(--color-texto-suave)] mt-0.5">
                {p.numResenas ? `${p.numResenas} reseñas` : 'Sin reseñas todavía'}
              </p>
            </div>
          </MobileCard>
        </MobileSection>
      )}

      {/* Espacio para que el sticky CTA + tab bar no tape contenido */}
      <div className="h-40" />

      {/* Sticky CTA inferior — sobre la tab bar (z-[60] vs z-50 del bottom nav) */}
      <div
        className="md:hidden fixed left-0 right-0 z-[60] bg-[var(--color-fondo-card)] border-t border-[var(--color-borde-suave)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-4 pt-3 pb-3"
        style={{ bottom: 'calc(70px + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)] leading-none mb-0.5">Total</p>
            <p className="text-[18px] font-bold text-[var(--color-texto)] tabular-nums leading-tight">
              {formatearMoneda(selectedService?.precio || 0)}
            </p>
          </div>
          {reservado ? (
            <button
              type="button"
              disabled
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <CheckCircle size={16} /> Reservado
            </button>
          ) : (
            <button
              type="button"
              onClick={onSolicitarReserva}
              disabled={solicitando || !activeEvent}
              className="btn-oro px-6 py-3.5 rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md disabled:opacity-60 whitespace-nowrap"
            >
              <CalendarIcon size={16} />
              {solicitando ? 'Solicitando…' : activeEvent ? 'Apartar fecha' : 'Selecciona evento'}
            </button>
          )}
        </div>
        {errorSolicitud && (
          <p className="text-[11px] text-rose-600 font-semibold mt-2 text-center">{errorSolicitud}</p>
        )}
      </div>
    </MobilePageShell>
  );
}
