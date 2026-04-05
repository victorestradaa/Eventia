'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  Music,
  Utensils,
  PartyPopper,
  Camera,
  Palette,
  Gift,
  Armchair,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CATEGORIAS_LABELS } from '@/lib/utils';

const CATEGORIAS = [
  { id: 'SALON',      label: 'Salones',      icon: Building2   },
  { id: 'MUSICA',     label: 'Música',       icon: Music       },
  { id: 'COMIDA',     label: 'Banquetes',    icon: Utensils    },
  { id: 'ANIMACION',  label: 'Animación',    icon: PartyPopper },
  { id: 'FOTOGRAFIA', label: 'Foto & Video', icon: Camera      },
  { id: 'DECORACION', label: 'Decoración',   icon: Palette     },
  { id: 'RECUERDOS',  label: 'Recuerdos',    icon: Gift        },
  { id: 'MOBILIARIO', label: 'Inmobiliario', icon: Armchair    },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-fondo)', color: 'var(--color-texto)' }}>

      {/* ──────────── Top Navbar ──────────── */}
      <header style={{ backgroundColor: 'var(--color-fondo-card)', borderBottom: '1px solid var(--color-borde-suave)' }}
        className="sticky top-0 z-50 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Eventia Logo" width={280} height={90} className="w-auto h-20 object-contain" priority />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login"
              className="text-sm font-bold px-5 py-2 rounded-full transition-all"
              style={{ color: 'var(--color-texto-suave)' }}>
              Iniciar sesión
            </Link>
            <Link href="/registro"
              className="btn btn-primario text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full">
              Empezar
            </Link>
          </div>
        </div>
      </header>

      {/* ──────────── Hero ──────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 md:py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em]"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-primario) 8%, transparent)', color: 'var(--color-primario)' }}>
            Gestión de eventos premium
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.88]"
            style={{ color: 'var(--color-texto)' }}>
            Crea momentos<br />
            <span className="gradient-texto">inolvidables</span>
          </h1>

          <p className="text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'var(--color-texto-suave)' }}>
            La plataforma definitiva para organizar los eventos más importantes de tu vida con los mejores proveedores de México.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/registro"
              className="btn btn-primario text-xs font-black uppercase tracking-widest px-10 py-5 rounded-2xl shadow-xl">
              Empezar mi evento
            </Link>
            <Link href="/login"
              className="btn text-xs font-black uppercase tracking-widest px-10 py-5 rounded-2xl transition-all active:scale-95"
              style={{ border: '1.5px solid var(--color-borde-suave)', backgroundColor: 'var(--color-fondo-input)', color: 'var(--color-texto)' }}>
              Soy un proveedor
            </Link>
          </div>
        </div>
      </main>

      {/* ──────────── Categories ──────────── */}
      <section className="py-20 w-full" style={{ borderTop: '1px solid var(--color-borde-suave)', backgroundColor: 'var(--color-fondo-card)' }}>
        <div className="w-full text-center mb-12 space-y-2 px-6">
          <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-texto)' }}>
            Todo en un solo lugar
          </h2>
          <p className="text-sm font-medium" style={{ color: 'var(--color-texto-muted)' }}>
            Encuentra exactamente lo que necesitas para tu gran día
          </p>
        </div>

        {/* Full-width centered flex row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', width: '100%', padding: '0 1.5rem' }}>
          {CATEGORIAS.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              href={`/explorar?categoria=${id}`}
              className="group flex flex-col items-center justify-center gap-3 rounded-3xl transition-all duration-300 active:scale-95"
              style={{
                width: '110px',
                flexShrink: 0,
                padding: '1.25rem 0.75rem',
                backgroundColor: 'var(--color-fondo-input)',
                border: '1.5px solid var(--color-borde-suave)',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primario-claro)';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-fondo-card)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(109,40,217,0.12)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-borde-suave)';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-fondo-input)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-fondo-card)', border: '1.5px solid var(--color-borde-suave)', color: 'var(--color-texto-muted)' }}>
                <Icon size={22} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight"
                style={{ color: 'var(--color-texto-suave)' }}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ──────────── Footer ──────────── */}
      <footer className="py-10" style={{ borderTop: '1px solid var(--color-borde-suave)', backgroundColor: 'var(--color-fondo-card)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Eventia Logo" width={200} height={70} className="w-auto h-16 object-contain" />
          </div>
          <p className="text-xs font-medium" style={{ color: 'var(--color-texto-muted)' }}>
            &copy; {new Date().getFullYear()} Eventia. Hecho con ❤️ para momentos especiales.
          </p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-texto-muted)' }}>
            <Link href="#" className="hover:opacity-80 transition-opacity">Privacidad</Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">Términos</Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
