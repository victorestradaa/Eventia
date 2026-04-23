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
        "fixed top-0 left-0 h-screen w-[310px] bg-[#0c0d16] border-r border-white/5 z-[1000] flex flex-col transition-transform duration-500 ease-in-out shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between p-8 mb-4 border-b border-white/5">
          <Link href="/admin/dashboard" className="text-3xl font-black tracking-[0.2em] text-[#d4af37] uppercase italic drop-shadow-md">
            ADMIN
          </Link>
          <button 
            onClick={onClose}
            className="md:hidden p-3 bg-white/5 rounded-full text-white/50 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
        </div>
        
        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="space-y-4">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const activo = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-6 px-6 py-5 rounded-[2rem] text-base md:text-lg font-bold transition-all duration-300 group",
                      activo 
                        ? "bg-gradient-to-r from-[#d4af37] to-[#b89547] text-black shadow-xl shadow-[#d4af37]/20 translate-x-2" 
                        : "text-white/70 hover:bg-white/5 hover:text-white hover:translate-x-2"
                    )}
                  >
                    <Icon size={26} className={activo ? "text-black" : "text-[#d4af37] group-hover:text-white"} />
                    <span className="tracking-wide">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-8 border-t border-white/5 space-y-6">
          <div className="bg-white/5 rounded-3xl p-2 border border-white/5">
             <ThemeToggle className="w-full justify-start py-4 px-6 text-white hover:bg-white/5 rounded-2xl transition-all font-bold text-base" />
          </div>
          <form action={cerrarSesion}>
            <button 
              type="submit" 
              className="flex items-center gap-6 w-full px-6 py-5 rounded-[2rem] text-base font-bold text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut size={26} />
              <span className="tracking-wide">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
