'use client';

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import {
  TrendingUp, ShoppingCart, DollarSign, Receipt, Loader2, Calendar, AlertCircle, Download, Package, Banknote, CreditCard, ArrowLeftRight, MoreHorizontal, XCircle, Clock, CheckCircle2, Sparkles, Truck,
} from 'lucide-react';
import { getReportePV } from '@/lib/actions/puntoVentaActions';
import { cn, formatearMoneda } from '@/lib/utils';

type Reporte = {
  periodo: { inicio: string; fin: string };
  totalVentas: number;
  totalCobrado: number;
  totalPendiente: number;
  numPedidos: number;
  ticketPromedio: number;
  cancelados: number;
  porTipo: { VENTA_DIRECTA: number; PEDIDO: number };
  porEstado: Record<string, number>;
  porMetodo: Record<string, number>;
  porDia: { fecha: string; ventas: number; pedidos: number }[];
  productosTop: { nombre: string; cantidad: number; total: number }[];
};

interface Props {
  proveedorId: string;
  reporteInicial: Reporte | null;
}

const RANGOS = [
  { id: 'HOY',  label: 'Hoy',     days: 0 },
  { id: 'AYER', label: 'Ayer',    days: -1 },
  { id: '7D',   label: '7 días',  days: 6 },
  { id: '30D',  label: '30 días', days: 29 },
  { id: 'CUSTOM', label: 'Custom', days: null as number | null },
];

const COLORES_ESTADO: Record<string, string> = {
  PENDIENTE: '#f59e0b',
  EN_PREPARACION: '#3b82f6',
  LISTO: '#8b5cf6',
  ENTREGADO: '#10b981',
};

const COLORES_METODO: Record<string, string> = {
  EFECTIVO: '#10b981',
  TARJETA: '#3b82f6',
  TRANSFERENCIA: '#8b5cf6',
  OTRO: '#6b7280',
};

const ICONOS_METODO: Record<string, any> = {
  EFECTIVO: Banknote,
  TARJETA: CreditCard,
  TRANSFERENCIA: ArrowLeftRight,
  OTRO: MoreHorizontal,
};

const ICONOS_ESTADO: Record<string, any> = {
  PENDIENTE: Clock,
  EN_PREPARACION: Package,
  LISTO: Sparkles,
  ENTREGADO: Truck,
};

const LABELS_ESTADO: Record<string, string> = {
  PENDIENTE: 'Pendientes',
  EN_PREPARACION: 'En preparación',
  LISTO: 'Listos',
  ENTREGADO: 'Entregados',
};

export default function ReportesPVClient({ proveedorId, reporteInicial }: Props) {
  const [rango, setRango] = useState('7D');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [reporte, setReporte] = useState<Reporte | null>(reporteInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const aplicarRango = async (rangoId: string, customDesde?: string, customHasta?: string) => {
    setError('');
    let inicio = new Date();
    let fin = new Date();

    if (rangoId === 'HOY') {
      inicio.setHours(0, 0, 0, 0);
    } else if (rangoId === 'AYER') {
      inicio.setDate(inicio.getDate() - 1);
      inicio.setHours(0, 0, 0, 0);
      fin.setDate(fin.getDate() - 1);
      fin.setHours(23, 59, 59, 999);
    } else if (rangoId === '7D') {
      inicio.setDate(inicio.getDate() - 6);
      inicio.setHours(0, 0, 0, 0);
    } else if (rangoId === '30D') {
      inicio.setDate(inicio.getDate() - 29);
      inicio.setHours(0, 0, 0, 0);
    } else if (rangoId === 'CUSTOM') {
      if (!customDesde || !customHasta) return;
      inicio = new Date(customDesde);
      fin = new Date(customHasta);
    }

    setCargando(true);
    const res = await getReportePV(
      proveedorId,
      inicio.toISOString().slice(0, 10),
      fin.toISOString().slice(0, 10)
    );
    setCargando(false);

    if (!res.success) {
      setError(res.error || 'Error al cargar el reporte.');
      return;
    }
    setReporte(res.data as Reporte);
  };

  const handleRango = (id: string) => {
    setRango(id);
    if (id === 'CUSTOM') return;
    aplicarRango(id);
  };

  const aplicarCustom = () => {
    if (!desde || !hasta) { setError('Selecciona ambas fechas.'); return; }
    aplicarRango('CUSTOM', desde, hasta);
  };

  /* ─── Datos para gráficas ─────────────────────────────────────────── */

  const dataPorDia = useMemo(() => {
    if (!reporte) return [];
    return reporte.porDia.map((d) => ({
      fecha: new Date(d.fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
      ventas: d.ventas,
      pedidos: d.pedidos,
    }));
  }, [reporte]);

  const dataPorMetodo = useMemo(() => {
    if (!reporte) return [];
    return Object.entries(reporte.porMetodo)
      .filter(([, v]) => v > 0)
      .map(([metodo, valor]) => ({ name: metodo, value: valor }));
  }, [reporte]);

  /* ─── Exportar CSV ────────────────────────────────────────────────── */

  const exportarCSV = () => {
    if (!reporte) return;
    const rows: string[] = [];
    rows.push('REPORTE PUNTO DE VENTA');
    rows.push(`Periodo,${reporte.periodo.inicio.slice(0, 10)} a ${reporte.periodo.fin.slice(0, 10)}`);
    rows.push('');
    rows.push('RESUMEN');
    rows.push(`Total ventas,${reporte.totalVentas.toFixed(2)}`);
    rows.push(`Cobrado,${reporte.totalCobrado.toFixed(2)}`);
    rows.push(`Pendiente,${reporte.totalPendiente.toFixed(2)}`);
    rows.push(`Pedidos,${reporte.numPedidos}`);
    rows.push(`Ticket promedio,${reporte.ticketPromedio.toFixed(2)}`);
    rows.push(`Cancelados,${reporte.cancelados}`);
    rows.push('');
    rows.push('POR DIA');
    rows.push('Fecha,Ventas,Pedidos');
    reporte.porDia.forEach((d) => rows.push(`${d.fecha},${d.ventas.toFixed(2)},${d.pedidos}`));
    rows.push('');
    rows.push('TOP PRODUCTOS');
    rows.push('Producto,Cantidad,Total');
    reporte.productosTop.forEach((p) => rows.push(`"${p.nombre.replace(/"/g, '""')}",${p.cantidad},${p.total.toFixed(2)}`));

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-pv-${reporte.periodo.inicio.slice(0, 10)}-${reporte.periodo.fin.slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* ─── Render ──────────────────────────────────────────────────────── */

  return (
    <div className="space-y-5">
      {/* Filtros de rango */}
      <div className="flex flex-wrap items-center gap-2">
        {RANGOS.map((r) => (
          <button
            key={r.id}
            onClick={() => handleRango(r.id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors',
              rango === r.id
                ? 'bg-[#d4af37] text-black'
                : 'bg-[var(--color-fondo-card)] text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)]'
            )}
          >
            {r.label}
          </button>
        ))}
        {reporte && (
          <button
            onClick={exportarCSV}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-[var(--color-borde-suave)] hover:bg-[var(--color-fondo-hover)]"
          >
            <Download size={14} /> CSV
          </button>
        )}
      </div>

      {/* Inputs de custom */}
      {rango === 'CUSTOM' && (
        <div className="flex flex-wrap gap-2 items-end p-4 rounded-2xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)]">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1">Desde</label>
            <input type="date" className="input" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1">Hasta</label>
            <input type="date" className="input" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          <button
            onClick={aplicarCustom}
            disabled={cargando}
            className="px-5 py-2 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest disabled:opacity-50 inline-flex items-center gap-2"
          >
            {cargando && <Loader2 size={12} className="animate-spin" />} Aplicar
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-3 flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {cargando && !reporte && (
        <div className="flex items-center justify-center py-16 text-[var(--color-texto-muted)]">
          <Loader2 className="animate-spin mr-2" size={20} /> Cargando...
        </div>
      )}

      {reporte && (
        <div className={cn('space-y-5 transition-opacity', cargando && 'opacity-60')}>
          {/* KPIs */}
          <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KPI icon={TrendingUp}    label="Ventas"          valor={formatearMoneda(reporte.totalVentas)} accent />
            <KPI icon={DollarSign}    label="Cobrado"         valor={formatearMoneda(reporte.totalCobrado)} tono="emerald" />
            <KPI icon={DollarSign}    label="Pendiente"       valor={formatearMoneda(reporte.totalPendiente)} tono="rose" />
            <KPI icon={ShoppingCart}  label="Pedidos"         valor={String(reporte.numPedidos)} />
            <KPI icon={Receipt}       label="Ticket promedio" valor={formatearMoneda(reporte.ticketPromedio)} />
          </section>

          {/* Gráficas */}
          <section className="grid lg:grid-cols-3 gap-4">
            {/* Bar chart de ventas por día */}
            <div className="lg:col-span-2 rounded-2xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-texto)] flex items-center gap-2">
                  <Calendar size={14} /> Ventas por día
                </h3>
              </div>
              {dataPorDia.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-[var(--color-texto-muted)] text-sm">
                  Sin ventas en este periodo.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={dataPorDia} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-borde-suave)" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: 'var(--color-texto-muted)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--color-texto-muted)' }} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                    <Tooltip
                      formatter={(value: any, name: any) => name === 'ventas' ? [formatearMoneda(Number(value)), 'Ventas'] : [value, 'Pedidos']}
                      contentStyle={{ background: 'var(--color-fondo-card)', border: '1px solid var(--color-borde-suave)', borderRadius: 12, fontSize: 12 }}
                    />
                    <Bar dataKey="ventas" fill="#d4af37" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie de método de pago */}
            <div className="rounded-2xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-texto)] mb-4 flex items-center gap-2">
                <DollarSign size={14} /> Por método
              </h3>
              {dataPorMetodo.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-[var(--color-texto-muted)] text-sm">
                  Sin cobranza.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={dataPorMetodo}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {dataPorMetodo.map((d, i) => (
                        <Cell key={i} fill={COLORES_METODO[d.name] || '#999'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatearMoneda(Number(value))} contentStyle={{ background: 'var(--color-fondo-card)', border: '1px solid var(--color-borde-suave)', borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="mt-3 space-y-1.5">
                {Object.entries(reporte.porMetodo).map(([metodo, monto]) => {
                  const Icon = ICONOS_METODO[metodo];
                  return (
                    <div key={metodo} className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-2 text-[var(--color-texto-suave)]">
                        <Icon size={12} style={{ color: COLORES_METODO[metodo] }} /> {metodo}
                      </span>
                      <span className="font-black">{formatearMoneda(Number(monto))}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Estados activos + tipo + cancelados */}
          <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            {/* Por estado */}
            <div className="rounded-2xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-texto)] mb-4">
                Pedidos por estado
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'] as const).map((est) => {
                  const Icon = ICONOS_ESTADO[est];
                  return (
                    <div key={est} className="rounded-xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon size={12} style={{ color: COLORES_ESTADO[est] }} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-texto-muted)]">{LABELS_ESTADO[est]}</span>
                      </div>
                      <p className="text-xl font-black" style={{ color: COLORES_ESTADO[est] }}>
                        {reporte.porEstado[est] || 0}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tipo + cancelados */}
            <div className="rounded-2xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-5 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-texto)]">
                Resumen
              </h3>
              <Row label="Venta directa" value={reporte.porTipo.VENTA_DIRECTA} />
              <Row label="Pedido (entrega futura)" value={reporte.porTipo.PEDIDO} />
              <div className="border-t border-[var(--color-borde-suave)]" />
              <Row label="Cancelados" value={reporte.cancelados} tono="rose" />
            </div>
          </section>

          {/* Top productos */}
          <section className="rounded-2xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-borde-suave)]">
              <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-texto)] flex items-center gap-2">
                <Package size={14} /> Top productos
              </h3>
            </div>
            {reporte.productosTop.length === 0 ? (
              <div className="p-10 text-center">
                <Package size={24} className="mx-auto text-[var(--color-texto-muted)] mb-2" />
                <p className="text-sm text-[var(--color-texto-suave)]">Sin productos vendidos en este periodo.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-borde-suave)]">
                {reporte.productosTop.map((p, i) => {
                  const max = reporte.productosTop[0]?.total || 1;
                  const pct = (p.total / max) * 100;
                  return (
                    <div key={i} className="px-5 py-3">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0',
                          i === 0 ? 'bg-[#d4af37] text-black' :
                          i === 1 ? 'bg-zinc-300 text-black' :
                          i === 2 ? 'bg-amber-700 text-white' :
                          'bg-[var(--color-fondo-hover)] text-[var(--color-texto-suave)]'
                        )}>
                          {i + 1}
                        </span>
                        <p className="flex-1 text-sm font-bold truncate">{p.nombre}</p>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black">{formatearMoneda(p.total)}</p>
                          <p className="text-[10px] text-[var(--color-texto-muted)]">{p.cantidad} {p.cantidad === 1 ? 'unidad' : 'unidades'}</p>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--color-fondo-hover)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#d4af37] to-[#b89547]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

/* ─── helpers ───────────────────────────────────────────────────────── */

function KPI({ icon: Icon, label, valor, tono, accent = false }: { icon: any; label: string; valor: string; tono?: string; accent?: boolean }) {
  return (
    <div className={cn(
      'rounded-2xl border p-4',
      accent ? 'bg-gradient-to-br from-[#fdf6e1] to-[#f4e4b9] border-[#d4af37]/40 text-[#1F2937]' : 'bg-[var(--color-fondo-card)] border-[var(--color-borde-suave)]'
    )}>
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center mb-2',
        accent ? 'bg-black text-[#d4af37]' :
        tono === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
        tono === 'rose' ? 'bg-rose-500/10 text-rose-500' :
        'bg-[#d4af37]/10 text-[#d4af37]'
      )}>
        <Icon size={14} />
      </div>
      <p className={cn(
        'text-[10px] font-black uppercase tracking-widest',
        accent ? 'text-[#1F2937]/70' : 'text-[var(--color-texto-muted)]'
      )}>{label}</p>
      <p className={cn(
        'text-lg font-black mt-0.5 tracking-tight',
        accent ? 'text-[#1F2937]' : 'text-[var(--color-texto)]'
      )}>{valor}</p>
    </div>
  );
}

function Row({ label, value, tono }: { label: string; value: number; tono?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-[var(--color-texto-suave)]">{label}</span>
      <span className={cn(
        'text-base font-black',
        tono === 'rose' ? 'text-rose-500' : 'text-[var(--color-texto)]'
      )}>{value}</span>
    </div>
  );
}
