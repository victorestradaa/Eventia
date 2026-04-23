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
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] md:hidden animate-in fade-in duration-500"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "sidebar z-[120] border-r border-[var(--color-borde-suave)] shadow-2xl transition-transform duration-500 ease-in-out",
        "bg-[var(--color-fondo-card)]", // Asegurar color de fondo sólido
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="sidebar-logo flex items-center justify-between py-8">
          <Link href="/admin/dashboard" className="text-2xl font-black tracking-tighter uppercase gradient-texto block px-2">
            Admin Panel
          </Link>
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-[var(--color-texto-muted)] hover:text-[var(--color-acento)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav px-4">
          <ul className="space-y-2">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const activo = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300",
                      activo 
                        ? "bg-gradient-to-r from-[var(--color-primario)]/20 to-[var(--color-acento)]/10 text-[var(--color-acento-claro)] border border-[var(--color-acento)]/20 shadow-lg shadow-[var(--color-acento)]/5" 
                        : "text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)] hover:text-[var(--color-texto)]"
                    )}
                  >
                    <Icon size={20} className={activo ? "text-[var(--color-acento)]" : "text-[var(--color-texto-muted)]"} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto p-6 border-t border-[var(--color-borde-suave)] space-y-4">
          <div className="bg-[var(--color-fondo-input)]/50 rounded-2xl p-2 border border-[var(--color-borde-suave)]">
             <ThemeToggle className="w-full justify-start py-3 px-4 hover:bg-[var(--color-fondo-hover)] rounded-xl transition-all" />
          </div>
          <form action={cerrarSesion}>
            <button 
              type="submit" 
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
