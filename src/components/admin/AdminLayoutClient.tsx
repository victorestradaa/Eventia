'use client';

import { useState, ReactNode } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMobileHeader from '@/components/admin/AdminMobileHeader';
import { ThemeToggle } from '@/components/ThemeToggle';

interface AdminLayoutClientProps {
  children: ReactNode;
  userName: string;
  userEmail: string;
  initial: string;
}

export default function AdminLayoutClient({ children, userName, userEmail, initial }: AdminLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row bg-[var(--color-fondo)] min-h-screen">
      <AdminMobileHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
      
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content */}
      <main className="main-con-sidebar w-full">
        {/* Header simple (Solo visible en desktop o como parte del layout principal) */}
        <header className="hidden md:flex justify-between items-center mb-10 pb-6 border-b border-[var(--color-borde-suave)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-texto-muted)] uppercase tracking-wider">
              Sistema de Gestión
            </h2>
            <p className="text-[var(--color-texto-suave)]">Panel Central de Control</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 mr-2">
               <ThemeToggle />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{userName}</p>
              <p className="text-xs text-[var(--color-texto-muted)]">{userEmail}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primario)] to-[var(--color-acento)] flex items-center justify-center font-bold text-white shadow-lg">
              {initial}
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
