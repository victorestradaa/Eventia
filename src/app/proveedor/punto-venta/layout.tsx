import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { Home } from 'lucide-react';

export const dynamic = 'force-dynamic';

const TABS = [
  { href: '/proveedor/punto-venta', label: 'Menú', icon: Home },
];

export default async function PuntoVentaLayout({ children }: { children: React.ReactNode }) {
  const profileRes = await getCurrentProfile();
  if (!profileRes.success || !profileRes.data) redirect('/login');

  const perfil = profileRes.data;
  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) redirect('/cliente/dashboard');

  return (
    <div className="space-y-6">
      {/* Header del módulo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-black text-[#d4af37]">
            Módulo nuevo
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-1">Punto de Venta Emprendedor</h1>
          <p className="text-sm text-[var(--color-texto-suave)] mt-1">
            Vende productos, gestiona pedidos y lleva tu corte de caja desde un solo lugar.
          </p>
        </div>
      </div>

      {/* Tabs de navegación */}
      <nav className="flex gap-2 overflow-x-auto pb-2 border-b border-[var(--color-borde-suave)] no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)] hover:text-[var(--color-texto)] transition-colors"
            >
              <Icon size={16} />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Contenido del tab */}
      <div>{children}</div>
    </div>
  );
}
