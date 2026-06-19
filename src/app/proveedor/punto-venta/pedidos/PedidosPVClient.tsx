'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search, X, Loader2, AlertCircle, ShoppingCart, ChevronRight, MessageCircle, Copy, CheckCircle2, Clock, Truck, Package, XCircle, Hash, ArrowRight, Calendar, DollarSign, ImageOff, History, CreditCard,
} from 'lucide-react';
import { getPedidoDetallePV, cambiarEstadoPedidoPV, registrarAbonoPedidoPV, listarPedidosPV } from '@/lib/actions/puntoVentaActions';
import { cn, formatearMoneda } from '@/lib/utils';

type EstadoPV = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';
type TipoPV = 'VENTA_DIRECTA' | 'PEDIDO';
type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';

type PedidoResumen = {
  id: string;
  folio: number;
  tipo: TipoPV;
  estado: EstadoPV;
  trackingToken: string;
  total: number | string;
  pagado: number | string;
  fechaEntrega: string | null;
  creadoEn: string;
  nombreCliente: string | null;
  telefonoCliente: string | null;
  cliente?: { id: string; nombre: string; telefono?: string | null } | null;
  _count?: { lineas: number };
};

interface Props {
  proveedorId: string;
  pedidosIniciales: PedidoResumen[];
}

const ESTADO_META: Record<EstadoPV, { label: string; icon: any; color: string; bg: string; ring: string }> = {
  PENDIENTE:       { label: 'Pendiente',      icon: Clock,       color: 'text-amber-500',   bg: 'bg-amber-500/10',   ring: 'ring-amber-500/30' },
  EN_PREPARACION:  { label: 'En preparación', icon: Package,     color: 'text-blue-500',    bg: 'bg-blue-500/10',    ring: 'ring-blue-500/30' },
  LISTO:           { label: 'Listo',          icon: CheckCircle2,color: 'text-violet-500',  bg: 'bg-violet-500/10',  ring: 'ring-violet-500/30' },
  ENTREGADO:       { label: 'Entregado',      icon: Truck,       color: 'text-emerald-500', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/30' },
  CANCELADO:       { label: 'Cancelado',      icon: XCircle,     color: 'text-rose-500',    bg: 'bg-rose-500/10',    ring: 'ring-rose-500/30' },
};

const SIGUIENTE_ESTADO: Partial<Record<EstadoPV, EstadoPV>> = {
  PENDIENTE: 'EN_PREPARACION',
  EN_PREPARACION: 'LISTO',
  LISTO: 'ENTREGADO',
};

export default function PedidosPVClient({ proveedorId, pedidosIniciales }: Props) {
  const [pedidos, setPedidos] = useState<PedidoResumen[]>(pedidosIniciales);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPV | 'TODOS'>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [refrescando, setRefrescando] = useState(false);

  // Drawer detalle
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<any | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Acciones en curso
  const [transicionando, setTransicionando] = useState(false);
  const [abonando, setAbonando] = useState(false);
  const [showAbono, setShowAbono] = useState(false);
  const [abonoMonto, setAbonoMonto] = useState('');
  const [abonoMetodo, setAbonoMetodo] = useState<MetodoPago>('EFECTIVO');
  const [showCancelar, setShowCancelar] = useState(false);
  const [cancelMotivo, setCancelMotivo] = useState('');
  const [copiado, setCopiado] = useState(false);

  /* ─── Filtros + contadores ────────────────────────────────────────── */

  const contadores = useMemo(() => {
    const c: Record<EstadoPV | 'TODOS', number> = {
      TODOS: pedidos.length,
      PENDIENTE: 0, EN_PREPARACION: 0, LISTO: 0, ENTREGADO: 0, CANCELADO: 0,
    };
    for (const p of pedidos) c[p.estado]++;
    return c;
  }, [pedidos]);

  const filtrados = useMemo(() => {
    return pedidos.filter((p) => {
      if (filtroEstado !== 'TODOS' && p.estado !== filtroEstado) return false;
      const q = busqueda.trim().toLowerCase();
      if (!q) return true;
      const digits = q.replace(/\D/g, '');
      const nombre = (p.cliente?.nombre || p.nombreCliente || '').toLowerCase();
      const tel = (p.cliente?.telefono || p.telefonoCliente || '').replace(/\D/g, '');
      return (
        String(p.folio).includes(digits) ||
        nombre.includes(q) ||
        (digits && tel.includes(digits))
      );
    });
  }, [pedidos, filtroEstado, busqueda]);

  /* ─── Recargar lista (después de cambios) ─────────────────────────── */

  const recargarLista = async () => {
    setRefrescando(true);
    const res = await listarPedidosPV(proveedorId, { estado: 'TODOS' });
    if (res.success) setPedidos(res.data as PedidoResumen[]);
    setRefrescando(false);
  };

  /* ─── Drawer detalle ──────────────────────────────────────────────── */

  useEffect(() => {
    if (!detalleId) {
      setDetalle(null);
      setShowAbono(false);
      setShowCancelar(false);
      setAbonoMonto('');
      setCancelMotivo('');
      return;
    }
    setCargandoDetalle(true);
    getPedidoDetallePV(detalleId, proveedorId).then((res) => {
      setCargandoDetalle(false);
      if (res.success) setDetalle(res.data);
    });
  }, [detalleId, proveedorId]);

  const cerrarDetalle = () => setDetalleId(null);

  /* ─── Transiciones ────────────────────────────────────────────────── */

  const avanzarEstado = async () => {
    if (!detalle) return;
    const siguiente = SIGUIENTE_ESTADO[detalle.estado as EstadoPV];
    if (!siguiente) return;
    setTransicionando(true);
    const res = await cambiarEstadoPedidoPV(detalle.id, proveedorId, siguiente);
    setTransicionando(false);
    if (!res.success) { alert(res.error || 'Error.'); return; }
    // Recarga detalle + lista
    const det = await getPedidoDetallePV(detalle.id, proveedorId);
    if (det.success) setDetalle(det.data);
    await recargarLista();
  };

  const cambiarA = async (estado: EstadoPV) => {
    if (!detalle) return;
    setTransicionando(true);
    const res = await cambiarEstadoPedidoPV(detalle.id, proveedorId, estado);
    setTransicionando(false);
    if (!res.success) { alert(res.error || 'Error.'); return; }
    const det = await getPedidoDetallePV(detalle.id, proveedorId);
    if (det.success) setDetalle(det.data);
    await recargarLista();
  };

  const confirmarCancelar = async () => {
    if (!detalle) return;
    setTransicionando(true);
    const res = await cambiarEstadoPedidoPV(detalle.id, proveedorId, 'CANCELADO', cancelMotivo);
    setTransicionando(false);
    setShowCancelar(false);
    setCancelMotivo('');
    if (!res.success) { alert(res.error || 'Error.'); return; }
    const det = await getPedidoDetallePV(detalle.id, proveedorId);
    if (det.success) setDetalle(det.data);
    await recargarLista();
  };

  const registrarAbono = async () => {
    if (!detalle) return;
    const monto = parseFloat(abonoMonto || '0');
    if (!monto || monto <= 0) { alert('Ingresa un monto válido.'); return; }
    setAbonando(true);
    const res = await registrarAbonoPedidoPV(detalle.id, proveedorId, monto, abonoMetodo);
    setAbonando(false);
    setShowAbono(false);
    setAbonoMonto('');
    if (!res.success) { alert(res.error || 'Error.'); return; }
    const det = await getPedidoDetallePV(detalle.id, proveedorId);
    if (det.success) setDetalle(det.data);
    await recargarLista();
  };

  /* ─── Acciones cliente ────────────────────────────────────────────── */

  const trackingUrl = (token?: string) =>
    typeof window !== 'undefined' && token ? `${window.location.origin}/pedido/${token}` : '';

  const enviarWhatsApp = (p: any) => {
    const tel = (p.cliente?.telefono || p.telefonoCliente || '').replace(/\D/g, '');
    if (!tel) { alert('Este pedido no tiene teléfono. Cópialo y mándalo manualmente.'); return; }
    const nombre = p.cliente?.nombre || p.nombreCliente || '';
    const url = trackingUrl(p.trackingToken);
    const mensaje = `¡Hola${nombre ? ` ${nombre}` : ''}! Aquí está el seguimiento de tu pedido #${p.folio}: ${url}`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const copiarLink = async (token: string) => {
    try {
      await navigator.clipboard.writeText(trackingUrl(token));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {}
  };

  /* ─── Render ──────────────────────────────────────────────────────── */

  return (
    <div className="space-y-4">
      {/* Tabs estado */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {(['TODOS', 'PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'] as const).map((e) => {
          const isActive = filtroEstado === e;
          const label = e === 'TODOS' ? 'Todos' : ESTADO_META[e as EstadoPV].label;
          const count = contadores[e];
          return (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={cn(
                'shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors',
                isActive
                  ? 'bg-[#d4af37] text-black'
                  : 'bg-[var(--color-fondo-card)] text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)]'
              )}
            >
              {label}
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-black',
                isActive ? 'bg-black/15 text-black' : 'bg-[var(--color-fondo-hover)] text-[var(--color-texto-muted)]'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
        <input
          type="text"
          className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[var(--color-primario-claro)]"
          placeholder="Buscar por folio, cliente o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {refrescando && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-texto-muted)]" />
        )}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-14 text-center">
          <ShoppingCart size={28} className="mx-auto text-[var(--color-texto-muted)] mb-3" />
          <p className="text-sm font-bold">
            {pedidos.length === 0 ? 'Aún no tienes pedidos.' : 'No hay resultados.'}
          </p>
          <p className="text-xs text-[var(--color-texto-suave)] mt-1">
            {pedidos.length === 0 ? 'Crea tu primera venta para empezar.' : 'Ajusta los filtros o la búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] overflow-hidden divide-y divide-[var(--color-borde-suave)]">
          {filtrados.map((p) => (
            <PedidoRow
              key={p.id}
              pedido={p}
              onClick={() => setDetalleId(p.id)}
            />
          ))}
        </div>
      )}

      {/* Drawer detalle */}
      {detalleId && (
        <DrawerDetalle
          detalle={detalle}
          cargando={cargandoDetalle}
          transicionando={transicionando}
          abonando={abonando}
          copiado={copiado}
          showAbono={showAbono}
          showCancelar={showCancelar}
          abonoMonto={abonoMonto}
          abonoMetodo={abonoMetodo}
          cancelMotivo={cancelMotivo}
          setShowAbono={setShowAbono}
          setShowCancelar={setShowCancelar}
          setAbonoMonto={setAbonoMonto}
          setAbonoMetodo={setAbonoMetodo}
          setCancelMotivo={setCancelMotivo}
          onCerrar={cerrarDetalle}
          onAvanzar={avanzarEstado}
          onCambiarEstado={cambiarA}
          onConfirmarCancelar={confirmarCancelar}
          onAbonar={registrarAbono}
          onCopiarLink={copiarLink}
          onWhatsApp={enviarWhatsApp}
        />
      )}
    </div>
  );
}

/* ─── Fila de la lista ────────────────────────────────────────────── */

function PedidoRow({ pedido, onClick }: { pedido: PedidoResumen; onClick: () => void }) {
  const meta = ESTADO_META[pedido.estado];
  const Icon = meta.icon;
  const totalNum = Number(pedido.total);
  const pagadoNum = Number(pedido.pagado);
  const pendiente = totalNum - pagadoNum;
  const cliente = pedido.cliente?.nombre || pedido.nombreCliente || 'Cliente rápido';

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[var(--color-fondo-hover)] transition-colors"
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', meta.bg, meta.color)}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-black uppercase tracking-widest text-[var(--color-texto-muted)]">#{pedido.folio}</span>
          <span className={cn('text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded', meta.bg, meta.color)}>
            {meta.label}
          </span>
          {pedido.tipo === 'PEDIDO' && (
            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-[var(--color-fondo-hover)] text-[var(--color-texto-suave)]">
              Pedido
            </span>
          )}
        </div>
        <p className="text-sm font-bold truncate">{cliente}</p>
        <p className="text-[10px] text-[var(--color-texto-muted)]">
          {new Date(pedido.creadoEn).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          {pedido.fechaEntrega && (
            <> · Entrega: {new Date(pedido.fechaEntrega).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</>
          )}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-black text-[var(--color-texto)]">{formatearMoneda(totalNum)}</p>
        {pendiente > 0 && pedido.estado !== 'CANCELADO' && (
          <p className="text-[10px] font-bold text-rose-500">Pendiente: {formatearMoneda(pendiente)}</p>
        )}
      </div>
      <ChevronRight size={16} className="text-[var(--color-texto-muted)]" />
    </button>
  );
}

/* ─── Drawer de detalle ────────────────────────────────────────────── */

function DrawerDetalle({
  detalle, cargando, transicionando, abonando, copiado,
  showAbono, showCancelar, abonoMonto, abonoMetodo, cancelMotivo,
  setShowAbono, setShowCancelar, setAbonoMonto, setAbonoMetodo, setCancelMotivo,
  onCerrar, onAvanzar, onCambiarEstado, onConfirmarCancelar, onAbonar,
  onCopiarLink, onWhatsApp,
}: any) {
  if (!detalle && !cargando) return null;

  const meta = detalle ? ESTADO_META[detalle.estado as EstadoPV] : null;
  const siguiente = detalle ? SIGUIENTE_ESTADO[detalle.estado as EstadoPV] : null;
  const totalNum = detalle ? Number(detalle.total) : 0;
  const pagadoNum = detalle ? Number(detalle.pagado) : 0;
  const pendiente = totalNum - pagadoNum;
  const cliente = detalle?.cliente?.nombre || detalle?.nombreCliente || 'Cliente rápido';
  const telefono = detalle?.cliente?.telefono || detalle?.telefonoCliente || null;
  const url = typeof window !== 'undefined' && detalle?.trackingToken ? `${window.location.origin}/pedido/${detalle.trackingToken}` : '';

  return (
    <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-200" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }} onClick={onCerrar}>
      <aside onClick={(e) => e.stopPropagation()} className="w-full max-w-md h-full bg-[var(--color-fondo-card)] border-l border-[var(--color-borde-suave)] shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--color-fondo-card)] border-b border-[var(--color-borde-suave)] px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)]">Pedido</p>
            <h3 className="text-lg font-black">#{detalle?.folio || '...'}</h3>
          </div>
          <button onClick={onCerrar} className="p-2 rounded-lg hover:bg-[var(--color-fondo-hover)]">
            <X size={18} />
          </button>
        </div>

        {cargando && (
          <div className="flex items-center justify-center py-16 text-[var(--color-texto-muted)]">
            <Loader2 size={20} className="animate-spin mr-2" /> Cargando...
          </div>
        )}

        {detalle && (
          <div className="p-5 space-y-5">
            {/* Estado actual */}
            <div className={cn('rounded-2xl p-4 ring-1', meta!.bg, meta!.ring)}>
              <div className="flex items-center gap-2 mb-1">
                {(() => { const Icon = meta!.icon; return <Icon size={16} className={meta!.color} />; })()}
                <p className={cn('text-xs font-black uppercase tracking-widest', meta!.color)}>{meta!.label}</p>
                {detalle.tipo === 'PEDIDO' && (
                  <span className="ml-auto text-[10px] font-bold text-[var(--color-texto-muted)] uppercase">Pedido</span>
                )}
              </div>
              {detalle.fechaEntrega && (
                <p className="text-xs text-[var(--color-texto-suave)] flex items-center gap-1.5">
                  <Calendar size={11} /> Entrega: {new Date(detalle.fechaEntrega).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              )}
            </div>

            {/* Cliente */}
            <section>
              <p className="text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)] mb-2">Cliente</p>
              <div className="rounded-xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-3">
                <p className="font-bold text-sm">{cliente}</p>
                {telefono && <p className="text-xs text-[var(--color-texto-suave)] mt-0.5">{telefono}</p>}
                {detalle.cliente?.email && <p className="text-xs text-[var(--color-texto-suave)]">{detalle.cliente.email}</p>}
              </div>
            </section>

            {/* Items */}
            <section>
              <p className="text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)] mb-2">Productos</p>
              <div className="rounded-xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] divide-y divide-[var(--color-borde-suave)]">
                {detalle.lineas.map((l: any) => (
                  <div key={l.id} className="px-3 py-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-fondo-input)] flex items-center justify-center overflow-hidden shrink-0">
                      {l.producto?.imagenes?.[0] ? (
                        <img src={l.producto.imagenes[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageOff size={14} className="text-[var(--color-texto-muted)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{l.nombre}</p>
                      <p className="text-[10px] text-[var(--color-texto-muted)]">
                        {l.cantidad} × {formatearMoneda(Number(l.precioUnit))}
                      </p>
                    </div>
                    <p className="text-sm font-black">{formatearMoneda(Number(l.subtotal))}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Totales */}
            <section className="rounded-xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-4 space-y-2">
              <Linea label="Subtotal" value={formatearMoneda(Number(detalle.subtotal))} />
              {Number(detalle.descuento) > 0 && (
                <Linea label="Descuento" value={`- ${formatearMoneda(Number(detalle.descuento))}`} />
              )}
              <Linea label="Total" value={formatearMoneda(totalNum)} bold />
              <div className="border-t border-[var(--color-borde-suave)] my-2" />
              <Linea label="Pagado" value={formatearMoneda(pagadoNum)} className="text-emerald-500" />
              {pendiente > 0 && (
                <Linea label="Pendiente" value={formatearMoneda(pendiente)} className="text-rose-500" bold />
              )}
            </section>

            {/* Notas */}
            {detalle.notas && (
              <section>
                <p className="text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)] mb-2">Notas</p>
                <p className="text-xs text-[var(--color-texto-suave)] italic bg-[var(--color-fondo)]/50 border-l-2 border-[#d4af37]/40 pl-3 py-2">"{detalle.notas}"</p>
              </section>
            )}

            {/* Historial */}
            <section>
              <p className="text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)] mb-2 flex items-center gap-1.5">
                <History size={11} /> Historial
              </p>
              <ol className="space-y-2">
                {detalle.historial.map((h: any) => {
                  const m = ESTADO_META[h.estado as EstadoPV];
                  return (
                    <li key={h.id} className="flex items-start gap-2.5">
                      <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', m.color.replace('text-', 'bg-'))} />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-black uppercase tracking-widest', m.color)}>{m.label}</p>
                        <p className="text-[10px] text-[var(--color-texto-muted)]">
                          {new Date(h.creadoEn).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {h.nota && <p className="text-[11px] text-[var(--color-texto-suave)] italic mt-0.5">"{h.nota}"</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Acciones */}
            {detalle.estado !== 'CANCELADO' && (
              <div className="space-y-2 pt-4 border-t border-[var(--color-borde-suave)]">
                {siguiente && (
                  <button
                    onClick={onAvanzar}
                    disabled={transicionando}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest hover:brightness-110 disabled:opacity-50"
                  >
                    {transicionando ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                    Marcar como {ESTADO_META[siguiente].label}
                  </button>
                )}
                {pendiente > 0 && (
                  <button
                    onClick={() => { setShowAbono(true); setAbonoMonto(String(pendiente.toFixed(2))); }}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--color-borde-suave)] font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-fondo-hover)]"
                  >
                    <DollarSign size={14} /> Registrar abono
                  </button>
                )}
                {telefono && (
                  <button
                    onClick={() => onWhatsApp(detalle)}
                    style={{ backgroundColor: '#25D366' }}
                    className="w-full py-3 rounded-xl text-white font-black uppercase text-xs tracking-widest hover:brightness-110 inline-flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={14} fill="currentColor" strokeWidth={0} />
                    Enviar tracking por WhatsApp
                  </button>
                )}
                <div className="flex gap-2">
                  {detalle.tipo === 'PEDIDO' && (
                    <button onClick={() => onCopiarLink(detalle.trackingToken)} className="flex-1 py-2 rounded-xl text-xs font-bold border border-[var(--color-borde-suave)] hover:bg-[var(--color-fondo-hover)] inline-flex items-center justify-center gap-1.5">
                      {copiado ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      Copiar link
                    </button>
                  )}
                  <button
                    onClick={() => setShowCancelar(true)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20"
                  >
                    Cancelar pedido
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal abono */}
        {showAbono && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAbono(false)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl w-full max-w-sm p-6 space-y-4">
              <h3 className="text-lg font-black">Registrar abono</h3>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">Monto</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-texto-muted)]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    autoFocus
                    className="input w-full pl-7 text-sm"
                    value={abonoMonto}
                    onChange={(e) => setAbonoMonto(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-[var(--color-texto-muted)] mt-1">Pendiente: {formatearMoneda(pendiente)}</p>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">Método</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'] as MetodoPago[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setAbonoMetodo(m)}
                      className={cn(
                        'rounded-lg border py-2 text-[10px] font-black uppercase tracking-widest',
                        abonoMetodo === m
                          ? 'border-[#d4af37] bg-[#d4af37]/10 text-[var(--color-texto)]'
                          : 'border-[var(--color-borde-suave)] text-[var(--color-texto-muted)]'
                      )}
                    >
                      {m.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAbono(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)]" disabled={abonando}>Cancelar</button>
                <button
                  onClick={onAbonar}
                  disabled={abonando || !abonoMonto || parseFloat(abonoMonto) <= 0}
                  className="px-5 py-2 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {abonando && <Loader2 size={12} className="animate-spin" />} Registrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal cancelar */}
        {showCancelar && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowCancelar(false)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-[var(--color-fondo-card)] border border-rose-500/30 rounded-3xl w-full max-w-sm p-6 space-y-4">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-500 mb-3">
                  <XCircle size={28} />
                </div>
                <h3 className="text-lg font-black">Cancelar pedido</h3>
                <p className="text-xs text-[var(--color-texto-suave)] mt-1">
                  El stock de los productos se restituirá automáticamente. Esta acción no se puede deshacer.
                </p>
              </div>
              <textarea
                className="input w-full text-sm min-h-[70px]"
                placeholder="Motivo (opcional)"
                value={cancelMotivo}
                onChange={(e) => setCancelMotivo(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => setShowCancelar(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-[var(--color-borde-suave)] hover:bg-[var(--color-fondo-hover)]" disabled={transicionando}>
                  No, conservar
                </button>
                <button
                  onClick={onConfirmarCancelar}
                  disabled={transicionando}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-black uppercase text-xs tracking-widest hover:bg-rose-600 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {transicionando && <Loader2 size={12} className="animate-spin" />} Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function Linea({ label, value, className = '', bold = false }: { label: string; value: string; className?: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-xs', bold ? 'font-black' : 'font-bold text-[var(--color-texto-suave)]', className)}>{label}</span>
      <span className={cn(bold ? 'text-base font-black' : 'text-sm font-bold', className)}>{value}</span>
    </div>
  );
}
