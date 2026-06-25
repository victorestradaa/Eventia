'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, User, X, Loader2, AlertCircle, MessageCircle, Copy, CheckCircle2, ImageOff, Package, ArrowRight, Calendar, Hash, Zap, Banknote, CreditCard, ArrowRightLeft, MoreHorizontal, Sparkles,
} from 'lucide-react';
import { crearPedidoPV, crearClientePV, listarVentasRecientesPV, getPedidoDetallePV } from '@/lib/actions/puntoVentaActions';
import { descargarReciboPDF, compartirReciboPDF } from '@/lib/pdf/reciboPV';
import { cn, formatearMoneda } from '@/lib/utils';
import { History, FileText, Send } from 'lucide-react';

type Producto = {
  id: string;
  nombre: string;
  precio: number | string;
  stock: number;
  controlStock: boolean;
  imagenes: string[];
  categoria?: string | null;
};

type ClienteOpt = {
  id: string;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
};

type Linea = {
  key: string; // único para react keys
  productoId?: string;
  nombre: string;
  cantidad: number;
  precioUnit: number;
  notas?: string;
  stockDisponible?: number;
  controlStock?: boolean;
};

interface Props {
  proveedorId: string;
  productos: Producto[];
  clientes: ClienteOpt[];
}

type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';
type TipoVenta = 'VENTA_DIRECTA' | 'PEDIDO';

export default function NuevaVentaPVClient({ proveedorId, productos, clientes: clientesInicial }: Props) {
  const [clientes, setClientes] = useState<ClienteOpt[]>(clientesInicial);

  // Carrito
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [descuento, setDescuento] = useState('0');

  // Cliente
  const [modoCliente, setModoCliente] = useState<'EXISTENTE' | 'AD_HOC'>('EXISTENTE');
  const [clienteId, setClienteId] = useState<string>('');
  const [adHocNombre, setAdHocNombre] = useState('');
  const [adHocTelefono, setAdHocTelefono] = useState('');
  const [busquedaCliente, setBusquedaCliente] = useState('');

  // Detalle de pedido
  const [tipo, setTipo] = useState<TipoVenta>('VENTA_DIRECTA');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [pagado, setPagado] = useState('');
  const [notas, setNotas] = useState('');

  // Buscador productos
  const [busquedaProducto, setBusquedaProducto] = useState('');

  // Estado guardar
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState('');
  const [pedidoCreado, setPedidoCreado] = useState<any | null>(null);

  // Modal cliente rápido
  const [quickClienteOpen, setQuickClienteOpen] = useState(false);
  const [quickClienteForm, setQuickClienteForm] = useState({ nombre: '', telefono: '' });
  const [quickClienteSaving, setQuickClienteSaving] = useState(false);

  // Drawer historial de ventas
  const [historialOpen, setHistorialOpen] = useState(false);
  const [historialList, setHistorialList] = useState<any[]>([]);
  const [historialCargando, setHistorialCargando] = useState(false);
  const [reciboCargandoId, setReciboCargandoId] = useState<string | null>(null);

  const abrirHistorial = async () => {
    setHistorialOpen(true);
    setHistorialCargando(true);
    const res = await listarVentasRecientesPV(proveedorId, 30);
    setHistorialCargando(false);
    if (res.success) setHistorialList(res.data as any[]);
  };

  const reenviarRecibo = async (pedidoId: string, modo: 'descargar' | 'compartir') => {
    setReciboCargandoId(pedidoId);
    const res = await getPedidoDetallePV(pedidoId, proveedorId);
    setReciboCargandoId(null);
    if (!res.success || !res.data) { alert(res.error || 'No se pudo cargar el pedido.'); return; }
    if (modo === 'descargar') await descargarReciboPDF(res.data as any);
    else await compartirReciboPDF(res.data as any);
  };

  /* ─── Cálculos ────────────────────────────────────────────────────── */

  const subtotal = useMemo(
    () => lineas.reduce((s, l) => s + l.cantidad * l.precioUnit, 0),
    [lineas]
  );
  const dscNum = Math.max(0, parseFloat(descuento || '0') || 0);
  const total = Math.max(0, subtotal - dscNum);

  // Pre-llenar pagado cuando es venta directa
  useEffect(() => {
    if (tipo === 'VENTA_DIRECTA') setPagado(String(total.toFixed(2)));
    else setPagado('0');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, total]);

  /* ─── Productos filtrados ────────────────────────────────────────── */

  const productosFiltrados = useMemo(() => {
    const q = busquedaProducto.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.categoria || '').toLowerCase().includes(q)
    );
  }, [productos, busquedaProducto]);

  /* ─── Clientes filtrados ─────────────────────────────────────────── */

  const clientesFiltrados = useMemo(() => {
    const q = busquedaCliente.trim().toLowerCase();
    if (!q) return clientes;
    const digits = q.replace(/\D/g, '');
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (digits && (c.telefono || '').replace(/\D/g, '').includes(digits))
    );
  }, [clientes, busquedaCliente]);

  /* ─── Acciones del carrito ───────────────────────────────────────── */

  const agregarProducto = (p: Producto) => {
    setError('');
    if (p.controlStock && p.stock === 0) {
      setError(`"${p.nombre}" no tiene stock disponible.`);
      return;
    }
    setLineas((prev) => {
      const existente = prev.find((l) => l.productoId === p.id);
      if (existente) {
        if (p.controlStock && existente.cantidad + 1 > p.stock) {
          setError(`Stock máximo de "${p.nombre}" alcanzado.`);
          return prev;
        }
        return prev.map((l) =>
          l.productoId === p.id ? { ...l, cantidad: l.cantidad + 1 } : l
        );
      }
      return [
        ...prev,
        {
          key: `prod-${p.id}-${Date.now()}`,
          productoId: p.id,
          nombre: p.nombre,
          cantidad: 1,
          precioUnit: Number(p.precio),
          stockDisponible: p.stock,
          controlStock: p.controlStock,
        },
      ];
    });
  };

  const agregarLineaLibre = () => {
    setLineas((prev) => [
      ...prev,
      {
        key: `libre-${Date.now()}`,
        nombre: '',
        cantidad: 1,
        precioUnit: 0,
      },
    ]);
  };

  const actualizarLinea = (key: string, cambios: Partial<Linea>) => {
    setLineas((prev) => prev.map((l) => (l.key === key ? { ...l, ...cambios } : l)));
  };

  const cambiarCantidad = (key: string, delta: number) => {
    setLineas((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const nueva = l.cantidad + delta;
        if (nueva < 1) return l;
        if (l.controlStock && l.stockDisponible != null && nueva > l.stockDisponible) {
          setError(`Stock máximo de "${l.nombre}" alcanzado.`);
          return l;
        }
        return { ...l, cantidad: nueva };
      })
    );
  };

  const quitarLinea = (key: string) => {
    setLineas((prev) => prev.filter((l) => l.key !== key));
  };

  /* ─── Cliente rápido ─────────────────────────────────────────────── */

  const crearClienteRapido = async () => {
    if (!quickClienteForm.nombre.trim()) return;
    setQuickClienteSaving(true);
    const tel = quickClienteForm.telefono.trim();
    const res = await crearClientePV(proveedorId, {
      nombre: quickClienteForm.nombre.trim(),
      telefono: tel ? (tel.startsWith('+') ? tel : `+52${tel.replace(/\D/g, '')}`) : undefined,
    });
    setQuickClienteSaving(false);
    if (!res.success) {
      alert(res.error || 'Error al crear cliente.');
      return;
    }
    const nuevo = res.data as ClienteOpt;
    setClientes((prev) => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
    setClienteId(nuevo.id);
    setQuickClienteOpen(false);
    setQuickClienteForm({ nombre: '', telefono: '' });
  };

  /* ─── Guardar pedido ─────────────────────────────────────────────── */

  const handleCrear = async () => {
    setError('');

    // Validaciones cliente
    let clienteFinal: { clienteId?: string | null; nombreCliente?: string | null; telefonoCliente?: string | null } = {};
    if (modoCliente === 'EXISTENTE') {
      if (!clienteId) {
        setError('Selecciona un cliente o usa el modo "Cliente rápido".');
        return;
      }
      clienteFinal.clienteId = clienteId;
    } else {
      if (!adHocNombre.trim() && tipo === 'PEDIDO') {
        setError('Para un pedido necesitas mínimo el nombre del cliente.');
        return;
      }
      clienteFinal.nombreCliente = adHocNombre.trim() || null;
      clienteFinal.telefonoCliente = adHocTelefono.trim() || null;
    }

    // Validaciones líneas
    const lineasValidas = lineas
      .filter((l) => l.nombre.trim() && l.cantidad > 0 && l.precioUnit >= 0);
    if (lineasValidas.length === 0) {
      setError('Agrega al menos un producto válido al pedido.');
      return;
    }

    if (tipo === 'PEDIDO' && !fechaEntrega) {
      setError('Selecciona la fecha de entrega.');
      return;
    }

    setCreando(true);
    // El input datetime-local devuelve "YYYY-MM-DDTHH:mm" sin zona horaria.
    // Si lo enviamos así al servidor (Amplify corre en UTC) `new Date(...)` lo
    // interpreta como UTC y se desfasa por la zona horaria local. Convertimos
    // en el cliente — donde sí conocemos la TZ — al ISO correcto.
    const fechaEntregaISO = fechaEntrega ? new Date(fechaEntrega).toISOString() : null;
    const res = await crearPedidoPV(proveedorId, {
      tipo,
      ...clienteFinal,
      lineas: lineasValidas.map((l) => ({
        productoId: l.productoId,
        nombre: l.nombre,
        cantidad: l.cantidad,
        precioUnit: l.precioUnit,
        notas: l.notas,
      })),
      descuento: dscNum,
      metodoPago,
      fechaEntrega: fechaEntregaISO,
      notas: notas || null,
      pagado: parseFloat(pagado || '0') || 0,
    });
    setCreando(false);

    if (!res.success) {
      setError(res.error || 'Error al crear el pedido.');
      return;
    }
    setPedidoCreado(res.data);
  };

  const resetForm = () => {
    setPedidoCreado(null);
    setLineas([]);
    setDescuento('0');
    setClienteId('');
    setAdHocNombre('');
    setAdHocTelefono('');
    setBusquedaCliente('');
    setBusquedaProducto('');
    setFechaEntrega('');
    setMetodoPago('EFECTIVO');
    setNotas('');
    setError('');
  };

  /* ─── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-5">
      {/* IZQUIERDA: cliente + productos */}
      <div className="space-y-5">
        {/* Cliente */}
        <section className="rounded-2xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-texto-muted)] flex items-center gap-2">
              <User size={14} /> Cliente
            </h3>
            <div className="bg-[var(--color-fondo-input)] p-0.5 rounded-lg flex">
              {(['EXISTENTE', 'AD_HOC'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setModoCliente(m)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors',
                    modoCliente === m
                      ? 'bg-[#d4af37] text-black'
                      : 'text-[var(--color-texto-muted)]'
                  )}
                >
                  {m === 'EXISTENTE' ? 'Registrado' : 'Rápido'}
                </button>
              ))}
            </div>
          </div>

          {modoCliente === 'EXISTENTE' ? (
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
                <input
                  type="text"
                  className="input w-full pl-9 text-sm"
                  placeholder="Buscar cliente..."
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                />
              </div>
              <div className="max-h-72 overflow-y-auto -mx-1 px-1">
                {clientesFiltrados.length === 0 ? (
                  <div className="p-4 text-center rounded-xl border border-[var(--color-borde-suave)]">
                    <p className="text-xs text-[var(--color-texto-muted)]">No hay clientes.</p>
                    <button onClick={() => setQuickClienteOpen(true)} className="mt-2 text-xs font-bold text-[#d4af37] hover:underline">
                      + Crear cliente rápido
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    {clientesFiltrados.map((c) => {
                      const selected = clienteId === c.id;
                      const { initials, color } = avatarFromName(c.nombre);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setClienteId(c.id)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all',
                            selected
                              ? 'border-[#d4af37] bg-[#d4af37]/10 ring-1 ring-[#d4af37]/40'
                              : 'border-[var(--color-borde-suave)] hover:border-[#d4af37]/40 hover:bg-[var(--color-fondo-hover)]'
                          )}
                          aria-pressed={selected}
                        >
                          <span
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-black shrink-0',
                              color
                            )}
                          >
                            {initials}
                          </span>
                          <span className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate leading-tight">{c.nombre}</p>
                            {c.telefono && (
                              <p className="text-[11px] text-[var(--color-texto-muted)] truncate">{c.telefono}</p>
                            )}
                          </span>
                          {selected && (
                            <span className="w-2 h-2 rounded-full bg-[#d4af37] shrink-0" aria-hidden />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <button onClick={() => setQuickClienteOpen(true)} className="text-xs font-bold text-[#d4af37] hover:underline">
                + Crear cliente nuevo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                className="input w-full text-sm"
                placeholder="Nombre del cliente"
                value={adHocNombre}
                onChange={(e) => setAdHocNombre(e.target.value)}
              />
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-3 rounded-xl bg-[var(--color-fondo-hover)] border border-[var(--color-borde-suave)] text-sm font-bold select-none">+52</div>
                <input
                  type="tel"
                  inputMode="numeric"
                  className="input flex-1 min-w-0 text-sm"
                  placeholder="10 dígitos (opcional)"
                  value={(adHocTelefono || '').replace(/^\+52/, '')}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, '');
                    setAdHocTelefono(d ? `+52${d}` : '');
                  }}
                />
              </div>
              <p className="text-[10px] text-[var(--color-texto-muted)]">No se guardará en tu base de clientes. Solo para esta venta.</p>
            </div>
          )}
        </section>

        {/* Catálogo de productos */}
        <section className="rounded-2xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-5">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-texto-muted)] flex items-center gap-2 shrink-0">
              <Package size={14} /> Productos
            </h3>
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
                <input
                  type="text"
                  className="input w-full pl-9 text-sm"
                  placeholder="Buscar..."
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={abrirHistorial}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-fondo-hover)] hover:bg-[var(--color-borde-suave)] text-xs font-bold text-[var(--color-texto)] shrink-0"
                title="Ver historial de ventas"
              >
                <History size={14} /> Historial
              </button>
            </div>
          </div>

          {productosFiltrados.length === 0 ? (
            <div className="text-center py-10">
              <Package size={24} className="mx-auto text-[var(--color-texto-muted)] mb-2" />
              <p className="text-xs text-[var(--color-texto-muted)]">
                {productos.length === 0 ? 'Aún no tienes productos.' : 'No hay resultados.'}
              </p>
              {productos.length === 0 && (
                <Link href="/proveedor/punto-venta/productos" className="text-xs font-bold text-[#d4af37] hover:underline">
                  Ir a crear productos →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {productosFiltrados.map((p) => {
                const sinStock = p.controlStock && p.stock === 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => agregarProducto(p)}
                    disabled={sinStock}
                    className={cn(
                      'rounded-xl border bg-[var(--color-fondo)] text-left overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed',
                      'border-[var(--color-borde-suave)]'
                    )}
                  >
                    <div className="aspect-square bg-[var(--color-fondo-input)] relative">
                      {p.imagenes?.[0] ? (
                        <img src={p.imagenes[0]} alt={p.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-texto-muted)]">
                          <ImageOff size={20} />
                        </div>
                      )}
                      {sinStock && (
                        <div className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">Sin stock</div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-bold truncate">{p.nombre}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs font-black text-[#d4af37]">{formatearMoneda(Number(p.precio))}</p>
                        {p.controlStock && (
                          <p className="text-[9px] text-[var(--color-texto-muted)]">{p.stock} ud.</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <button onClick={agregarLineaLibre} className="mt-3 text-xs font-bold text-[var(--color-texto-suave)] hover:text-[#d4af37]">
            + Agregar producto libre (sin catálogo)
          </button>
        </section>
      </div>

      {/* DERECHA: carrito sticky */}
      <aside className="lg:sticky lg:top-20 self-start">
        <div className="rounded-3xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] overflow-hidden shadow-xl shadow-black/[0.04] dark:shadow-black/30">
          {/* Header carrito */}
          <div className="px-5 py-4 border-b border-[var(--color-borde-suave)] flex items-center justify-between bg-gradient-to-r from-[#d4af37]/[0.04] via-transparent to-[#d4af37]/[0.04]">
            <h3 className="text-sm font-black tracking-tight text-[var(--color-texto)] flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b89547] text-white inline-flex items-center justify-center shadow-md shadow-[#d4af37]/30">
                <ShoppingCart size={15} strokeWidth={2.3} />
              </span>
              Carrito
              <span className={cn(
                'text-[11px] font-black px-2 py-0.5 rounded-full transition-colors',
                lineas.length > 0
                  ? 'bg-[#d4af37] text-black'
                  : 'bg-[var(--color-fondo-input)] text-[var(--color-texto-muted)]'
              )}>
                {lineas.length}
              </span>
            </h3>
            {lineas.length > 0 && (
              <button onClick={() => setLineas([])} className="text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 px-2 py-1 rounded-md uppercase tracking-widest inline-flex items-center gap-1">
                <Trash2 size={11} /> Vaciar
              </button>
            )}
          </div>

          {/* Líneas */}
          <div className="max-h-64 overflow-y-auto divide-y divide-[var(--color-borde-suave)]">
            {lineas.length === 0 ? (
              <div className="px-6 py-10 text-center flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-[#d4af37]/10 blur-xl" aria-hidden />
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-fondo-input)] to-[var(--color-fondo-hover)] flex items-center justify-center text-[var(--color-texto-muted)] ring-1 ring-[var(--color-borde-suave)]">
                    <ShoppingCart size={26} strokeWidth={1.7} />
                  </div>
                  <Sparkles size={12} className="absolute -top-1 -right-1 text-[#d4af37]" />
                </div>
                <p className="text-sm font-black text-[var(--color-texto)]">Carrito vacío</p>
                <p className="text-[11px] text-[var(--color-texto-muted)] mt-1">Selecciona productos para empezar.</p>
              </div>
            ) : (
              lineas.map((l) => (
                <div key={l.key} className="px-4 py-3 space-y-2">
                  {l.productoId ? (
                    <p className="text-sm font-bold">{l.nombre}</p>
                  ) : (
                    <input
                      type="text"
                      className="input w-full text-sm"
                      placeholder="Nombre del producto"
                      value={l.nombre}
                      onChange={(e) => actualizarLinea(l.key, { nombre: e.target.value })}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center rounded-lg border border-[var(--color-borde-suave)]">
                      <button onClick={() => cambiarCantidad(l.key, -1)} className="p-1.5 text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)] rounded-l-lg">
                        <Minus size={12} />
                      </button>
                      <span className="px-2 text-xs font-bold min-w-[28px] text-center">{l.cantidad}</span>
                      <button onClick={() => cambiarCantidad(l.key, 1)} className="p-1.5 text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)] rounded-r-lg">
                        <Plus size={12} />
                      </button>
                    </div>
                    {!l.productoId && (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input w-24 text-xs"
                        placeholder="Precio"
                        value={l.precioUnit || ''}
                        onChange={(e) => actualizarLinea(l.key, { precioUnit: parseFloat(e.target.value) || 0 })}
                      />
                    )}
                    <p className="text-xs font-bold ml-auto">{formatearMoneda(l.cantidad * l.precioUnit)}</p>
                    <button onClick={() => quitarLinea(l.key)} className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-md">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Resumen de totales — tarjeta visual destacada */}
          <div className="px-5 pt-5 pb-4 border-t border-[var(--color-borde-suave)]">
            <div className="rounded-2xl bg-gradient-to-br from-[#d4af37]/[0.06] via-transparent to-transparent border border-[var(--color-borde-suave)] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-texto-suave)]">Subtotal</span>
                <span className="text-sm font-bold tabular-nums text-[var(--color-texto)]">{formatearMoneda(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-[var(--color-texto-suave)]">Descuento</span>
                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--color-texto-muted)] pointer-events-none">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-6 pr-2 py-1.5 text-right text-xs tabular-nums rounded-lg bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] focus:border-[#d4af37] outline-none transition-colors"
                    value={descuento}
                    onChange={(e) => setDescuento(e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-3 mt-1 border-t border-dashed border-[#d4af37]/30 flex items-end justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-texto-suave)] pb-1">Total</span>
                <span className="text-3xl font-black tabular-nums bg-gradient-to-br from-[#d4af37] to-[#b89547] bg-clip-text text-transparent leading-none">
                  {formatearMoneda(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Configuración del pedido */}
          <div className="px-5 pb-5 space-y-4">
            {/* Tipo de venta — segmented control con iconos */}
            <div className="grid grid-cols-2 gap-2">
              {([
                { v: 'VENTA_DIRECTA' as TipoVenta, label: 'Venta directa', desc: 'Entrega inmediata', icon: Zap,      accent: 'emerald' },
                { v: 'PEDIDO'        as TipoVenta, label: 'Pedido',        desc: 'Entrega futura',    icon: Calendar, accent: 'amber'   },
              ] as const).map((opt) => {
                const selected = tipo === opt.v;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setTipo(opt.v)}
                    className={cn(
                      'group rounded-2xl border-2 p-3 text-left transition-all flex items-start gap-2.5',
                      selected
                        ? opt.accent === 'emerald'
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-sm shadow-emerald-500/20'
                          : 'border-amber-500 bg-amber-500/10 shadow-sm shadow-amber-500/20'
                        : 'border-[var(--color-borde-suave)] text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)] hover:border-[var(--color-borde)]'
                    )}
                    aria-pressed={selected}
                  >
                    <span className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                      selected
                        ? opt.accent === 'emerald'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                        : 'bg-[var(--color-fondo-input)] text-[var(--color-texto-muted)]'
                    )}>
                      <Icon size={14} strokeWidth={2.3} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <p className={cn(
                        'text-xs font-black leading-tight',
                        selected && opt.accent === 'emerald' && 'text-emerald-600 dark:text-emerald-400',
                        selected && opt.accent === 'amber' && 'text-amber-600 dark:text-amber-400',
                      )}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] opacity-70 mt-0.5 leading-tight">{opt.desc}</p>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Fecha entrega si es pedido */}
            {tipo === 'PEDIDO' && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5 flex items-center gap-1.5">
                  <Calendar size={11} /> Fecha de entrega *
                </label>
                <input
                  type="datetime-local"
                  className="input w-full text-sm"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                />
              </div>
            )}

            {/* Método de pago — con iconos en lugar de letras */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-2">Método de pago</label>
              <div className="grid grid-cols-4 gap-1.5">
                {([
                  { v: 'EFECTIVO'      as MetodoPago, label: 'Efectivo',     short: 'Efec', icon: Banknote,        accent: 'emerald' },
                  { v: 'TARJETA'       as MetodoPago, label: 'Tarjeta',      short: 'Tarj', icon: CreditCard,      accent: 'blue'    },
                  { v: 'TRANSFERENCIA' as MetodoPago, label: 'Transferencia', short: 'Tran', icon: ArrowRightLeft, accent: 'cyan'    },
                  { v: 'OTRO'          as MetodoPago, label: 'Otro',         short: 'Otro', icon: MoreHorizontal,  accent: 'slate'   },
                ] as const).map((m) => {
                  const selected = metodoPago === m.v;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.v}
                      type="button"
                      onClick={() => setMetodoPago(m.v)}
                      className={cn(
                        'rounded-xl border-2 py-2.5 px-1 flex flex-col items-center justify-center gap-1 transition-all',
                        selected
                          ? m.accent === 'emerald' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/20'
                          : m.accent === 'blue'    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-500/20'
                          : m.accent === 'cyan'    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-sm shadow-cyan-500/20'
                          : 'border-slate-500 bg-slate-500/10 text-slate-600 dark:text-slate-400 shadow-sm shadow-slate-500/20'
                          : 'border-[var(--color-borde-suave)] text-[var(--color-texto-muted)] hover:bg-[var(--color-fondo-hover)] hover:border-[var(--color-borde)]'
                      )}
                      aria-pressed={selected}
                      title={m.label}
                    >
                      <Icon size={18} strokeWidth={2.2} />
                      <span className="text-[10px] font-black uppercase tracking-wider">{m.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pagado — input más visible y grande */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">
                {tipo === 'VENTA_DIRECTA' ? 'Cobrado' : 'Anticipo (opcional)'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-[var(--color-texto-muted)] pointer-events-none">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={total}
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-[var(--color-fondo-input)] border-2 border-[var(--color-borde-suave)] focus:border-[#d4af37] outline-none text-base font-bold tabular-nums transition-colors"
                  value={pagado}
                  onChange={(e) => setPagado(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">Notas internas</label>
              <textarea
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] focus:border-[#d4af37] outline-none text-xs min-h-[60px] resize-y transition-colors"
                placeholder="Instrucciones, dirección de entrega..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-[11px] font-bold p-2.5 flex items-start gap-2">
                <AlertCircle size={12} className="mt-0.5 shrink-0" /> <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleCrear}
              disabled={creando || lineas.length === 0}
              className="group relative w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b89547] text-black font-black uppercase text-sm tracking-widest hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#d4af37]/30 transition-all overflow-hidden"
            >
              {/* Brillo sutil que pasa al hover */}
              <span aria-hidden className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <span className="relative inline-flex items-center gap-2">
                {creando ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} strokeWidth={2.5} />}
                {tipo === 'VENTA_DIRECTA' ? 'Cobrar' : 'Crear pedido'} · {formatearMoneda(total)}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modal cliente rápido */}
      {quickClienteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setQuickClienteOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-black">Cliente rápido</h3>
            <input
              type="text"
              className="input w-full text-sm"
              placeholder="Nombre completo"
              autoFocus
              value={quickClienteForm.nombre}
              onChange={(e) => setQuickClienteForm({ ...quickClienteForm, nombre: e.target.value })}
            />
            <div className="flex gap-2">
              <div className="flex items-center px-3 py-3 rounded-xl bg-[var(--color-fondo-hover)] border border-[var(--color-borde-suave)] text-sm font-bold select-none">+52</div>
              <input
                type="tel"
                inputMode="numeric"
                className="input flex-1 min-w-0 text-sm"
                placeholder="10 dígitos (opcional)"
                value={quickClienteForm.telefono.replace(/\D/g, '')}
                onChange={(e) => setQuickClienteForm({ ...quickClienteForm, telefono: e.target.value.replace(/\D/g, '') })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setQuickClienteOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)]">Cancelar</button>
              <button
                onClick={crearClienteRapido}
                disabled={quickClienteSaving || !quickClienteForm.nombre.trim()}
                className="px-5 py-2 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest disabled:opacity-50 inline-flex items-center gap-2"
              >
                {quickClienteSaving && <Loader2 size={12} className="animate-spin" />} Crear y usar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer historial de ventas */}
      {historialOpen && (
        <div
          className="fixed inset-0 z-[100] flex justify-end"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={() => setHistorialOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full bg-[var(--color-fondo-card)] border-l border-[var(--color-borde-suave)] shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200"
          >
            <div className="sticky top-0 bg-[var(--color-fondo-card)] border-b border-[var(--color-borde-suave)] px-5 py-4 flex items-center justify-between z-10">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)]">Últimas 30</p>
                <h3 className="text-lg font-black flex items-center gap-2"><History size={16} /> Historial de ventas</h3>
              </div>
              <button onClick={() => setHistorialOpen(false)} className="p-2 rounded-lg hover:bg-[var(--color-fondo-hover)]">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {historialCargando ? (
                <div className="flex items-center justify-center py-10 text-[var(--color-texto-muted)]">
                  <Loader2 className="animate-spin mr-2" size={16} /> Cargando...
                </div>
              ) : historialList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--color-borde-suave)] bg-[var(--color-fondo)]/50 p-8 text-center">
                  <ShoppingCart size={20} className="mx-auto text-[var(--color-texto-muted)] mb-2" />
                  <p className="text-xs text-[var(--color-texto-suave)]">No hay ventas registradas aún.</p>
                </div>
              ) : (
                <ol className="space-y-2">
                  {historialList.map((p) => {
                    const total = Number(p.total);
                    const pagado = Number(p.pagado);
                    const pend = Math.max(0, total - pagado);
                    const estadoStyle: Record<string, string> = {
                      PENDIENTE: 'bg-amber-500/15 text-amber-600',
                      EN_PREPARACION: 'bg-blue-500/15 text-blue-600',
                      LISTO: 'bg-violet-500/15 text-violet-600',
                      ENTREGADO: 'bg-emerald-500/15 text-emerald-600',
                    };
                    const cargando = reciboCargandoId === p.id;
                    return (
                      <li key={p.id} className="rounded-xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)]">#{p.folio}</span>
                            <span className={cn('text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded', estadoStyle[p.estado] || 'bg-[var(--color-fondo-hover)] text-[var(--color-texto-suave)]')}>
                              {p.estado.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm font-black whitespace-nowrap">{formatearMoneda(total)}</p>
                        </div>
                        <p className="text-xs font-bold truncate text-[var(--color-texto)]">
                          {p.cliente?.nombre || p.nombreCliente || 'Cliente rápido'}
                        </p>
                        <p className="text-[10px] text-[var(--color-texto-muted)]">
                          {new Date(p.creadoEn).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {' · '}{p._count?.lineas ?? 0} {p._count?.lineas === 1 ? 'ítem' : 'ítems'}
                          {pend > 0 && <span className="text-rose-600 font-bold"> · Pendiente {formatearMoneda(pend)}</span>}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => reenviarRecibo(p.id, 'descargar')}
                            disabled={cargando}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[var(--color-borde-suave)] hover:bg-[var(--color-fondo-hover)] text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                          >
                            {cargando ? <Loader2 size={10} className="animate-spin" /> : <FileText size={10} />}
                            PDF
                          </button>
                          <button
                            onClick={() => reenviarRecibo(p.id, 'compartir')}
                            disabled={cargando}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                          >
                            {cargando ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                            Enviar
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Modal éxito */}
      {pedidoCreado && (
        <PedidoCreadoModal pedido={pedidoCreado} onCerrar={resetForm} />
      )}
    </div>
  );
}

/* ─── helpers ───────────────────────────────────────────────────────── */

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('font-bold', highlight ? 'text-sm text-[var(--color-texto)]' : 'text-xs text-[var(--color-texto-suave)]')}>{label}</span>
      <span className={cn('font-black', highlight ? 'text-lg text-[#d4af37]' : 'text-sm text-[var(--color-texto)]')}>{value}</span>
    </div>
  );
}

function PedidoCreadoModal({ pedido, onCerrar }: { pedido: any; onCerrar: () => void }) {
  const [copiado, setCopiado] = useState(false);
  const esVenta = pedido.tipo === 'VENTA_DIRECTA';
  const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/pedido/${pedido.trackingToken}` : '';

  const enviarWhatsApp = () => {
    const tel = (pedido.telefonoCliente || pedido.cliente?.telefono || '').replace(/\D/g, '');
    if (!tel) {
      alert('Este pedido no tiene teléfono. Cópialo y mándalo manualmente.');
      return;
    }
    const nombre = pedido.cliente?.nombre || pedido.nombreCliente || '';
    const mensaje = esVenta
      ? `¡Gracias por tu compra${nombre ? `, ${nombre}` : ''}! Folio #${pedido.folio} · Total: ${formatearMoneda(Number(pedido.total))}.`
      : `¡Hola${nombre ? ` ${nombre}` : ''}! Aquí está el seguimiento de tu pedido #${pedido.folio}: ${trackingUrl}`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl w-full max-w-md p-6 text-center space-y-5 animate-in zoom-in duration-200">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h3 className="text-xl font-black">
            {esVenta ? '¡Venta registrada!' : '¡Pedido creado!'}
          </h3>
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-[var(--color-fondo-hover)] text-xs font-bold">
            <Hash size={12} /> Folio #{pedido.folio}
          </div>
        </div>

        <div className="space-y-2 text-left bg-[var(--color-fondo)]/50 rounded-2xl p-4 border border-[var(--color-borde-suave)]">
          <Row label="Total" value={formatearMoneda(Number(pedido.total))} highlight />
          <Row label="Pagado" value={formatearMoneda(Number(pedido.pagado))} />
          {Number(pedido.pagado) < Number(pedido.total) && (
            <Row label="Pendiente" value={formatearMoneda(Number(pedido.total) - Number(pedido.pagado))} />
          )}
        </div>

        {!esVenta && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)]">Link de seguimiento</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={trackingUrl}
                className="input w-full text-xs"
                onFocus={(e) => e.target.select()}
              />
              <button onClick={copiar} className="p-2.5 rounded-xl bg-[var(--color-fondo-hover)] hover:bg-[var(--color-borde-suave)]" title="Copiar">
                {copiado ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => descargarReciboPDF(pedido)}
              className="py-3 rounded-xl border border-[var(--color-borde-suave)] hover:bg-[var(--color-fondo-hover)] text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2"
            >
              <FileText size={14} /> PDF
            </button>
            <button
              onClick={() => compartirReciboPDF(pedido)}
              className="py-3 rounded-xl bg-[#d4af37]/15 text-[#d4af37] hover:bg-[#d4af37]/25 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2"
            >
              <Send size={14} /> Enviar recibo
            </button>
          </div>
          {(pedido.cliente?.telefono || pedido.telefonoCliente) && (
            <button
              onClick={enviarWhatsApp}
              style={{ backgroundColor: '#25D366' }}
              className="w-full py-3 rounded-xl text-white font-black uppercase text-xs tracking-widest hover:brightness-110 inline-flex items-center justify-center gap-2"
            >
              <MessageCircle size={14} fill="currentColor" strokeWidth={0} />
              Solo texto por WhatsApp
            </button>
          )}
          <button onClick={onCerrar} className="w-full py-3 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest hover:brightness-110">
            Nueva venta
          </button>
          <Link href="/proveedor/punto-venta/pedidos" className="text-xs font-bold text-[var(--color-texto-suave)] hover:text-[#d4af37] inline-flex items-center justify-center gap-1">
            Ver lista de pedidos <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */

const AVATAR_COLORS = [
  'bg-blue-500/20 text-blue-600 dark:text-blue-300',
  'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300',
  'bg-amber-500/20 text-amber-600 dark:text-amber-300',
  'bg-violet-500/20 text-violet-600 dark:text-violet-300',
  'bg-rose-500/20 text-rose-600 dark:text-rose-300',
  'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300',
  'bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-300',
  'bg-teal-500/20 text-teal-600 dark:text-teal-300',
];

function avatarFromName(nombre: string): { initials: string; color: string } {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  const initials = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  // Hash determinista del nombre para escoger color
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = (h * 31 + nombre.charCodeAt(i)) | 0;
  const color = AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
  return { initials: initials.toUpperCase() || '?', color };
}
