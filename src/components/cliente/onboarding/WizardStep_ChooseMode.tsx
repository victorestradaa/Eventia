'use client';

import { Sparkles, ClipboardList, ChevronRight } from 'lucide-react';

interface Props {
  onFacil: () => void;
  onManual: () => void;
}

export default function WizardStep_ChooseMode({ onFacil, onManual }: Props) {
  return (
    <div className="max-w-lg mx-auto">
      {/* Hero */}
      <div className="text-center space-y-2 mb-8">
        <div className="text-5xl mb-3">✨</div>
        <h1 className="text-[26px] font-bold tracking-tight text-[var(--color-texto)] leading-tight">
          ¿Cómo prefieres organizar?
        </h1>
        <p className="text-[14px] text-[var(--color-texto-suave)] max-w-xs mx-auto">
          Elige el modo que mejor se adapte a ti. Puedes cambiar cuando quieras.
        </p>
      </div>

      {/* Cards de selección */}
      <div className="space-y-3">
        {/* Asistente Automático — destacado */}
        <button
          type="button"
          onClick={onFacil}
          className="w-full text-left bg-[var(--color-fondo-card)] border-2 border-[#d4af37] rounded-3xl p-5 shadow-md active:scale-[0.99] transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#eadeba] to-[#c79a3b] flex items-center justify-center shadow-md shrink-0">
              <Sparkles size={26} className="text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d4af37] text-black">Recomendado</span>
              </div>
              <p className="text-[16px] font-bold text-[var(--color-texto)] leading-tight">Asistente automático</p>
              <p className="text-[13px] text-[var(--color-texto-suave)] mt-1.5 leading-relaxed">
                Te guiamos paso a paso por cada categoría. Solo responde <strong className="text-[var(--color-texto)]">Sí o No</strong>.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['Salón', 'Banquetes', 'Música', 'Fotografía', '+4 más'].map(cat => (
                  <span key={cat} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#a87a2a]">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <ChevronRight size={20} className="text-[var(--color-texto-muted)] mt-3 shrink-0" />
          </div>
        </button>

        {/* Modo Manual */}
        <button
          type="button"
          onClick={onManual}
          className="w-full text-left bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl p-5 shadow-sm active:scale-[0.99] transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-fondo-hover)] flex items-center justify-center shrink-0">
              <ClipboardList size={24} className="text-[var(--color-texto)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-[var(--color-texto)] leading-tight">Modo manual</p>
              <p className="text-[13px] text-[var(--color-texto-suave)] mt-1.5 leading-relaxed">
                Explora el catálogo libremente desde tu panel y organiza a tu ritmo.
              </p>
            </div>
            <ChevronRight size={20} className="text-[var(--color-texto-muted)] mt-3 shrink-0" />
          </div>
        </button>
      </div>
    </div>
  );
}
