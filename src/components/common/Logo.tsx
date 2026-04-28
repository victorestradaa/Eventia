'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';
import { useEffect, useState } from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  forceWhite?: boolean;
}

/**
 * Componente de Logotipo inteligente.
 * Cambia automáticamente entre la versión oscura y la versión blanca (logo-blanco.png)
 * dependiendo del tema detectado por el context.
 */
export default function Logo({ width = 200, height = 60, className, forceWhite = false }: LogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Si forzamos blanco, lo mostramos siempre
  if (forceWhite) {
    return (
      <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width, height }}>
        <Image 
          src="/logo-blanco.png" 
          alt="Eventia Logo" 
          fill
          className="object-contain" 
          priority 
        />
      </div>
    );
  }

  // Siempre mostrar logo.png por defecto (SSR y primer render)
  // Solo cambiar a blanco si está montado Y el tema es oscuro
  const logoSrc = (mounted && theme === 'dark') ? "/logo-blanco.png" : "/logo.png";

  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)} 
      style={{ 
        width: className?.includes('w-') ? undefined : width, 
        height: className?.includes('h-') ? undefined : height,
        minWidth: width ? (width / 2) : undefined,
        minHeight: height ? (height / 2) : undefined
      }}
    >
        <Image 
          src={logoSrc} 
          alt="Eventia Logo" 
          fill
          className="object-contain" 
          priority 
          key={logoSrc}
        />
    </div>
  );
}
