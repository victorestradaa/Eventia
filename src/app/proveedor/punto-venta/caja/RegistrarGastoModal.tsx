'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Loader2, X, AlertCircle, Save, Package, Wrench, Boxes, Briefcase, Banknote, CreditCard, ArrowRightLeft, MoreHorizontal, Calendar, Search, Plus,
} from 'lucide-react';
import { crearGastoPV, listarProductosPV } from '@/lib/actions/puntoVentaActions';
import { cn, formatearMoneda } from '@/lib/utils';

type TipoGasto = 'MERCANCIA' | 'INSUMOS' | 'MAQUINARIA' | 'OPERATIVO';
type FormaPago = 'CONTADO' | 'CREDITO';
type MetPag = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';

type Producto = { id: string; nombre: string; precio: number | string; stock: number };

interface Props {
  proveedorId: string;
  onClose: () => void;
  onSaved: () => void;
}

const TIPOS: { v: TipoGasto; label: string; desc: string; icon: any; color: string }[] = [
  { v: 'MERCANCIA', label: 'Mercancía',  desc: 'Productos para reventa (entra a inventario)', icon: Boxes,     color: 'amber'   },
  { v: 'INSUMOS',   label: 'Insumos',    desc: 'Material y consumibles',                       icon: Package,   color: 'blue'    },
  { v: 'MAQUINARIA',label: 'Maquinaria', desc: 'Equipo y herramientas',                       icon: Wrench,    color: 'violet'  },
  { v: 'OPERATIVO', label: 'Operativo',  desc: 'Renta, sueldos, servicios, etc.',             icon: Briefcase, color: 'emerald' },
];

const METODOS: { v: MetPag; label: string; icon: any; color: string }[] = [
  { v: 'EFECTIVO',      label: 'Efectivo',      icon: Banknote,        color: 'emerald' },
  { v: 'TARJETA',       label: 'Tarjeta',       icon: CreditCard,      color: 'blue'    },
  { v: 'TRANSFERENCIA', label: 'Transferencia', icon: ArrowRightLeft,  color: 'cyan'    },
  { v: 'OTRO',          label: 'Otro',          icon: MoreHorizontal,  color: 'slate'   },
];

export default function RegistrarGastoModal({ proveedorId, onClose, onSaved }: Props) {
  // Paso 1: tipo + datos básicos
  const [tipo, setTipo] = useState<TipoGasto>('MERCANCIA');
  const [concepto, setConcepto] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [precioUnit, setPrecioUnit] = useState('');
  const [proveedorTercero, setProveedorTercero] = useState('');
  const [notas, setNotas] = useState('');

  // Mercancía: producto existente o nuevo
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargandoProds, setCargandoProds] = useState(false);
  const [productoMode, setProductoMode] = useState<'EXISTENTE' | 'NUEVO'>('EXISTENTE');
  const [productoId, setProductoId] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [nuevoSku, setNuevoSku] = useState('');

  // Paso 2: forma de pago
  const [formaPago, setFormaPago] = useState<FormaPago>('CONTADO');
  // Contado: distribución
  const [pagosContado, setPagosContado] = useState<Record<MetPag, string>>({
    EFECTIVO: '', TARJETA: '', TRANSFERENCIA: '', OTRO: '',
  });
  // Crédito: número de mensualidades + primera fecha
  const [numMensualidades, setNumMensualidades] = useState('1');
  const [primeraFecha, setPrimeraFecha] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  });

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Cargar productos solo si tipo es MERCANCIA
  useEffect(() => {
    if (tipo !== 'MERCANCIA') return;
    if (productos.length > 0) return;
    setCargandoProds(true);
    listarProductosPV(proveedorId).then((res) => {
      if (res.success) setProductos((res.data as any[]).filter((p) => p.activo) as Producto[]);
      setCargandoProds(false);
    });
  }, [tipo]); // eslint-disable-line react-hooks/exhaustive-deps

  const cantidadNum = parseFloat(cantidad) || 0;
  const precioNum = parseFloat(precioUnit) || 0;
  const total = cantidadNum * precioNum;

  const sumaContado = useMemo(() =>
    Object.values(pagosContado).reduce((s, v) => s + (parseFloat(v) || 0), 0),
  [pagosContado]);
  const diferenciaContado = total - sumaContado;

  const cuotaMensual = useMemo(() => {
    const n = parseInt(numMensualidades, 10) || 1;
    return n > 0 ? total / n : 0;
  }, [total, numMensualidades]);

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productos.slice(0, 20);
    return productos.filter((p) => p.nombre.toLowerCase().includes(q)).slice(0, 20);
  }, [productos, busqueda]);

  const setPagoMetodo = (m: MetPag, valor: string) => {
    setPagosContado((prev) => ({ ...prev, [m]: valor }));
  };

  const usarTodoEn = (m: MetPag) => {
    setPagosContado({ EFECTIVO: '', TARJETA: '', TRANSFERENCIA: '', OTRO: '' });
    setPagosContado((prev) => ({ ...prev, [m]: total.toFixed(2) }));
  };

  const guardar = async () => {
    setError('');
    if (!concepto.trim() && tipo !== 'MERCANCIA') {
      setError('Falta el concepto / descripción.');
      return;
    }
    if (tipo === 'MERCANCIA') {
      if (productoMode === 'EXISTENTE' && !productoId) {
        setError('Selecciona un producto existente o crea uno nuevo.');
        return;
      }
      if (productoMode === 'NUEVO' && !nuevoNombre.trim()) {
        setError('Pon nombre al producto nuevo.');
        return;
      }
    }
    if (cantidadNum <= 0) return setError('La cantidad debe ser mayor a 0.');
    if (precioNum <= 0) return setError('El precio unitario debe ser mayor a 0.');

    // Validar pago
    let pagosContadoArr: Array<{ metodoPago: MetPag; monto: number }> | undefined;
    let pagosCreditoArr: Array<{ numeroPago: number; fechaVencimiento: string; montoEsperado: number }> | undefined;

    if (formaPago === 'CONTADO') {
      pagosContadoArr = Object.entries(pagosContado)
        .map(([m, v]) => ({ metodoPago: m as MetPag, monto: parseFloat(v) || 0 }))
        .filter((p) => p.monto > 0);
      if (pagosContadoArr.length === 0) return setError('Indica al menos un método de pago.');
      if (Math.abs(diferenciaContado) > 0.01) {
        return setError(`Faltan ${formatearMoneda(diferenciaContado)} por asignar.`);
      }
    } else {
      const n = parseInt(numMensualidades, 10);
      if (!n || n < 1) return setError('Número de pagos inválido.');
      if (!primeraFecha) return setError('Selecciona la fecha del primer pago.');
      const cuota = total / n;
      pagosCreditoArr = Array.from({ length: n }, (_, i) => {
        const d = new Date(primeraFecha);
        d.setMonth(d.getMonth() + i);
        return {
          numeroPago: i + 1,
          fechaVencimiento: d.toISOString().slice(0, 10),
          montoEsperado: Math.round(cuota * 100) / 100,
        };
      });
      // Ajustar último para que cuadre exactamente con total
      const sumaActual = pagosCreditoArr.reduce((s, p) => s + p.montoEsperado, 0);
      const diff = total - sumaActual;
      pagosCreditoArr[pagosCreditoArr.length - 1].montoEsperado += Math.round(diff * 100) / 100;
    }

    // Concepto efectivo
    const conceptoFinal = tipo === 'MERCANCIA'
      ? (productoMode === 'NUEVO' ? nuevoNombre.trim() : (productos.find((p) => p.id === productoId)?.nombre || 'Mercancía'))
      : concepto.trim();

    setGuardando(true);
    const res = await crearGastoPV(proveedorId, {
      tipo,
      concepto: conceptoFinal,
      cantidad: cantidadNum,
      precioUnit: precioNum,
      proveedorTerceroNombre: proveedorTercero.trim() || null,
      notas: notas.trim() || null,
      productoId: tipo === 'MERCANCIA' && productoMode === 'EXISTENTE' ? productoId : null,
      productoNuevo: tipo === 'MERCANCIA' && productoMode === 'NUEVO' ? {
        nombre: nuevoNombre.trim(),
        categoria: nuevaCategoria.trim() || null,
        sku: nuevoSku.trim() || null,
      } : null,
      formaPago,
      pagosContado: pagosContadoArr,
      pagosCredito: pagosCreditoArr,
    });
    setGuardando(false);

    if (!res.success) { setError(res.error || 'Error al guardar.'); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--color-borde-suave)] flex items-center justify-between bg-gradient-to-r from-rose-500/[0.05] via-transparent to-rose-500/[0.05]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Egreso</p>
            <h3 className="text-lg font-black">Registrar gasto</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-fondo-hover)]" disabled={guardando}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-3 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Tipo de gasto */}
          <section>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-2">Tipo de gasto</label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS.map((t) => {
                const Icon = t.icon;
                const selected = tipo === t.v;
                return (
                  <button
                    key={t.v}
                    type="button"
                    onClick={() => setTipo(t.v)}
                    className={cn(
                      'rounded-2xl border-2 p-3 text-left flex items-start gap-2.5 transition-all',
                      selected
                        ? t.color === 'amber'   ? 'border-amber-500 bg-amber-500/10'
                        : t.color === 'blue'    ? 'border-blue-500 bg-blue-500/10'
                        : t.color === 'violet'  ? 'border-violet-500 bg-violet-500/10'
                        : 'border-emerald-500 bg-emerald-500/10'
                        : 'border-[var(--color-borde-suave)] hover:bg-[var(--color-fondo-hover)]'
                    )}
                  >
                    <span className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                      selected
                        ? t.color === 'amber'   ? 'bg-amber-500 text-white'
                        : t.color === 'blue'    ? 'bg-blue-500 text-white'
                        : t.color === 'violet'  ? 'bg-violet-500 text-white'
                        : 'bg-emerald-500 text-white'
                        : 'bg-[var(--color-fondo-input)] text-[var(--color-texto-muted)]'
                    )}>
                      <Icon size={14} strokeWidth={2.3} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <p className="text-xs font-black leading-tight">{t.label}</p>
                      <p className="text-[10px] opacity-70 mt-0.5 leading-tight">{t.desc}</p>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Detalles del gasto */}
          {tipo === 'MERCANCIA' ? (
            <section className="space-y-3">
              <div className="bg-[var(--color-fondo-input)] p-0.5 rounded-xl flex">
                {(['EXISTENTE', 'NUEVO'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setProductoMode(m)}
                    className={cn(
                      'flex-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                      productoMode === m ? 'bg-[#d4af37] text-black shadow-sm' : 'text-[var(--color-texto-muted)]'
                    )}
                  >
                    {m === 'EXISTENTE' ? 'Producto existente' : 'Producto nuevo'}
                  </button>
                ))}
              </div>

              {productoMode === 'EXISTENTE' ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
                    <input
                      type="text"
                      className="input w-full pl-9 text-sm"
                      placeholder="Buscar producto..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </div>
                  {cargandoProds ? (
                    <div className="text-center py-4 text-[var(--color-texto-muted)]"><Loader2 size={14} className="mx-auto animate-spin" /></div>
                  ) : productosFiltrados.length === 0 ? (
                    <p className="text-xs text-center text-[var(--color-texto-muted)] py-3">No hay productos. Cambia a "Producto nuevo".</p>
                  ) : (
                    <div className="max-h-44 overflow-y-auto rounded-xl border border-[var(--color-borde-suave)] divide-y divide-[var(--color-borde-suave)]">
                      {productosFiltrados.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setProductoId(p.id)}
                          className={cn('w-full text-left px-3 py-2 hover:bg-[var(--color-fondo-hover)] flex items-center gap-2', productoId === p.id && 'bg-[#d4af37]/10')}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{p.nombre}</p>
                            <p className="text-[10px] text-[var(--color-texto-muted)]">Stock actual: {p.stock} ud.</p>
                          </div>
                          {productoId === p.id && <span className="w-2 h-2 rounded-full bg-[#d4af37]" />}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-[var(--color-texto-muted)]">Aumentará el stock del producto seleccionado.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <input type="text" className="input w-full text-sm" placeholder="Nombre del producto *" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" className="input w-full text-sm" placeholder="Categoría (opcional)" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} />
                    <input type="text" className="input w-full text-sm uppercase" placeholder="SKU (opcional)" value={nuevoSku} onChange={(e) => setNuevoSku(e.target.value.toUpperCase())} />
                  </div>
                  <p className="text-[10px] text-[var(--color-texto-muted)]">Se creará y entrará al inventario con el stock que indiques.</p>
                </div>
              )}
            </section>
          ) : (
            <section>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">Concepto / qué compraste *</label>
              <input
                type="text"
                className="input w-full text-sm"
                placeholder={tipo === 'INSUMOS' ? 'Ej. Cinta adhesiva' : tipo === 'MAQUINARIA' ? 'Ej. Prensa térmica' : 'Ej. Renta del local'}
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
              />
            </section>
          )}

          {/* Cantidad + precio + total */}
          <section className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">Cantidad</label>
              <input type="number" min="1" step="1" className="input w-full text-sm tabular-nums" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">Precio unit.</label>
              <div className="flex items-stretch rounded-xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-input)] overflow-hidden focus-within:border-[#d4af37]">
                <span className="flex items-center px-2 text-xs font-bold text-[var(--color-texto-muted)]">$</span>
                <input type="number" min="0" step="0.01" placeholder="0.00" className="flex-1 min-w-0 py-2 pr-2 bg-transparent border-0 outline-none text-sm font-bold tabular-nums" value={precioUnit} onChange={(e) => setPrecioUnit(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">Total</label>
              <div className="flex items-center justify-end px-3 py-2 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-sm font-black text-[#d4af37] tabular-nums">
                {formatearMoneda(total)}
              </div>
            </div>
          </section>

          {/* Proveedor (tercero) opcional */}
          <section>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">¿A quién le compraste? (opcional)</label>
            <input type="text" className="input w-full text-sm" placeholder="Ej. Costco, Pepe Distribuidor..." value={proveedorTercero} onChange={(e) => setProveedorTercero(e.target.value)} />
          </section>

          {/* Forma de pago */}
          <section className="border-t border-[var(--color-borde-suave)] pt-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-2">Forma de pago</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {([
                { v: 'CONTADO' as FormaPago, label: 'Contado', desc: 'Pago inmediato' },
                { v: 'CREDITO' as FormaPago, label: 'Crédito', desc: 'A pagar después' },
              ] as const).map((f) => (
                <button
                  key={f.v}
                  onClick={() => setFormaPago(f.v)}
                  className={cn(
                    'rounded-2xl border-2 p-3 text-left transition-all',
                    formaPago === f.v
                      ? f.v === 'CONTADO' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'border-[var(--color-borde-suave)] hover:bg-[var(--color-fondo-hover)]'
                  )}
                >
                  <p className="text-xs font-black">{f.label}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{f.desc}</p>
                </button>
              ))}
            </div>

            {formaPago === 'CONTADO' ? (
              <div className="space-y-2">
                <p className="text-[11px] text-[var(--color-texto-suave)]">
                  Indica cuánto se descuenta de cada método. Puedes combinar varios.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {METODOS.map((m) => {
                    const Icon = m.icon;
                    const valor = pagosContado[m.v];
                    return (
                      <div key={m.v} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-[var(--color-texto-suave)]">
                          <span className="inline-flex items-center gap-1.5"><Icon size={11} /> {m.label}</span>
                          {total > 0 && !valor && (
                            <button onClick={() => usarTodoEn(m.v)} className="text-[#d4af37] hover:underline">Usar todo</button>
                          )}
                        </div>
                        <div className="flex items-stretch rounded-lg border border-[var(--color-borde-suave)] bg-[var(--color-fondo-input)] overflow-hidden focus-within:border-[#d4af37]">
                          <span className="flex items-center px-2 text-xs font-bold text-[var(--color-texto-muted)]">$</span>
                          <input type="number" min="0" step="0.01" placeholder="0.00" className="flex-1 min-w-0 py-1.5 pr-2 bg-transparent border-0 outline-none text-sm font-bold tabular-nums text-right" value={valor} onChange={(e) => setPagoMetodo(m.v, e.target.value)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={cn('flex items-center justify-between rounded-lg px-3 py-2 mt-2', Math.abs(diferenciaContado) < 0.01 && total > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600')}>
                  <span className="text-[10px] font-black uppercase tracking-widest">Diferencia</span>
                  <span className="text-sm font-black tabular-nums">{formatearMoneda(diferenciaContado)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">¿Cuántos pagos?</label>
                    <input type="number" min="1" step="1" className="input w-full text-sm" value={numMensualidades} onChange={(e) => setNumMensualidades(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5 flex items-center gap-1"><Calendar size={11} /> Primera fecha</label>
                    <input type="date" className="input w-full text-sm" value={primeraFecha} onChange={(e) => setPrimeraFecha(e.target.value)} />
                  </div>
                </div>
                {total > 0 && parseInt(numMensualidades, 10) > 0 && (
                  <div className="rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 p-3 text-xs">
                    <p className="font-bold text-[var(--color-texto)]">
                      {numMensualidades} pago{parseInt(numMensualidades, 10) > 1 ? 's mensuales' : ' único'} de{' '}
                      <span className="text-[#d4af37] font-black">{formatearMoneda(cuotaMensual)}</span>
                    </p>
                    <p className="text-[10px] text-[var(--color-texto-muted)] mt-1">
                      Quedará en tus Cuentas por Pagar hasta que registres cada pago.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Notas */}
          <section>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">Notas (opcional)</label>
            <textarea className="w-full px-3 py-2 rounded-xl bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] focus:border-[#d4af37] outline-none text-xs min-h-[50px] resize-y" placeholder="Folio de factura, observaciones..." value={notas} onChange={(e) => setNotas(e.target.value)} />
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--color-borde-suave)] flex items-center justify-end gap-2">
          <button onClick={onClose} disabled={guardando} className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)]">Cancelar</button>
          <button
            onClick={guardar}
            disabled={guardando || total <= 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 text-white font-black uppercase text-xs tracking-widest hover:brightness-110 disabled:opacity-50"
          >
            {guardando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Registrar gasto
          </button>
        </div>
      </div>
    </div>
  );
}
