'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

const CATEGORIAS = [
  { id: 'SALON',      label: 'Salones',      img: '/cat_salones.png' },
  { id: 'MUSICA',     label: 'Música',       img: '/cat_musica.png' },
  { id: 'COMIDA',     label: 'Banquetes',    img: '/cat_banquetes.png' },
  { id: 'ANIMACION',  label: 'Animación',    img: '/cat_animacion.png' },
  { id: 'FOTOGRAFIA', label: 'Foto & Video', img: '/cat_fotografia.png' },
  { id: 'DECORACION', label: 'Decoración',   img: '/cat_decoracion.png' },
  { id: 'RECUERDOS',  label: 'Recuerdos',    img: '/cat_recuerdos.png' },
  { id: 'MOBILIARIO', label: 'Inmobiliario', img: '/cat_inmobiliario.png' },
];

export default function HomeClient() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-[var(--color-fondo)] text-[var(--color-texto)]">
      
      {/* ──────────── Header ──────────── */}
      <header className="sticky top-0 z-50 py-4 px-8 bg-[var(--color-fondo)]/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <Image src="/logo.png" alt="Eventia Logo" width={140} height={45} className="w-auto h-11 object-contain" priority />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 ml-12">
            <Link href="#" className="text-sm font-medium hover:text-[var(--color-acento)] transition-colors">Mis Eventos</Link>
            <Link href="/explorar" className="text-sm font-medium hover:text-[var(--color-acento)] transition-colors">Explorar</Link>
            <Link href="#" className="text-sm font-medium hover:text-[var(--color-acento)] transition-colors">Presupuesto</Link>
            <Link href="#" className="text-sm font-medium hover:text-[var(--color-acento)] transition-colors">Invitaciones</Link>
            <Link href="#" className="text-sm font-medium hover:text-[var(--color-acento)] transition-colors">Mi Plan</Link>
          </nav>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-semibold hover:text-[var(--color-acento)] transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="btn-oro px-6 py-2.5 rounded-full text-xs">
              EMPEZAR
            </Link>
          </div>
        </div>
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
           <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-fondo)]/40 via-transparent to-white" />
        </div>

        <div className="max-w-4xl w-full text-center space-y-10">
          <h1 className="flex flex-col gap-2">
            <span className="text-5xl md:text-8xl font-accent tracking-tight text-[var(--color-primario)]">
              Crea momentos
            </span>
            <span className="text-6xl md:text-9xl font-serif italic text-[var(--color-acento)] leading-tight">
              inolvidables
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-[var(--color-texto-suave)] leading-relaxed font-light">
            La plataforma definitiva para organizar los eventos más importantes de tu vida con los mejores proveedores de México.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/registro" className="btn-oro px-10 py-5 rounded-2xl text-xs tracking-[0.1em]">
              EMPEZAR MI EVENTO
            </Link>
            <Link href="/login" className="px-10 py-5 rounded-2xl text-xs tracking-[0.1em] font-bold border-2 border-[var(--color-primario)] text-[var(--color-primario)] hover:bg-[var(--color-primario)] hover:text-white transition-all">
              SOY UN PROVEEDOR
            </Link>
          </div>
        </div>
      </main>

      {/* ──────────── Categories Section ──────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-4xl font-serif text-center mb-16 text-[var(--color-primario)]">
            Todo en un solo lugar
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            {CATEGORIAS.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/explorar?categoria=${cat.id}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--color-borde)] transition-all hover:scale-[1.02] hover:shadow-glow-oro"
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
