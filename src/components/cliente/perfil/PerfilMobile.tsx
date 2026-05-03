'use client';

import {
  User,
  Camera,
  Edit,
  Calendar,
  Heart,
  Wallet,
  Star,
  Settings,
  CreditCard,
  ChevronRight,
  LogOut,
  Loader2,
  ListTodo,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import {
  MobilePageShell,
  MobileSection,
  MobileCard,
  MobileEmpty,
} from '@/components/cliente/mobile/primitives';
import { cn } from '@/lib/utils';

interface Props {
  perfil: any;
  user: { nombre: string; email: string; avatar: string; miembroDesde: string; eventos: number; favoritos: number; pagoPendiente: number };
  uploading: boolean;
  isLoggingOut: boolean;
  onPickAvatar: () => void;
  onEditProfile: () => void;
  onOpenMyData: () => void;
  onOpenSecurity: () => void;
  onLogout: () => void;
}

interface RowItem {
  icon: LucideIcon;
  label: string;
  sub?: string;
  onClick?: () => void;
  href?: string;
  trailing?: React.ReactNode;
}

export default function PerfilMobile({
  perfil,
  user,
  uploading,
  isLoggingOut,
  onPickAvatar,
  onEditProfile,
  onOpenMyData,
  onOpenSecurity,
  onLogout,
}: Props) {
  const stats = [
    { label: 'Eventos', value: user.eventos, icon: Calendar, color: 'bg-blue-50 text-blue-700' },
    { label: 'Favoritos', value: user.favoritos, icon: Heart, color: 'bg-rose-50 text-rose-700' },
    { label: 'Saldo', value: `$${user.pagoPendiente.toLocaleString()}`, icon: Wallet, color: 'bg-amber-50 text-amber-700' },
    { label: 'Reseñas', value: 0, icon: Star, color: 'bg-emerald-50 text-emerald-700' },
  ];

  const gestion: RowItem[] = [
    { icon: User, label: 'Mis datos', sub: 'Nombre, correo, ubicación', onClick: onOpenMyData },
    { icon: CreditCard, label: 'Métodos de pago', sub: 'Tarjetas y cuentas', href: '#' },
    { icon: Settings, label: 'Seguridad y privacidad', sub: 'Contraseña y sesión', onClick: onOpenSecurity },
  ];

  const accesos: RowItem[] = [
    { icon: ListTodo, label: 'Historial de eventos', sub: 'Eventos archivados', href: '/cliente/historial' },
    { icon: Star, label: 'Mi plan', sub: `Plan ${perfil.cliente?.plan || 'FREE'}`, href: '/cliente/planes' },
  ];

  return (
    <MobilePageShell>
      {/* Avatar + nombre */}
      <MobileCard className="p-5 mb-5 flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full bg-[var(--color-fondo-hover)] overflow-hidden flex items-center justify-center text-[var(--color-texto-suave)]">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={28} />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={18} />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onPickAvatar}
            aria-label="Cambiar avatar"
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--color-primario)] text-white flex items-center justify-center shadow-sm border-2 border-white active:scale-90 transition-transform"
          >
            <Camera size={13} />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-semibold text-[var(--color-texto)] truncate">{user.nombre}</p>
          <p className="text-[12px] text-[var(--color-texto-suave)] truncate">{user.email}</p>
          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
            Plan {perfil.cliente?.plan || 'FREE'}
          </span>
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          aria-label="Editar perfil"
          className="w-9 h-9 rounded-full bg-[var(--color-fondo-hover)] text-[var(--color-texto)] flex items-center justify-center active:scale-95 transition-transform shrink-0"
        >
          <Edit size={16} />
        </button>
      </MobileCard>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {stats.map((s) => (
          <div key={s.label} className={cn('rounded-2xl p-3 flex flex-col items-center justify-center', s.color)}>
            <s.icon size={16} className="mb-1" />
            <p className="text-[14px] font-bold leading-none tabular-nums">{s.value}</p>
            <p className="text-[9px] font-semibold uppercase tracking-wider mt-1 opacity-90">{s.label}</p>
          </div>
        ))}
      </div>

      <MobileSection title="Gestión de perfil">
        <SettingsList items={gestion} />
      </MobileSection>

      <MobileSection title="Mi cuenta">
        <SettingsList items={accesos} />
      </MobileSection>

      <MobileSection>
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl shadow-sm flex items-center justify-center gap-2 py-3.5 text-[14px] font-semibold text-rose-600 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          {isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
      </MobileSection>

      <p className="text-center text-[11px] text-[var(--color-texto-muted)] mt-2">Miembro desde {user.miembroDesde}</p>
    </MobilePageShell>
  );
}

function SettingsList({ items }: { items: RowItem[] }) {
  return (
    <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl shadow-sm overflow-hidden divide-y divide-[var(--color-borde-suave)]">
      {items.map((item, idx) => {
        const inner = (
          <div className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-fondo-hover)] flex items-center justify-center text-[var(--color-texto)] shrink-0">
              <item.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[var(--color-texto)] truncate">{item.label}</p>
              {item.sub && <p className="text-[12px] text-[var(--color-texto-suave)] truncate">{item.sub}</p>}
            </div>
            {item.trailing || <ChevronRight size={16} className="text-[var(--color-texto-muted)]" />}
          </div>
        );
        if (item.href) {
          return (
            <Link key={idx} href={item.href} className="block">
              {inner}
            </Link>
          );
        }
        return (
          <button key={idx} type="button" onClick={item.onClick} className="block w-full text-left">
            {inner}
          </button>
        );
      })}
    </div>
  );
}
