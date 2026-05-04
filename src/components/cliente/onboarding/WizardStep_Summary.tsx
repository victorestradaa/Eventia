'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { formatearMoneda } from '@/lib/utils';

interface ReservaHecha {
  servicioId: string;
  servicioNombre: string;
  proveedorNombre: string;
  precio: number;
  categoriaLabel: string;
  categoriaEmoji: string;
}

interface Props {
  eventoId: string;
  eventoNombre: string;
  reservasHechas: ReservaHecha[];
  onFinalizar: () => void;
}

export default function WizardStep_Summary({ eventoId, eventoNombre, reservasHechas, onFinalizar }: Props) {
  const total = reservasHechas.reduce((acc, r) => acc + r.precio, 0);

  return (
    <div className="max-w-lg mx-auto">
      {/* Hero celebratorio */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce">🎊</div>
        <h1 className="text-[26px] font-bold tracking-tight text-[var(--color-texto)] leading-tight">
          ¡Listo, {eventoNombre}!
        </h1>
        <p className="text-[14px] text-[var(--color-texto-suave)] max-w-xs mx-auto mt-2 leading-relaxed">
          Tu evento está tomando forma. Aquí está lo que reservaste:
        </p>
      </div>

      {/* Lista de reservas o estado vacío */}
      {reservasHechas.length === 0 ? (
        <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl p-8 text-center shadow-sm mb-6">
          <p className="text-[14px] font-semibold text-[var(--color-texto)]">No reservaste servicios en el asistente</p>
          <p className="text-[12px] text-[var(--color-texto-suave)] mt-1">Puedes explorar el catálogo desde tu panel cuando quieras.</p>
        </div>
      ) : (
        <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl shadow-sm divide-y divide-[var(--color-borde-suave)] mb-5 overflow-hidden">
          {reservasHechas.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <span className="text-xl">{r.categoriaEmoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[var(--color-texto)] truncate">{r.servicioNombre}</p>
                <p className="text-[11px] text-[var(--color-texto-suave)] truncate">{r.proveedorNombre} · {r.categoriaLabel}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[13px] font-bold text-[var(--color-texto)] tabular-nums">{formatearMoneda(r.precio)}</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      {reservasHechas.length > 0 && (
        <div className="bg-gradient-to-br from-[#d4af37]/12 to-[#c79a3b]/5 border border-[#d4af37]/30 rounded-3xl p-5 mb-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)]">Total estimado</p>
              <p className="text-[12px] text-[var(--color-texto-suave)] mt-0.5">
                {reservasHechas.length} servicio{reservasHechas.length !== 1 ? 's' : ''} · Por confirmar
              </p>
            </div>
            <p className="text-[28px] font-bold text-[#a87a2a] tabular-nums tracking-tight">{formatearMoneda(total)}</p>
          </div>
        </div>
      )}

      {/* Nota informativa */}
      <div className="px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100 mb-5">
        <p className="text-[12px] text-blue-800 leading-relaxed">
          <strong>Siguiente paso:</strong> el proveedor revisará tu solicitud y te contactará para confirmar el anticipo y los detalles.
        </p>
      </div>

      {/* CTAs */}
      <div className="space-y-2">
        <Link
          href={`/cliente/evento/${eventoId}`}
          onClick={onFinalizar}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold uppercase text-[14px] tracking-wider text-black bg-gradient-to-b from-[#eadeba] to-[#c79a3b] shadow-lg active:scale-[0.98] transition-all"
        >
          Administrar mi evento
          <ArrowRight size={18} />
        </Link>
        <button
          onClick={onFinalizar}
          className="block w-full py-3 text-center text-[13px] font-semibold text-[var(--color-texto-suave)] active:text-[var(--color-texto)] transition-colors"
        >
          Ir al inicio
        </button>
      </div>
    </div>
  );
}
