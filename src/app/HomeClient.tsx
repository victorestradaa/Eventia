'use client';

import Link from 'next/link';
import Logo from '@/components/common/Logo';
import { useState } from 'react';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Menu,
  X,
  Shield,
  Send,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { track } from '@/lib/analytics';

export default function HomeClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[var(--color-fondo)] text-[var(--color-texto)] overflow-x-hidden">

      {/* HEADER */}
      <header className="sticky top-0 z-[100] py-4 px-6 lg:px-12 bg-[var(--color-fondo)]/85 backdrop-blur-md border-b border-[var(--color-borde-suave)]/30 flex justify-center">
        <div className="w-full max-w-[960px] flex items-center justify-between">
          <Link href="/" className="shrink-0 flex items-center">
            <Logo width={160} height={48} className="w-44 h-10" />
          </Link>
          <div className="flex items-center gap-3 lg:gap-6">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden lg:inline-flex text-sm font-semibold hover:text-[#d4af37] transition-colors"
            >
              Iniciar sesión
            </Link>
            <button
              className="lg:hidden p-2 text-[var(--color-texto)]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menú"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <nav className="lg:hidden absolute top-full left-0 right-0 bg-[var(--color-fondo)] border-b border-[var(--color-borde-suave)] shadow-lg flex flex-col p-6 gap-3 animate-in slide-in-from-top">
            <Link href="/login" className="btn btn-fantasma w-full justify-center">Iniciar sesión</Link>
          </nav>
        )}
      </header>

      {/* 1 · HERO — flex justify-center bulletproof */}
      <main className="relative pt-12 lg:pt-24 pb-16 lg:pb-20 px-6 overflow-hidden flex justify-center">
        <div className="absolute inset-0 -z-10 pointer-events-none opacity-50">
          <Image src="/hero_wave.png" alt="" fill className="object-cover object-center scale-110" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-fondo)]/40 via-[var(--color-fondo)]/20 to-[var(--color-fondo)]" />
        </div>

        <div className="w-full max-w-[960px] text-center relative z-10">
          <h1 className="font-serif italic text-[var(--color-texto)] leading-[0.95] text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl text-center">
            Olvídate del <span className="text-[#d4af37]">grupo de WhatsApp.</span>
            <span className="block mt-2 lg:mt-4">Vive tu evento en paz.</span>
          </h1>

          <p className="mt-6 lg:mt-8 text-base lg:text-xl text-[var(--color-texto-suave)] font-light text-center">
            Confirmaciones, proveedores y pagos en un solo lugar.
          </p>

          <div className="mt-8 lg:mt-10 flex justify-center">
            <Link
              href="/registro?from=hero_primary"
              onClick={() => track('cta_click', { cta: 'hero_primary', location: 'hero' })}
              className="btn-hero-primary min-w-[280px] !py-5 !text-base shadow-2xl shadow-[#d4af37]/30"
            >
              QUIERO MI EVENTO EN PAZ →
            </Link>
          </div>

          <p className="mt-6 text-[11px] tracking-widest uppercase font-medium text-[var(--color-texto-muted)] text-center">
            Gratis · Sin tarjeta
          </p>

          {/* Mockup centrado debajo del CTA */}
          <div className="mt-12 lg:mt-16 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/30 via-[#d4af37]/10 to-transparent blur-3xl pointer-events-none" />
              <div className="relative w-[220px] sm:w-[260px] lg:w-[280px] aspect-[9/16] rounded-[2rem] lg:rounded-[2.5rem] border-[8px] lg:border-[10px] border-[#1F2937] bg-[var(--color-fondo-card)] shadow-2xl overflow-hidden">
                <img
                  src="/marketing/guests.png"
                  alt="Vista del panel de Eventium"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 rounded-b-2xl bg-[#1F2937]" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 2 · SECCIÓN VISUAL */}
      <section className="px-4 lg:px-12 py-20 lg:py-28 flex justify-center">
        <div className="w-full max-w-[960px] relative rounded-[2rem] md:rounded-[3rem] overflow-hidden aspect-[4/5] md:aspect-[16/9]">
          <img
            src="/marketing/invitation.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
            <Send size={28} className="text-[#d4af37] mb-3" />
            <h2 className="text-4xl md:text-6xl lg:text-5xl xl:text-6xl font-serif italic text-white leading-[0.95] max-w-2xl">
              Cada "sí asisto" <span className="text-[#d4af37]">emociona.</span>
            </h2>
          </div>
        </div>
      </section>

      {/* 3 · ANTES vs DESPUÉS */}
      <section className="py-24 lg:py-28 px-6 lg:px-12 bg-[var(--color-fondo-card)] border-y border-[var(--color-borde-suave)] flex justify-center">
        <div className="w-full max-w-[960px]">
          <h2 className="text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-serif text-center text-[var(--color-texto)] leading-[0.95] mb-16 lg:mb-16">
            El antes. <span className="italic text-[#d4af37]">El ahora.</span>
          </h2>

          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* ANTES — WhatsApp */}
            <div className="flex flex-col items-center">
              <PhoneFrame variant="whatsapp">
                <ChatBubble side="left"  name="Lupe">¿a qué hora era?</ChatBubble>
                <ChatBubble side="left"  name="Tito">confirmo, llevo a 2 más</ChatBubble>
                <ChatBubble side="left"  name="Ana">¿código de vestir?</ChatBubble>
                <ChatBubble side="right" name="Tú">dice 7pm</ChatBubble>
                <ChatBubble side="left"  name="Lupe">no me llegó</ChatBubble>
                <ChatBubble side="left"  name="Tito">mejor llego a las 8</ChatBubble>
              </PhoneFrame>
              <p className="mt-6 text-center text-base md:text-lg font-bold text-[var(--color-texto)]">
                200 mensajes. <span className="text-rose-500">Cero control.</span>
              </p>
            </div>

            {/* DESPUÉS — Eventium */}
            <div className="flex flex-col items-center relative">
              <div className="absolute -inset-8 bg-gradient-to-tr from-[#d4af37]/30 to-transparent blur-3xl pointer-events-none" />
              <PhoneFrame variant="eventium">
                <p className="text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)] mt-2">Boda Lupe & Tito</p>
                <h3 className="text-xl font-serif text-[var(--color-texto)] leading-tight">15 de junio · 7pm</h3>
                <div className="grid grid-cols-3 gap-1.5 mt-3">
                  <PanelStat value="120" label="Sí" tone="emerald" />
                  <PanelStat value="12"  label="Tal vez" tone="amber" />
                  <PanelStat value="3"   label="No" tone="rose" />
                </div>
                <div className="mt-3 space-y-1.5">
                  <PanelRow name="Lupe Pérez"  status="confirmado" />
                  <PanelRow name="Tito Garza"  status="confirmado" />
                  <PanelRow name="Ana Ríos"    status="pendiente"  />
                  <PanelRow name="Carlos Vega" status="confirmado" />
                </div>
              </PhoneFrame>
              <p className="mt-6 text-center text-base md:text-lg font-bold text-[var(--color-texto)] relative">
                Todo bajo control <span className="text-emerald-500">en segundos.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 · PROCESO */}
      <section className="py-28 lg:py-28 px-6 lg:px-12 flex justify-center">
        <div className="w-full max-w-[960px] text-center">
          <h2 className="text-5xl md:text-7xl lg:text-6xl xl:text-7xl font-serif italic text-[var(--color-texto)] leading-[0.9] mb-10 lg:mb-12">
            Sueñas. <span className="text-[#d4af37]">Eliges.</span> Brindas.
          </h2>
          <p className="text-sm md:text-base uppercase tracking-[0.4em] font-black text-[var(--color-texto-muted)]">
            Fecha <span className="text-[#d4af37] mx-2">·</span> Proveedores <span className="text-[#d4af37] mx-2">·</span> Confirmaciones
          </p>
        </div>
      </section>

      {/* 5 · CIERRE */}
      <section className="px-6 lg:px-12 pb-16 lg:pb-24 mb-28 lg:mb-0 flex justify-center">
        <div className="w-full max-w-[860px] rounded-[2rem] lg:rounded-[3rem] bg-gradient-to-br from-[#fdf6e1] via-[#f4e4b9] to-[#d4af37] p-12 lg:p-16 text-center text-[#1F2937] shadow-2xl shadow-[#d4af37]/30">
          <Sparkles size={28} className="block mx-auto mb-4 text-[#1F2937]" />
          <h2 className="text-4xl md:text-6xl lg:text-5xl xl:text-6xl font-serif italic leading-[0.95] mb-8">
            Nos vemos en <span className="not-italic font-black">la pista.</span>
          </h2>
          <Link
            href="/registro?from=cta_final"
            onClick={() => track('cta_click', { cta: 'cta_final', location: 'cta_final' })}
            className="inline-flex items-center gap-2 bg-black text-white px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-[1.02] transition-transform shadow-2xl"
          >
            Quiero mi evento en paz <ArrowRight size={18} />
          </Link>
          <p className="text-[11px] uppercase tracking-widest font-bold text-[#1F2937]/70 mt-5">
            Gratis · Sin tarjeta
          </p>
        </div>
      </section>

      {/* STICKY CTA mobile */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-[90] px-4 pt-3 bg-gradient-to-t from-[var(--color-fondo)] via-[var(--color-fondo)]/95 to-transparent"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
      >
        <Link
          href="/registro?from=sticky_mobile"
          onClick={() => track('cta_click', { cta: 'sticky_mobile', location: 'sticky_bottom' })}
          aria-label="Quiero mi evento en paz"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest shadow-2xl shadow-[#d4af37]/30 active:scale-[0.97] transition-all"
        >
          Quiero mi evento en paz <ArrowRight size={14} />
        </Link>
      </div>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-[var(--color-borde-suave)] bg-[var(--color-fondo)] flex justify-center">
        <div className="w-full max-w-[960px] flex flex-col items-center gap-4 text-center">
          <Logo width={100} height={32} className="w-auto h-7 opacity-70" />
          <p className="text-[10px] text-[var(--color-texto-muted)] flex items-center gap-1.5">
            <Shield size={10} className="text-[#d4af37]" />
            Plataforma de conexión. Cada proveedor es responsable de sus servicios.
          </p>
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)]">
            <Link href="/privacidad" className="hover:text-[#d4af37] transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-[#d4af37] transition-colors">Términos</Link>
            <Link href="/contrato-proveedor" className="hover:text-[#d4af37] transition-colors">Contrato proveedor</Link>
          </div>
          <p className="text-[10px] text-[var(--color-texto-muted)]">
            &copy; {new Date().getFullYear()} Eventium · Mazatlán, México
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── HELPERS ─────────────────────────────────────────────────────── */

function PhoneFrame({
  variant,
  children,
}: {
  variant: 'whatsapp' | 'eventium';
  children: React.ReactNode;
}) {
  const isWhats = variant === 'whatsapp';
  const bg = isWhats ? 'bg-[#0b1f0e]' : 'bg-[var(--color-fondo)]';
  const tilt = isWhats ? 'md:rotate-[-3deg]' : 'md:rotate-[3deg]';
  return (
    <div className={`relative w-full max-w-[230px] lg:max-w-[240px] aspect-[9/16] lg:aspect-[9/13] rounded-[2rem] lg:rounded-[2.5rem] border-[8px] lg:border-[10px] border-[#1F2937] ${bg} shadow-2xl overflow-hidden ${tilt}`}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 rounded-b-2xl bg-[#1F2937] z-20" />
      <div className={`pt-9 px-3 ${isWhats ? 'space-y-1.5' : 'px-3 pb-4 space-y-2'} h-full overflow-hidden`}>
        {children}
      </div>
    </div>
  );
}

function ChatBubble({
  side,
  name,
  children,
}: {
  side: 'left' | 'right';
  name: string;
  children: React.ReactNode;
}) {
  if (side === 'right') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#005c4b] text-white px-3 py-1.5 text-[11px] leading-tight">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#1f2c34] text-white px-3 py-1.5 text-[11px] leading-tight">
        <p className="text-[9px] font-bold text-[#d4af37] m-0 mb-0.5">{name}</p>
        {children}
      </div>
    </div>
  );
}

function PanelStat({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: 'emerald' | 'amber' | 'rose';
}) {
  const palette: Record<string, { bg: string; fg: string }> = {
    emerald: { bg: 'bg-emerald-500/10', fg: 'text-emerald-500' },
    amber:   { bg: 'bg-amber-500/10',   fg: 'text-amber-500'   },
    rose:    { bg: 'bg-rose-500/10',    fg: 'text-rose-500'    },
  };
  return (
    <div className={`rounded-xl ${palette[tone].bg} p-2 text-center`}>
      <p className={`text-base font-black m-0 ${palette[tone].fg}`}>{value}</p>
      <p className="text-[8px] uppercase tracking-widest font-bold text-[var(--color-texto-muted)] m-0">{label}</p>
    </div>
  );
}

function PanelRow({ name, status }: { name: string; status: 'confirmado' | 'pendiente' }) {
  const dot = status === 'confirmado' ? 'bg-emerald-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-[var(--color-fondo-card)]">
      <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className="text-[10px] font-bold text-[var(--color-texto)] m-0">{name}</span>
    </div>
  );
}

