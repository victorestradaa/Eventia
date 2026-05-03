'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Users, User, PartyPopper, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomTab {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Patrón para considerar la pestaña activa (prefijo de pathname) */
  match: (path: string) => boolean;
}

interface MobileBottomNavProps {
  /** Si está disponible, "Invitados" lleva al detalle del evento activo en su pestaña de invitados */
  activeEventId?: string | null;
}

export default function MobileBottomNav({ activeEventId }: MobileBottomNavProps) {
  const pathname = usePathname() || '';

  const eventoHref = activeEventId
    ? `/cliente/evento/${activeEventId}?tab=resumen`
    : '/cliente/dashboard';
  const invitadosHref = activeEventId
    ? `/cliente/evento/${activeEventId}?tab=invitados`
    : '/cliente/dashboard';

  const TABS: BottomTab[] = [
    {
      href: '/cliente/dashboard',
      label: 'Inicio',
      icon: Home,
      match: (p) => p === '/cliente/dashboard',
    },
    {
      href: '/cliente/explorar',
      label: 'Explorar',
      icon: Search,
      match: (p) => p.startsWith('/cliente/explorar') || p.startsWith('/cliente/proveedor'),
    },
    {
      href: eventoHref,
      label: 'Mi evento',
      icon: PartyPopper,
      // Activa cuando el usuario está dentro del detalle del evento
      match: (p) => p.startsWith('/cliente/evento/'),
    },
    {
      href: invitadosHref,
      label: 'Invitados',
      icon: Users,
      // Solo se activa en la página legacy /cliente/invitaciones
      match: (p) => p.startsWith('/cliente/invitaciones'),
    },
    {
      href: '/cliente/perfil',
      label: 'Perfil',
      icon: User,
      match: (p) =>
        p.startsWith('/cliente/perfil') ||
        p.startsWith('/cliente/planes') ||
        p.startsWith('/cliente/historial'),
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Navegación principal"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-fondo-card)]/95 backdrop-blur-md border-t border-[var(--color-borde-suave)] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex w-full" style={{ listStyle: 'none' }}>
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={label} className="flex-1 min-w-0">
              <Link
                href={href}
                className={cn(
                  'w-full flex flex-col items-center justify-center gap-0.5 py-2.5 active:scale-95 transition-all',
                  active ? 'text-[var(--color-acento-claro)]' : 'text-[var(--color-texto-muted)]',
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                <span className={cn('text-[10px] leading-tight tracking-tight whitespace-nowrap', active ? 'font-semibold' : 'font-medium')}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
