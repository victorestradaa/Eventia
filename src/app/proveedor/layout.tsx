"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/proveedor/Sidebar';
import MobileHeader from '@/components/proveedor/MobileHeader';

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // El módulo de Punto de Venta corre como "app" propia: sin sidebar ni
  // mobile header del proveedor — usa su propio shell con botón SALIR.
  const isPuntoVenta = pathname?.startsWith('/proveedor/punto-venta');
  if (isPuntoVenta) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MobileHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="main-con-sidebar w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
