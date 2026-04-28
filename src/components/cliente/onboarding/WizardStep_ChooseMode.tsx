'use client';

import { Sparkles, ClipboardList } from 'lucide-react';

interface Props {
  onFacil: () => void;
  onManual: () => void;
}

export default function WizardStep_ChooseMode({ onFacil, onManual }: Props) {
  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-2">✨</div>
        <h2 className="text-2xl font-bold text-[var(--color-texto)]">
          ¿Cómo prefieres armar tu evento?
        </h2>
        <p className="text-[var(--color-texto-suave)] text-sm max-w-xs mx-auto">
          Elige el modo que más se adapte a ti. Siempre puedes cambiar después.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Asistente Fácil */}
        <button
          type="button"
          onClick={onFacil}
          className="group relative overflow-hidden flex flex-col items-start gap-3 p-6 rounded-3xl border-2 border-[#d4af37]/40 bg-gradient-to-br from-[#d4af37]/10 via-transparent to-transparent hover:border-[#d4af37] hover:from-[#d4af37]/20 transition-all duration-300 text-left w-full shadow-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.2)] hover:-translate-y-1"
        >
          {/* Glow effect */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#d4af37]/10 rounded-full blur-3xl group-hover:bg-[#d4af37]/20 transition-all duration-500" />

          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#eadeba] to-[#c79a3b] flex items-center justify-center shadow-md">
              <Sparkles size={22} className="text-black" />
            </div>
            <div>
              <p className="font-black text-[var(--color-texto)] text-base">Asistente Automático</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">Fácil y rápido ✨</p>
            </div>
          </div>

          <p className="relative text-sm text-[var(--color-texto-suave)] leading-relaxed">
            Te guiamos paso a paso por cada categoría. Solo responde <strong className="text-[var(--color-texto)]">Sí o No</strong>, elige tus favoritos y listo.
          </p>

          <div className="relative flex flex-wrap gap-2 mt-1">
            {['Salón', 'Banquetes', 'Música', 'Fotografía', 'Decoración'].map(cat => (
              <span key={cat} className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#d4af37]/20 text-[#d4af37]">
                {cat}
              </span>
            ))}
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#d4af37]/20 text-[#d4af37]">+más</span>
          </div>

          <div className="relative w-full pt-2 border-t border-[#d4af37]/20">
            <span className="text-xs font-black text-[#d4af37] group-hover:translate-x-1 transition-transform inline-block">
              Empezar asistente →
            </span>
          </div>
        </button>

        {/* Modo Manual */}
        <button
          type="button"
          onClick={onManual}
          className="group flex flex-col items-start gap-3 p-6 rounded-3xl border-2 border-[var(--color-borde-suave)] hover:border-[var(--color-primario-claro)]/40 bg-[var(--color-fondo-input)] hover:bg-[var(--color-fondo-card)] transition-all duration-300 text-left w-full hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] flex items-center justify-center">
              <ClipboardList size={22} className="text-[var(--color-texto-suave)]" />
            </div>
            <div>
              <p className="font-black text-[var(--color-texto)] text-base">Modo Manual</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-texto-muted)]">Control total</p>
            </div>
          </div>

          <p className="text-sm text-[var(--color-texto-suave)] leading-relaxed">
            Explora el catálogo libremente y organiza tu evento a tu ritmo desde el panel principal.
          </p>

          <div className="w-full pt-2 border-t border-[var(--color-borde-suave)]">
            <span className="text-xs font-black text-[var(--color-texto-muted)] group-hover:text-[var(--color-texto)] transition-colors">
              Ir al panel manual →
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
