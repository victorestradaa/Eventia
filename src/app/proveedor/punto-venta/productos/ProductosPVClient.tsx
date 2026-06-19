'use client';

import { useMemo, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Loader2, Upload, ImageOff, Package, AlertCircle } from 'lucide-react';
import {
  crearProductoPV,
  actualizarProductoPV,
  eliminarProductoPV,
  subirImagenProductoPV,
} from '@/lib/actions/puntoVentaActions';
import { cn, formatearMoneda } from '@/lib/utils';

type Producto = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  sku?: string | null;
  categoria?: string | null;
  precio: number | string;
  costo?: number | string | null;
  stock: number;
  controlStock: boolean;
  imagenes: string[];
  activo: boolean;
  creadoEn: string;
};

interface Props {
  proveedorId: string;
  productosIniciales: Producto[];
}

type FormState = {
  nombre: string;
  descripcion: string;
  sku: string;
  categoria: string;
  precio: string;
  costo: string;
  stock: string;
  controlStock: boolean;
  imagenes: string[];
};

const emptyForm: FormState = {
  nombre: '',
  descripcion: '',
  sku: '',
  categoria: '',
  precio: '',
  costo: '',
  stock: '0',
  controlStock: true,
  imagenes: [],
};

export default function ProductosPVClient({ proveedorId, productosIniciales }: Props) {
  const [productos, setProductos] = useState<Producto[]>(productosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<string>('TODAS');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => p.categoria && set.add(p.categoria));
    return Array.from(set).sort();
  }, [productos]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      if (!mostrarInactivos && !p.activo) return false;
      if (categoria !== 'TODAS' && (p.categoria || 'Sin categoría') !== categoria) return false;
      if (!q) return true;
      return (
        p.nombre.toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.categoria || '').toLowerCase().includes(q)
      );
    });
  }, [productos, busqueda, categoria, mostrarInactivos]);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const abrirEditar = (p: Producto) => {
    setEditando(p.id);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      sku: p.sku || '',
      categoria: p.categoria || '',
      precio: String(p.precio ?? ''),
      costo: p.costo != null ? String(p.costo) : '',
      stock: String(p.stock ?? 0),
      controlStock: p.controlStock,
      imagenes: p.imagenes || [],
    });
    setError('');
    setModalOpen(true);
  };

  const cerrarModal = () => {
    if (saving || uploading) return;
    setModalOpen(false);
    setEditando(null);
    setError('');
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    const nuevasUrls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('proveedorId', proveedorId);
      const res = await subirImagenProductoPV(fd);
      if (res.success && res.url) nuevasUrls.push(res.url);
      else {
        setError(res.error || 'Error al subir imagen.');
        break;
      }
    }
    setForm((prev) => ({ ...prev, imagenes: [...prev.imagenes, ...nuevasUrls] }));
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const quitarImagen = (url: string) => {
    setForm((prev) => ({ ...prev, imagenes: prev.imagenes.filter((u) => u !== url) }));
  };

  const handleGuardar = async () => {
    setError('');
    if (!form.nombre.trim()) return setError('El nombre es obligatorio.');
    const precioNum = parseFloat(form.precio);
    if (isNaN(precioNum) || precioNum < 0) return setError('El precio debe ser un número mayor o igual a 0.');
    const costoNum = form.costo ? parseFloat(form.costo) : null;
    if (costoNum != null && isNaN(costoNum)) return setError('Costo inválido.');
    const stockNum = parseInt(form.stock || '0', 10);
    if (isNaN(stockNum) || stockNum < 0) return setError('Stock inválido.');

    setSaving(true);
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      sku: form.sku.trim() || undefined,
      categoria: form.categoria.trim() || undefined,
      precio: precioNum,
      costo: costoNum,
      stock: stockNum,
      controlStock: form.controlStock,
      imagenes: form.imagenes,
    };

    const res = editando
      ? await actualizarProductoPV(editando, proveedorId, payload)
      : await crearProductoPV(proveedorId, payload);

    setSaving(false);

    if (!res.success) {
      setError(res.error || 'Error al guardar.');
      return;
    }

    if (editando) {
      setProductos((prev) => prev.map((p) => (p.id === editando ? (res.data as Producto) : p)));
    } else {
      setProductos((prev) => [res.data as Producto, ...prev]);
    }
    setModalOpen(false);
  };

  const handleEliminar = async (p: Producto) => {
    if (!confirm(`¿Eliminar "${p.nombre}"? Si ya tiene ventas asociadas, se desactivará en lugar de borrarse.`)) return;
    setEliminando(p.id);
    const res = await eliminarProductoPV(p.id, proveedorId);
    setEliminando(null);
    if (!res.success) {
      alert(res.error || 'Error al eliminar.');
      return;
    }
    if ((res as any).softDelete) {
      setProductos((prev) => prev.map((x) => (x.id === p.id ? { ...x, activo: false } : x)));
    } else {
      setProductos((prev) => prev.filter((x) => x.id !== p.id));
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o categoría..."
            className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[var(--color-primario-claro)] transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primario-claro)]"
        >
          <option value="TODAS">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2 text-xs font-bold text-[var(--color-texto-suave)] cursor-pointer">
          <input
            type="checkbox"
            className="rounded accent-[#d4af37]"
            checked={mostrarInactivos}
            onChange={(e) => setMostrarInactivos(e.target.checked)}
          />
          Ver inactivos
        </label>
        <button
          onClick={abrirNuevo}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#d4af37]/20"
        >
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {/* Grid de productos */}
      {filtrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-14 text-center">
          <Package size={28} className="mx-auto text-[var(--color-texto-muted)] mb-3" />
          <p className="text-sm font-bold text-[var(--color-texto)]">
            {productos.length === 0 ? 'Aún no tienes productos.' : 'No hay resultados.'}
          </p>
          <p className="text-xs text-[var(--color-texto-suave)] mt-1">
            {productos.length === 0 ? 'Crea tu primer producto para empezar a vender.' : 'Ajusta los filtros o la búsqueda.'}
          </p>
          {productos.length === 0 && (
            <button onClick={abrirNuevo} className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-black uppercase tracking-widest">
              <Plus size={14} /> Crear primer producto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtrados.map((p) => (
            <ProductoCard
              key={p.id}
              producto={p}
              eliminando={eliminando === p.id}
              onEditar={() => abrirEditar(p)}
              onEliminar={() => handleEliminar(p)}
            />
          ))}
        </div>
      )}

      {/* Modal crear / editar */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={cerrarModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header del modal */}
            <div className="sticky top-0 bg-[var(--color-fondo-card)] border-b border-[var(--color-borde-suave)] px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-black">{editando ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={cerrarModal} className="p-2 rounded-lg hover:bg-[var(--color-fondo-hover)]" disabled={saving || uploading}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-3 flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              {/* Imágenes */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-2">
                  Fotos del producto
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {form.imagenes.map((url) => (
                    <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--color-borde-suave)] group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => quitarImagen(url)}
                        type="button"
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Quitar foto"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label
                    className={cn(
                      'aspect-square rounded-xl border-2 border-dashed border-[var(--color-borde-suave)] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all',
                      uploading && 'opacity-50 cursor-wait'
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleUpload(e.target.files)}
                      disabled={uploading}
                    />
                    {uploading ? <Loader2 size={18} className="animate-spin text-[var(--color-texto-muted)]" /> : <Upload size={18} className="text-[var(--color-texto-muted)]" />}
                    <span className="text-[10px] font-bold text-[var(--color-texto-suave)]">{uploading ? 'Subiendo...' : 'Agregar'}</span>
                  </label>
                </div>
                <p className="text-[10px] text-[var(--color-texto-muted)] mt-2">JPG / PNG / WebP · max 10MB cada una.</p>
              </div>

              {/* Nombre */}
              <Field label="Nombre del producto *">
                <input
                  type="text"
                  className="input w-full"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej. Pastel de chocolate 1 kg"
                />
              </Field>

              {/* Descripción */}
              <Field label="Descripción">
                <textarea
                  className="input w-full min-h-[80px]"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Detalles, ingredientes, presentación..."
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Precio de venta *">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)] text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input w-full pl-7"
                      value={form.precio}
                      onChange={(e) => setForm({ ...form, precio: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </Field>
                <Field label="Costo (opcional)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)] text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input w-full pl-7"
                      value={form.costo}
                      onChange={(e) => setForm({ ...form, costo: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="SKU / Código">
                  <input
                    type="text"
                    className="input w-full uppercase"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                    placeholder="Ej. PC-1KG-CHOC"
                  />
                </Field>
                <Field label="Categoría">
                  <input
                    type="text"
                    className="input w-full"
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    placeholder="Ej. Pasteles"
                    list="categorias-existentes"
                  />
                  <datalist id="categorias-existentes">
                    {categorias.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </Field>
              </div>

              {/* Stock + control */}
              <div className="rounded-2xl border border-[var(--color-borde-suave)] p-4 space-y-3 bg-[var(--color-fondo)]/50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded accent-[#d4af37]"
                    checked={form.controlStock}
                    onChange={(e) => setForm({ ...form, controlStock: e.target.checked })}
                  />
                  <div>
                    <p className="text-sm font-bold">Controlar stock</p>
                    <p className="text-[11px] text-[var(--color-texto-muted)]">Si lo desactivas, vendes ilimitadamente sin descontar inventario.</p>
                  </div>
                </label>
                {form.controlStock && (
                  <Field label="Stock actual">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="input w-full"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                  </Field>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[var(--color-fondo-card)] border-t border-[var(--color-borde-suave)] px-6 py-4 flex items-center justify-end gap-3">
              <button onClick={cerrarModal} className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)]" disabled={saving || uploading}>
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={saving || uploading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editando ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── helpers de UI ──────────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function ProductoCard({
  producto,
  eliminando,
  onEditar,
  onEliminar,
}: {
  producto: Producto;
  eliminando: boolean;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  const imgPrincipal = producto.imagenes?.[0];
  const precio = Number(producto.precio);
  const sinStock = producto.controlStock && producto.stock === 0;

  return (
    <div
      className={cn(
        'rounded-2xl border bg-[var(--color-fondo-card)] overflow-hidden flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-lg',
        producto.activo ? 'border-[var(--color-borde-suave)]' : 'border-[var(--color-borde-suave)] opacity-60'
      )}
    >
      {/* Imagen */}
      <div className="relative aspect-square bg-[var(--color-fondo-input)]">
        {imgPrincipal ? (
          <img src={imgPrincipal} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-texto-muted)]">
            <ImageOff size={32} />
          </div>
        )}
        {!producto.activo && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-black uppercase tracking-widest">
            Inactivo
          </div>
        )}
        {producto.activo && sinStock && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest">
            Sin stock
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-bold text-[var(--color-texto)] leading-tight">{producto.nombre}</p>
          <p className="font-black text-[#d4af37] whitespace-nowrap">{formatearMoneda(precio)}</p>
        </div>
        {producto.categoria && (
          <p className="text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)] mb-2">{producto.categoria}</p>
        )}
        {producto.descripcion && (
          <p className="text-xs text-[var(--color-texto-suave)] line-clamp-2 mb-3">{producto.descripcion}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-[var(--color-borde-suave)]">
          <p className="text-[11px] font-bold text-[var(--color-texto-suave)]">
            {producto.controlStock ? `Stock: ${producto.stock}` : 'Stock libre'}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={onEditar}
              className="p-1.5 rounded-lg text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)] hover:text-[var(--color-texto)]"
              aria-label="Editar"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={onEliminar}
              disabled={eliminando}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 disabled:opacity-50"
              aria-label="Eliminar"
            >
              {eliminando ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
