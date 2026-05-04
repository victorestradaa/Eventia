'use client';

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
    <div className="max-w-lg mx-auto">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-7xl mb-5">{categoria.emoji}</div>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--color-texto)] leading-snug px-2">
          {categoria.pregunta}
        </h1>
        <p className="text-[14px] text-[var(--color-texto-suave)] max-w-xs mx-auto mt-2 leading-relaxed">
          {categoria.descripcion}
        </p>
      </div>

      {/* Botones de respuesta */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onSi}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-emerald-500 text-white text-[15px] font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
        >
          <span className="text-xl">✓</span>
          Sí, quiero ver opciones
        </button>

        <button
          type="button"
          onClick={onNo}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[var(--color-fondo-card)] border border-[var(--color-borde)] text-[var(--color-texto)] text-[15px] font-semibold shadow-sm active:scale-[0.98] transition-all"
        >
          {esUltima ? 'No, finalizar' : 'No, siguiente categoría'}
        </button>

        {!esUltima && (
          <button
            type="button"
            onClick={onTerminar}
            className="w-full text-center pt-2 text-[12px] font-medium text-[var(--color-texto-suave)] active:text-[var(--color-texto)] underline underline-offset-2"
          >
            Ya terminé, ver mi resumen
          </button>
        )}
      </div>
    </div>
  );
}
