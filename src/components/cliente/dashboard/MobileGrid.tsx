'use client';

import Link from 'next/link';
import { Store, Wallet, Users, Mail, QrCode, PartyPopper, type LucideIcon } from 'lucide-react';

interface MobileGridProps {
  eventoId?: string | null;
  /** Se invoca cuando el usuario toca una tarjeta que requiere evento pero aún no existe (lanza el wizard). */
  onCreateEvent?: () => void;
}

interface Tarjeta {
  label: string;
  icon: LucideIcon;
  href: string;
  /** Si es true, esta tarjeta requiere un evento existente; sin evento dispara `onCreateEvent` */
  requiresEvento: boolean;
}

export default function MobileGrid({ eventoId, onCreateEvent }: MobileGridProps) {
  const eventoBase = eventoId ? `/cliente/evento/${eventoId}` : '/cliente/dashboard';
  const hrefTab = (tab: string) => (eventoId ? `${eventoBase}?tab=${tab}` : '/cliente/dashboard');

  const tarjetas: Tarjeta[] = [
    { label: 'Mi Evento',     icon: PartyPopper, href: hrefTab('resumen'),                           requiresEvento: true  },
    { label: 'Mi Presupuesto',icon: Wallet,      href: hrefTab('pagos'),                             requiresEvento: true  },
    { label: 'Proveedores',   icon: Store,       href: '/cliente/explorar',                          requiresEvento: false },
    { label: 'Invitaciones',  icon: Mail,        href: '/cliente/invitaciones',                      requiresEvento: false },
    { label: 'Invitados',     icon: Users,       href: hrefTab('invitados'),                         requiresEvento: true  },
    { label: 'Álbum Digital', icon: QrCode,      href: eventoId ? `${eventoBase}/album` : '#',       requiresEvento: true  },
  ];

  return (
    <div className="block md:hidden bg-[var(--color-fondo)] -mx-6 -my-6 px-5 py-6 min-h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-2 gap-4">
        {tarjetas.map(({ label, icon: Icon, href, requiresEvento }) => {
          const sinEvento = requiresEvento && !eventoId;
          const className =
            'flex flex-col items-center justify-center aspect-square bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl shadow-[var(--sombra-card)] text-[var(--color-texto)] active:scale-95 transition-all duration-200';

          // Sin evento: las tarjetas que requieren evento abren el wizard de creación
          if (sinEvento) {
            return (
              <button
                key={label}
                type="button"
                onClick={onCreateEvent}
                className={className}
              >
                <Icon size={32} strokeWidth={1.75} className="mb-2" />
                <span className="text-[15px] font-medium">{label}</span>
              </button>
            );
          }

          return (
            <Link key={label} href={href} className={className}>
              <Icon size={32} strokeWidth={1.75} className="mb-2" />
              <span className="text-[15px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
