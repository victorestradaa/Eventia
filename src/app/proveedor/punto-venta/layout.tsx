import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { LogOut, Store } from 'lucide-react';
import Logo from '@/components/common/Logo';

export const dynamic = 'force-dynamic';

export default async function PuntoVentaLayout({ children }: { children: React.ReactNode }) {
  const profileRes = await getCurrentProfile();
  if (!profileRes.success || !profileRes.data) redirect('/login');

  const perfil = profileRes.data;
  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) redirect('/cliente/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-fondo)]">
      {/* Top bar: identidad + SALIR */}
      <header className="sticky top-0 z-40 bg-[var(--color-fondo-card)]/95 backdrop-blur-md border-b border-[var(--color-borde-suave)]">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link
            href="/proveedor/punto-venta"
            className="inline-flex items-center gap-3 group"
            aria-label="Inicio Punto de Venta"
          >
            <span className="hidden sm:block">
              <Logo width={120} height={32} />
            </span>
            <span className="sm:hidden w-8 h-8 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center">
              <Store size={16} />
            </span>
            <span className="hidden md:inline-flex items-center gap-2 pl-3 ml-1 border-l border-[var(--color-borde-suave)]">
              <Store size={14} className="text-[#d4af37]" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-suave)]">
                Punto de Venta
              </span>
            </span>
          </Link>

          <Link
            href="/proveedor/dashboard"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-xs font-black uppercase tracking-widest hover:bg-[var(--color-fondo-hover)] hover:border-[#d4af37]/40 transition-colors"
          >
            <LogOut size={14} />
            Salir
          </Link>
        </div>
      </header>

      {/* Contenido — sin max-width para aprovechar toda la pantalla */}
      <main className="flex-1 px-4 sm:px-6 py-6 w-full">
        {children}
      </main>
    </div>
  );
}
