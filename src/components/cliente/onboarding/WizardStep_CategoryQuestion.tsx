'use client';

import { cn } from '@/lib/utils';

interface CategoryInfo {
  id: string;
  label: string;
  emoji: string;
  pregunta: string;
  descripcion: string;
}

interface Props {
  categoria: CategoryInfo;
  onSi: () => void;
  onNo: () => void;
  onTerminar: () => void;
  totalCategorias: number;
  categoriaIndex: number;
}

export default function WizardStep_CategoryQuestion({
  categoria,
  onSi,
  onNo,
  onTerminar,
  totalCategorias,
  categoriaIndex,
}: Props) {
  const esUltima = categoriaIndex === totalCategorias - 1;

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="text-center space-y-3">
        <div className="text-6xl">{categoria.emoji}</div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)]">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)]">
            Categoría {categoriaIndex + 1} de {totalCategorias}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-texto)]">
          {categoria.pregunta}
        </h2>
        <p className="text-[var(--color-texto-suave)] text-sm max-w-xs mx-auto">
          {categoria.descripcion}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* SÍ */}
        <button
          type="button"
          onClick={onSi}
          className="group relative overflow-hidden flex items-center justify-center gap-3 p-5 rounded-3xl border-2 border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/15 hover:border-emerald-500 transition-all duration-300 font-black text-emerald-400 text-lg hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]"
        >
          <span className="text-2xl">✅</span>
          <span>Sí, quiero ver opciones</span>
        </button>

        {/* NO */}
        <button
          type="button"
          onClick={onNo}
          className="group flex items-center justify-center gap-3 p-4 rounded-3xl border-2 border-[var(--color-borde-suave)] bg-[var(--color-fondo-input)] hover:border-[var(--color-primario-claro)]/40 hover:bg-[var(--color-fondo-card)] transition-all duration-300 font-bold text-[var(--color-texto-suave)] text-base"
        >
          <span className="text-xl">➡️</span>
          <span>{esUltima ? 'No, finalizar' : 'No, siguiente categoría'}</span>
        </button>

        {/* Terminar ya */}
        {!esUltima && (
          <button
            type="button"
            onClick={onTerminar}
            className="text-xs font-bold text-[var(--color-texto-muted)] hover:text-[var(--color-texto)] transition-colors underline underline-offset-4 text-center pt-1"
          >
            Ya terminé de elegir, ver mi resumen
          </button>
        )}
      </div>
    </div>
  );
}
