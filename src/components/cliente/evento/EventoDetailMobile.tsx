'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  Users,
  Mail,
  Store,
  ChevronRight,
  CalendarDays,
  LayoutGrid,
  Phone,
  CreditCard,
  Trash2,
} from 'lucide-react';
import { formatearMoneda, cn } from '@/lib/utils';
import {
  MobilePageShell,
  MobileTopBar,
  MobileSection,
  MobileCard,
  MobileSegmentedTabs,
  MobileEmpty,
} from '@/components/cliente/mobile/primitives';

type Tab = 'resumen' | 'invitados' | 'pagos' | 'proveedores' | 'mesas';

interface Props {
  evento: any;
  fechaFormateada: string;
  diasRestantes: number | null;
  tabActiva: Tab;
  setTabActiva: (t: Tab) => void;
  invitados: any[];
  invitadosConfirmados: number;
  invitadosPendientes: number;
  invitadosRechazados: number;
  lineasConReservas: any[];
  lineasConReservasActivas: any[];
  subtotalContratado: number;
  totalPagado: number;
  presupuestoTotal: number;
  onEditEvento: () => void;
  onAbonar: (linea: any) => void;
  onAddInvitado: () => void;
  onUpdateRSVP: (invitadoId: string, estado: 'CONFIRMADO' | 'RECHAZADO' | 'PENDIENTE') => void;
  onEditInvitado: (invitado: any) => void;
  onDeleteInvitado: (invitado: any) => void;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'invitados', label: 'Invitados' },
  { key: 'pagos', label: 'Pagos' },
  { key: 'proveedores', label: 'Proveedores' },
  { key: 'mesas', label: 'Mesas' },
];

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

function rsvpBadgeStyle(estado: string) {
  switch (estado) {
    case 'CONFIRMADO':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'RECHAZADO':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
}

function estadoReservaStyle(estado?: string) {
  switch (estado) {
    case 'LIQUIDADO':
      return { label: 'Pagado', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'APARTADO':
      return { label: 'Apartado', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'TEMPORAL':
      return { label: 'Pendiente', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'CANCELADO':
      return { label: 'Cancelado', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
    default:
      return { label: 'Manual', cls: 'bg-[var(--color-fondo-hover)] text-[var(--color-texto-suave)] border-[var(--color-borde)]' };
  }
}

export default function EventoDetailMobile({
  evento,
  fechaFormateada,
  diasRestantes,
  tabActiva,
  setTabActiva,
  invitados,
  invitadosConfirmados,
  invitadosPendientes,
  invitadosRechazados,
  lineasConReservas,
  lineasConReservasActivas,
  subtotalContratado,
  totalPagado,
  presupuestoTotal,
  onEditEvento,
  onAbonar,
  onAddInvitado,
  onUpdateRSVP,
  onEditInvitado,
  onDeleteInvitado,
}: Props) {
  const progresoPagos = subtotalContratado > 0 ? Math.round((totalPagado / subtotalContratado) * 100) : 0;
  const restantePresupuesto = Math.max(0, presupuestoTotal - subtotalContratado);
  const pendientesPago = lineasConReservas.filter(
    (l: any) => Number(l.montoTotal) - Number(l.montoPagado || 0) > 0,
  );
  // Dedupe por id de pago: si dos líneas comparten reserva, los pagos pueden venir duplicados
  const historialPagos = (() => {
    const seen = new Set<string>();
    return lineasConReservasActivas
      .flatMap((l: any) =>
        (l.pagos || []).map((p: any) => ({ ...p, targetDesc: l.descripcion, parentLine: l })),
      )
      .filter((p: any) => {
        if (!p.id) return true; // si no hay id, dejarlo (raro)
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.fechaPago || b.fechaVencimiento || b.fecha).getTime() -
          new Date(a.fechaPago || a.fechaVencimiento || a.fecha).getTime(),
      );
  })();

  return (
    <MobilePageShell>
      <MobileTopBar
        title={evento.nombre}
        backHref="/cliente/dashboard"
        subtitle={fechaFormateada}
        rightSlot={
          <button
            type="button"
            onClick={onEditEvento}
            aria-label="Editar evento"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--color-texto)] active:bg-[var(--color-fondo-hover)] active:scale-95 transition-all"
          >
            <Edit size={19} />
          </button>
        }
      />

      {/* Hero del evento — gradiente navy con acentos dorados estilo app nativa */}
      <div
        className="relative p-5 mb-5 rounded-3xl text-white shadow-[0_8px_28px_rgba(17,24,39,0.18)] overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #030712 0%, #111827 60%, #1F2937 100%)',
        }}
      >
        {/* Glow dorado sutil esquina superior derecha */}
        <div
          aria-hidden
          className="absolute -top-16 -right-16 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.22) 0%, transparent 70%)' }}
        />
        {/* Línea dorada superior */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />

        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Próximo evento</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
              {evento.tipo}
            </span>
          </div>

          <h2 className="font-serif italic text-3xl leading-tight tracking-tight mb-2 drop-shadow-sm">
            {evento.nombre}
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-white/75 mb-3">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} className="text-[#d4af37]" /> {fechaFormateada}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={13} className="text-[#d4af37]" /> {evento.numInvitados || 0} invitados
            </span>
          </div>

          {typeof diasRestantes === 'number' && (
            <div className="mt-1 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-[12px] font-semibold border border-white/10">
              <Clock size={13} className="text-[#d4af37]" />
              <span><strong className="text-white">{diasRestantes}</strong> días faltan</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <MobileSegmentedTabs<Tab> tabs={TABS} value={tabActiva} onChange={setTabActiva} />

      {tabActiva === 'resumen' && (
        <ResumenTab
          presupuestoTotal={presupuestoTotal}
          subtotalContratado={subtotalContratado}
          totalPagado={totalPagado}
          restantePresupuesto={restantePresupuesto}
          progresoPagos={progresoPagos}
          invitadosTotal={invitados.length}
          invitadosConfirmados={invitadosConfirmados}
          invitadosPendientes={invitadosPendientes}
          invitadosRechazados={invitadosRechazados}
          numProveedoresContratados={lineasConReservasActivas.length}
          setTabActiva={setTabActiva}
        />
      )}

      {tabActiva === 'invitados' && (
        <InvitadosTab
          invitados={invitados}
          invitadosConfirmados={invitadosConfirmados}
          invitadosPendientes={invitadosPendientes}
          invitadosRechazados={invitadosRechazados}
          onAddInvitado={onAddInvitado}
          onUpdateRSVP={onUpdateRSVP}
          onEditInvitado={onEditInvitado}
          onDeleteInvitado={onDeleteInvitado}
        />
      )}

      {tabActiva === 'pagos' && (
        <PagosTab
          subtotalContratado={subtotalContratado}
          totalPagado={totalPagado}
          progresoPagos={progresoPagos}
          pendientes={pendientesPago}
          historial={historialPagos}
          onAbonar={onAbonar}
        />
      )}

      {tabActiva === 'proveedores' && (
        <ProveedoresTab
          lineas={lineasConReservas}
          eventoNombre={evento.nombre}
          fechaEvento={evento.fecha}
        />
      )}

      {tabActiva === 'mesas' && <MesasTab eventoId={evento.id} />}
    </MobilePageShell>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Resumen
// ────────────────────────────────────────────────────────────────────────────
function ResumenTab({
  presupuestoTotal,
  subtotalContratado,
  totalPagado,
  restantePresupuesto,
  progresoPagos,
  invitadosTotal,
  invitadosConfirmados,
  invitadosPendientes,
  invitadosRechazados,
  numProveedoresContratados,
  setTabActiva,
}: {
  presupuestoTotal: number;
  subtotalContratado: number;
  totalPagado: number;
  restantePresupuesto: number;
  progresoPagos: number;
  invitadosTotal: number;
  invitadosConfirmados: number;
  invitadosPendientes: number;
  invitadosRechazados: number;
  numProveedoresContratados: number;
  setTabActiva: (t: Tab) => void;
}) {
  return (
    <>
      <MobileSection title="Presupuesto">
        <MobileCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-texto-suave)]">Total</span>
            <span className="text-2xl font-bold text-[var(--color-texto)] tracking-tight">
              {formatearMoneda(presupuestoTotal)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-[var(--color-fondo)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)] mb-0.5">
                Contratado
              </p>
              <p className="text-base font-bold text-[var(--color-texto)]">{formatearMoneda(subtotalContratado)}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 mb-0.5">
                Restante
              </p>
              <p className="text-base font-bold text-emerald-700">{formatearMoneda(restantePresupuesto)}</p>
            </div>
          </div>
          {subtotalContratado > 0 && (
            <>
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-semibold text-[var(--color-texto-suave)]">Pagos: {formatearMoneda(totalPagado)}</span>
                <span className="font-bold text-[var(--color-texto)]">{progresoPagos}%</span>
              </div>
              <div className="w-full h-2 bg-[var(--color-fondo-hover)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  style={{ width: `${progresoPagos}%` }}
                />
              </div>
            </>
          )}
        </MobileCard>
      </MobileSection>

      <MobileSection
        title="Invitados"
        action={
          <button
            type="button"
            onClick={() => setTabActiva('invitados')}
            className="text-[11px] font-semibold text-[var(--color-texto)] active:text-[var(--color-texto)]"
          >
            Ver todos
          </button>
        }
      >
        {invitadosTotal === 0 ? (
          <MobileEmpty
            icon={Users}
            title="Sin invitados"
            description="Comienza a armar tu lista de invitados desde cero."
            action={
              <button
                type="button"
                onClick={() => setTabActiva('invitados')}
                className="px-5 py-2.5 rounded-full bg-[var(--color-primario)] text-white text-[13px] font-semibold active:scale-95 transition-all"
              >
                Agregar invitados
              </button>
            }
          />
        ) : (
          <MobileCard className="p-4">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Stat label="Confirmados" value={invitadosConfirmados} tone="emerald" />
              <Stat label="Pendientes" value={invitadosPendientes} tone="amber" />
              <Stat label="Rechazados" value={invitadosRechazados} tone="rose" />
            </div>
            <button
              type="button"
              onClick={() => setTabActiva('invitados')}
              className="w-full py-2.5 rounded-xl bg-[var(--color-fondo-hover)] text-[var(--color-texto)] text-[13px] font-semibold active:scale-[0.98] transition-all"
            >
              Gestionar lista ({invitadosTotal})
            </button>
          </MobileCard>
        )}
      </MobileSection>

      <MobileSection title="Proveedores">
        <MobileCard className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-fondo-hover)] flex items-center justify-center text-[var(--color-texto)]">
              <Store size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[var(--color-texto)]">
                {numProveedoresContratados} contratados
              </p>
              <p className="text-[11px] text-[var(--color-texto-suave)]">
                {numProveedoresContratados > 0
                  ? '¡Sigue armando tu equipo!'
                  : 'Aún no contratas proveedores.'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTabActiva('proveedores')}
              className="py-2.5 rounded-xl bg-[var(--color-fondo-hover)] text-[var(--color-texto)] text-[13px] font-semibold active:scale-[0.98] transition-all"
            >
              Ver detalle
            </button>
            <Link
              href="/cliente/explorar"
              className="py-2.5 rounded-xl bg-[var(--color-primario)] text-white text-[13px] font-semibold text-center active:scale-[0.98] transition-all"
            >
              Buscar más
            </Link>
          </div>
        </MobileCard>
      </MobileSection>

      <MobileSection title="Tu evento, en marcha">
        <MobileCard href="/cliente/invitaciones" interactive className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-fondo-hover)] flex items-center justify-center text-[var(--color-texto)]">
            <Mail size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[var(--color-texto)]">Invitación digital</p>
            <p className="text-[12px] text-[var(--color-texto-suave)] truncate">Personaliza y envía tu invitación.</p>
          </div>
          <ChevronRight size={18} className="text-[var(--color-texto-muted)]" />
        </MobileCard>
      </MobileSection>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'emerald' | 'amber' | 'rose' }) {
  const palette =
    tone === 'emerald'
      ? 'bg-emerald-50 text-emerald-700'
      : tone === 'amber'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-rose-50 text-rose-700';
  return (
    <div className={cn('rounded-xl p-2.5 text-center', palette)}>
      <p className="text-lg font-bold leading-none">{value}</p>
      <p className="text-[9px] font-semibold uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Invitados
// ────────────────────────────────────────────────────────────────────────────
function InvitadosTab({
  invitados,
  invitadosConfirmados,
  invitadosPendientes,
  invitadosRechazados,
  onAddInvitado,
  onUpdateRSVP,
  onEditInvitado,
  onDeleteInvitado,
}: {
  invitados: any[];
  invitadosConfirmados: number;
  invitadosPendientes: number;
  invitadosRechazados: number;
  onAddInvitado: () => void;
  onUpdateRSVP: (id: string, estado: 'CONFIRMADO' | 'RECHAZADO' | 'PENDIENTE') => void;
  onEditInvitado: (invitado: any) => void;
  onDeleteInvitado: (invitado: any) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Stat label="Confirmados" value={invitadosConfirmados} tone="emerald" />
        <Stat label="Pendientes" value={invitadosPendientes} tone="amber" />
        <Stat label="Rechazados" value={invitadosRechazados} tone="rose" />
      </div>

      <button
        type="button"
        onClick={onAddInvitado}
        className="w-full mb-4 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[var(--color-primario)] text-white text-[14px] font-semibold active:scale-[0.98] transition-all shadow-sm"
      >
        <Plus size={18} /> Agregar invitado
      </button>

      {invitados.length === 0 ? (
        <MobileEmpty
          icon={Users}
          title="Lista vacía"
          description="Aún no agregas invitados. Empieza por la familia más cercana."
        />
      ) : (
        <MobileSection title={`Lista (${invitados.length})`}>
          <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl shadow-sm divide-y divide-[var(--color-borde-suave)] overflow-hidden">
            {invitados.map((i: any) => (
              <InvitadoRow key={i.id} invitado={i} onUpdateRSVP={onUpdateRSVP} onEditInvitado={onEditInvitado} onDeleteInvitado={onDeleteInvitado} />
            ))}
          </div>
        </MobileSection>
      )}
    </>
  );
}

function InvitadoRow({
  invitado,
  onUpdateRSVP,
  onEditInvitado,
  onDeleteInvitado,
}: {
  invitado: any;
  onUpdateRSVP: (id: string, estado: 'CONFIRMADO' | 'RECHAZADO' | 'PENDIENTE') => void;
  onEditInvitado: (invitado: any) => void;
  onDeleteInvitado: (invitado: any) => void;
}) {
  const estado = invitado.rsvpEstado || 'PENDIENTE';
  const labelEstado = estado === 'CONFIRMADO' ? 'Confirmado' : estado === 'RECHAZADO' ? 'Rechazado' : 'Pendiente';

  const sendWhatsApp = () => {
    const tel = (invitado.telefono || '').replace(/\D/g, '');
    if (!tel) return;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = invitado.rsvpToken ? `${baseUrl}/invitacion/${invitado.rsvpToken}` : baseUrl;
    const mensaje = `¡Hola ${invitado.nombre}! Te invito a mi evento, aquí tienes tu invitación digital para confirmar tu asistencia: ${link}`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[var(--color-fondo-hover)] flex items-center justify-center text-[13px] font-bold text-[var(--color-texto)] shrink-0">
        {getInitials(invitado.nombre || '?')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-[var(--color-texto)] truncate">{invitado.nombre}</p>
        <p className="text-[12px] text-[var(--color-texto-suave)] truncate">
          {invitado.email || invitado.telefono || 'Sin contacto'}
        </p>
      </div>
      {invitado.telefono && (
        <button
          type="button"
          onClick={sendWhatsApp}
          aria-label="Enviar invitación por WhatsApp"
          style={{ backgroundColor: '#25D366' }}
          className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform shrink-0"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
      )}
      <button
        type="button"
        onClick={() => onEditInvitado(invitado)}
        aria-label="Editar invitado"
        className="w-9 h-9 rounded-full bg-[var(--color-fondo-hover)] flex items-center justify-center text-[var(--color-texto-suave)] active:scale-95 transition-transform shrink-0"
      >
        <Edit size={15} />
      </button>
      <button
        type="button"
        onClick={() => onDeleteInvitado(invitado)}
        aria-label="Eliminar invitado"
        className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 active:scale-95 transition-transform shrink-0"
      >
        <Trash2 size={15} />
      </button>
      <span
        className={cn(
          'text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border',
          rsvpBadgeStyle(estado),
        )}
      >
        {labelEstado}
      </span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Pagos
// ────────────────────────────────────────────────────────────────────────────
function PagosTab({
  subtotalContratado,
  totalPagado,
  progresoPagos,
  pendientes,
  historial,
  onAbonar,
}: {
  subtotalContratado: number;
  totalPagado: number;
  progresoPagos: number;
  pendientes: any[];
  historial: any[];
  onAbonar: (linea: any) => void;
}) {
  const saldo = Math.max(0, subtotalContratado - totalPagado);
  // Filtro de historial por línea de presupuesto/reserva (proveedor seleccionado)
  const [filtroLineaId, setFiltroLineaId] = useState<string | null>(null);

  const historialFiltrado = filtroLineaId
    ? historial.filter((p: any) => p.parentLine?.id === filtroLineaId)
    : historial;

  // Nombre del proveedor seleccionado (para el chip de filtro)
  const proveedorFiltradoNombre = filtroLineaId
    ? (() => {
        const linea = pendientes.find((l: any) => l.id === filtroLineaId)
          || historial.find((p: any) => p.parentLine?.id === filtroLineaId)?.parentLine;
        return linea?.servicio?.proveedor?.nombre || linea?.proveedor?.nombre || linea?.descripcion || 'Filtrado';
      })()
    : null;

  return (
    <>
      {/* Resumen financiero — card prominente con accent dorado */}
      <div className="bg-[var(--color-fondo-card)] rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[var(--color-borde-suave)] mb-5 overflow-hidden">
        {/* Línea decorativa dorada superior */}
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-[#d4af37] to-emerald-400" />

        <div className="p-5">
          {/* Encabezado con icono */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Wallet size={17} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-texto-suave)] leading-none">Pagado</p>
                <p className="text-[11px] text-[var(--color-texto-suave)] mt-0.5">{progresoPagos}% liquidado</p>
              </div>
            </div>
          </div>

          {/* Monto principal */}
          <p className="text-[36px] font-bold text-[var(--color-texto)] tracking-tight leading-none mb-3 tabular-nums">
            {formatearMoneda(totalPagado)}
          </p>

          {/* Barra de progreso */}
          <div className="w-full h-2 bg-[var(--color-fondo-hover)] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${progresoPagos}%` }}
            />
          </div>

          {/* Stats secundarios — separados visualmente con fondo distinto */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[var(--color-fondo-hover)] p-3 border border-[var(--color-borde-suave)]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primario)]" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)]">
                  Comprometido
                </p>
              </div>
              <p className="text-[16px] font-bold text-[var(--color-texto)] tabular-nums">{formatearMoneda(subtotalContratado)}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 border border-amber-200/60">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                  Saldo
                </p>
              </div>
              <p className="text-[16px] font-bold text-amber-700 tabular-nums">{formatearMoneda(saldo)}</p>
            </div>
          </div>
        </div>
      </div>

      <MobileSection title="Pendientes de pago">
        {pendientes.length === 0 ? (
          <MobileEmpty
            icon={CheckCircle2}
            title="¡Todo al corriente!"
            description="No tienes pagos pendientes por liquidar."
          />
        ) : (
          <div className="space-y-3">
            {pendientes.map((l: any) => {
              const saldoLinea = Number(l.montoTotal) - Number(l.montoPagado || 0);
              const proveedor = l.servicio?.proveedor?.nombre || l.proveedor?.nombre || l.descripcion;
              const isFiltrado = filtroLineaId === l.id;
              // Una reserva está cancelada si su estado es CANCELADO o si era TEMPORAL y ya expiró
              const isCanceled =
                l.reservaEstado === 'CANCELADO' ||
                (l.reservaEstado === 'TEMPORAL' &&
                  l.fechaExpiracion &&
                  new Date(l.fechaExpiracion).getTime() - Date.now() <= 0);

              if (isCanceled) {
                return (
                  <div
                    key={l.id}
                    className="relative bg-gradient-to-br from-rose-50 to-rose-100/40 border border-rose-200 rounded-2xl p-4 overflow-hidden"
                  >
                    {/* Patrón diagonal sutil */}
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-[0.04] pointer-events-none"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(45deg, #be123c 0, #be123c 1px, transparent 1px, transparent 8px)',
                      }}
                    />
                    <div className="relative">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-11 h-11 rounded-2xl bg-rose-200/60 text-rose-700 flex items-center justify-center shrink-0 shadow-sm">
                          <XCircle size={19} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-semibold text-rose-900 truncate leading-tight line-through decoration-rose-400/60 decoration-1">{proveedor}</p>
                          <p className="text-[12px] text-rose-700/80 truncate mt-0.5">{l.descripcion}</p>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-white whitespace-nowrap bg-rose-500 px-2.5 py-1 rounded-full shadow-sm">
                          Cancelado
                        </span>
                      </div>
                      <p className="text-[12px] text-rose-700 leading-relaxed pt-2 border-t border-rose-200">
                        Esta reserva fue cancelada o expiró sin confirmación. No se aceptan más abonos.
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  type="button"
                  key={l.id}
                  onClick={() => setFiltroLineaId((prev) => (prev === l.id ? null : l.id))}
                  className={cn(
                    'w-full text-left bg-[var(--color-fondo-card)] border rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4 active:scale-[0.99] transition-all',
                    isFiltrado
                      ? 'border-[var(--color-acento)] ring-2 ring-[var(--color-acento)]/20 shadow-[0_4px_18px_rgba(212,175,55,0.18)]'
                      : 'border-[var(--color-borde-suave)]',
                  )}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn(
                      'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm',
                      isFiltrado
                        ? 'bg-gradient-to-br from-[#fdf6e1] to-[#f4e4b9] text-[#a87a2a]'
                        : 'bg-gradient-to-br from-amber-50 to-amber-100/70 text-amber-700',
                    )}>
                      <Wallet size={19} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-[var(--color-texto)] truncate leading-tight">{proveedor}</p>
                      <p className="text-[12px] text-[var(--color-texto-suave)] truncate mt-0.5">{l.descripcion}</p>
                    </div>
                    {isFiltrado && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#a87a2a] whitespace-nowrap bg-[#d4af37]/15 px-2 py-1 rounded-full">Filtrado</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--color-borde-suave)]">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)] leading-none mb-1">
                        Saldo pendiente
                      </p>
                      <p className="text-[20px] font-bold text-amber-600 tabular-nums leading-tight">{formatearMoneda(saldoLinea)}</p>
                    </div>
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAbonar(l);
                      }}
                      className="btn-oro px-5 py-3 rounded-2xl text-[12px] font-bold uppercase tracking-wider shadow-md cursor-pointer select-none whitespace-nowrap"
                    >
                      Abonar
                    </span>
                  </div>
                </button>
              );
            })}
            {pendientes.length > 0 && (
              <p className="text-center text-[11px] text-[var(--color-texto-suave)] mt-1">
                Toca un proveedor para ver solo sus pagos abajo · El botón <strong>Abonar</strong> registra un nuevo abono.
              </p>
            )}
          </div>
        )}
      </MobileSection>

      {historial.length > 0 && (
        <MobileSection
          title={filtroLineaId ? 'Historial filtrado' : 'Historial'}
          action={
            filtroLineaId && (
              <button
                type="button"
                onClick={() => setFiltroLineaId(null)}
                className="text-[11px] font-semibold text-[var(--color-acento-claro)] active:text-[var(--color-acento)] inline-flex items-center gap-1"
              >
                Quitar filtro <XCircle size={12} />
              </button>
            )
          }
        >
          {filtroLineaId && proveedorFiltradoNombre && (
            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-acento)]/15 text-[var(--color-acento-claro)] text-[11px] font-semibold">
              <span>Mostrando: {proveedorFiltradoNombre}</span>
            </div>
          )}
          {historialFiltrado.length === 0 ? (
            <MobileEmpty
              icon={Clock}
              title="Sin pagos"
              description="Este proveedor aún no tiene pagos registrados."
            />
          ) : (
          <div className="space-y-2">
            {historialFiltrado.map((p: any, idx: number) => {
              const isPending = p.estado === 'PENDIENTE';
              const tipoLabel = (p.tipo || 'ABONO').toUpperCase();
              return (
                <div
                  key={`hist-${p.id || idx}-${idx}`}
                  className={cn(
                    'bg-[var(--color-fondo-card)] border rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm',
                    isPending ? 'border-amber-200/60' : 'border-[var(--color-borde-suave)]',
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm',
                      isPending
                        ? 'bg-gradient-to-br from-amber-50 to-amber-100/70 text-amber-700'
                        : 'bg-gradient-to-br from-emerald-50 to-emerald-100/70 text-emerald-700',
                    )}
                  >
                    {isPending ? <Clock size={17} /> : <CheckCircle2 size={17} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={cn(
                        'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full',
                        tipoLabel === 'ANTICIPO' ? 'bg-[#d4af37]/15 text-[#a87a2a]' : 'bg-[var(--color-fondo-hover)] text-[var(--color-texto-suave)]',
                      )}>
                        {tipoLabel}
                      </span>
                      <p className="text-[13px] font-semibold text-[var(--color-texto)] truncate">{p.targetDesc}</p>
                    </div>
                    <p className="text-[11px] text-[var(--color-texto-suave)]">
                      {new Date(p.fechaPago || p.fechaVencimiento || p.fecha).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {isPending && ' · Pendiente de confirmar'}
                    </p>
                  </div>
                  <p
                    className={cn(
                      'text-[15px] font-bold tabular-nums shrink-0',
                      isPending ? 'text-amber-700' : 'text-emerald-700',
                    )}
                  >
                    {formatearMoneda(p.monto)}
                  </p>
                </div>
              );
            })}
          </div>
          )}
        </MobileSection>
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Proveedores
// ────────────────────────────────────────────────────────────────────────────
function ProveedoresTab({
  lineas,
  eventoNombre,
  fechaEvento,
}: {
  lineas: any[];
  eventoNombre: string;
  fechaEvento?: string | Date | null;
}) {
  if (lineas.length === 0) {
    return (
      <MobileEmpty
        icon={Store}
        title="Sin proveedores"
        description="Cuando contrates proveedores aparecerán aquí."
        action={
          <Link
            href="/cliente/explorar"
            className="px-5 py-2.5 rounded-full bg-[var(--color-primario)] text-white text-[13px] font-semibold active:scale-95 transition-all"
          >
            Explorar proveedores
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {lineas.map((l: any) => {
        const proveedor = l.servicio?.proveedor?.nombre || l.proveedor?.nombre || l.descripcion;
        const tel = l.servicio?.proveedor?.usuario?.telefono || l.proveedor?.usuario?.telefono;
        const saldo = Number(l.montoTotal) - Number(l.montoPagado || 0);
        const { label, cls } = estadoReservaStyle(l.reservaEstado);
        const fechaText = fechaEvento
          ? new Date(fechaEvento).toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })
          : 'por confirmar';
        const waMsg = encodeURIComponent(
          `Hola! 👋 Le contacto a través de *Eventium*.\n\n📋 *Detalles de mi reserva:*\n• Evento: ${eventoNombre}\n• Fecha: ${fechaText}\n• Servicio: ${l.descripcion}\n• Precio pactado: ${formatearMoneda(l.montoTotal)}\n\nQuedo en espera de su confirmación. ¡Gracias!`,
        );

        return (
          <MobileCard key={l.id} className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-fondo-hover)] flex items-center justify-center text-[var(--color-texto)] shrink-0">
                  <Store size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[var(--color-texto)] truncate">{proveedor}</p>
                  <p className="text-[12px] text-[var(--color-texto-suave)] truncate">{l.descripcion}</p>
                </div>
              </div>
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border whitespace-nowrap',
                  cls,
                )}
              >
                {label}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <Money label="Total" value={l.montoTotal} tone="default" />
              <Money label="Pagado" value={l.montoPagado || 0} tone="emerald" />
              <Money label="Saldo" value={saldo} tone="rose" />
            </div>

            {tel && (
              <a
                href={`https://wa.me/${tel.replace(/\D/g, '')}?text=${waMsg}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500 text-white text-[13px] font-semibold active:scale-[0.98] transition-all"
              >
                <Phone size={15} /> Contactar por WhatsApp
              </a>
            )}
          </MobileCard>
        );
      })}
    </div>
  );
}

function Money({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: 'default' | 'emerald' | 'rose';
}) {
  const palette =
    tone === 'emerald'
      ? 'bg-emerald-50 text-emerald-700'
      : tone === 'rose'
      ? 'bg-rose-50 text-rose-700'
      : 'bg-[var(--color-fondo)] text-[var(--color-texto)]';
  return (
    <div className={cn('rounded-xl p-2.5', palette)}>
      <p className="text-[9px] font-semibold uppercase tracking-wider opacity-80 mb-0.5">{label}</p>
      <p className="text-[13px] font-bold tabular-nums">{formatearMoneda(value)}</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Mesas
// ────────────────────────────────────────────────────────────────────────────
function MesasTab({ eventoId }: { eventoId: string }) {
  return (
    <MobileEmpty
      icon={LayoutGrid}
      title="Organizador de mesas"
      description="La herramienta visual está optimizada para pantallas grandes. Te recomendamos abrirla desde una computadora o tablet."
      action={
        <Link
          href={`/cliente/evento/${eventoId}/mesas`}
          className="px-5 py-2.5 rounded-full bg-[var(--color-primario)] text-white text-[13px] font-semibold active:scale-95 transition-all"
        >
          Abrir de todos modos
        </Link>
      }
    />
  );
}
