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
      {/* Overlay para móvil con z-index alto */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999] md:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar con z-index más alto que el overlay */}
      <aside className={cn(
        "fixed top-0 left-0 h-screen w-[280px] bg-[#0f111a] border-r border-white/5 z-[1000] flex flex-col transition-transform duration-500 ease-in-out shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between p-6 mb-2">
          <Link href="/admin/dashboard" className="text-2xl font-black tracking-widest text-[#d4af37] uppercase italic">
            ADMIN
          </Link>
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-white/50 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-4 py-2">
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
                      "flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group",
                      activo 
                        ? "bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 translate-x-1" 
                        : "text-white/60 hover:bg-white/5 hover:text-white hover:translate-x-1"
                    )}
                  >
                    <Icon size={20} className={activo ? "text-black" : "text-[#d4af37] group-hover:text-white"} />
                    <span className="tracking-wide">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="bg-white/5 rounded-2xl p-2 border border-white/5">
             <ThemeToggle className="w-full justify-start py-3 px-4 text-white hover:bg-white/5 rounded-xl transition-all font-bold text-sm" />
          </div>
          <form action={cerrarSesion}>
            <button 
              type="submit" 
              className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
