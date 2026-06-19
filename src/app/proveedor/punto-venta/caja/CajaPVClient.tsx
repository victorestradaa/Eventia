'use client';

import { useMemo, useState } from 'react';
import {
  Receipt, Lock, Unlock, ArrowDownCircle, ArrowUpCircle, Banknote, CreditCard, ArrowLeftRight, MoreHorizontal,
  Plus, Minus, X, Loader2, AlertCircle, Clock, CheckCircle2, History, Hash, Calendar, TrendingUp,
} from 'lucide-react';
import {
  abrirSesionCajaPV,
  cerrarSesionCajaPV,
  registrarMovimientoCajaPV,
  getSesionActivaPV,
  listarSesionesCajaPV,
  calcularTotalesSesion,
} from '@/lib/actions/puntoVentaActions';
import { cn, formatearMoneda } from '@/lib/utils';

type MetPag = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';
type TipoMov = 'VENTA' | 'ABONO' | 'RETIRO' | 'INGRESO' | 'AJUSTE';

type Movimiento = {
  id: string;
  tipo: TipoMov;
  metodoPago: MetPag;
  monto: number | string;
  concepto: string | null;
  creadoEn: string;
  pedidoId: string | null;
};

type Sesion = {
  id: string;
  estado: 'ABIERTA' | 'CERRADA';
  montoApertura: number | string;
  montoCierre?: number | string | null;
  notas: string | null;
  abiertaEn: string;
  cerradaEn: string | null;
  movimientos?: Movimiento[];
  _count?: { movimientos: number; pedidos: number };
};

interface Props {
  proveedorId: string;
  sesionActivaInicial: Sesion | null;
  historicoInicial: Sesion[];
}

const ICONO_METODO: Record<MetPag, any> = {
  EFECTIVO: Banknote,
  TARJETA: CreditCard,
  TRANSFERENCIA: ArrowLeftRight,
  OTRO: MoreHorizontal,
};

const META_TIPO: Record<TipoMov, { label: string; color: string; bg: string; signo: '+' | '-' }> = {
  VENTA:   { label: 'Venta',   color: 'text-emerald-600', bg: 'bg-emerald-500/10', signo: '+' },
  ABONO:   { label: 'Abono',   color: 'text-emerald-600', bg: 'bg-emerald-500/10', signo: '+' },
  INGRESO: { label: 'Ingreso', color: 'text-blue-600',    bg: 'bg-blue-500/10',    signo: '+' },
  RETIRO:  { label: 'Retiro',  color: 'text-rose-600',    bg: 'bg-rose-500/10',    signo: '-' },
  AJUSTE:  { label: 'Ajuste',  color: 'text-amber-600',   bg: 'bg-amber-500/10',   signo: '+' },
};

export default function CajaPVClient({ proveedorId, sesionActivaInicial, historicoInicial }: Props) {
  const [sesion, setSesion] = useState<Sesion | null>(sesionActivaInicial);
  const [historico, setHistorico] = useState<Sesion[]>(historicoInicial);

  // Apertura
  const [montoApertura, setMontoApertura] = useState('0');
  const [notasApertura, setNotasApertura] = useState('');
  const [abriendo, setAbriendo] = useState(false);

  // Cierre
  const [showCierre, setShowCierre] = useState(false);
  const [montoCierre, setMontoCierre] = useState('');
  const [notasCierre, setNotasCierre] = useState('');
  const [cerrando, setCerrando] = useState(false);
  const [sesionCerrada, setSesionCerrada] = useState<Sesion | null>(null);

  // Movimiento manual
  const [movModal, setMovModal] = useState<'RETIRO' | 'INGRESO' | null>(null);
  const [movMonto, setMovMonto] = useState('');
  const [movMetodo, setMovMetodo] = useState<MetPag>('EFECTIVO');
  const [movConcepto, setMovConcepto] = useState('');
  const [guardandoMov, setGuardandoMov] = useState(false);

  const [error, setError] = useState('');

  /* ─── Totales calculados ──────────────────────────────────────────── */

  const totales = useMemo(() => {
    if (!sesion?.movimientos) return null;
    return calcularTotalesSesion(sesion.movimientos);
  }, [sesion]);

  const efectivoEsperado = useMemo(() => {
    if (!sesion || !totales) return 0;
    return Number(sesion.montoApertura) + totales.netoEfectivo;
  }, [sesion, totales]);

  /* ─── Acciones ────────────────────────────────────────────────────── */

  const recargarSesion = async () => {
    const res = await getSesionActivaPV(proveedorId);
    if (res.success) setSesion(res.data as Sesion | null);
  };
  const recargarHistorico = async () => {
    const res = await listarSesionesCajaPV(proveedorId, 10);
    if (res.success) setHistorico(res.data as Sesion[]);
  };

  const handleAbrir = async () => {
    setError('');
    const m = parseFloat(montoApertura || '0');
    if (isNaN(m) || m < 0) { setError('Monto inválido.'); return; }
    setAbriendo(true);
    const res = await abrirSesionCajaPV(proveedorId, m, notasApertura);
    setAbriendo(false);
    if (!res.success) { setError(res.error || 'Error al abrir.'); return; }
    await recargarSesion();
    setMontoApertura('0');
    setNotasApertura('');
  };

  const abrirCierre = () => {
    setShowCierre(true);
    setMontoCierre(String(efectivoEsperado.toFixed(2)));
    setNotasCierre('');
    setError('');
  };

  const handleCerrar = async () => {
    if (!sesion) return;
    setError('');
    const m = parseFloat(montoCierre || '0');
    if (isNaN(m) || m < 0) { setError('Monto inválido.'); return; }
    setCerrando(true);
    const res = await cerrarSesionCajaPV(sesion.id, proveedorId, m, notasCierre);
    setCerrando(false);
    if (!res.success) { setError(res.error || 'Error al cerrar.'); return; }
    setSesionCerrada(res.data as Sesion);
    setShowCierre(false);
    setSesion(null);
    await recargarHistorico();
  };

  const handleMovimiento = async () => {
    if (!movModal) return;
    setError('');
    const m = parseFloat(movMonto || '0');
    if (isNaN(m) || m <= 0) { setError('Monto inválido.'); return; }
    setGuardandoMov(true);
    const res = await registrarMovimientoCajaPV(proveedorId, {
      tipo: movModal,
      metodoPago: movMetodo,
      monto: m,
      concepto: movConcepto,
    });
    setGuardandoMov(false);
    if (!res.success) { setError(res.error || 'Error.'); return; }
    setMovModal(null);
    setMovMonto('');
    setMovMetodo('EFECTIVO');
    setMovConcepto('');
    await recargarSesion();
  };

  /* ─── Render ──────────────────────────────────────────────────────── */

  // Sin sesión abierta → onboarding apertura
  if (!sesion) {
    return (
      <div className="space-y-6">
        {/* Cierre exitoso modal */}
        {sesionCerrada && (
          <ResumenCierreModal sesion={sesionCerrada} onCerrar={() => setSesionCerrada(null)} />
        )}

        <section className="rounded-3xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-8 md:p-10 max-w-xl mx-auto">
          <div className="text-center mb-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center mb-4">
              <Unlock size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">Abrir sesión de caja</h2>
            <p className="text-sm text-[var(--color-texto-suave)] mt-1">
              Necesitas una sesión abierta para registrar ventas y movimientos. Empieza por el monto en efectivo con el que abres.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-3 flex items-center gap-2 mb-4">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="space-y-4">
            <Field label="Monto en efectivo (fondo inicial)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input w-full pl-7 text-xl font-black"
                  value={montoApertura}
                  onChange={(e) => setMontoApertura(e.target.value)}
                />
              </div>
            </Field>
            <Field label="Notas (opcional)">
              <textarea
                className="input w-full min-h-[70px]"
                placeholder="Ej. Turno mañana, encargado: Juan"
                value={notasApertura}
                onChange={(e) => setNotasApertura(e.target.value)}
              />
            </Field>
            <button
              onClick={handleAbrir}
              disabled={abriendo}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#d4af37] text-black font-black uppercase text-sm tracking-widest hover:brightness-110 disabled:opacity-50 shadow-lg shadow-[#d4af37]/20"
            >
              {abriendo ? <Loader2 size={16} className="animate-spin" /> : <Unlock size={16} />}
              Abrir sesión
            </button>
          </div>
        </section>

        {historico.length > 0 && (
          <HistoricoSesiones sesiones={historico} />
        )}
      </div>
    );
  }

  /* ─── Sesión activa ───────────────────────────────────────────────── */

  return (
    <div className="space-y-5">
      {/* Banner sesión activa */}
      <section className="rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sesión abierta</span>
            </div>
            <p className="text-sm font-bold text-[var(--color-texto-suave)] flex items-center gap-1.5">
              <Clock size={12} /> Abierta el {new Date(sesion.abiertaEn).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
            <p className="text-xs text-[var(--color-texto-muted)] mt-1">
              Fondo inicial: <strong className="text-[var(--color-texto)]">{formatearMoneda(Number(sesion.montoApertura))}</strong>
            </p>
          </div>
          <button
            onClick={abrirCierre}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1F2937] text-white font-black uppercase text-xs tracking-widest hover:bg-black shadow-lg"
          >
            <Lock size={14} /> Cerrar sesión
          </button>
        </div>
      </section>

      {/* Resumen por método de pago */}
      {totales && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <CardMetodo metodo="EFECTIVO" monto={efectivoEsperado} label="Efectivo esperado" />
          <CardMetodo metodo="TARJETA" monto={totales.porMetodo.TARJETA} />
          <CardMetodo metodo="TRANSFERENCIA" monto={totales.porMetodo.TRANSFERENCIA} />
          <CardMetodo metodo="OTRO" monto={totales.porMetodo.OTRO} />
        </section>
      )}

      {/* Resumen por tipo */}
      {totales && (
        <section className="rounded-2xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-5">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <Mini label="Ventas"     valor={totales.porTipo.VENTA}   tono="emerald" />
            <Mini label="Abonos"     valor={totales.porTipo.ABONO}   tono="emerald" />
            <Mini label="Ingresos"   valor={totales.porTipo.INGRESO} tono="blue" />
            <Mini label="Retiros"    valor={totales.porTipo.RETIRO}  tono="rose" signo="-" />
            <Mini label="Ajustes"    valor={totales.porTipo.AJUSTE}  tono="amber" />
          </div>
        </section>
      )}

      {/* Acciones rápidas */}
      <section className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setMovModal('INGRESO'); setError(''); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] text-sm font-bold hover:bg-[var(--color-fondo-hover)]"
        >
          <ArrowDownCircle size={14} className="text-blue-500" /> Registrar ingreso
        </button>
        <button
          onClick={() => { setMovModal('RETIRO'); setError(''); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] text-sm font-bold hover:bg-[var(--color-fondo-hover)]"
        >
          <ArrowUpCircle size={14} className="text-rose-500" /> Registrar retiro
        </button>
      </section>

      {/* Movimientos de la sesión */}
      <section className="rounded-2xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-borde-suave)] flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <History size={14} /> Movimientos ({sesion.movimientos?.length || 0})
          </h3>
        </div>
        {(!sesion.movimientos || sesion.movimientos.length === 0) ? (
          <div className="p-10 text-center">
            <Receipt size={24} className="mx-auto text-[var(--color-texto-muted)] mb-2" />
            <p className="text-sm text-[var(--color-texto-suave)]">Sin movimientos aún.</p>
            <p className="text-xs text-[var(--color-texto-muted)] mt-1">Las ventas y abonos se registran solos.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-borde-suave)] max-h-[420px] overflow-y-auto">
            {sesion.movimientos.map((m) => (
              <MovimientoRow key={m.id} mov={m} />
            ))}
          </div>
        )}
      </section>

      {/* Modal movimiento manual */}
      {movModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setMovModal(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">{movModal === 'INGRESO' ? 'Registrar ingreso' : 'Registrar retiro'}</h3>
              <button onClick={() => setMovModal(null)} className="p-1.5 rounded-lg hover:bg-[var(--color-fondo-hover)]"><X size={16} /></button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-2.5 flex items-center gap-2">
                <AlertCircle size={12} /> {error}
              </div>
            )}

            <Field label="Monto">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  autoFocus
                  className="input w-full pl-7 text-lg font-black"
                  value={movMonto}
                  onChange={(e) => setMovMonto(e.target.value)}
                />
              </div>
            </Field>
            <Field label="Método">
              <div className="grid grid-cols-4 gap-1.5">
                {(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'] as MetPag[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMovMetodo(m)}
                    className={cn(
                      'rounded-lg border py-2 text-[10px] font-black uppercase tracking-widest',
                      movMetodo === m
                        ? 'border-[#d4af37] bg-[#d4af37]/10 text-[var(--color-texto)]'
                        : 'border-[var(--color-borde-suave)] text-[var(--color-texto-muted)]'
                    )}
                  >
                    {m.slice(0, 4)}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Concepto (opcional)">
              <input
                type="text"
                className="input w-full text-sm"
                placeholder={movModal === 'INGRESO' ? 'Ej. Aporte de socio' : 'Ej. Pago a proveedor'}
                value={movConcepto}
                onChange={(e) => setMovConcepto(e.target.value)}
              />
            </Field>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setMovModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)]" disabled={guardandoMov}>Cancelar</button>
              <button
                onClick={handleMovimiento}
                disabled={guardandoMov || !movMonto}
                className="px-5 py-2 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest disabled:opacity-50 inline-flex items-center gap-2"
              >
                {guardandoMov && <Loader2 size={12} className="animate-spin" />} Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cierre */}
      {showCierre && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !cerrando && setShowCierre(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl w-full max-w-md p-6 space-y-4">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-[#1F2937] text-[#d4af37] flex items-center justify-center mb-3">
                <Lock size={24} />
              </div>
              <h3 className="text-lg font-black">Cerrar sesión de caja</h3>
              <p className="text-xs text-[var(--color-texto-suave)] mt-1">Confirma el efectivo contado en caja.</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-2.5 flex items-center gap-2">
                <AlertCircle size={12} /> {error}
              </div>
            )}

            <div className="rounded-xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-4 space-y-2 text-sm">
              <FilaCierre label="Fondo inicial" value={formatearMoneda(Number(sesion.montoApertura))} />
              {totales && (
                <>
                  <FilaCierre label="Entradas en efectivo" value={formatearMoneda(Math.max(0, totales.netoEfectivo))} />
                  {totales.netoEfectivo < 0 && (
                    <FilaCierre label="Salidas en efectivo" value={formatearMoneda(-totales.netoEfectivo)} className="text-rose-600" />
                  )}
                </>
              )}
              <div className="border-t border-[var(--color-borde-suave)] my-2" />
              <FilaCierre label="Efectivo esperado" value={formatearMoneda(efectivoEsperado)} highlight />
            </div>

            <Field label="Efectivo contado en caja">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input w-full pl-7 text-lg font-black"
                  value={montoCierre}
                  onChange={(e) => setMontoCierre(e.target.value)}
                />
              </div>
              {montoCierre && !isNaN(parseFloat(montoCierre)) && (
                <DiferenciaIndicador esperado={efectivoEsperado} contado={parseFloat(montoCierre)} />
              )}
            </Field>

            <Field label="Notas (opcional)">
              <textarea
                className="input w-full min-h-[60px] text-sm"
                placeholder="Observaciones del corte..."
                value={notasCierre}
                onChange={(e) => setNotasCierre(e.target.value)}
              />
            </Field>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCierre(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)]" disabled={cerrando}>Cancelar</button>
              <button
                onClick={handleCerrar}
                disabled={cerrando}
                className="px-5 py-2 rounded-xl bg-[#1F2937] text-white font-black uppercase text-xs tracking-widest hover:bg-black disabled:opacity-50 inline-flex items-center gap-2"
              >
                {cerrando && <Loader2 size={12} className="animate-spin" />} Cerrar y guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Histórico */}
      {historico.length > 0 && (
        <HistoricoSesiones sesiones={historico} />
      )}
    </div>
  );
}

/* ─── Componentes UI ────────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function CardMetodo({ metodo, monto, label }: { metodo: MetPag; monto: number; label?: string }) {
  const Icon = ICONO_METODO[metodo];
  return (
    <div className="rounded-2xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center">
          <Icon size={14} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)]">{label || metodo}</p>
      </div>
      <p className="text-lg font-black text-[var(--color-texto)]">{formatearMoneda(monto)}</p>
    </div>
  );
}

function Mini({ label, valor, tono, signo = '+' }: { label: string; valor: number; tono: string; signo?: '+' | '-' }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
  };
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)]">{label}</p>
      <p className={cn('text-base font-black mt-0.5', colorMap[tono])}>
        {signo === '-' && valor > 0 ? '-' : ''}{formatearMoneda(valor)}
      </p>
    </div>
  );
}

function MovimientoRow({ mov }: { mov: Movimiento }) {
  const meta = META_TIPO[mov.tipo];
  const Icon = ICONO_METODO[mov.metodoPago];
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', meta.bg)}>
        {meta.signo === '+' ? <Plus size={14} className={meta.color} /> : <Minus size={14} className={meta.color} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={cn('text-xs font-black uppercase tracking-widest', meta.color)}>{meta.label}</p>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-texto-suave)] bg-[var(--color-fondo-hover)] px-1.5 py-0.5 rounded-full">
            <Icon size={9} /> {mov.metodoPago.slice(0, 4)}
          </span>
        </div>
        {mov.concepto && <p className="text-xs truncate text-[var(--color-texto-suave)]">{mov.concepto}</p>}
        <p className="text-[10px] text-[var(--color-texto-muted)]">
          {new Date(mov.creadoEn).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <p className={cn('text-sm font-black whitespace-nowrap', meta.color)}>
        {meta.signo}{formatearMoneda(Number(mov.monto))}
      </p>
    </div>
  );
}

function DiferenciaIndicador({ esperado, contado }: { esperado: number; contado: number }) {
  const diff = contado - esperado;
  if (Math.abs(diff) < 0.01) {
    return (
      <p className="text-[11px] font-bold text-emerald-600 mt-1.5 inline-flex items-center gap-1">
        <CheckCircle2 size={11} /> Sin diferencia
      </p>
    );
  }
  const sobrante = diff > 0;
  return (
    <p className={cn('text-[11px] font-bold mt-1.5 inline-flex items-center gap-1', sobrante ? 'text-amber-600' : 'text-rose-600')}>
      <AlertCircle size={11} />
      {sobrante ? `Sobrante: ${formatearMoneda(diff)}` : `Faltante: ${formatearMoneda(-diff)}`}
    </p>
  );
}

function FilaCierre({ label, value, highlight = false, className = '' }: { label: string; value: string; highlight?: boolean; className?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-xs', highlight ? 'font-black uppercase tracking-widest' : 'font-bold text-[var(--color-texto-suave)]', className)}>{label}</span>
      <span className={cn('font-black', highlight ? 'text-lg text-[var(--color-texto)]' : 'text-sm text-[var(--color-texto)]', className)}>{value}</span>
    </div>
  );
}

function HistoricoSesiones({ sesiones }: { sesiones: Sesion[] }) {
  return (
    <section>
      <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-3 flex items-center gap-2">
        <History size={14} /> Histórico de cortes
      </h3>
      <div className="rounded-2xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] overflow-hidden divide-y divide-[var(--color-borde-suave)]">
        {sesiones.filter((s) => s.estado === 'CERRADA').map((s) => (
          <div key={s.id} className="px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center shrink-0">
              <Receipt size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">
                {new Date(s.abiertaEn).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-[11px] text-[var(--color-texto-muted)]">
                {new Date(s.abiertaEn).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                {' → '}
                {s.cerradaEn && new Date(s.cerradaEn).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                {' · '}
                {s._count?.pedidos ?? 0} pedidos · {s._count?.movimientos ?? 0} movs.
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)]">Cierre</p>
              <p className="text-sm font-black">{formatearMoneda(Number(s.montoCierre || 0))}</p>
            </div>
          </div>
        ))}
        {sesiones.filter((s) => s.estado === 'CERRADA').length === 0 && (
          <div className="p-6 text-center">
            <p className="text-xs text-[var(--color-texto-muted)]">Aún no hay cortes cerrados.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ResumenCierreModal({ sesion, onCerrar }: { sesion: Sesion; onCerrar: () => void }) {
  const totales = useMemo(() => calcularTotalesSesion(sesion.movimientos || []), [sesion]);
  const efectivoEsperado = Number(sesion.montoApertura) + totales.netoEfectivo;
  const cierre = Number(sesion.montoCierre || 0);
  const diff = cierre - efectivoEsperado;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="text-xl font-black">Sesión cerrada</h3>
          <p className="text-xs text-[var(--color-texto-suave)] mt-1">
            {sesion.cerradaEn && new Date(sesion.cerradaEn).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-4 space-y-2">
          <FilaCierre label="Fondo inicial" value={formatearMoneda(Number(sesion.montoApertura))} />
          <FilaCierre label="Ventas" value={formatearMoneda(totales.porTipo.VENTA)} className="text-emerald-600" />
          <FilaCierre label="Abonos" value={formatearMoneda(totales.porTipo.ABONO)} className="text-emerald-600" />
          <FilaCierre label="Ingresos" value={formatearMoneda(totales.porTipo.INGRESO)} className="text-blue-600" />
          <FilaCierre label="Retiros" value={`- ${formatearMoneda(totales.porTipo.RETIRO)}`} className="text-rose-600" />
          <div className="border-t border-[var(--color-borde-suave)] my-2" />
          <FilaCierre label="Efectivo esperado" value={formatearMoneda(efectivoEsperado)} />
          <FilaCierre label="Efectivo contado" value={formatearMoneda(cierre)} highlight />
          {Math.abs(diff) >= 0.01 && (
            <div className={cn(
              'rounded-lg p-2 text-center text-xs font-black',
              diff > 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
            )}>
              {diff > 0 ? `Sobrante: ${formatearMoneda(diff)}` : `Faltante: ${formatearMoneda(-diff)}`}
            </div>
          )}
        </div>

        <button onClick={onCerrar} className="w-full py-3 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest hover:brightness-110">
          Entendido
        </button>
      </div>
    </div>
  );
}
