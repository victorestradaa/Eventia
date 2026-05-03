'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * Primitivos visuales para la experiencia tipo app móvil del área cliente.
 * Usan las variables CSS del tema (--color-fondo, --color-texto, etc.) para
 * que el modo oscuro y el ivory premium de la landing apliquen correctamente.
 */

// ────────────────────────────────────────────────────────────────────────────
// MobilePageShell — fondo del tema + padding y safe-area; rompe el padding del <main>
// ────────────────────────────────────────────────────────────────────────────
export function MobilePageShell({
  children,
  className,
  withBottomNavSpacer = true,
}: {
  children: ReactNode;
  className?: string;
  /** Reserva ~80px al fondo para que la tab bar inferior no tape contenido */
  withBottomNavSpacer?: boolean;
}) {
  return (
    <div
      className={cn(
        'block md:hidden bg-[var(--color-fondo)] -mx-6 -my-6 px-5 pt-4',
        withBottomNavSpacer ? 'pb-[calc(80px+env(safe-area-inset-bottom))]' : 'pb-6',
        'min-h-[calc(100vh-4rem)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// MobileTopBar — encabezado tipo iOS: back + título + acción opcional
// ────────────────────────────────────────────────────────────────────────────
export function MobileTopBar({
  title,
  backHref,
  onBack,
  rightSlot,
  subtitle,
}: {
  title: string;
  backHref?: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
  subtitle?: string;
}) {
  const router = useRouter();
  const handleBack = () => {
    if (onBack) return onBack();
    if (backHref) return router.push(backHref);
    router.back();
  };

  return (
    <div className="flex items-center gap-3 mb-4 -mt-1">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Atrás"
        className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-[var(--color-texto)] active:scale-95 active:bg-[var(--color-fondo-hover)] transition-all"
      >
        <ArrowLeft size={22} />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-[17px] font-semibold text-[var(--color-texto)] truncate leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--color-texto-muted)] truncate">{subtitle}</p>}
      </div>
      {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// MobileSection — título de sección estilo iOS (uppercase tenue)
// ────────────────────────────────────────────────────────────────────────────
export function MobileSection({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('mb-6', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-2 px-1">
          {title && (
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-texto-muted)]">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// MobileCard — tarjeta del color-fondo-card con borde suave y sombra ligera
// ────────────────────────────────────────────────────────────────────────────
export function MobileCard({
  children,
  className,
  as = 'div',
  href,
  onClick,
  interactive,
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'button';
  href?: string;
  onClick?: () => void;
  /** Aplica feedback táctil active:scale */
  interactive?: boolean;
}) {
  const baseClasses = cn(
    'bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl shadow-[var(--sombra-card)]',
    (interactive || href || onClick) && 'active:scale-[0.98] transition-all duration-150',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cn('block', baseClasses)} onClick={onClick}>
        {children}
      </Link>
    );
  }
  if (as === 'button') {
    return (
      <button type="button" onClick={onClick} className={cn('text-left w-full', baseClasses)}>
        {children}
      </button>
    );
  }
  return <div className={baseClasses} onClick={onClick}>{children}</div>;
}

// ────────────────────────────────────────────────────────────────────────────
// MobileListRow — fila estilo iOS Settings (icono + label + chevron)
// ────────────────────────────────────────────────────────────────────────────
export function MobileListRow({
  icon: Icon,
  label,
  sublabel,
  trailing,
  href,
  onClick,
}: {
  icon?: LucideIcon;
  label: string;
  sublabel?: string;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <div className="flex items-center gap-3 px-4 py-3 active:bg-[var(--color-fondo-hover)] transition-colors">
      {Icon && (
        <div className="w-9 h-9 rounded-xl bg-[var(--color-fondo-hover)] flex items-center justify-center text-[var(--color-texto)] shrink-0">
          <Icon size={18} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-[var(--color-texto)] truncate">{label}</p>
        {sublabel && <p className="text-[12px] text-[var(--color-texto-muted)] truncate">{sublabel}</p>}
      </div>
      {trailing}
    </div>
  );

  if (href) return <Link href={href} className="block">{content}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className="block w-full text-left">{content}</button>;
  return content;
}

// ────────────────────────────────────────────────────────────────────────────
// MobileSegmentedTabs — chips horizontales con borde y feedback claro
// ────────────────────────────────────────────────────────────────────────────
export function MobileSegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('mb-4 -mx-5 px-5 overflow-x-auto no-scrollbar', className)}>
      <div className="inline-flex gap-2 min-w-max">
        {tabs.map((tab) => {
          const active = tab.key === value;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={cn(
                'px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap border active:scale-95',
                active
                  ? 'bg-[var(--color-primario)] text-white border-[var(--color-primario)] shadow-md'
                  : 'bg-[var(--color-fondo-card)] text-[var(--color-texto)] border-[var(--color-borde)] shadow-[var(--sombra-card)]',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// MobileEmpty — estado vacío con icono, título, descripción y CTA
// ────────────────────────────────────────────────────────────────────────────
export function MobileEmpty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl shadow-[var(--sombra-card)] p-8 text-center flex flex-col items-center gap-3">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-[var(--color-fondo-hover)] flex items-center justify-center text-[var(--color-texto-muted)]">
          <Icon size={26} />
        </div>
      )}
      <p className="font-semibold text-[var(--color-texto)] text-[15px]">{title}</p>
      {description && <p className="text-[13px] text-[var(--color-texto-suave)] max-w-[260px]">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
