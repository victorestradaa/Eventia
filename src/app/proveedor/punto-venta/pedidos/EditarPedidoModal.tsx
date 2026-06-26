'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Minus, Trash2, X, Search, AlertCircle, Save, ImageOff, Package } from 'lucide-react';
import { editarPedidoPV, listarProductosPV } from '@/lib/actions/puntoVentaActions';
import { cn, formatearMoneda } from '@/lib/utils';

type Producto = {
  id: string;
  nombre: string;
  precio: number | string;
  stock: number;
  controlStock: boolean;
  imagenes: string[];
  activo: boolean;
};

type Linea = {
  key: string;
  productoId?: string | null;
  nombre: string;
  cantidad: number;
  precioUnit: number;
  precioOriginal?: number;
  notas?: string;
};

interface Props {
  proveedorId: string;
  pedido: any;
  onClose: () => void;
  onSaved: (pedidoActualizado: any) => void;
}

export default function EditarPedidoModal({ proveedorId, pedido, onClose, onSaved }: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargandoProds, setCargandoProds] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [lineas, setLineas] = useState<Linea[]>(() =>
    (pedido.lineas || []).map((l: any) => ({
      key: `linea-${l.id}`,
      productoId: l.productoId || null,
      nombre: l.nombre,
      cantidad: l.cantidad,
      precioUnit: Number(l.precioUnit),
      precioOriginal: Number(l.precioUnit),
      notas: l.notas || '',
    })),
  );
  const [notaCambio, setNotaCambio] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await listarProductosPV(proveedorId);
      if (res.success) {
        setProductos((res.data as any[]).filter((p) => p.activo) as any);
      }
      setCargandoProds(false);
    })();
  }, [proveedorId]);

  const subtotal = useMemo(() => lineas.reduce((s, l) => s + l.cantidad * l.precioUnit, 0), [lineas]);
  const descuento = Number(pedido.descuento) || 0;
  const total = Math.max(0, subtotal - descuento);
  const pagado = Number(pedido.pagado) || 0;
  const sobrepago = Math.max(0, pagado - total);

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productos.slice(0, 30);
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.categoria as any || '').toLowerCase().includes(q)
    ).slice(0, 30);
  }, [productos, busqueda]);

  const agregarDelCatalogo = (p: Producto) => {
    const existente = lineas.find((l) => l.productoId === p.id);
    if (existente) {
      setLineas((prev) => prev.map((l) => l.productoId === p.id ? { ...l, cantidad: l.cantidad + 1 } : l));
    } else {
      setLineas((prev) => [...prev, {
        key: `nueva-${p.id}-${Date.now()}`,
        productoId: p.id,
        nombre: p.nombre,
        cantidad: 1,
        precioUnit: Number(p.precio),
        precioOriginal: Number(p.precio),
      }]);
    }
    setBusqueda('');
    setMostrarCatalogo(false);
  };

  const agregarLibre = () => {
    setLineas((prev) => [...prev, {
      key: `libre-${Date.now()}`,
      productoId: null,
      nombre: '',
      cantidad: 1,
      precioUnit: 0,
    }]);
  };

  const actualizar = (key: string, cambios: Partial<Linea>) => {
    setLineas((prev) => prev.map((l) => l.key === key ? { ...l, ...cambios } : l));
  };

  const quitar = (key: string) => {
    setLineas((prev) => prev.filter((l) => l.key !== key));
  };

  const cambiarCant = (key: string, delta: number) => {
    setLineas((prev) => prev.map((l) => {
      if (l.key !== key) return l;
      const nueva = l.cantidad + delta;
      if (nueva < 1) return l;
      return { ...l, cantidad: nueva };
    }));
  };

  const guardar = async () => {
    setError('');
    if (lineas.length === 0) {
      setError('El pedido debe tener al menos un producto.');
      return;
    }
    for (const l of lineas) {
      if (!l.nombre.trim()) { setError('Hay líneas sin nombre.'); return; }
      if (l.cantidad <= 0) { setError('Hay líneas con cantidad 0.'); return; }
    }

    setGuardando(true);
    const res = await editarPedidoPV(
      pedido.id,
      proveedorId,
      lineas.map((l) => ({
        productoId: l.productoId || null,
        nombre: l.nombre.trim(),
        cantidad: l.cantidad,
        precioUnit: l.precioUnit,
        notas: l.notas || null,
      })),
      notaCambio,
    );
    setGuardando(false);

    if (!res.success) {
      setError(res.error || 'Error al guardar los cambios.');
      return;
    }
    onSaved(res.data);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--color-borde-suave)] flex items-center justify-between bg-gradient-to-r from-[#d4af37]/[0.05] via-transparent to-[#d4af37]/[0.05]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">Editar pedido</p>
            <h3 className="text-lg font-black">Folio #{pedido.folio}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-fondo-hover)]" disabled={guardando}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-3 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Líneas */}
          <section>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-2">
              Productos del pedido
            </p>
            {lineas.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-borde-suave)] p-6 text-center">
                <Package size={20} className="mx-auto text-[var(--color-texto-muted)] mb-2" />
                <p className="text-xs text-[var(--color-texto-muted)]">Agrega al menos un producto.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--color-borde-suave)] divide-y divide-[var(--color-borde-suave)]">
                {lineas.map((l) => {
                  const override = l.precioOriginal != null && Math.abs(l.precioUnit - l.precioOriginal) > 0.005;
                  return (
                    <div key={l.key} className="p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        {l.productoId ? (
                          <p className="text-sm font-bold flex-1 min-w-0 truncate">{l.nombre}</p>
                        ) : (
                          <input
                            type="text"
                            className="input flex-1 text-sm"
                            placeholder="Nombre del producto libre"
                            value={l.nombre}
                            onChange={(e) => actualizar(l.key, { nombre: e.target.value })}
                          />
                        )}
                        {override && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md shrink-0">
                            Precio modificado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Cantidad */}
                        <div className="inline-flex items-center rounded-lg border border-[var(--color-borde-suave)]">
                          <button onClick={() => cambiarCant(l.key, -1)} className="p-1.5 hover:bg-[var(--color-fondo-hover)] rounded-l-lg">
                            <Minus size={12} />
                          </button>
                          <span className="px-2 text-xs font-bold min-w-[28px] text-center tabular-nums">{l.cantidad}</span>
                          <button onClick={() => cambiarCant(l.key, 1)} className="p-1.5 hover:bg-[var(--color-fondo-hover)] rounded-r-lg">
                            <Plus size={12} />
                          </button>
                        </div>
                        {/* Precio */}
                        <div className={cn(
                          'flex items-stretch rounded-lg border overflow-hidden',
                          override ? 'border-amber-500/60 bg-amber-500/5' : 'border-[var(--color-borde-suave)]'
                        )}>
                          <span className="flex items-center px-2 text-[10px] font-bold text-[var(--color-texto-muted)] select-none">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-20 py-1 pr-2 bg-transparent border-0 outline-none text-xs font-bold tabular-nums text-right"
                            value={l.precioUnit || ''}
                            onChange={(e) => actualizar(l.key, { precioUnit: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <p className="text-xs font-black ml-auto tabular-nums">{formatearMoneda(l.cantidad * l.precioUnit)}</p>
                        <button onClick={() => quitar(l.key)} className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-md">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => setMostrarCatalogo((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 text-xs font-bold"
              >
                <Plus size={12} /> Agregar del catálogo
              </button>
              <button
                onClick={agregarLibre}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-fondo-input)] hover:bg-[var(--color-fondo-hover)] text-xs font-bold"
              >
                <Plus size={12} /> Producto libre
              </button>
            </div>

            {/* Buscador de catálogo */}
            {mostrarCatalogo && (
              <div className="mt-3 rounded-xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo)]/40 p-3 space-y-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
                  <input
                    type="text"
                    autoFocus
                    className="input w-full pl-9 text-sm"
                    placeholder="Buscar producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
                {cargandoProds ? (
                  <div className="text-center py-6 text-[var(--color-texto-muted)]">
                    <Loader2 size={16} className="mx-auto animate-spin" />
                  </div>
                ) : productosFiltrados.length === 0 ? (
                  <p className="text-xs text-center text-[var(--color-texto-muted)] py-4">No hay productos.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-1.5">
                    {productosFiltrados.map((p) => {
                      const sinStock = p.controlStock && p.stock === 0;
                      return (
                        <button
                          key={p.id}
                          onClick={() => agregarDelCatalogo(p)}
                          disabled={sinStock}
                          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-fondo-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[var(--color-fondo-input)] overflow-hidden shrink-0 flex items-center justify-center">
                            {p.imagenes?.[0] ? (
                              <img src={p.imagenes[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageOff size={14} className="text-[var(--color-texto-muted)]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{p.nombre}</p>
                            <p className="text-[10px] text-[var(--color-texto-muted)]">
                              {formatearMoneda(Number(p.precio))}
                              {p.controlStock && ` · ${p.stock} ud.`}
                            </p>
                          </div>
                          <Plus size={14} className="text-[#d4af37]" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Totales */}
          <section className="rounded-xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--color-texto-suave)]">Subtotal</span>
              <span className="font-bold tabular-nums">{formatearMoneda(subtotal)}</span>
            </div>
            {descuento > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-texto-suave)]">Descuento</span>
                <span className="font-bold tabular-nums">- {formatearMoneda(descuento)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-dashed border-[var(--color-borde-suave)] flex justify-between items-center">
              <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-texto-suave)]">Nuevo total</span>
              <span className="text-xl font-black text-[#d4af37] tabular-nums">{formatearMoneda(total)}</span>
            </div>
            {pagado > 0 && (
              <div className="text-[11px] text-[var(--color-texto-suave)] pt-1">
                Pagado actual: <span className="font-bold text-emerald-500">{formatearMoneda(pagado)}</span>
                {sobrepago > 0 && (
                  <span className="block mt-1 text-amber-600 dark:text-amber-400 font-bold">
                    ⚠ Sobrepago de {formatearMoneda(sobrepago)} — se registrará como devolución en caja.
                  </span>
                )}
              </div>
            )}
          </section>

          {/* Nota del cambio */}
          <section>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">
              Motivo del cambio (opcional)
            </label>
            <input
              type="text"
              className="input w-full text-sm"
              placeholder="Ej. Cliente pidió agregar otro termo"
              value={notaCambio}
              onChange={(e) => setNotaCambio(e.target.value)}
            />
            <p className="text-[10px] text-[var(--color-texto-muted)] mt-1">
              Queda registrado en el historial del pedido.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--color-borde-suave)] flex items-center justify-end gap-2">
          <button onClick={onClose} disabled={guardando} className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)]">
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={guardando || lineas.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest hover:brightness-110 disabled:opacity-50"
          >
            {guardando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
