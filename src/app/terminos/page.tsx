'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ChevronLeft, Shield, Scale, AlertCircle, CreditCard, Ban, Globe, MapPin } from 'lucide-react';

export default function TerminosPage() {
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
          <div className="flex items-center gap-2 text-[var(--color-texto)]">
            <Shield className="text-[#d4af37]" size={20} />
            <span className="font-bold tracking-tighter text-lg uppercase">EVENTIA</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Hero Section */}
        <div className="mb-16 text-center md:text-left">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] mb-6">
            <Scale size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-[var(--color-texto)]">
            Términos y <span className="text-[#d4af37]">Condiciones</span>
          </h1>
          <p className="text-[var(--color-texto-muted)] font-medium">
            Última actualización: Abril de 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <div className="prose prose-lg max-w-none">
            <p className="lead font-medium text-lg leading-relaxed mb-12 text-[var(--color-texto)]">
              Bienvenido a Eventia. Los presentes Términos y Condiciones regulan el uso de nuestra plataforma web y la relación entre Eventia, los usuarios organizadores de eventos (en adelante "Clientes") y los proveedores de servicios (en adelante "Proveedores"). Al acceder o usar nuestra plataforma, aceptas estar sujeto a estas condiciones.
            </p>

            {/* Section 1 */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Globe size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">1. Naturaleza de la Plataforma</h2>
              </div>
              <p className="text-[var(--color-texto-suave)]">
                Eventia es un mercado digital (marketplace) y una herramienta de gestión. Nuestra plataforma proporciona el espacio y la tecnología para que Clientes y Proveedores se conecten, coticen, planifiquen y reserven servicios para eventos.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">2. Cuentas de Usuario</h2>
              </div>
              <ul className="space-y-6 text-[var(--color-texto-suave)] list-none p-0">
                <li className="bg-[var(--color-fondo)]/50 p-6 rounded-3xl border border-[var(--color-borde-suave)]">
                  <strong className="text-[var(--color-texto)] block mb-2">Veracidad de la información:</strong>
                  Todos los usuarios garantizan que la información proporcionada (datos personales, descripción de servicios, precios, fotografías) es veraz, precisa y lícita.
                </li>
                <li className="bg-[var(--color-fondo)]/50 p-6 rounded-3xl border border-[var(--color-borde-suave)]">
                  <strong className="text-[var(--color-texto)] block mb-2">Proveedores:</strong>
                  Son los únicos responsables de mantener actualizados sus calendarios de disponibilidad, precios y políticas de cancelación en su perfil.
                </li>
                <li className="flex gap-3 items-start text-red-500 bg-red-500/5 p-6 rounded-3xl border border-red-500/10 font-medium">
                  <AlertCircle size={20} className="shrink-0 mt-1" />
                  <span>Eventia se reserva el derecho de suspender o cancelar cuentas que violen estas normas, publiquen contenido inapropiado o realicen prácticas fraudulentas.</span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Ban size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">3. Límite de Responsabilidad</h2>
              </div>
              <p className="bg-red-500/5 p-6 rounded-3xl border border-red-500/20 text-red-600 dark:text-red-400 font-bold mb-8">
                Eventia actúa exclusivamente como un intermediario tecnológico. No somos una agencia de organización de eventos, ni los dueños, operadores o prestadores de los servicios anunciados.
              </p>
              <p className="text-[var(--color-texto-suave)] mb-6">Eventia no garantiza ni asume responsabilidad por:</p>
              <div className="grid md:grid-cols-1 gap-4">
                {[
                  "La calidad, seguridad, puntualidad o legalidad de los servicios proporcionados por el Proveedor.",
                  "Incumplimientos de contrato, cancelaciones de última hora o ausencias.",
                  "Daños, lesiones, pérdidas materiales o disputas que ocurran durante o después del evento."
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-center bg-[var(--color-fondo)]/50 p-4 rounded-2xl border border-[var(--color-borde-suave)]">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-sm font-black">{i+1}</div>
                    <span className="text-sm font-medium text-[var(--color-texto-suave)]">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">4. Pagos y Transacciones</h2>
              </div>
              <div className="space-y-4 text-[var(--color-texto-suave)]">
                <p>Los pagos realizados a través de la plataforma son procesados por <strong className="text-[var(--color-texto)]">Mercado Pago</strong>. Eventia no almacena información bancaria de los usuarios.</p>
                <p>Eventia puede cobrar una comisión por el uso de la tecnología de intermediación. Esta comisión se detallará claramente antes de confirmar cualquier transacción y no es reembolsable por parte de Eventia.</p>
                <div className="p-6 rounded-3xl bg-[#d4af37]/5 border border-[#d4af37]/20">
                  <p className="text-sm m-0">El Cliente entiende que el pago de un anticipo asegura la reserva en la plataforma, pero las condiciones del pago restante deben ser acordadas directamente con el Proveedor.</p>
                </div>
              </div>
            </section>

            {/* Section 5, 6, 7 */}
            <div className="space-y-12">
              <section>
                <h3 className="text-xl font-bold mb-4 text-[var(--color-texto)] uppercase tracking-tight">5. Políticas de Cancelación</h3>
                <p className="text-[var(--color-texto-suave)] text-sm">Cada Proveedor es responsable de establecer sus propias políticas de cancelación. Al reservar, el Cliente acepta dichas políticas. Eventia no tiene autoridad para obligar a reembolsos fuera de las políticas establecidas.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-4 text-[var(--color-texto)] uppercase tracking-tight">6. Propiedad Intelectual</h3>
                <p className="text-[var(--color-texto-suave)] text-sm">Todo el contenido, diseño visual y código fuente son propiedad exclusiva de Eventia. Queda prohibida su reproducción sin autorización.</p>
              </section>

              <section className="bg-[var(--color-fondo)]/80 p-8 rounded-[2.5rem] border-2 border-[#d4af37]/30 shadow-xl shadow-[#d4af37]/5">
                <div className="flex items-center gap-3 mb-4 text-[#d4af37]">
                  <MapPin size={24} />
                  <h3 className="text-xl font-black uppercase tracking-tighter m-0">7. Jurisdicción</h3>
                </div>
                <p className="text-[var(--color-texto-suave)] text-sm leading-relaxed m-0">
                  Para cualquier disputa, las partes se someten expresamente a las leyes federales de México y a la jurisdicción de los tribunales en la ciudad de <strong className="text-[var(--color-texto)]">Mazatlán, Sinaloa</strong>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <Link 
          href="/"
          className="w-full py-6 rounded-[2rem] bg-[var(--color-texto)] text-[var(--color-fondo)] font-black uppercase tracking-[0.2em] flex items-center justify-center hover:scale-[0.98] active:scale-[0.95] transition-all shadow-2xl"
        >
          Acepto los términos
        </Link>
      </div>
    </div>
  );
}
