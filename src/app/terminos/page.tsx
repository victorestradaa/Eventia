'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  ChevronLeft,
  Shield,
  Scale,
  AlertTriangle,
  CreditCard,
  Ban,
  Globe,
  MapPin,
  UserCheck,
  Network,
  Users,
  Store,
  ShieldOff,
  Image as ImageIcon,
  Copyright,
  Server,
  Pencil,
  Lock,
} from 'lucide-react';

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
            <span className="font-bold tracking-tighter text-lg uppercase">EVENTIUM</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Hero */}
        <div className="mb-16 text-center md:text-left">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] mb-6">
            <Scale size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-[var(--color-texto)]">
            Términos y <span className="text-[#d4af37]">Condiciones</span> de Uso
          </h1>
          <p className="text-[var(--color-texto-muted)] font-medium">
            Última actualización: Abril de 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <div className="prose prose-lg max-w-none">
            <p className="lead font-medium text-lg leading-relaxed mb-12 text-[var(--color-texto)]">
              Al acceder y utilizar la plataforma Eventium (
              <a href="https://www.eventium.mx" className="text-[#d4af37] no-underline hover:underline">www.eventium.mx</a>
              ), aceptas estos Términos y Condiciones.
            </p>

            {/* 1. Identidad del responsable */}
            <Section icon={UserCheck} color="blue" title="1. Identidad del responsable">
              <Card>
                <p className="m-0 mb-2">El servicio es operado por:</p>
                <p className="m-0"><strong className="text-[var(--color-texto)]">Víctor Manuel Estrada Aguilar</strong></p>
                <p className="m-0 text-sm">RFC: <strong className="text-[var(--color-texto)]">EAAV920712GH2</strong></p>
                <p className="m-0 text-sm flex items-center gap-2">
                  <MapPin size={14} className="text-[#d4af37]" />
                  Domicilio: Leonardo Avilés 2529, Col. 12 de Mayo, C.P. 82020, Mazatlán, Sinaloa, México.
                </p>
                <p className="m-0 text-sm pt-2 italic">(en adelante, “Eventium”)</p>
              </Card>
            </Section>

            {/* 2. Naturaleza del servicio */}
            <Section icon={Network} color="purple" title="2. Naturaleza del servicio">
              <Card>
                <p className="m-0 mb-3">Eventium es una <strong className="text-[var(--color-texto)]">plataforma tecnológica de intermediación</strong> que permite:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>A <strong className="text-[var(--color-texto)]">Clientes</strong> encontrar proveedores de servicios para eventos.</li>
                  <li>A <strong className="text-[var(--color-texto)]">Proveedores</strong> ofrecer sus servicios.</li>
                </ul>
              </Card>
              <Aviso>
                Eventium <strong>no presta servicios de eventos</strong>, ni actúa como proveedor, organizador, ni garante.
              </Aviso>
            </Section>

            {/* 3. Relación entre usuarios */}
            <Section icon={Users} color="amber" title="3. Relación entre usuarios">
              <Card>
                <p className="m-0 mb-3">Los contratos, acuerdos y relaciones comerciales:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Se realizan <strong className="text-[var(--color-texto)]">directamente entre Cliente y Proveedor</strong>.</li>
                  <li>Son <strong className="text-[var(--color-texto)]">independientes de Eventium</strong>.</li>
                </ul>
                <p className="text-sm mt-3 m-0">Eventium no forma parte del contrato entre las partes.</p>
              </Card>
            </Section>

            {/* 4. Responsabilidad del proveedor */}
            <Section icon={Store} color="emerald" title="4. Responsabilidad del proveedor">
              <Card>
                <p className="m-0 mb-3">El proveedor es <strong className="text-[var(--color-texto)]">único y total responsable</strong> de:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Cumplimiento del servicio</li>
                  <li>Calidad</li>
                  <li>Entrega</li>
                  <li>Cancelaciones</li>
                  <li>Reembolsos</li>
                  <li>Daños o incumplimientos</li>
                </ul>
              </Card>
              <Aviso>
                Eventium <strong>no garantiza ni respalda</strong> ningún servicio publicado en la plataforma.
              </Aviso>
            </Section>

            {/* 5. Responsabilidad del cliente */}
            <Section icon={UserCheck} color="blue" title="5. Responsabilidad del cliente">
              <Card>
                <p className="m-0 mb-3">El cliente acepta que:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Contrata <strong className="text-[var(--color-texto)]">bajo su propio criterio</strong>.</li>
                  <li>Es responsable de <strong className="text-[var(--color-texto)]">verificar la información del proveedor</strong>.</li>
                  <li>Asume los <strong className="text-[var(--color-texto)]">riesgos derivados de la contratación</strong>.</li>
                </ul>
              </Card>
            </Section>

            {/* 6. Limitación de responsabilidad de Eventium */}
            <Section icon={ShieldOff} color="red" title="6. Limitación de responsabilidad de Eventium">
              <Card>
                <p className="m-0 mb-3">Eventium <strong className="text-[var(--color-texto)]">no será responsable</strong> por:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Incumplimientos de proveedores</li>
                  <li>Cancelaciones de eventos</li>
                  <li>Fraudes entre usuarios</li>
                  <li>Daños, pérdidas o perjuicios</li>
                  <li>Calidad de servicios</li>
                  <li>Problemas derivados de pagos</li>
                  <li>Información incorrecta publicada por usuarios</li>
                </ul>
              </Card>
              <Destacado>El uso de la plataforma es bajo el propio riesgo del usuario.</Destacado>
            </Section>

            {/* 7. Pagos y comisiones */}
            <Section icon={CreditCard} color="emerald" title="7. Pagos y comisiones">
              <Card>
                <p className="m-0 mb-3">Eventium utiliza <strong className="text-[var(--color-texto)]">Mercado Pago</strong> como herramienta tecnológica para:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Procesar pagos</li>
                  <li>Retener comisiones</li>
                  <li>Dispersar fondos a proveedores</li>
                </ul>
              </Card>
              <Aviso>
                <strong>IMPORTANTE:</strong>
                <ul className="m-0 ml-5 list-disc text-sm mt-2 space-y-1">
                  <li>Eventium no es institución financiera.</li>
                  <li>Eventium no administra fondos como fiduciario.</li>
                  <li>Eventium no garantiza pagos ni cobros.</li>
                </ul>
              </Aviso>
              <p className="text-sm text-[var(--color-texto-suave)] mt-3">
                El proveedor es responsable de su servicio, <strong className="text-[var(--color-texto)]">independientemente del flujo de pago</strong>.
              </p>
            </Section>

            {/* 8. Reembolsos y cancelaciones */}
            <Section icon={Ban} color="red" title="8. Reembolsos y cancelaciones">
              <Card>
                <p className="m-0 mb-3">Eventium <strong className="text-[var(--color-texto)]">no gestiona, no autoriza y no garantiza reembolsos</strong>.</p>
                <p className="m-0 mb-2">Las políticas de:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Cancelación</li>
                  <li>Reembolso</li>
                  <li>Cambios</li>
                </ul>
                <p className="text-sm m-0 mt-3">son <strong className="text-[var(--color-texto)]">responsabilidad exclusiva del proveedor</strong>.</p>
              </Card>
            </Section>

            {/* 9. Disputas entre usuarios */}
            <Section icon={AlertTriangle} color="amber" title="9. Disputas entre usuarios">
              <Card>
                <p className="m-0 mb-3">Eventium:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>No actúa como mediador obligatorio.</li>
                  <li>No resuelve disputas.</li>
                  <li>No emite decisiones vinculantes.</li>
                </ul>
                <p className="text-sm mt-3 m-0">
                  Cualquier conflicto deberá resolverse <strong className="text-[var(--color-texto)]">directamente entre Cliente y Proveedor</strong>.
                </p>
              </Card>
            </Section>

            {/* 10. Uso de la plataforma */}
            <Section icon={FileText} color="blue" title="10. Uso de la plataforma">
              <Card>
                <p className="m-0 mb-3">El usuario se compromete a:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Proporcionar información veraz.</li>
                  <li>No realizar actividades fraudulentas.</li>
                  <li>No suplantar identidades.</li>
                  <li>No usar la plataforma con fines ilegales.</li>
                </ul>
              </Card>
              <Aviso>
                Eventium podrá <strong>suspender cuentas, eliminar contenido o bloquear usuarios</strong> sin previo aviso.
              </Aviso>
            </Section>

            {/* 11. Contenido y publicaciones */}
            <Section icon={ImageIcon} color="purple" title="11. Contenido y publicaciones">
              <Card>
                <p className="m-0 mb-3">Los proveedores son responsables de:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Fotos</li>
                  <li>Descripciones</li>
                  <li>Precios</li>
                  <li>Promociones</li>
                </ul>
                <p className="text-sm mt-3 m-0">
                  Eventium <strong className="text-[var(--color-texto)]">no garantiza veracidad ni exactitud</strong> del contenido.
                </p>
              </Card>
            </Section>

            {/* 12. Propiedad intelectual */}
            <Section icon={Copyright} color="amber" title="12. Propiedad intelectual">
              <Card>
                <p className="m-0 mb-3">Todo el contenido de Eventium:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Diseño</li>
                  <li>Marca</li>
                  <li>Código</li>
                  <li>Plataforma</li>
                </ul>
                <p className="text-sm mt-3 m-0">
                  es <strong className="text-[var(--color-texto)]">propiedad de Eventium</strong>. Queda prohibido su uso sin autorización.
                </p>
              </Card>
            </Section>

            {/* 13. Disponibilidad del servicio */}
            <Section icon={Server} color="blue" title="13. Disponibilidad del servicio">
              <Card>
                <p className="m-0 mb-3">Eventium <strong className="text-[var(--color-texto)]">no garantiza</strong>:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Funcionamiento continuo.</li>
                  <li>Ausencia de errores.</li>
                  <li>Disponibilidad permanente.</li>
                </ul>
              </Card>
            </Section>

            {/* 14. Modificaciones */}
            <Section icon={Pencil} color="emerald" title="14. Modificaciones">
              <Card>
                <p className="m-0 mb-3">Eventium puede modificar:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Funcionalidades</li>
                  <li>Precios</li>
                  <li>Condiciones</li>
                </ul>
                <p className="text-sm mt-3 m-0">en cualquier momento.</p>
              </Card>
            </Section>

            {/* 15. Protección de datos */}
            <Section icon={Lock} color="purple" title="15. Protección de datos">
              <Card>
                <p className="m-0 text-sm">El uso de datos personales se rige por el</p>
                <Link
                  href="/privacidad"
                  className="inline-flex items-center gap-2 mt-3 text-[#d4af37] font-bold hover:underline no-underline"
                >
                  👉 Aviso de Privacidad de Eventium
                </Link>
              </Card>
            </Section>

            {/* 16. Exclusión de garantías */}
            <Section icon={ShieldOff} color="red" title="16. Exclusión de garantías">
              <Card>
                <p className="m-0 mb-3">La plataforma se proporciona <strong className="text-[var(--color-texto)]">“tal cual”</strong>:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Sin garantías de funcionamiento.</li>
                  <li>Sin garantía de resultados.</li>
                  <li>Sin garantía de satisfacción.</li>
                </ul>
              </Card>
            </Section>

            {/* 17. Indemnización */}
            <Section icon={Scale} color="amber" title="17. Indemnización">
              <Card>
                <p className="m-0 mb-3">El usuario acepta <strong className="text-[var(--color-texto)]">indemnizar a Eventium</strong> por:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Uso indebido de la plataforma.</li>
                  <li>Violación de estos términos.</li>
                  <li>Daños causados a terceros.</li>
                </ul>
              </Card>
            </Section>

            {/* 18. Jurisdicción */}
            <section className="bg-[var(--color-fondo)]/80 p-8 rounded-[2.5rem] border-2 border-[#d4af37]/30 shadow-xl shadow-[#d4af37]/5 mb-12">
              <div className="flex items-center gap-3 mb-4 text-[#d4af37]">
                <MapPin size={24} />
                <h3 className="text-xl font-black uppercase tracking-tighter m-0">18. Jurisdicción</h3>
              </div>
              <p className="text-[var(--color-texto-suave)] text-sm leading-relaxed m-0 mb-3">
                Para cualquier controversia:
              </p>
              <ul className="m-0 ml-5 list-disc space-y-1 text-sm text-[var(--color-texto-suave)]">
                <li>Se aplicarán las <strong className="text-[var(--color-texto)]">leyes de México</strong>.</li>
                <li>Competencia en <strong className="text-[var(--color-texto)]">Mazatlán, Sinaloa</strong>.</li>
              </ul>
            </section>

            {/* Footer */}
            <footer className="border-t border-[var(--color-borde-suave)] pt-12 text-center">
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
          className="w-full py-6 rounded-[2rem] bg-[var(--color-texto)] text-[var(--color-fondo)] font-black uppercase tracking-[0.2em] flex items-center justify-center hover:scale-[0.98] active:scale-[0.95] transition-all shadow-2xl"
        >
          Acepto los términos
        </Link>
      </div>
    </div>
  );
}

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-500',
  amber: 'bg-amber-500/10 text-amber-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  red: 'bg-red-500/10 text-red-500',
  purple: 'bg-purple-500/10 text-purple-500',
};

function Section({
  icon: Icon,
  color,
  title,
  children,
}: {
  icon: any;
  color: keyof typeof COLOR_MAP;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${COLOR_MAP[color]}`}>
          <Icon size={20} />
        </div>
        <h2 className="text-2xl font-bold m-0 text-[var(--color-texto)] uppercase tracking-tight">{title}</h2>
      </div>
      <div className="space-y-3 text-[var(--color-texto-suave)]">{children}</div>
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-3xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)]">
      {children}
    </div>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-sm text-[var(--color-texto-suave)] flex items-start gap-2">
      <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
      <div className="m-0">{children}</div>
    </div>
  );
}

function Destacado({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 font-bold text-center text-sm">
      {children}
    </div>
  );
}
