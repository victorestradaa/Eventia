'use client';

import Link from 'next/link';
import { Search, MapPin, Star, Loader2, SlidersHorizontal, Users, Calendar as CalendarIcon } from 'lucide-react';
import { formatearMoneda, cn } from '@/lib/utils';
import {
  MobilePageShell,
  MobileSection,
  MobileEmpty,
} from '@/components/cliente/mobile/primitives';

interface Servicio {
  id: string;
  nombre: string;
  proveedorId: string;
  proveedorNombre?: string;
  ciudad?: string;
  categoria: string;
  precio: number | string;
  capacidad?: number | string;
  img?: string;
  premium?: boolean;
  calificacion?: number;
}

interface Filtros {
  precioMax: number;
  capacidadMin: number;
  fecha: string;
  ubicacion: string;
}

interface Props {
  isPublic: boolean;
  loading: boolean;
  servicios: Servicio[];
  catActiva: string;
  setCatActiva: (c: string) => void;
  categorias: string[];
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  filtros: Filtros;
  setFiltros: (f: Filtros) => void;
  showAdvanced: boolean;
  setShowAdvanced: (b: boolean) => void;
  onCardClick: (s: Servicio) => void;
  onClearFilters: () => void;
}

export default function ExploreMobile({
  isPublic,
  loading,
  servicios,
  catActiva,
  setCatActiva,
  categorias,
  searchQuery,
  setSearchQuery,
  filtros,
  setFiltros,
  showAdvanced,
  setShowAdvanced,
  onCardClick,
  onClearFilters,
}: Props) {
  return (
    <MobilePageShell>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--color-texto)] tracking-tight leading-tight">Explorar</h1>
          <p className="text-[12px] text-[var(--color-texto-suave)]">Encuentra a los mejores proveedores</p>
        </div>
      </div>

      {/* Búsqueda + filtros */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o ciudad…"
            className="w-full pl-10 pr-4 py-3 bg-[var(--color-fondo-card)] border border-[var(--color-borde)] rounded-2xl shadow-sm text-[14px] text-[var(--color-texto)] placeholder:text-[var(--color-texto-muted)] outline-none focus:border-[var(--color-acento)] transition-colors"
          />
        </div>
        {!isPublic && (
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold transition-all active:scale-[0.98]',
              showAdvanced
                ? 'bg-[var(--color-primario)] text-white'
                : 'bg-[var(--color-fondo-card)] text-[var(--color-texto)] border border-[var(--color-borde)] shadow-sm',
            )}
          >
            <SlidersHorizontal size={16} />
            {showAdvanced ? 'Ocultar filtros' : 'Filtros avanzados'}
          </button>
        )}
        {showAdvanced && !isPublic && (
          <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde)] rounded-2xl shadow-sm p-4 space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)] mb-1 block">
                Ciudad
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
                <input
                  type="text"
                  value={filtros.ubicacion}
                  onChange={(e) => setFiltros({ ...filtros, ubicacion: e.target.value })}
                  placeholder="Ej. Guadalajara"
                  className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-xl text-[13px] outline-none"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)]">
                  Presupuesto máximo
                </label>
                <span className="text-[12px] font-bold text-[var(--color-texto)]">
                  {filtros.precioMax >= 500000 ? 'Sin límite' : formatearMoneda(filtros.precioMax)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={500000}
                step={5000}
                value={filtros.precioMax}
                onChange={(e) => setFiltros({ ...filtros, precioMax: parseInt(e.target.value) })}
                className="w-full accent-[var(--color-primario)]"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)]">
                  Capacidad mínima
                </label>
                <span className="text-[12px] font-bold text-[var(--color-texto)]">{filtros.capacidadMin} pers.</span>
              </div>
              <input
                type="range"
                min={0}
                max={2000}
                step={50}
                value={filtros.capacidadMin}
                onChange={(e) => setFiltros({ ...filtros, capacidadMin: parseInt(e.target.value) })}
                className="w-full accent-[var(--color-primario)]"
              />
            </div>
            <button
              type="button"
              onClick={onClearFilters}
              className="w-full py-2.5 rounded-xl bg-[var(--color-fondo-hover)] text-[var(--color-texto)] text-[13px] font-semibold active:scale-[0.98] transition-all"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Categorías como pill scroller */}
      <div className="-mx-5 px-5 mb-4 overflow-x-auto no-scrollbar">
        <div className="inline-flex gap-2 min-w-max">
          {categorias.map((cat) => {
            const active = cat === catActiva;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCatActiva(cat)}
                className={cn(
                  'px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all active:scale-95',
                  active
                    ? 'bg-[var(--color-primario)] text-white shadow-sm'
                    : 'bg-[var(--color-fondo-card)] text-[var(--color-texto)] border border-[var(--color-borde)]',
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Loader2 className="animate-spin text-[var(--color-texto-muted)]" size={28} />
          <p className="text-[12px] text-[var(--color-texto-suave)] font-medium">Cargando catálogo…</p>
        </div>
      ) : servicios.length === 0 ? (
        <MobileEmpty
          icon={Search}
          title="Sin resultados"
          description="Ajusta los filtros para encontrar más opciones."
          action={
            <button
              type="button"
              onClick={onClearFilters}
              className="px-5 py-2.5 rounded-full bg-[var(--color-primario)] text-white text-[13px] font-semibold active:scale-95 transition-all"
            >
              Limpiar filtros
            </button>
          }
        />
      ) : (
        <MobileSection title={`${servicios.length} resultados`}>
          <div className="space-y-3">
            {servicios.map((s) => (
              <ServicioCard
                key={s.id}
                servicio={s}
                isPublic={isPublic}
                onCardClick={onCardClick}
              />
            ))}
          </div>
        </MobileSection>
      )}
    </MobilePageShell>
  );
}

function ServicioCard({
  servicio,
  isPublic,
  onCardClick,
}: {
  servicio: Servicio;
  isPublic: boolean;
  onCardClick: (s: Servicio) => void;
}) {
  const profileUrl = isPublic
    ? '#'
    : `/cliente/proveedor/${servicio.proveedorId}?paquete=${servicio.id}`;
  const calendarUrl = isPublic ? '#' : `${profileUrl}&showAvailability=true`;

  const inner = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-fondo-hover)]">
        <img
          src={servicio.img || '/placeholder_provider.png'}
          alt={servicio.nombre}
          className="w-full h-full object-cover"
        />
        {servicio.premium && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold uppercase tracking-wider shadow-sm">
            <Star size={10} fill="currentColor" /> Premium
          </span>
        )}
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--color-fondo-card)]/95 backdrop-blur text-[var(--color-texto)] text-[10px] font-semibold">
          {servicio.categoria}
        </span>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)]">
          {servicio.proveedorNombre}
        </p>
        <div className="flex items-start justify-between gap-2 mt-0.5">
          <h3 className="text-[15px] font-semibold text-[var(--color-texto)] leading-tight line-clamp-2">
            {servicio.nombre}
          </h3>
          {!isPublic && servicio.calificacion ? (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0">
              <Star size={11} fill="currentColor" /> {servicio.calificacion}
            </span>
          ) : null}
        </div>
        {servicio.ciudad && (
          <p className="text-[12px] text-[var(--color-texto-suave)] mt-0.5 inline-flex items-center gap-1">
            <MapPin size={12} /> {servicio.ciudad}
          </p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-borde-suave)]">
          {servicio.capacidad ? (
            <span className="inline-flex items-center gap-1 text-[12px] text-[var(--color-texto-suave)] font-medium">
              <Users size={13} /> {servicio.capacidad}
            </span>
          ) : (
            <span />
          )}
          <div className="text-right">
            <p className="text-[10px] uppercase font-semibold text-[var(--color-texto-suave)]">Desde</p>
            <p className="text-[15px] font-bold text-[var(--color-texto)] tabular-nums">
              {servicio.categoria === 'Comida'
                ? `${formatearMoneda(servicio.precio)} c/u`
                : formatearMoneda(servicio.precio)}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  if (isPublic) {
    return (
      <button
        type="button"
        onClick={() => onCardClick(servicio)}
        className="w-full text-left bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl shadow-sm overflow-hidden active:scale-[0.99] transition-all"
      >
        {inner}
      </button>
    );
  }

  return (
    <div className="relative bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl shadow-sm overflow-hidden active:scale-[0.99] transition-all">
      {/* Stretched link cubre toda la tarjeta menos el botón de agenda */}
      <Link
        href={profileUrl}
        className="absolute inset-0 z-[1]"
        aria-label={`Ver detalle de ${servicio.nombre}`}
      />
      {/* Botón "Ver disponibilidad" — overlay arriba a la derecha de la imagen */}
      <Link
        href={calendarUrl}
        aria-label="Ver disponibilidad del proveedor"
        className="absolute top-3 right-3 z-[2] w-9 h-9 rounded-full bg-[var(--color-fondo-card)]/95 backdrop-blur text-[var(--color-acento-claro)] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
      >
        <CalendarIcon size={16} />
      </Link>
      {inner}
    </div>
  );
}
