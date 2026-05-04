'use client';

import Link from 'next/link';
import { Store, Wallet, Users, Mail, QrCode, PartyPopper, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileGridProps {
  eventoId?: string | null;
  /** Se invoca cuando el usuario toca una tarjeta que requiere evento pero aún no existe (lanza el wizard). */
  onCreateEvent?: () => void;
}

type TileTone = 'gold' | 'navy' | 'emerald' | 'rose' | 'sky' | 'violet';

interface Tarjeta {
  label: string;
  icon: LucideIcon;
  href: string;
  requiresEvento: boolean;
  /** Tono de marca para esta tarjeta */
  tone: TileTone;
}

// Mapa de tonos coordinados con la marca (oro y azul marino + 4 acentos cálidos)
const TONES: Record<TileTone, { bg: string; iconBg: string; iconColor: string; border: string }> = {
  gold:    { bg: 'bg-gradient-to-br from-[#fdf6e1] to-[#f4e4b9]', iconBg: 'bg-[#d4af37]',          iconColor: 'text-white',           border: 'border-[#d4af37]/30' },
  navy:    { bg: 'bg-gradient-to-br from-[#f5f6fb] to-[#e5e9f5]', iconBg: 'bg-[#1F2937]',          iconColor: 'text-[#d4af37]',       border: 'border-[#1F2937]/15' },
  emerald: { bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/60', iconBg: 'bg-emerald-500',  iconColor: 'text-white',           border: 'border-emerald-200/60' },
  rose:    { bg: 'bg-gradient-to-br from-rose-50 to-rose-100/60', iconBg: 'bg-rose-500',           iconColor: 'text-white',           border: 'border-rose-200/60' },
  sky:     { bg: 'bg-gradient-to-br from-sky-50 to-sky-100/60', iconBg: 'bg-sky-500',              iconColor: 'text-white',           border: 'border-sky-200/60' },
  violet:  { bg: 'bg-gradient-to-br from-violet-50 to-violet-100/60', iconBg: 'bg-violet-500',     iconColor: 'text-white',           border: 'border-violet-200/60' },
};

export default function MobileGrid({ eventoId, onCreateEvent }: MobileGridProps) {
  const eventoBase = eventoId ? `/cliente/evento/${eventoId}` : '/cliente/dashboard';
  const hrefTab = (tab: string) => (eventoId ? `${eventoBase}?tab=${tab}` : '/cliente/dashboard');

  const tarjetas: Tarjeta[] = [
    { label: 'Mi Evento',      icon: PartyPopper, href: hrefTab('resumen'),                          requiresEvento: true,  tone: 'gold' },
    { label: 'Mi Presupuesto', icon: Wallet,      href: hrefTab('pagos'),                            requiresEvento: true,  tone: 'emerald' },
    { label: 'Proveedores',    icon: Store,       href: '/cliente/explorar',                         requiresEvento: false, tone: 'navy' },
    { label: 'Invitaciones',   icon: Mail,        href: '/cliente/invitaciones',                     requiresEvento: false, tone: 'sky' },
    { label: 'Invitados',      icon: Users,       href: hrefTab('invitados'),                        requiresEvento: true,  tone: 'rose' },
    { label: 'Álbum Digital',  icon: QrCode,      href: eventoId ? `${eventoBase}/album` : '#',      requiresEvento: true,  tone: 'violet' },
  ];

  return (
    <div
      className="block md:hidden -mx-6 -my-6 px-5 py-6 min-h-[calc(100vh-4rem)]"
      style={{
        background:
          'radial-gradient(circle at 20% 0%, rgba(212,175,55,0.10) 0%, transparent 45%), radial-gradient(circle at 100% 100%, rgba(31,41,55,0.06) 0%, transparent 45%), var(--color-fondo)',
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        {tarjetas.map(({ label, icon: Icon, href, requiresEvento, tone }) => {
          const sinEvento = requiresEvento && !eventoId;
          const t = TONES[tone];

          const className = cn(
            'flex flex-col items-center justify-center aspect-square rounded-2xl shadow-[var(--sombra-card)] text-[var(--color-texto)] active:scale-95 transition-all duration-200 border',
            t.bg,
            t.border,
          );

          const inner = (
            <>
              <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md', t.iconBg)}>
                <Icon size={28} strokeWidth={1.9} className={t.iconColor} />
              </div>
              <span className="text-[15px] font-semibold text-[var(--color-texto)] text-center px-2">{label}</span>
            </>
          );

          if (sinEvento) {
            return (
              <button key={label} type="button" onClick={onCreateEvent} className={className}>
                {inner}
              </button>
            );
          }

          return (
            <Link key={label} href={href} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
