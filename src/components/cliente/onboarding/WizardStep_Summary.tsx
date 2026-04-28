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
    <div className="space-y-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-5xl">🎊</div>
        <h2 className="text-2xl font-bold text-[var(--color-texto)]">
          ¡Tu evento está tomando forma!
        </h2>
        <p className="text-[var(--color-texto-suave)] text-sm max-w-xs mx-auto">
          Aquí está el resumen de lo que reservaste para{' '}
          <strong className="text-[var(--color-texto)]">{eventoNombre}</strong>.
        </p>
      </div>

      {/* Lista de reservas */}
      <div className="space-y-3">
        {reservasHechas.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-texto-muted)]">
            <p className="text-sm">No reservaste ningún servicio en el asistente.</p>
            <p className="text-xs mt-1">Puedes explorar el catálogo desde tu panel.</p>
          </div>
        ) : (
          reservasHechas.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)]"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{r.categoriaEmoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-[var(--color-texto)] truncate">{r.servicioNombre}</p>
                <p className="text-[10px] text-[var(--color-texto-muted)] truncate">{r.proveedorNombre} · {r.categoriaLabel}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-black text-[var(--color-texto)]">{formatearMoneda(r.precio)}</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total */}
      {reservasHechas.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#d4af37]/15 to-transparent border border-[#d4af37]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)]">
                Costo estimado total
              </p>
              <p className="text-[10px] text-[var(--color-texto-muted)] mt-0.5">
                {reservasHechas.length} servicio{reservasHechas.length !== 1 ? 's' : ''} reservado{reservasHechas.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-[#d4af37]">{formatearMoneda(total)}</p>
              <p className="text-[10px] text-[var(--color-texto-muted)]">Estado: <span className="text-amber-400 font-bold">Por confirmar</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Nota */}
      <div className="px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <p className="text-xs text-blue-300 leading-relaxed">
          <strong>ℹ️ Siguiente paso:</strong> El proveedor revisará tu solicitud y se pondrá en contacto contigo para confirmar el anticipo y los detalles del servicio.
        </p>
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <Link
          href={`/cliente/evento/${eventoId}`}
          onClick={onFinalizar}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black uppercase text-sm tracking-widest text-black bg-gradient-to-b from-[#eadeba] to-[#c79a3b] shadow-lg hover:brightness-110 transition-all"
        >
          Administrar mi Evento
          <ArrowRight size={18} />
        </Link>

        <button
          onClick={onFinalizar}
          className="block w-full text-center text-xs font-bold text-[var(--color-texto-muted)] hover:text-[var(--color-texto)] transition-colors"
        >
          Ir al Dashboard
        </button>
      </div>
    </div>
  );
}
