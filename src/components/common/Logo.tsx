'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  forceWhite?: boolean;
}

/**
 * Componente de Logotipo inteligente.
 * Cambia automáticamente entre la versión oscura y la versión blanca (logo-blanco.png)
 * dependiendo del tema detectado por CSS o mediante prop.
 */
export default function Logo({ width = 200, height = 60, className, forceWhite = false }: LogoProps) {
  const logoSrc = forceWhite ? "/logo-blanco.png" : "/logo.png";

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

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: !className?.includes('w-') ? width : undefined, height: !className?.includes('h-') ? height : undefined }}>
      {/* Versión estándar (oscura) - Se oculta en modo oscuro */}
      <div className="dark-hidden relative w-full h-full">
        <Image 
          src="/logo.png" 
          alt="Eventia Logo" 
          fill
          className="object-contain" 
          priority 
        />
      </div>

      {/* Versión blanca - Se muestra solo en modo oscuro */}
      <div className="dark-visible hidden relative w-full h-full">
        <Image 
          src="/logo-blanco.png" 
          alt="Eventia Logo" 
          fill
          className="object-contain" 
          priority 
        />
      </div>

      <style jsx>{`
        :global([data-theme="dark"]) .dark-hidden {
          display: none;
        }
        :global([data-theme="dark"]) .dark-visible {
          display: block !important;
        }
      `}</style>
    </div>
  );
}
