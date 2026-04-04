'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
      className={cn(
        'relative flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all duration-300',
        'text-[var(--color-texto-suave)] hover:text-[var(--color-texto)]',
        'bg-[var(--color-fondo-input)] border-[var(--color-borde-suave)]',
        'hover:border-[var(--color-primario-claro)] hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]/40',
        className
      )}
    >
      {theme === 'light' ? (
        <>
          <Moon size={15} strokeWidth={1.5} />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Oscuro</span>
        </>
      ) : (
        <>
          <Sun size={15} strokeWidth={1.5} />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Claro</span>
        </>
      )}
    </button>
  );
}
