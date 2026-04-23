'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, X, BarChart2, Users, Calendar, TrendingUp, Settings, FolderTree } from 'lucide-react';
import { cerrarSesion } from '@/lib/actions/authActions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart2 },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/eventos', label: 'Eventos', icon: Calendar },
  { href: '/admin/reportes', label: 'Reportes', icon: TrendingUp },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
  { href: '/admin/catalogo', label: 'Catálogo Invitaciones', icon: FolderTree },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] md:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "sidebar z-[120]",
        isOpen && "abierto"
      )}>
        <div className="sidebar-logo flex items-center justify-between">
          <Link href="/admin/dashboard" className="text-2xl font-bold gradient-texto">
            Admin Panel
          </Link>
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-[var(--color-texto-muted)] hover:text-white"
          >
            <X size={20} />
          </button>
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
                      "sidebar-item",
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

        <div className="mt-auto p-4 border-t border-[var(--color-borde-suave)] space-y-2">
          <div className="px-2 pb-1">
             <ThemeToggle className="w-full justify-start py-3" />
          </div>
          <form action={cerrarSesion}>
            <button type="submit" className="sidebar-item w-full text-left text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
