'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  ChevronLeft,
  Mail,
  Lock,
  UserCheck,
  Eye,
  RefreshCw,
  Smartphone,
  Target,
  Network,
  CreditCard,
  AlertTriangle,
  ShieldCheck,
  KeyRound,
  MapPin,
  Pencil,
} from 'lucide-react';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[var(--color-fondo)] text-[var(--color-texto)] selection:bg-[#d4af37]/30">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-[var(--color-fondo)]/80 backdrop-blur-md border-b border-[var(--color-borde-suave)]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--color-texto-muted)] hover:text-[#d4af37] transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Volver al inicio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="text-[#d4af37]" size={20} />
            <span className="font-bold tracking-tighter text-lg text-[var(--color-texto)]">EVENTIUM</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Hero Section */}
        <div className="mb-16 text-center md:text-left">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] mb-6">
            <Lock size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-[var(--color-texto)]">
            Aviso de <span className="text-[#d4af37]">Privacidad</span> Integral
          </h1>
          <p className="text-[var(--color-texto-muted)] font-medium">
            Última actualización: Abril de 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            <p className="lead font-medium text-lg leading-relaxed mb-12 text-[var(--color-texto)]">
              En cumplimiento con la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong>, se informa lo siguiente sobre el tratamiento de tu información personal en la plataforma Eventium.
            </p>

            {/* Sección 1 — Responsable */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">
                  1. Responsable del tratamiento de datos
                </h2>
              </div>
              <div className="p-6 rounded-3xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] space-y-2 text-[var(--color-texto-suave)]">
                <p className="m-0"><strong className="text-[var(--color-texto)]">Víctor Manuel Estrada Aguilar</strong></p>
                <p className="m-0 text-sm">RFC: <strong className="text-[var(--color-texto)]">EAAV920712GH2</strong></p>
                <p className="m-0 text-sm flex items-center gap-2">
                  <MapPin size={14} className="text-[#d4af37]" />
                  Leonardo Avilés 2529, Col. 12 de Mayo, C.P. 82020, Mazatlán, Sinaloa, México.
                </p>
                <p className="m-0 text-sm pt-2">Responsable del tratamiento de datos a través de la plataforma Eventium.</p>
              </div>
            </section>

            {/* Sección 2 — Datos */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                  <Eye size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">
                  2. Datos personales que recopilamos
                </h2>
              </div>
              <div className="space-y-4">
                <DataBlock title="Datos de identificación">
                  <li>Nombre completo</li>
                  <li>Correo electrónico</li>
                  <li>Número telefónico</li>
                </DataBlock>
                <DataBlock title="Datos de cuenta">
                  <li>Contraseña (encriptada)</li>
                </DataBlock>
                <DataBlock title="Datos del evento (Clientes)">
                  <li>Tipo de evento</li>
                  <li>Fecha</li>
                  <li>Ubicación aproximada</li>
                  <li>Preferencias</li>
                </DataBlock>
                <DataBlock title="Datos comerciales (Proveedores)">
                  <li>Nombre del negocio</li>
                  <li>Dirección</li>
                  <li>Fotografías</li>
                  <li>Servicios y tarifas</li>
                  <li>Datos fiscales</li>
                </DataBlock>
                <DataBlock title="Datos de pago" highlight>
                  <li>Identificadores de transacción</li>
                  <li>Tokens de pago</li>
                  <li>Información relacionada con cobros y comisiones</li>
                </DataBlock>
                <Aviso>
                  Eventium <strong>no almacena datos completos de tarjetas bancarias</strong>.
                </Aviso>
              </div>
            </section>

            {/* Sección 3 — Finalidades */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Target size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">
                  3. Finalidades del tratamiento
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Crear y gestionar cuentas',
                  'Conectar clientes y proveedores',
                  'Facilitar contratación de servicios',
                  'Gestionar solicitudes, reservas y operaciones',
                  'Procesar cobros y comisiones',
                  'Brindar soporte',
                  'Mejorar la plataforma',
                ].map((item, i) => (
                  <div key={i} className="bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-4 rounded-2xl flex gap-3 items-start">
                    <div className="mt-1 text-[#d4af37] font-bold text-sm">{i + 1}.</div>
                    <span className="text-sm font-medium text-[var(--color-texto-suave)]">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Sección 4 — Naturaleza */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Network size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">
                  4. Naturaleza de la plataforma
                </h2>
              </div>
              <div className="p-6 rounded-3xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] space-y-3 text-[var(--color-texto-suave)] text-sm">
                <p className="m-0">Eventium es una <strong className="text-[var(--color-texto)]">plataforma tecnológica de intermediación</strong> que facilita la conexión entre usuarios.</p>
                <p className="m-0">Eventium <strong className="text-[var(--color-texto)]">no presta directamente</strong> los servicios ofrecidos por los proveedores.</p>
                <p className="m-0">Los proveedores son <strong className="text-[var(--color-texto)]">responsables exclusivos</strong> de los servicios contratados.</p>
              </div>
            </section>

            {/* Sección 5 — Transferencia */}
            <section className="mb-12 text-[var(--color-texto-suave)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <RefreshCw size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">
                  5. Transferencia de datos
                </h2>
              </div>
              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)]">
                  <h4 className="font-bold mb-2 text-[var(--color-texto)]">Entre usuarios</h4>
                  <p className="text-sm m-0 mb-3">Se compartirán datos necesarios para:</p>
                  <ul className="text-sm space-y-1 m-0 ml-5 list-disc">
                    <li>Cotización</li>
                    <li>Contratación</li>
                    <li>Comunicación</li>
                  </ul>
                </div>
                <Aviso>
                  Eventium <strong>no es responsable</strong> del uso que los usuarios den a la información una vez compartida.
                </Aviso>
                <div className="p-6 rounded-3xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)]">
                  <h4 className="font-bold mb-2 text-[var(--color-texto)] flex items-center gap-2">
                    <CreditCard size={16} className="text-[#d4af37]" />
                    Con procesadores de pago
                  </h4>
                  <p className="text-sm m-0 mb-3">Eventium utiliza <strong className="text-[var(--color-texto)]">Mercado Pago</strong> como plataforma tecnológica para:</p>
                  <ul className="text-sm space-y-1 m-0 ml-5 list-disc">
                    <li>Procesar cobros</li>
                    <li>Retener comisiones</li>
                    <li>Dispersar pagos a proveedores</li>
                  </ul>
                  <p className="text-xs mt-3 m-0 text-[var(--color-texto-muted)]">
                    Se comparten datos necesarios para la operación de pagos conforme a sus políticas.
                  </p>
                </div>
              </div>
            </section>

            {/* Sección 6 — Pagos y limitación de responsabilidad */}
            <section className="mb-12 text-[var(--color-texto-suave)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">
                  6. Procesamiento de pagos y limitación de responsabilidad
                </h2>
              </div>
              <div className="p-6 rounded-3xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] space-y-3 text-sm">
                <p className="m-0">Eventium:</p>
                <ul className="space-y-1 m-0 ml-5 list-disc">
                  <li>Facilita la gestión de cobros mediante Mercado Pago.</li>
                  <li>Retiene automáticamente su comisión.</li>
                  <li>Transfiere el monto restante al proveedor.</li>
                </ul>
              </div>
              <div className="mt-4 space-y-3">
                <Aviso>
                  Eventium <strong>no actúa como institución financiera</strong>, ni garantiza la ejecución, cumplimiento o calidad de los servicios contratados.
                </Aviso>
                <Aviso>
                  Eventium <strong>no es responsable</strong> por cancelaciones, incumplimientos, fraudes o disputas entre clientes y proveedores.
                </Aviso>
                <p className="text-sm">Cualquier reclamación relacionada con el servicio contratado deberá resolverse <strong className="text-[var(--color-texto)]">directamente entre cliente y proveedor</strong>.</p>
              </div>
            </section>

            {/* Sección 7 — Reembolsos */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">
                  7. Limitación sobre reembolsos
                </h2>
              </div>
              <div className="p-6 rounded-3xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] space-y-3 text-sm text-[var(--color-texto-suave)]">
                <p className="m-0">Eventium <strong className="text-[var(--color-texto)]">no gestiona ni garantiza reembolsos</strong>.</p>
                <p className="m-0">Las políticas de cancelación, devolución o reembolso son <strong className="text-[var(--color-texto)]">responsabilidad exclusiva del proveedor</strong>.</p>
              </div>
            </section>

            {/* Sección 8 + 9 — Cookies y Seguridad */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <section className="bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-8 rounded-[2rem]">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 uppercase tracking-tight text-[var(--color-texto)]">
                  <Smartphone size={20} className="text-[#d4af37]" />
                  8. Uso de cookies
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-texto-muted)] mb-3">
                  Utilizamos cookies para:
                </p>
                <ul className="text-sm space-y-1 ml-5 list-disc text-[var(--color-texto-suave)]">
                  <li>Sesión</li>
                  <li>Preferencias</li>
                  <li>Analítica</li>
                </ul>
                <p className="text-xs mt-3 text-[var(--color-texto-muted)]">
                  Puedes desactivarlas en tu navegador.
                </p>
              </section>

              <section className="bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-8 rounded-[2rem]">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 uppercase tracking-tight text-[var(--color-texto)]">
                  <ShieldCheck size={20} className="text-[#d4af37]" />
                  9. Medidas de seguridad
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-texto-muted)] mb-3">
                  Implementamos medidas para proteger la información:
                </p>
                <ul className="text-sm space-y-1 ml-5 list-disc text-[var(--color-texto-suave)]">
                  <li>Técnicas</li>
                  <li>Administrativas</li>
                  <li>Digitales</li>
                </ul>
              </section>
            </div>

            {/* Sección 10 — ARCO */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center">
                  <KeyRound size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">
                  10. Derechos ARCO
                </h2>
              </div>
              <div className="p-6 rounded-3xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] space-y-4 text-sm text-[var(--color-texto-suave)]">
                <p className="m-0">Puedes ejercer los siguientes derechos sobre tus datos personales:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Acceso', 'Rectificación', 'Cancelación', 'Oposición'].map((d) => (
                    <div key={d} className="bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl px-3 py-2 text-center">
                      <span className="text-xs font-black uppercase tracking-widest text-[var(--color-texto)]">{d}</span>
                    </div>
                  ))}
                </div>
                <p className="m-0 flex items-center gap-2 pt-2">
                  <Mail size={14} className="text-[#d4af37]" />
                  <a href="mailto:contacto@eventium.mx" className="font-bold text-[var(--color-texto)] hover:text-[#d4af37] transition-colors">
                    contacto@eventium.mx
                  </a>
                </p>
                <div>
                  <p className="m-0 mb-1">Tu solicitud debe incluir:</p>
                  <ul className="m-0 ml-5 list-disc">
                    <li>Nombre completo</li>
                    <li>Identificación</li>
                    <li>Solicitud clara</li>
                  </ul>
                </div>
                <p className="m-0 text-xs text-[var(--color-texto-muted)]">
                  ⏱️ Respuesta en máximo <strong className="text-[var(--color-texto)]">20 días hábiles</strong>.
                </p>
              </div>
            </section>

            {/* Sección 11 — Modificaciones */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Pencil size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">
                  11. Modificaciones
                </h2>
              </div>
              <div className="p-6 rounded-3xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] text-sm text-[var(--color-texto-suave)]">
                <p className="m-0">Eventium puede actualizar este aviso en cualquier momento. Notificaremos a los usuarios sobre cambios significativos.</p>
              </div>
            </section>

            {/* Footer Info */}
            <footer className="border-t border-[var(--color-borde-suave)] pt-12 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#d4af37] text-black font-bold mb-8 shadow-lg shadow-[#d4af37]/20">
                <Mail size={18} />
                <span>contacto@eventium.mx</span>
              </div>
              <p className="text-sm text-[var(--color-texto-muted)] italic">
                Última actualización: Abril de 2026.
              </p>
            </footer>
          </div>
        </div>
      </main>

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <Link
          href="/"
          className="w-full py-6 rounded-[2rem] bg-[var(--color-texto)] text-[var(--color-fondo)] font-black uppercase tracking-[0.2em] flex items-center justify-center hover:scale-[0.98] active:scale-[0.95] transition-all"
        >
          He leído y entiendo
        </Link>
      </div>
    </div>
  );
}

function DataBlock({ title, children, highlight = false }: { title: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={
      highlight
        ? 'p-5 rounded-2xl bg-[#d4af37]/5 border border-[#d4af37]/30'
        : 'p-5 rounded-2xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)]'
    }>
      <p className="m-0 mb-2 text-sm font-black uppercase tracking-widest text-[var(--color-texto)]">
        {title}
      </p>
      <ul className="m-0 ml-5 list-disc space-y-1 text-sm text-[var(--color-texto-suave)]">
        {children}
      </ul>
    </div>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-sm text-[var(--color-texto-suave)] flex items-start gap-2">
      <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
      <p className="m-0">{children}</p>
    </div>
  );
}
