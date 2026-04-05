"use client";

import { useState } from 'react';
import Sidebar from '@/components/proveedor/Sidebar';
import MobileHeader from '@/components/proveedor/MobileHeader';

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
