'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Calendar, Wallet, Mail, User, Menu, X, ChevronDown, Check, Star, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cerrarSesion } from '@/lib/actions/authActions';

interface ClientLayoutContentProps {
  children: React.ReactNode;
  initialEventos: any[];
  perfil: any;
}

export default function ClientLayoutContent({ children, initialEventos, perfil }: ClientLayoutContentProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEventSelectorOpen, setIsEventSelectorOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // En un sistema real usaríamos un context o un cookie para persistir esto
  const [activeEventId, setActiveEventId] = useState(initialEventos.length > 0 ? initialEventos[0].id : null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const eventosArray = Array.isArray(initialEventos) ? initialEventos : [];
  const activeEvent = eventosArray.find(e => e.id === activeEventId) || eventosArray[0] || null;

  const NAV_ITEMS = [
    { href: '/cliente/dashboard', label: 'Mis Eventos', icon: Calendar },
    { href: '/cliente/explorar', label: 'Explorar', icon: Search },
    { href: activeEvent?.id ? `/cliente/evento/${activeEvent.id}` : '/cliente/dashboard', label: 'Presupuesto', icon: Wallet },
    { href: '/cliente/invitaciones', label: 'Invitaciones', icon: Mail },
    { href: '/cliente/planes', label: 'Mi Plan', icon: Star },
  ];

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEventSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    
    try {
      // 1. Client-side sign out (clears local state and some cookies)
      const { createClient } = await import('@/lib/supabase/cliente');
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // 2. Server-side sign out (clears server-only cookies and revalidates)
      await cerrarSesion();
      
      // 3. Fallback redirect if server action didn't trigger it
      window.location.href = '/login';
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-fondo)]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[var(--color-fondo-card)]/80 backdrop-blur-md border-b border-[var(--color-borde-suave)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Eventia Logo" width={240} height={80} className="w-auto h-16 object-contain" priority />
            </Link>
            
            {/* Context Indicator (Active Event Selector) */}
            {initialEventos.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <div 
                  onClick={() => setIsEventSelectorOpen(!isEventSelectorOpen)}
                   className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-[10px] font-bold cursor-pointer hover:border-[var(--color-primario-claro)]/40 transition-all group"
                >
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                   <span className="text-[var(--color-texto-muted)] uppercase tracking-wider">Gestionando:</span>
                   <span className="text-[var(--color-texto)] font-black">{activeEvent?.nombre}</span>
                   <ChevronDown size={14} className={cn("text-[var(--color-primario-claro)] transition-transform", isEventSelectorOpen && "rotate-180")} />
                </div>

                {/* Dropdown Menu */}
                {isEventSelectorOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl shadow-2xl p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                    <p className="px-3 py-2 text-[10px] font-black uppercase text-[var(--color-texto-muted)] border-b border-white/5 mb-1">Cambiar Evento</p>
                    <div className="max-h-60 overflow-y-auto scrollbar-style px-1">
                      {initialEventos.map((evt) => (
                        <button
                          key={evt.id}
                          onClick={() => {
                            setActiveEventId(evt.id);
                            setIsEventSelectorOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left mb-1",
                            activeEventId === evt.id ? "bg-[var(--color-primario)]/20 text-white" : "hover:bg-white/5 text-[var(--color-texto-suave)]"
                          )}
                        >
                          <div>
                            <p className="text-sm font-bold truncate max-w-[160px]">{evt.nombre}</p>
                            <p className="text-[10px] opacity-40">
                              {evt.fecha ? new Date(evt.fecha).toLocaleDateString() : 'Sin fecha'}
                            </p>
                          </div>
                          {activeEventId === evt.id && <Check size={16} className="text-[var(--color-primario-claro)]" />}
                        </button>
                      ))}
                    </div>
                    <Link 
                      href="/cliente/dashboard" 
                      onClick={() => setIsEventSelectorOpen(false)}
                      className="block w-full mt-2 p-2 text-center text-[10px] font-black uppercase text-[var(--color-primario-claro)] hover:bg-[var(--color-primario)]/10 rounded-xl transition-all"
                    >
                      Gestionar lista completa
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[var(--color-primario-claro)]",
                  pathname === item.href ? "text-[var(--color-primario-claro)] font-bold underline underline-offset-8" : "text-[var(--color-texto-suave)]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link 
              href="/cliente/perfil"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-[var(--color-texto-suave)] hover:text-[var(--color-texto)] transition-colors"
            >
              <User size={18} />
              <span className="max-w-[120px] truncate">{perfil.nombre}</span>
            </Link>
            
            <button 
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Cerrar sesión"
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-[var(--color-texto-suave)] hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <LogOut size={18} />
            </button>

            
            <button 
              className="md:hidden text-[var(--color-texto)]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - z-60 para estar sobre el header z-50 */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[var(--color-fondo)] pt-20 px-6 md:hidden animate-in fade-in slide-in-from-right duration-300 overflow-y-auto">
          <nav className="flex flex-col gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 text-xl font-bold text-[var(--color-texto)]"
              >
                <item.icon className="text-[var(--color-primario-claro)]" />
                {item.label}
              </Link>
            ))}
            <hr className="border-[var(--color-borde-suave)] my-2" />
            <Link href="/cliente/perfil" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-xl font-bold text-[var(--color-texto)]">
              <User className="text-[var(--color-primario-claro)]" />
              Mi Perfil
            </Link>
            <Link 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className={cn(
                "flex items-center gap-4 text-xl font-bold transition-colors mt-2 select-none",
                isLoggingOut ? "text-[var(--color-texto-muted)] opacity-50 pointer-events-none" : "text-red-500 hover:text-red-600 cursor-pointer"
              )}
            >
              <LogOut className={cn(isLoggingOut ? "text-[var(--color-texto-muted)]" : "text-red-500", "pointer-events-none")} />
              <span className="pointer-events-none">
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </span>
            </Link>
          </nav>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
