'use client';

import Image from 'next/image';

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
export default function Logo({ width = 400, height = 160, className = "w-auto h-28 object-contain", forceWhite = false }: LogoProps) {
  if (forceWhite) {
    return (
      <Image 
        src="/logo-blanco.png" 
        alt="Eventia Logo" 
        width={width} 
        height={height} 
        className={className} 
        priority 
      />
    );
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Versión estándar (oscura) - Se oculta en modo oscuro */}
      <div className="dark-hidden">
        <Image 
          src="/logo.png" 
          alt="Eventia Logo" 
          width={width} 
          height={height} 
          className="w-auto h-full object-contain" 
          priority 
        />
      </div>

      {/* Versión blanca - Se muestra solo en modo oscuro */}
      <div className="dark-visible hidden">
        <Image 
          src="/logo-blanco.png" 
          alt="Eventia Logo" 
          width={width} 
          height={height} 
          className="w-auto h-full object-contain" 
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
