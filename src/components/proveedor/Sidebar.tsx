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
  DollarSign,
  X,
  Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPendingTasksCount } from '@/lib/actions/providerActions';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

import { cerrarSesion } from '@/lib/actions/authActions';
import Logo from '@/components/common/Logo';

const MENU_ITEMS = [
  { href: '/proveedor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/proveedor/calendario', label: 'Calendario', icon: Calendar },
  { href: '/proveedor/catalogo', label: 'Catálogo', icon: Package },
  { href: '/proveedor/ventas', label: 'Ventas', icon: TrendingUp },
  { href: '/proveedor/planes', label: 'Mi Plan', icon: DollarSign },
];

interface ProviderSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ProviderSidebar({ isOpen, onClose }: ProviderSidebarProps) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      const profile = await getCurrentProfile();
      if (profile.success && profile.data?.proveedor) {
        const res = await getPendingTasksCount(profile.data.proveedor.id);
        if (res.success) setPendingCount(res.data);
      }
    };
    loadCount();
    
    // Opcional: Podrías poner un intervalo aquí si quieres "pseudo-push"
    const interval = setInterval(loadCount, 60000); // Cada minuto
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside className={cn("sidebar", isOpen && "abierto")}>
        <div className="sidebar-logo pt-2 text-center relative">
          {/* Botón cerrar para móvil */}
          <button 
            onClick={onClose}
            className="md:hidden absolute -right-2 top-2 p-2 text-[var(--color-texto-muted)] hover:text-white"
          >
            <X size={20} />
          </button>

          <Logo width={280} height={90} className="w-full h-20" />
          <p className="text-[10px] text-[var(--color-texto-muted)] uppercase tracking-widest font-bold mt-2">
            Panel Proveedor
          </p>
        </div>

        <nav className="sidebar-nav">
          <ul className="space-y-1">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const activo = pathname === item.href;
              const hasBadge = item.label === 'Ventas' && pendingCount > 0;
              
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "sidebar-item relative",
                      activo && "activo"
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                    
                    {hasBadge && (
                      <span className="absolute right-4 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse border-2 border-[#121212]">
                        {pendingCount}
                      </span>
                    )}
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
          <Link 
            href="/proveedor/configuracion" 
            onClick={onClose}
            className="sidebar-item mb-1"
          >
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
    </>
  );
}
