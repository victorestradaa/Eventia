'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ChevronLeft, Mail, Lock, UserCheck, Eye, RefreshCw, Smartphone } from 'lucide-react';

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
            <span className="font-bold tracking-tighter text-lg text-[var(--color-texto)]">EVENTIA</span>
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
            Aviso de <span className="text-[#d4af37]">Privacidad</span>
          </h1>
          <p className="text-[var(--color-texto-muted)] font-medium">
            Última actualización: Abril de 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            <p className="lead font-medium text-lg leading-relaxed mb-12 text-[var(--color-texto)]">
              En Eventia, valoramos tu privacidad y la seguridad de tu información. Este Aviso de Privacidad explica cómo recopilamos, utilizamos, compartimos y protegemos tus datos personales cuando utilizas nuestra plataforma web y servicios asociados, operando desde Mazatlán, Sinaloa, México.
            </p>

            {/* Section 1 */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">1. Datos que recopilamos</h2>
              </div>
              <p className="text-[var(--color-texto-suave)]">Para brindarte un excelente servicio, recopilamos diferentes tipos de información dependiendo de si eres Cliente (organizador de un evento) o Proveedor (quien ofrece el servicio):</p>
              <ul className="space-y-4 mt-6 text-[var(--color-texto-suave)]">
                <li className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#d4af37] shrink-0" />
                  <span><strong className="text-[var(--color-texto)]">Información de Registro (Clientes y Proveedores):</strong> Nombre completo, dirección de correo electrónico, número de teléfono y contraseña.</span>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#d4af37] shrink-0" />
                  <span><strong className="text-[var(--color-texto)]">Información del Evento (Clientes):</strong> Fecha, tipo de evento, ubicación estimada y preferencias de servicios.</span>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#d4af37] shrink-0" />
                  <span><strong className="text-[var(--color-texto)]">Información Comercial (Proveedores):</strong> Nombre del negocio, dirección comercial, fotografías de servicios, tarifas y, en su caso, datos fiscales para facturación.</span>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#d4af37] shrink-0" />
                  <span className="bg-[#d4af37]/5 p-4 rounded-2xl border border-[#d4af37]/20">
                    <strong className="text-[var(--color-texto)] font-black">Información de Pago:</strong> Utilizamos Mercado Pago como pasarela de pago segura. Eventia no almacena ni tiene acceso a los números de tu tarjeta de crédito o débito, ni a tus contraseñas bancarias. Solo recibimos confirmaciones de transacción y tokens de seguridad.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                  <Eye size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">2. ¿Para qué utilizamos tus datos?</h2>
              </div>
              <p className="text-[var(--color-texto-suave)]">Utilizamos tu información personal para las siguientes finalidades principales:</p>
              <div className="grid md:grid-cols-2 gap-4 mt-8">
                {[
                  "Crear y gestionar tu cuenta dentro de la plataforma.",
                  "Conectar a Clientes con Proveedores para cotización.",
                  "Facilitar la comunicación interna entre las partes.",
                  "Procesar pagos de forma segura vía Mercado Pago.",
                  "Brindar soporte técnico y atención al cliente.",
                  "Mejorar la experiencia y seguridad de la plataforma."
                ].map((item, i) => (
                  <div key={i} className="bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-4 rounded-2xl flex gap-3 items-start">
                    <div className="mt-1 text-[#d4af37] font-bold text-sm">{i + 1}.</div>
                    <span className="text-sm font-medium text-[var(--color-texto-suave)]">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-12 text-[var(--color-texto-suave)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <RefreshCw size={20} />
                </div>
                <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">3. Transferencia de Datos</h2>
              </div>
              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)]">
                  <h4 className="font-bold mb-2 text-[var(--color-texto)]">Entre Usuarios:</h4>
                  <p className="text-sm">Cuando un Cliente reserva o solicita una cotización, compartiremos los datos de contacto básicos (nombre, teléfono y detalles del evento) con ese Proveedor. De igual forma, el Cliente tendrá acceso a los datos del Proveedor.</p>
                </div>
                <div className="p-6 rounded-3xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)]">
                  <h4 className="font-bold mb-2 text-[var(--color-texto)]">Procesadores de Pago:</h4>
                  <p className="text-sm">Compartimos los datos de transacción necesarios con Mercado Pago para procesar los cobros y transferencias de manera segura.</p>
                </div>
                <p className="font-bold text-[#d4af37] italic">Eventia no vende, alquila ni comercializa tu información personal a terceros para fines publicitarios externos.</p>
              </div>
            </section>

            {/* Section 4 & 5 */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <section className="bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-8 rounded-[2rem]">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 uppercase tracking-tight text-[var(--color-texto)]">
                  <Smartphone size={20} className="text-[#d4af37]" />
                  4. Cookies
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-texto-muted)]">
                  Nuestra plataforma utiliza cookies para mantener tu sesión activa, recordar tus preferencias y analizar el tráfico para mejorar el rendimiento.
                </p>
              </section>

              <section className="bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-8 rounded-[2rem]">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 uppercase tracking-tight text-[var(--color-texto)]">
                  <Shield size={20} className="text-[#d4af37]" />
                  5. Derechos ARCO
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-texto-muted)]">
                  Tienes derecho a conocer, rectificar, cancelar u oponerte al uso de tus datos. Contacta con nosotros para ejercer estos derechos.
                </p>
              </section>
            </div>

            {/* Footer Info */}
            <footer className="border-t border-[var(--color-borde-suave)] pt-12 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#d4af37] text-black font-bold mb-8 shadow-lg shadow-[#d4af37]/20">
                <Mail size={18} />
                <span>privacidad@eventia.com</span>
              </div>
              <p className="text-sm text-[var(--color-texto-muted)] italic">
                Eventia se reserva el derecho de modificar este Aviso de Privacidad en cualquier momento. Notificaremos a nuestros usuarios sobre cambios significativos.
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
