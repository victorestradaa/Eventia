import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { LogOut, Store, Package, ShoppingCart, Users, LineChart, Wallet } from 'lucide-react';
import Logo from '@/components/common/Logo';

export const dynamic = 'force-dynamic';

type NavItem = { href: string; label: string; icon: typeof Package };

const NAV: NavItem[] = [
  { href: '/proveedor/punto-venta/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/proveedor/punto-venta/productos', label: 'Productos', icon: Package },
  { href: '/proveedor/punto-venta/clientes', label: 'Clientes', icon: Users },
  { href: '/proveedor/punto-venta/caja', label: 'Caja', icon: Wallet },
  { href: '/proveedor/punto-venta/reportes', label: 'Reportes', icon: LineChart },
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
        <div className="px-3 sm:px-5 h-14 flex items-center justify-between gap-2 sm:gap-3">
          {/* Branding */}
          <Link
            href="/proveedor/punto-venta"
            className="inline-flex items-center gap-2 sm:gap-3 shrink-0"
            aria-label="Inicio Punto de Venta"
          >
            <span className="hidden sm:block">
              <Logo width={100} height={28} />
            </span>
            <span className="sm:hidden w-8 h-8 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center">
              <Store size={16} />
            </span>
            <span className="hidden lg:inline-flex items-center gap-2 pl-3 ml-1 border-l border-[var(--color-borde-suave)]">
              <Store size={14} className="text-[#d4af37]" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-suave)]">
                Punto de Venta
              </span>
            </span>
          </Link>

          {/* Nav rápido — íconos para no robar espacio */}
          <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] font-bold text-[var(--color-texto-suave)] hover:text-[var(--color-texto)] hover:bg-[var(--color-fondo-hover)] transition-colors whitespace-nowrap"
                  title={item.label}
                >
                  <Icon size={14} />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Salir */}
          <Link
            href="/proveedor/dashboard"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-xs font-black uppercase tracking-widest hover:bg-[var(--color-fondo-hover)] hover:border-[#d4af37]/40 transition-colors shrink-0"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Salir</span>
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
