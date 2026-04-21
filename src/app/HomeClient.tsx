'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const CATEGORIAS = [
  { id: 'SALON',      label: 'Salones',      img: '/cat_salones.png' },
  { id: 'MUSICA',     label: 'Música',       img: '/cat_musica.png' },
  { id: 'COMIDA',     label: 'Banquetes',    img: '/cat_banquetes.png' },
  { id: 'ANIMACION',  label: 'Animación',    img: '/cat_animacion.png' },
  { id: 'FOTOGRAFIA', label: 'Foto & Video', img: '/cat_fotografia.png' },
  { id: 'DECORACION', label: 'Decoración',   img: '/cat_decoracion.png' },
  { id: 'RECUERDOS',  label: 'Recuerdos',    img: '/cat_recuerdos.png' },
  { id: 'MOBILIARIO', label: 'Mobiliario',   img: '/cat_inmobiliario.png' },
];

export default function HomeClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[var(--color-fondo)] text-[var(--color-texto)]">
      
      {/* ──────────── Header ──────────── */}
      <header className="sticky top-0 z-50 py-4 px-8 bg-[var(--color-fondo)]/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <Image src="/logo.png" alt="Eventia Logo" width={140} height={45} className="w-auto h-11 object-contain" priority />
          </Link>

          {/* Menú Superior removido para usuarios no autenticados */}
          <div className="hidden lg:flex flex-1"></div>

          <div className="flex items-center gap-4 lg:gap-6">
            <ThemeToggle />
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/login" className="text-sm font-semibold hover:text-[var(--color-acento)] transition-colors">
                Iniciar sesión
              </Link>
              <Link href="/registro" className="btn-oro px-6 py-2.5 rounded-full text-xs">
                REGISTRARSE
              </Link>
            </div>
            
            <button 
              className="lg:hidden p-2 text-[var(--color-texto)]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden absolute top-full left-0 right-0 bg-[var(--color-fondo)] border-b border-[var(--color-borde-suave)] shadow-lg flex flex-col p-6 gap-4 animate-in slide-in-from-top">
            <div className="flex flex-col gap-3">
               <Link href="/login" className="btn btn-fantasma w-full justify-center">Iniciar sesión</Link>
               <Link href="/registro" className="btn-oro w-full justify-center py-3">REGISTRARSE</Link>
            </div>
          </nav>
        )}
      </header>

      {/* ──────────── Hero Section ──────────── */}
      <main className="relative flex flex-col items-center justify-center pt-24 pb-32 px-6 overflow-hidden">
        {/* Background Particles Decoration */}
         <div className="absolute inset-0 -z-10 pointer-events-none opacity-60">
           <Image 
             src="/hero_wave.png" 
             alt="Luxury gold background" 
             fill 
             className="object-cover object-center scale-110"
             priority
           />
           <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-fondo)]/40 via-[var(--color-fondo)]/20 to-[var(--color-fondo)]" />
        </div>

        <div className="max-w-4xl w-full text-center space-y-10 z-10 relative flex flex-col items-center">
          <h1 className="flex flex-col items-center gap-2">
            <span className="text-5xl md:text-7xl lg:text-8xl font-accent tracking-tight text-[var(--color-texto)] drop-shadow-md">
              Crea momentos
            </span>
            <span className="text-6xl md:text-8xl lg:text-9xl font-serif italic text-[var(--color-acento)] leading-tight drop-shadow-lg">
              inolvidables
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-[var(--color-texto-suave)] leading-relaxed font-light">
            La plataforma definitiva para organizar los eventos más importantes de tu vida con los mejores proveedores de México.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full px-4">
            <Link href="/registro" className="btn-oro px-8 py-4 sm:px-10 sm:py-5 rounded-2xl text-xs tracking-[0.1em] w-full sm:w-auto text-center">
              EMPEZAR MI EVENTO
            </Link>
            <Link href="/login" className="px-8 py-4 sm:px-10 sm:py-5 rounded-2xl text-xs tracking-[0.1em] font-bold border-2 border-[var(--color-texto)] text-[var(--color-texto)] hover:bg-[var(--color-texto)] hover:text-[var(--color-fondo)] transition-all w-full sm:w-auto text-center">
              SOY UN PROVEEDOR
            </Link>
          </div>
        </div>
      </main>

      {/* ──────────── Categories Section ──────────── */}
      <section className="py-24 px-6 bg-[var(--color-fondo-card)] border-y border-[var(--color-borde-suave)]">
        <div className="max-w-[1450px] mx-auto flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-serif text-center mb-16 text-[var(--color-texto)]">
            Todo en un solo lugar
          </h2>

          <div className="flex flex-wrap lg:flex-nowrap justify-center items-center gap-4 w-full overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 no-scrollbar">
            {CATEGORIAS.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/cliente/explorar?categoria=${cat.id}`}
                className="group relative aspect-[3/4] w-[140px] md:w-[160px] overflow-hidden rounded-2xl border border-[var(--color-borde)] transition-all hover:scale-[1.03] hover:shadow-glow-oro shrink-0"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                <Image 
                  src={cat.img} 
                  alt={cat.label} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-0 inset-x-0 p-4 z-20 bg-gradient-to-t from-black/80 to-transparent">
                  <span className="block text-[10px] font-bold text-white uppercase tracking-widest text-center">
                    {cat.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── Footer ──────────── */}
      <footer className="py-12 px-8 border-t border-[var(--color-borde-suave)] bg-[var(--color-fondo)]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="shrink-0">
            <Image src="/logo.png" alt="Eventia Logo" width={110} height={35} className="w-auto h-8 opacity-60 grayscale" />
          </div>

          <p className="text-[11px] text-[var(--color-texto-muted)] font-medium">
            &copy; {new Date().getFullYear()} Eventia. Hecho con ❤️ para momentos especiales.
          </p>

          <div className="flex items-center gap-8 text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)]">
            <Link href="#" className="hover:text-[var(--color-acento)] transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-[var(--color-acento)] transition-colors">Términos</Link>
            <Link href="#" className="hover:text-[var(--color-acento)] transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
