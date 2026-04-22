"use client";

import Logo from '@/components/common/Logo';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

export default function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-[var(--color-fondo-card)]/80 backdrop-blur-md border-b border-[var(--color-borde-suave)] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-[var(--color-texto)] hover:bg-[var(--color-fondo-input)] rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        <Logo width={120} height={40} className="w-auto h-8 object-contain" />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="w-8 h-8 rounded-full bg-[var(--color-primario)]/10 flex items-center justify-center text-[var(--color-primario-claro)] text-xs font-black border border-[var(--color-borde-suave)]">
          P
        </div>
      </div>
    </header>
  );
}
