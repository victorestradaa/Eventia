'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';

interface AdminMobileHeaderProps {
  onOpenSidebar: () => void;
}

export default function AdminMobileHeader({ onOpenSidebar }: AdminMobileHeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-[100] bg-[var(--color-fondo-card)] border-b border-[var(--color-borde-suave)] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-[var(--color-texto)] hover:bg-[var(--color-fondo-input)] rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        <Link href="/admin/dashboard" className="text-xl font-black italic tracking-tighter uppercase gradient-texto">
          Admin Panel
        </Link>
      </div>
    </header>
  );
}
