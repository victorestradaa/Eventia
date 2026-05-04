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
  MapPin,
  UserCheck,
  Network,
  Store,
  ShieldOff,
  Copyright,
  Pencil,
  Lock,
  CheckCircle2,
  CalendarClock,
  Star,
  Handshake,
} from 'lucide-react';

export default function ContratoProveedorPage() {
  return (
    <div className="min-h-screen bg-[var(--color-fondo)] text-[var(--color-texto)] selection:bg-[#d4af37]/30">
      {/* Header */}
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
            <Handshake size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-[var(--color-texto)]">
            Contrato de Prestación de Servicios para <span className="text-[#d4af37]">Proveedores</span>
          </h1>
          <p className="text-[var(--color-texto-muted)] font-medium">
            Última actualización: Abril de 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <div className="prose prose-lg max-w-none">
            <p className="lead font-medium text-lg leading-relaxed mb-12 text-[var(--color-texto)]">
              El presente contrato regula la relación entre Eventium y los proveedores que se registran en la plataforma para ofrecer sus servicios.
            </p>

            {/* 1. Partes */}
            <Section icon={UserCheck} color="blue" title="1. Partes">
              <Card>
                <p className="m-0 mb-2 font-bold text-[var(--color-texto)]">Por una parte:</p>
                <p className="m-0"><strong className="text-[var(--color-texto)]">Víctor Manuel Estrada Aguilar</strong></p>
                <p className="m-0 text-sm">RFC: <strong className="text-[var(--color-texto)]">EAAV920712GH2</strong></p>
                <p className="m-0 text-sm flex items-center gap-2">
                  <MapPin size={14} className="text-[#d4af37]" />
                  Domicilio: Leonardo Avilés 2529, Col. 12 de Mayo, C.P. 82020, Mazatlán, Sinaloa, México.
                </p>
                <p className="m-0 text-sm pt-1 italic">(en adelante, “Eventium”)</p>
                <div className="border-t border-[var(--color-borde-suave)] my-4" />
                <p className="m-0 mb-2 font-bold text-[var(--color-texto)]">Y por otra:</p>
                <p className="m-0 text-sm">El <strong className="text-[var(--color-texto)]">Proveedor</strong>, persona física o moral que se registra en la plataforma.</p>
              </Card>
            </Section>

            {/* 2. Objeto */}
            <Section icon={FileText} color="amber" title="2. Objeto">
              <Card>
                <p className="m-0 mb-3">El presente contrato regula el uso de la plataforma Eventium por parte del proveedor para:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Publicar servicios.</li>
                  <li>Promocionar su negocio.</li>
                  <li>Recibir solicitudes de clientes.</li>
                </ul>
              </Card>
            </Section>

            {/* 3. Naturaleza de la relación */}
            <Section icon={Network} color="purple" title="3. Naturaleza de la relación">
              <Card>
                <p className="m-0 mb-3">Eventium actúa exclusivamente como <strong className="text-[var(--color-texto)]">intermediario tecnológico</strong>.</p>
                <p className="m-0 mb-2">No existe relación de:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Sociedad</li>
                  <li>Asociación</li>
                  <li>Representación</li>
                  <li>Relación laboral</li>
                </ul>
                <p className="text-sm mt-3 m-0">El proveedor actúa de <strong className="text-[var(--color-texto)]">forma independiente</strong>.</p>
              </Card>
            </Section>

            {/* 4. Responsabilidad total del proveedor */}
            <Section icon={Store} color="emerald" title="4. Responsabilidad total del proveedor">
              <Card>
                <p className="m-0 mb-3">El proveedor es <strong className="text-[var(--color-texto)]">único responsable</strong> de:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Cumplimiento del servicio.</li>
                  <li>Calidad.</li>
                  <li>Entrega.</li>
                  <li>Cancelaciones.</li>
                  <li>Reembolsos.</li>
                  <li>Atención al cliente.</li>
                  <li>Daños ocasionados.</li>
                </ul>
              </Card>
              <Aviso>
                Eventium <strong>no será responsable bajo ninguna circunstancia</strong> por el servicio prestado.
              </Aviso>
            </Section>

            {/* 5. Obligaciones del proveedor */}
            <Section icon={CheckCircle2} color="emerald" title="5. Obligaciones del proveedor">
              <Card>
                <p className="m-0 mb-3">El proveedor se compromete a:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Proporcionar información veraz.</li>
                  <li>Cumplir con lo ofrecido.</li>
                  <li>Respetar fechas y condiciones.</li>
                  <li>Atender a los clientes adecuadamente.</li>
                  <li>Cumplir con leyes aplicables.</li>
                </ul>
              </Card>
            </Section>

            {/* 6. Pagos y comisiones */}
            <Section icon={CreditCard} color="emerald" title="6. Pagos y comisiones">
              <Card>
                <p className="m-0 mb-3">Eventium utiliza herramientas como <strong className="text-[var(--color-texto)]">Mercado Pago</strong> para:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Procesar pagos.</li>
                  <li>Retener comisión.</li>
                  <li>Transferir el restante al proveedor.</li>
                </ul>
              </Card>
              <Aviso>
                <strong>IMPORTANTE:</strong>
                <ul className="m-0 ml-5 list-disc text-sm mt-2 space-y-1">
                  <li>Eventium no es institución financiera.</li>
                  <li>Eventium no garantiza pagos.</li>
                  <li>Eventium no es responsable de contracargos o disputas bancarias.</li>
                </ul>
              </Aviso>
            </Section>

            {/* 7. Reembolsos y cancelaciones */}
            <Section icon={Ban} color="red" title="7. Reembolsos y cancelaciones">
              <Card>
                <p className="m-0 mb-3">El proveedor es responsable de <strong className="text-[var(--color-texto)]">establecer y cumplir sus políticas de cancelación</strong>.</p>
                <p className="m-0 mb-2">Eventium:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>No gestiona reembolsos.</li>
                  <li>No interviene en devoluciones.</li>
                  <li>No cubre pérdidas.</li>
                </ul>
              </Card>
            </Section>

            {/* 8. Disponibilidad y agenda */}
            <Section icon={CalendarClock} color="blue" title="8. Disponibilidad y agenda">
              <Card>
                <p className="m-0 mb-3">El proveedor es responsable de:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Mantener actualizada su disponibilidad.</li>
                  <li>Gestionar su agenda correctamente.</li>
                  <li>Evitar sobreventas.</li>
                </ul>
                <p className="text-sm mt-3 m-0">Eventium <strong className="text-[var(--color-texto)]">no es responsable</strong> por errores de agenda.</p>
              </Card>
            </Section>

            {/* 9. Uso de datos */}
            <Section icon={Lock} color="purple" title="9. Uso de datos">
              <Card>
                <p className="m-0 mb-3">El proveedor acepta que:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Recibirá datos de clientes.</li>
                  <li>Debe usarlos <strong className="text-[var(--color-texto)]">únicamente para fines del servicio</strong>.</li>
                </ul>
              </Card>
              <Aviso>
                <strong>Queda prohibido:</strong>
                <ul className="m-0 ml-5 list-disc text-sm mt-2 space-y-1">
                  <li>Vender datos.</li>
                  <li>Usarlos para spam.</li>
                  <li>Compartirlos sin autorización.</li>
                </ul>
              </Aviso>
            </Section>

            {/* 10. Reputación y reseñas */}
            <Section icon={Star} color="amber" title="10. Reputación y reseñas">
              <Card>
                <p className="m-0 mb-3">Eventium podrá:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Mostrar calificaciones.</li>
                  <li>Publicar reseñas.</li>
                  <li>Ajustar visibilidad del proveedor.</li>
                </ul>
                <p className="text-sm mt-3 m-0">Eventium <strong className="text-[var(--color-texto)]">no garantiza posicionamiento</strong>.</p>
              </Card>
            </Section>

            {/* 11. Suspensión o terminación */}
            <Section icon={AlertTriangle} color="red" title="11. Suspensión o terminación">
              <Card>
                <p className="m-0 mb-3">Eventium podrá <strong className="text-[var(--color-texto)]">suspender o eliminar cuentas</strong> por:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Incumplimientos.</li>
                  <li>Fraudes.</li>
                  <li>Mala reputación.</li>
                  <li>Uso indebido.</li>
                </ul>
                <p className="text-sm mt-3 m-0">Sin necesidad de previo aviso.</p>
              </Card>
            </Section>

            {/* 12. Limitación de responsabilidad de Eventium */}
            <Section icon={ShieldOff} color="red" title="12. Limitación de responsabilidad de Eventium">
              <Card>
                <p className="m-0 mb-3">Eventium <strong className="text-[var(--color-texto)]">no será responsable</strong> por:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Cancelaciones.</li>
                  <li>Daños a clientes.</li>
                  <li>Incumplimientos.</li>
                  <li>Pérdidas económicas.</li>
                  <li>Problemas legales del proveedor.</li>
                </ul>
              </Card>
            </Section>

            {/* 13. Indemnización */}
            <Section icon={Scale} color="amber" title="13. Indemnización">
              <Card>
                <p className="m-0 mb-3">El proveedor acepta:</p>
                <p className="m-0 text-sm">
                  Indemnizar a Eventium por <strong className="text-[var(--color-texto)]">cualquier reclamación derivada de sus servicios</strong>.
                </p>
                <p className="m-0 mt-3 mb-2 text-sm">Incluye:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Demandas.</li>
                  <li>Daños.</li>
                  <li>Gastos legales.</li>
                </ul>
              </Card>
            </Section>

            {/* 14. Propiedad intelectual */}
            <Section icon={Copyright} color="amber" title="14. Propiedad intelectual">
              <Card>
                <p className="m-0 mb-3">El proveedor autoriza a Eventium a usar:</p>
                <ul className="m-0 ml-5 list-disc space-y-1 text-sm">
                  <li>Imágenes.</li>
                  <li>Descripciones.</li>
                  <li>Marca.</li>
                </ul>
                <p className="text-sm mt-3 m-0">para promoción <strong className="text-[var(--color-texto)]">dentro de la plataforma</strong>.</p>
              </Card>
            </Section>

            {/* 15. Modificaciones */}
            <Section icon={Pencil} color="emerald" title="15. Modificaciones">
              <Card>
                <p className="m-0 text-sm">Eventium puede modificar este contrato en cualquier momento.</p>
              </Card>
            </Section>

            {/* 16. Jurisdicción */}
            <section className="bg-[var(--color-fondo)]/80 p-8 rounded-[2.5rem] border-2 border-[#d4af37]/30 shadow-xl shadow-[#d4af37]/5 mb-12">
              <div className="flex items-center gap-3 mb-4 text-[#d4af37]">
                <MapPin size={24} />
                <h3 className="text-xl font-black uppercase tracking-tighter m-0">16. Jurisdicción</h3>
              </div>
              <ul className="m-0 ml-5 list-disc space-y-1 text-sm text-[var(--color-texto-suave)]">
                <li>Aplican las <strong className="text-[var(--color-texto)]">leyes de México</strong>.</li>
                <li>Competencia en <strong className="text-[var(--color-texto)]">Mazatlán, Sinaloa</strong>.</li>
              </ul>
            </section>

            {/* Aceptación */}
            <section className="mb-4">
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#fdf6e1] to-[#f4e4b9] border-2 border-[#d4af37] text-[#1F2937] shadow-lg shadow-[#d4af37]/20 text-center">
                <p className="text-2xl m-0 mb-2">✍️</p>
                <p className="text-xs uppercase font-black tracking-widest text-[#1F2937]/70 m-0 mb-2">Aceptación</p>
                <p className="text-base font-bold m-0">
                  El proveedor acepta este contrato al registrarse en la plataforma.
                </p>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[var(--color-borde-suave)] pt-12 text-center mt-12">
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
          He leído y acepto
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
