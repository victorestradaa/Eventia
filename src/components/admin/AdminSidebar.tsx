'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart2, 
  Users, 
  Calendar, 
  DollarSign, 
  Settings, 
  FolderTree, 
  LogOut, 
  X 
} from 'lucide-react';
import { cerrarSesion } from '@/lib/actions/authActions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import Logo from '@/components/common/Logo';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { href: '/admin/dashboard',     label: 'Dashboard',             icon: BarChart2 },
  { href: '/admin/usuarios',      label: 'Usuarios',              icon: Users },
  { href: '/admin/eventos',       label: 'Eventos',               icon: Calendar },
  { href: '/admin/reportes',      label: 'Reportes',              icon: DollarSign },
  { href: '/admin/catalogo',      label: 'Catálogo Invitaciones', icon: FolderTree },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[38] md:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "sidebar !z-[50]",
        isOpen && "abierto"
      )}>
        <div className="sidebar-logo pt-2 text-center relative px-2">
          {/* Botón cerrar para móvil */}
          <button 
            onClick={onClose}
            className="md:hidden absolute -right-2 top-2 p-2 text-[var(--color-texto-muted)] hover:text-white"
          >
            <X size={20} />
          </button>

          <Logo width={280} height={90} className="w-full h-20" />
          <p className="text-[10px] text-[var(--color-texto-muted)] uppercase tracking-widest font-black mt-2">
            Panel Central
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
                    onClick={onClose}
                    className={cn(
                      "sidebar-item relative",
                      activo && "activo"
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto px-3 border-t border-[var(--color-borde-suave)] pt-4 pb-2 space-y-1">
          <div className="px-2 py-2">
             <ThemeToggle className="w-full justify-start" />
          </div>
          <Link 
            href="/admin/configuracion" 
            onClick={onClose}
            className={cn("sidebar-item mb-1", pathname === '/admin/configuracion' && "activo")}
          >
            <Settings size={18} />
            Configuración
          </Link>
          <form action={cerrarSesion}>
            <button type="submit" className="w-full text-left sidebar-item text-red-500 hover:bg-red-500/10 transition-colors">
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
