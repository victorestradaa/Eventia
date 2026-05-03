'use client';

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
}: Props) {
  const progresoPagos = subtotalContratado > 0 ? Math.round((totalPagado / subtotalContratado) * 100) : 0;
  const restantePresupuesto = Math.max(0, presupuestoTotal - subtotalContratado);
  const pendientesPago = lineasConReservas.filter(
    (l: any) => Number(l.montoTotal) - Number(l.montoPagado || 0) > 0,
  );
  const historialPagos = lineasConReservasActivas
    .flatMap((l: any) =>
      (l.pagos || []).map((p: any) => ({ ...p, targetDesc: l.descripcion, parentLine: l })),
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.fechaPago || b.fechaVencimiento || b.fecha).getTime() -
        new Date(a.fechaPago || a.fechaVencimiento || a.fecha).getTime(),
    );

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

      {/* Hero del evento */}
      <div
        className="p-5 mb-5 rounded-2xl text-white shadow-[var(--sombra-card)] border-0"
        style={{
          background: 'linear-gradient(135deg, var(--color-primario-oscuro) 0%, var(--color-primario) 100%)',
        }}
      >
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Próximo evento
        </div>
        <h2 className="text-2xl font-serif leading-tight mb-3">{evento.nombre}</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-white/85">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} /> {fechaFormateada}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users size={14} /> {evento.numInvitados || 0} invitados
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-wider">
            {evento.tipo}
          </span>
        </div>
        {typeof diasRestantes === 'number' && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-[12px] font-semibold">
            <Clock size={13} /> {diasRestantes} días faltan
          </div>
        )}
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
}: {
  invitados: any[];
  invitadosConfirmados: number;
  invitadosPendientes: number;
  invitadosRechazados: number;
  onAddInvitado: () => void;
  onUpdateRSVP: (id: string, estado: 'CONFIRMADO' | 'RECHAZADO' | 'PENDIENTE') => void;
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
              <InvitadoRow key={i.id} invitado={i} onUpdateRSVP={onUpdateRSVP} />
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
}: {
  invitado: any;
  onUpdateRSVP: (id: string, estado: 'CONFIRMADO' | 'RECHAZADO' | 'PENDIENTE') => void;
}) {
  const estado = invitado.rsvpEstado || 'PENDIENTE';
  const labelEstado = estado === 'CONFIRMADO' ? 'Confirmado' : estado === 'RECHAZADO' ? 'Rechazado' : 'Pendiente';

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

  return (
    <>
      <MobileCard className="p-5 mb-5">
        <div className="flex items-end justify-between mb-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-texto-suave)]">Pagado</p>
          <p className="text-[10px] font-semibold text-[var(--color-texto-suave)]">{progresoPagos}% liquidado</p>
        </div>
        <p className="text-3xl font-bold text-[var(--color-texto)] tracking-tight mb-3">
          {formatearMoneda(totalPagado)}
        </p>
        <div className="w-full h-2 bg-[var(--color-fondo-hover)] rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            style={{ width: `${progresoPagos}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[var(--color-fondo)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)] mb-0.5">
              Comprometido
            </p>
            <p className="text-base font-bold text-[var(--color-texto)]">{formatearMoneda(subtotalContratado)}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 mb-0.5">
              Saldo
            </p>
            <p className="text-base font-bold text-amber-700">{formatearMoneda(saldo)}</p>
          </div>
        </div>
      </MobileCard>

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
              return (
                <MobileCard key={l.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-fondo-hover)] flex items-center justify-center text-[var(--color-texto)] shrink-0">
                      <Wallet size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--color-texto)] truncate">{proveedor}</p>
                      <p className="text-[12px] text-[var(--color-texto-suave)] truncate">{l.descripcion}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)]">
                        Saldo
                      </p>
                      <p className="text-lg font-bold text-amber-600">{formatearMoneda(saldoLinea)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAbonar(l)}
                      className="px-5 py-2.5 rounded-full bg-[var(--color-primario)] text-white text-[13px] font-semibold active:scale-95 transition-all"
                    >
                      Abonar
                    </button>
                  </div>
                </MobileCard>
              );
            })}
          </div>
        )}
      </MobileSection>

      {historial.length > 0 && (
        <MobileSection title="Historial">
          <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl shadow-sm divide-y divide-[var(--color-borde-suave)] overflow-hidden">
            {historial.map((p: any, idx: number) => {
              const isPending = p.estado === 'PENDIENTE';
              return (
                <div key={p.id || idx} className="px-4 py-3 flex items-center gap-3">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                      isPending ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
                    )}
                  >
                    {isPending ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--color-texto)] truncate">
                      {(p.tipo || 'ABONO').toUpperCase()} · {p.targetDesc}
                    </p>
                    <p className="text-[11px] text-[var(--color-texto-suave)]">
                      {new Date(p.fechaPago || p.fechaVencimiento || p.fecha).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <p
                    className={cn(
                      'text-[14px] font-bold tabular-nums',
                      isPending ? 'text-amber-700' : 'text-emerald-700',
                    )}
                  >
                    {formatearMoneda(p.monto)}
                  </p>
                </div>
              );
            })}
          </div>
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
