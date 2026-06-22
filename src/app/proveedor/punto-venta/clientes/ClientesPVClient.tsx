'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus, Pencil, Trash2, Search, X, Loader2, Users, AlertCircle, Phone, Mail, MapPin, MessageCircle, ShoppingCart, History, ChevronRight,
} from 'lucide-react';
import {
  crearClientePV,
  actualizarClientePV,
  eliminarClientePV,
  getPedidosPorClientePV,
} from '@/lib/actions/puntoVentaActions';
import { cn, formatearMoneda } from '@/lib/utils';

type Cliente = {
  id: string;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  notas?: string | null;
  creadoEn: string;
  _count?: { pedidos: number };
};

interface Props {
  proveedorId: string;
  clientesIniciales: Cliente[];
}

type FormState = {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  notas: string;
};

const emptyForm: FormState = {
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  notas: '',
};

export default function ClientesPVClient({ proveedorId, clientesIniciales }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciales);
  const [busqueda, setBusqueda] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState<string | null>(null);

  // Drawer de historial del cliente
  const [historialCliente, setHistorialCliente] = useState<Cliente | null>(null);
  const [historialPedidos, setHistorialPedidos] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  useEffect(() => {
    if (!historialCliente) {
      setHistorialPedidos([]);
      return;
    }
    setCargandoHistorial(true);
    getPedidosPorClientePV(historialCliente.id, proveedorId).then((res) => {
      setCargandoHistorial(false);
      if (res.success) setHistorialPedidos(res.data as any[]);
    });
  }, [historialCliente, proveedorId]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return clientes;
    const digits = q.replace(/\D/g, '');
    return clientes.filter((c) =>
      c.nombre.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (digits && (c.telefono || '').replace(/\D/g, '').includes(digits))
    );
  }, [clientes, busqueda]);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const abrirEditar = (c: Cliente) => {
    setEditando(c.id);
    setForm({
      nombre: c.nombre,
      telefono: c.telefono || '',
      email: c.email || '',
      direccion: c.direccion || '',
      notas: c.notas || '',
    });
    setError('');
    setModalOpen(true);
  };

  const cerrarModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditando(null);
    setError('');
  };

  const handleGuardar = async () => {
    setError('');
    if (!form.nombre.trim()) return setError('El nombre es obligatorio.');

    setSaving(true);
    const payload = {
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim() || undefined,
      email: form.email.trim() || undefined,
      direccion: form.direccion.trim() || undefined,
      notas: form.notas.trim() || undefined,
    };

    const res = editando
      ? await actualizarClientePV(editando, proveedorId, {
          nombre: payload.nombre,
          telefono: payload.telefono ?? null,
          email: payload.email ?? null,
          direccion: payload.direccion ?? null,
          notas: payload.notas ?? null,
        })
      : await crearClientePV(proveedorId, payload);

    setSaving(false);

    if (!res.success) {
      setError(res.error || 'Error al guardar.');
      return;
    }

    if (editando) {
      setClientes((prev) => prev.map((c) => (c.id === editando ? (res.data as Cliente) : c)));
    } else {
      // Inserción ordenada por nombre
      setClientes((prev) => {
        const nuevo = res.data as Cliente;
        return [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      });
    }
    setModalOpen(false);
  };

  const handleEliminar = async (c: Cliente) => {
    if (!confirm(`¿Eliminar a "${c.nombre}"? Esta acción no se puede deshacer.`)) return;
    setEliminando(c.id);
    const res = await eliminarClientePV(c.id, proveedorId);
    setEliminando(null);
    if (!res.success) {
      alert(res.error || 'Error al eliminar.');
      return;
    }
    setClientes((prev) => prev.filter((x) => x.id !== c.id));
  };

  const enviarWhatsApp = (c: Cliente) => {
    const tel = (c.telefono || '').replace(/\D/g, '');
    if (!tel) {
      alert('Este cliente no tiene teléfono registrado.');
      return;
    }
    const mensaje = `Hola ${c.nombre}, gracias por tu compra.`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[var(--color-primario-claro)]"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-texto-suave)] font-bold">
          <Users size={14} />
          <span>{clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'}</span>
        </div>
        <button
          onClick={abrirNuevo}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest hover:brightness-110 shadow-lg shadow-[#d4af37]/20"
        >
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-14 text-center">
          <Users size={28} className="mx-auto text-[var(--color-texto-muted)] mb-3" />
          <p className="text-sm font-bold">{clientes.length === 0 ? 'Aún no tienes clientes.' : 'No hay resultados.'}</p>
          <p className="text-xs text-[var(--color-texto-suave)] mt-1">
            {clientes.length === 0 ? 'Empieza registrando a tus compradores frecuentes.' : 'Ajusta tu búsqueda.'}
          </p>
          {clientes.length === 0 && (
            <button onClick={abrirNuevo} className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-black uppercase tracking-widest">
              <Plus size={14} /> Crear primer cliente
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Vista lista (todos los tamaños) */}
          <div className="rounded-2xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] overflow-hidden divide-y divide-[var(--color-borde-suave)]">
            {filtrados.map((c) => (
              <ClienteRow
                key={c.id}
                cliente={c}
                eliminando={eliminando === c.id}
                onVerHistorial={() => setHistorialCliente(c)}
                onEditar={() => abrirEditar(c)}
                onEliminar={() => handleEliminar(c)}
                onWhatsApp={() => enviarWhatsApp(c)}
              />
            ))}
          </div>
        </>
      )}

      {/* Drawer de historial del cliente */}
      {historialCliente && (
        <div
          className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-200"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={() => setHistorialCliente(null)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full bg-[var(--color-fondo-card)] border-l border-[var(--color-borde-suave)] shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200"
          >
            <div className="sticky top-0 bg-[var(--color-fondo-card)] border-b border-[var(--color-borde-suave)] px-5 py-4 flex items-center justify-between z-10">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)]">Historial</p>
                <h3 className="text-lg font-black truncate">{historialCliente.nombre}</h3>
              </div>
              <button onClick={() => setHistorialCliente(null)} className="p-2 rounded-lg hover:bg-[var(--color-fondo-hover)]">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Datos del cliente */}
              <section className="rounded-xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-3 space-y-1">
                {historialCliente.telefono && (
                  <p className="text-xs text-[var(--color-texto-suave)] flex items-center gap-1.5">
                    <Phone size={12} /> {historialCliente.telefono}
                  </p>
                )}
                {historialCliente.email && (
                  <p className="text-xs text-[var(--color-texto-suave)] flex items-center gap-1.5">
                    <Mail size={12} /> {historialCliente.email}
                  </p>
                )}
                {historialCliente.direccion && (
                  <p className="text-xs text-[var(--color-texto-suave)] flex items-center gap-1.5">
                    <MapPin size={12} /> {historialCliente.direccion}
                  </p>
                )}
                {historialCliente.notas && (
                  <p className="text-xs italic text-[var(--color-texto-muted)] mt-1 border-l-2 border-[#d4af37]/40 pl-2">
                    "{historialCliente.notas}"
                  </p>
                )}
              </section>

              {/* Resumen */}
              {historialPedidos.length > 0 && (() => {
                const total = historialPedidos.reduce((s, p) => s + Number(p.total), 0);
                const pendiente = historialPedidos.reduce((s, p) => s + (p.estado === 'CANCELADO' ? 0 : Math.max(0, Number(p.total) - Number(p.pagado))), 0);
                return (
                  <section className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-texto-muted)]">Pedidos</p>
                      <p className="text-base font-black mt-0.5">{historialPedidos.length}</p>
                    </div>
                    <div className="rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 p-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#d4af37]">Total</p>
                      <p className="text-base font-black text-[#d4af37] mt-0.5">{formatearMoneda(total)}</p>
                    </div>
                    <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-rose-600">Adeudo</p>
                      <p className="text-base font-black text-rose-600 mt-0.5">{formatearMoneda(pendiente)}</p>
                    </div>
                  </section>
                );
              })()}

              {/* Lista de pedidos */}
              <section>
                <p className="text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)] mb-2 flex items-center gap-1.5">
                  <History size={11} /> Pedidos realizados
                </p>
                {cargandoHistorial ? (
                  <div className="flex items-center justify-center py-8 text-[var(--color-texto-muted)]">
                    <Loader2 className="animate-spin mr-2" size={16} /> Cargando...
                  </div>
                ) : historialPedidos.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--color-borde-suave)] bg-[var(--color-fondo)]/50 p-6 text-center">
                    <ShoppingCart size={20} className="mx-auto text-[var(--color-texto-muted)] mb-2" />
                    <p className="text-xs text-[var(--color-texto-suave)]">Este cliente aún no tiene pedidos.</p>
                  </div>
                ) : (
                  <ol className="space-y-2">
                    {historialPedidos.map((p) => {
                      const total = Number(p.total);
                      const pagado = Number(p.pagado);
                      const pend = Math.max(0, total - pagado);
                      const estadoStyle: Record<string, string> = {
                        PENDIENTE: 'bg-amber-500/15 text-amber-600',
                        EN_PREPARACION: 'bg-blue-500/15 text-blue-600',
                        LISTO: 'bg-violet-500/15 text-violet-600',
                        ENTREGADO: 'bg-emerald-500/15 text-emerald-600',
                        CANCELADO: 'bg-rose-500/15 text-rose-600',
                      };
                      return (
                        <li key={p.id} className="rounded-xl bg-[var(--color-fondo)]/50 border border-[var(--color-borde-suave)] p-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)]">#{p.folio}</span>
                              <span className={cn('text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded', estadoStyle[p.estado] || '')}>
                                {p.estado.replace('_', ' ')}
                              </span>
                              {p.tipo === 'PEDIDO' && (
                                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-[var(--color-fondo-hover)] text-[var(--color-texto-suave)]">Pedido</span>
                              )}
                            </div>
                            <p className="text-sm font-black whitespace-nowrap">{formatearMoneda(total)}</p>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <p className="text-[var(--color-texto-muted)]">
                              {new Date(p.creadoEn).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · {p._count?.lineas ?? 0} {p._count?.lineas === 1 ? 'ítem' : 'ítems'}
                            </p>
                            {pend > 0 && p.estado !== 'CANCELADO' && (
                              <p className="font-bold text-rose-600">Pendiente: {formatearMoneda(pend)}</p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>

              {historialPedidos.length > 0 && (
                <Link
                  href="/proveedor/punto-venta/pedidos"
                  className="block text-center text-xs font-bold text-[#d4af37] hover:underline"
                >
                  Ver todos los pedidos →
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={cerrarModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 bg-[var(--color-fondo-card)] border-b border-[var(--color-borde-suave)] px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-black">{editando ? 'Editar cliente' : 'Nuevo cliente'}</h3>
              <button onClick={cerrarModal} className="p-2 rounded-lg hover:bg-[var(--color-fondo-hover)]" disabled={saving}>
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-3 flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <Field label="Nombre *">
                <input
                  type="text"
                  className="input w-full"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Nombre completo"
                  autoFocus
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Teléfono">
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-3 rounded-xl bg-[var(--color-fondo-hover)] border border-[var(--color-borde-suave)] text-sm font-bold select-none">
                      +52
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      className="input flex-1 min-w-0"
                      placeholder="10 dígitos"
                      value={(form.telefono || '').replace(/^\+52/, '')}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setForm({ ...form, telefono: digits ? `+52${digits}` : '' });
                      }}
                    />
                  </div>
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    className="input w-full"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                  />
                </Field>
              </div>

              <Field label="Dirección">
                <input
                  type="text"
                  className="input w-full"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  placeholder="Calle, número, colonia, ciudad..."
                />
              </Field>

              <Field label="Notas internas">
                <textarea
                  className="input w-full min-h-[70px]"
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  placeholder="Preferencias, alergias, fechas importantes..."
                />
              </Field>
            </div>

            <div className="sticky bottom-0 bg-[var(--color-fondo-card)] border-t border-[var(--color-borde-suave)] px-6 py-4 flex items-center justify-end gap-3">
              <button onClick={cerrarModal} className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)]" disabled={saving}>
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest hover:brightness-110 disabled:opacity-50"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editando ? 'Guardar' : 'Crear cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── helpers UI ─────────────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ClienteRow({
  cliente, eliminando, onVerHistorial, onEditar, onEliminar, onWhatsApp,
}: {
  cliente: Cliente;
  eliminando: boolean;
  onVerHistorial: () => void;
  onEditar: () => void;
  onEliminar: () => void;
  onWhatsApp: () => void;
}) {
  const iniciales = cliente.nombre
    .split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
  const tienePedidos = (cliente._count?.pedidos || 0) > 0;

  return (
    <div className="px-4 py-3 flex items-center gap-3 hover:bg-[var(--color-fondo-hover)] transition-colors cursor-pointer" onClick={onVerHistorial}>
      <div className="w-10 h-10 rounded-full bg-[var(--color-fondo-hover)] flex items-center justify-center text-sm font-black text-[var(--color-texto)] shrink-0">
        {iniciales || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{cliente.nombre}</p>
        <div className="flex items-center gap-3 text-[11px] text-[var(--color-texto-suave)] mt-0.5 flex-wrap">
          {cliente.telefono && (
            <span className="inline-flex items-center gap-1">
              <Phone size={11} /> {cliente.telefono}
            </span>
          )}
          {cliente._count && (
            <span className="inline-flex items-center gap-1">
              <ShoppingCart size={11} /> {cliente._count.pedidos} {cliente._count.pedidos === 1 ? 'pedido' : 'pedidos'}
            </span>
          )}
          {cliente.email && (
            <span className="inline-flex items-center gap-1">
              <Mail size={11} /> {cliente.email}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {cliente.telefono && (
          <button
            onClick={(e) => { e.stopPropagation(); onWhatsApp(); }}
            aria-label="Enviar WhatsApp"
            title="Enviar WhatsApp"
            className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10"
          >
            <MessageCircle size={14} fill="currentColor" strokeWidth={0} />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onEditar(); }}
          aria-label="Editar"
          className="p-2 rounded-lg text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)] hover:text-[var(--color-texto)]"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEliminar(); }}
          disabled={eliminando || tienePedidos}
          title={tienePedidos ? 'No se puede eliminar: tiene pedidos asociados' : 'Eliminar'}
          aria-label="Eliminar"
          className={cn(
            'p-2 rounded-lg',
            tienePedidos
              ? 'text-[var(--color-texto-muted)] opacity-40 cursor-not-allowed'
              : 'text-rose-500 hover:bg-rose-500/10'
          )}
        >
          {eliminando ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
        <ChevronRight size={14} className="text-[var(--color-texto-muted)]" />
      </div>
    </div>
  );
}
