"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  TrendingUp, 
  Settings, 
  LogOut,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

import { cerrarSesion } from '@/lib/actions/authActions';

const MENU_ITEMS = [
  { href: '/proveedor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/proveedor/calendario', label: 'Calendario', icon: Calendar },
  { href: '/proveedor/catalogo', label: 'Catálogo', icon: Package },
  { href: '/proveedor/ventas', label: 'Ventas', icon: TrendingUp },
  { href: '/proveedor/planes', label: 'Mi Plan', icon: DollarSign },
];

export default function ProviderSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo pt-2 text-center">
        <Image src="/logo.png" alt="Eventia Logo" width={280} height={90} className="w-auto h-20 mx-auto object-contain" priority />
        <p className="text-[10px] text-[var(--color-texto-muted)] uppercase tracking-widest font-bold mt-2">
          Panel Proveedor
        </p>
      </div>

      <nav className="sidebar-nav">
        <ul className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const activo = pathname === item.href;
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={cn(
                    "sidebar-item",
                    activo && "activo"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-auto px-3 border-t border-[var(--color-borde-suave)] pt-4 pb-2 space-y-1">
        <div className="px-2 py-2">
          <ThemeToggle className="w-full justify-start" />
        </div>
        <Link href="/proveedor/configuracion" className="sidebar-item mb-1">
          <Settings size={18} />
          Configuración
        </Link>
        <form action={cerrarSesion}>
          <button type="submit" className="w-full text-left sidebar-item text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
