'use client';

import { useState } from 'react';
import { crearCupon, eliminarCupon, actualizarCupon } from '@/lib/actions/cuponActions';
import { Ticket, Plus, Trash2, Calendar, Users, Percent, Sparkles, Loader2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Cupon {
  id: string;
  codigo: string;
  mesesGratis: number;
  planObjetivo: string | null;
  maxUsos: number | null;
  usosActuales: number;
  fechaExpira: Date | string | null;
  activo: boolean;
  creadoEn: Date | string;
}

interface CuponAdminClientProps {
  initialCupones: any[];
}

export default function CuponAdminClient({ initialCupones }: CuponAdminClientProps) {
  const [cupones, setCupones] = useState<Cupon[]>(initialCupones);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [newCupon, setNewCupon] = useState({
    codigo: '',
    mesesGratis: 1,
    planObjetivo: '',
    maxUsos: '',
    fechaExpira: '',
    activo: true,
  });

  const resetForm = () => {
    setNewCupon({ codigo: '', mesesGratis: 1, planObjetivo: '', maxUsos: '', fechaExpira: '', activo: true });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editingId) {
      const res = await actualizarCupon(editingId, {
        codigo: newCupon.codigo,
        mesesGratis: Number(newCupon.mesesGratis),
        planObjetivo: newCupon.planObjetivo || null,
        maxUsos: newCupon.maxUsos ? Number(newCupon.maxUsos) : null,
        fechaExpira: newCupon.fechaExpira ? new Date(newCupon.fechaExpira) : null,
        activo: newCupon.activo,
      });
      if (res.success) {
        setCupones(cupones.map(c => c.id === editingId ? (res.data as any) : c));
        setShowForm(false);
        resetForm();
      } else {
        alert(`Error: ${res.error}`);
      }
    } else {
      const res = await crearCupon({
        codigo: newCupon.codigo,
        mesesGratis: Number(newCupon.mesesGratis),
        planObjetivo: newCupon.planObjetivo || undefined,
        maxUsos: newCupon.maxUsos ? Number(newCupon.maxUsos) : undefined,
        fechaExpira: newCupon.fechaExpira ? new Date(newCupon.fechaExpira) : null,
      });
      if (res.success) {
        setCupones([res.data as any, ...cupones]);
        setShowForm(false);
        resetForm();
        alert('Cupón creado con éxito.');
      } else {
        alert(`Error: ${res.error}`);
      }
    }
    setLoading(false);
  };

  const handleEdit = (cupon: Cupon) => {
    setEditingId(cupon.id);
    setNewCupon({
      codigo: cupon.codigo,
      mesesGratis: cupon.mesesGratis,
      planObjetivo: cupon.planObjetivo || '',
      maxUsos: cupon.maxUsos != null ? String(cupon.maxUsos) : '',
      fechaExpira: cupon.fechaExpira ? new Date(cupon.fechaExpira).toISOString().split('T')[0] : '',
      activo: cupon.activo,
    });
    setShowForm(true);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return;

    const res = await eliminarCupon(id);
    if (res.success) {
      setCupones(cupones.filter(c => c.id !== id));
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Gestión de Cupones</h2>
          <p className="text-[var(--color-texto-suave)] text-sm">Crea incentivos de meses gratis para tus proveedores.</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              resetForm();
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
          className="btn btn-primario flex items-center gap-2"
        >
          {showForm ? 'Cancelar' : <><Plus size={18} /> Nuevo Cupón</>}
        </button>
      </div>

      {showForm && (
        <div className="card p-8 border-[var(--color-primario-claro)]/30 bg-[var(--color-primario)]/[0.02] animate-in slide-in-from-top-4 duration-300">
          {editingId && (
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primario-claro)] mb-4">
              Editando cupón
            </p>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Código del Cupón</label>
              <input 
                required
                placeholder="PROMO2026"
                className="input w-full uppercase"
                value={newCupon.codigo}
                onChange={e => setNewCupon({...newCupon, codigo: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Meses de Regalo</label>
              <input 
                type="number" 
                min="1"
                required
                className="input w-full"
                value={newCupon.mesesGratis}
                onChange={e => setNewCupon({...newCupon, mesesGratis: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Plan Aplicable</label>
              <select 
                className="input w-full"
                value={newCupon.planObjetivo}
                onChange={e => setNewCupon({...newCupon, planObjetivo: e.target.value})}
              >
                <option value="">Cualquier Plan (Solo extiende vigencia)</option>
                <option value="GRATIS">Plan Emprendedor</option>
                <option value="INTERMEDIO">Plan Destacado</option>
                <option value="ELITE">Plan Elite</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Límite de Usos (Opcional)</label>
              <input 
                type="number" 
                placeholder="Ilimitado"
                className="input w-full"
                value={newCupon.maxUsos}
                onChange={e => setNewCupon({...newCupon, maxUsos: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Expira (Opcional)</label>
              <input 
                type="date" 
                className="input w-full"
                value={newCupon.fechaExpira}
                onChange={e => setNewCupon({...newCupon, fechaExpira: e.target.value})}
              />
            </div>
            {editingId && (
              <div className="md:col-span-2 lg:col-span-4 flex items-center gap-3 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newCupon.activo}
                    onChange={(e) => setNewCupon({ ...newCupon, activo: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <span className="text-xs font-bold text-[var(--color-texto-suave)]">
                    Cupón activo
                  </span>
                </label>
                <span className="text-[10px] text-[var(--color-texto-muted)]">
                  Desactívalo para que ya no se pueda canjear sin necesidad de eliminarlo.
                </span>
              </div>
            )}
            <div className="md:col-span-2 lg:col-span-4 flex justify-end pt-2 gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)] transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primario px-10 py-3 font-black uppercase tracking-widest text-xs"
              >
                {loading ? <Loader2 className="animate-spin" /> : (editingId ? 'Guardar Cambios' : 'Generar Cupón Oficial')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cupones.map(cupon => (
          <div key={cupon.id} className={cn(
            "card p-6 border-white/5 relative group hover:border-[var(--color-primario-claro)]/30 transition-all",
            !cupon.activo && "opacity-60"
          )}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-primario)]/10 flex items-center justify-center text-[var(--color-primario-claro)]">
                <Ticket size={24} />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(cupon)}
                  aria-label="Editar cupón"
                  title="Editar cupón"
                  className="p-2 text-[var(--color-texto-suave)] hover:text-[var(--color-primario-claro)] hover:bg-[var(--color-primario)]/10 rounded-xl transition-all"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(cupon.id)}
                  aria-label="Eliminar cupón"
                  title="Eliminar cupón"
                  className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h4 className="text-2xl font-black tracking-tight mb-1">{cupon.codigo}</h4>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                {cupon.mesesGratis} MESES GRATIS
              </span>
              {cupon.planObjetivo && (
                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                  {cupon.planObjetivo === 'GRATIS' ? 'EMPRENDEDOR' : cupon.planObjetivo === 'INTERMEDIO' ? 'DESTACADO' : 'ELITE'}
                </span>
              )}
              {!cupon.activo && (
                <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest">
                  Inactivo
                </span>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--color-texto-muted)] flex items-center gap-2"><Users size={14}/> Usos:</span>
                <span className="font-bold">{cupon.usosActuales} / {cupon.maxUsos || '∞'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--color-texto-muted)] flex items-center gap-2"><Calendar size={14}/> Expiración:</span>
                <span className="font-bold">
                  {cupon.fechaExpira ? format(new Date(cupon.fechaExpira), 'dd MMM, yyyy', { locale: es }) : 'Nunca'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
               <p className="text-[9px] text-[var(--color-texto-muted)] uppercase font-bold tracking-widest">
                 Creado el {format(new Date(cupon.creadoEn), 'dd/MM/yyyy')}
               </p>
            </div>
          </div>
        ))}
      </div>

      {cupones.length === 0 && (
        <div className="text-center py-20 bg-white/[0.02] rounded-3xl border-2 border-dashed border-white/5">
          <Ticket size={48} className="mx-auto text-[var(--color-texto-muted)] mb-4 opacity-20" />
          <p className="text-[var(--color-texto-suave)] font-medium">No hay cupones generados aún.</p>
        </div>
      )}
    </div>
  );
}
