import { Hammer } from 'lucide-react';

export function ComingSoon({
  titulo,
  descripcion,
  fase,
}: {
  titulo: string;
  descripcion: string;
  fase: number;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-10 md:p-14 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center mx-auto mb-5">
        <Hammer size={24} />
      </div>
      <p className="inline-block text-[10px] uppercase tracking-widest font-black text-[#d4af37] bg-[#d4af37]/10 px-3 py-1 rounded-full mb-3">
        Fase {fase} · próximamente
      </p>
      <h2 className="text-2xl font-black tracking-tight mb-3">{titulo}</h2>
      <p className="text-sm text-[var(--color-texto-suave)] max-w-lg mx-auto">{descripcion}</p>
    </div>
  );
}
