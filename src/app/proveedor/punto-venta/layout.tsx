import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { LogOut, Store, Package, ShoppingCart, Users, LineChart, Wallet } from 'lucide-react';
import Logo from '@/components/common/Logo';

export const dynamic = 'force-dynamic';

type NavItem = {
  href: string;
  label: string;
  icon: typeof Package;
  /** Tailwind classes para color de fondo/borde/icono — un acento distinto por módulo */
  accent: string;
};

const NAV: NavItem[] = [
  { href: '/proveedor/punto-venta/pedidos',   label: 'Pedidos',   icon: ShoppingCart, accent: 'bg-blue-500/15 text-blue-500 ring-blue-500/30' },
  { href: '/proveedor/punto-venta/productos', label: 'Productos', icon: Package,      accent: 'bg-amber-500/15 text-amber-500 ring-amber-500/30' },
  { href: '/proveedor/punto-venta/clientes',  label: 'Clientes',  icon: Users,        accent: 'bg-emerald-500/15 text-emerald-500 ring-emerald-500/30' },
  { href: '/proveedor/punto-venta/caja',      label: 'Caja',      icon: Wallet,       accent: 'bg-violet-500/15 text-violet-500 ring-violet-500/30' },
  { href: '/proveedor/punto-venta/reportes',  label: 'Reportes',  icon: LineChart,    accent: 'bg-cyan-500/15 text-cyan-500 ring-cyan-500/30' },
];

export default async function PuntoVentaLayout({ children }: { children: React.ReactNode }) {
  const profileRes = await getCurrentProfile();
  if (!profileRes.success || !profileRes.data) redirect('/login');

  const perfil = profileRes.data;
  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) redirect('/cliente/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-fondo)]">
      {/* Top bar: identidad + nav rápido + SALIR */}
      <header className="sticky top-0 z-40 bg-[var(--color-fondo-card)]/95 backdrop-blur-md border-b border-[var(--color-borde-suave)]">
        <div className="px-3 sm:px-5 h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Branding */}
          <Link
            href="/proveedor/punto-venta"
            className="inline-flex items-center gap-2 sm:gap-3 shrink-0"
            aria-label="Inicio Punto de Venta"
          >
            <span className="hidden sm:block">
              <Logo width={100} height={28} />
            </span>
            <span className="sm:hidden w-10 h-10 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center ring-1 ring-[#d4af37]/30">
              <Store size={20} />
            </span>
            <span className="hidden lg:inline-flex items-center gap-2 pl-3 ml-1 border-l border-[var(--color-borde-suave)]">
              <Store size={14} className="text-[#d4af37]" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-suave)]">
                Punto de Venta
              </span>
            </span>
          </Link>

          {/* Nav rápido — íconos grandes con color por módulo */}
          <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 w-11 h-11 md:w-auto md:h-auto md:px-3 md:py-2 rounded-xl ring-1 ${item.accent} hover:brightness-110 transition-all whitespace-nowrap shrink-0`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon size={20} className="md:w-[16px] md:h-[16px]" strokeWidth={2.2} />
                  <span className="hidden md:inline text-xs font-bold">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Salir */}
          <Link
            href="/proveedor/dashboard"
            className="inline-flex items-center justify-center gap-2 w-11 h-11 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-xl bg-rose-500/15 text-rose-500 ring-1 ring-rose-500/30 hover:brightness-110 transition-all shrink-0"
            aria-label="Salir"
            title="Salir"
          >
            <LogOut size={20} className="sm:w-[14px] sm:h-[14px]" strokeWidth={2.2} />
            <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Salir</span>
          </Link>
        </div>
      </header>

      {/* Contenido — sin max-width para aprovechar toda la pantalla */}
      <main className="flex-1 px-3 sm:px-5 py-4 w-full">
        {children}
      </main>
    </div>
  );
}
