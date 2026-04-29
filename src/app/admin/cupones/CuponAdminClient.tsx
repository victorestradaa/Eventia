'use client';

import { useState } from 'react';
import { crearCupon, eliminarCupon } from '@/lib/actions/cuponActions';
import { Ticket, Plus, Trash2, Calendar, Users, Percent, Sparkles, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Cupon {
  id: string;
  codigo: string;
  mesesGratis: number;
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

  // Form state
  const [newCupon, setNewCupon] = useState({
    codigo: '',
    mesesGratis: 1,
    maxUsos: '',
    fechaExpira: ''
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await crearCupon({
      codigo: newCupon.codigo,
      mesesGratis: Number(newCupon.mesesGratis),
      maxUsos: newCupon.maxUsos ? Number(newCupon.maxUsos) : undefined,
      fechaExpira: newCupon.fechaExpira ? new Date(newCupon.fechaExpira) : null
    });

    if (res.success) {
      setCupones([res.data as any, ...cupones]);
      setShowForm(false);
      setNewCupon({ codigo: '', mesesGratis: 1, maxUsos: '', fechaExpira: '' });
      alert('Cupón creado con éxito.');
    } else {
      alert(`Error: ${res.error}`);
    }
    setLoading(null as any);
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
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primario flex items-center gap-2"
        >
          {showForm ? 'Cancelar' : <><Plus size={18} /> Nuevo Cupón</>}
        </button>
      </div>

      {showForm && (
        <div className="card p-8 border-[var(--color-primario-claro)]/30 bg-[var(--color-primario)]/[0.02] animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="md:col-span-2 lg:col-span-4 flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primario px-10 py-3 font-black uppercase tracking-widest text-xs"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Generar Cupón Oficial'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cupones.map(cupon => (
          <div key={cupon.id} className="card p-6 border-white/5 relative group hover:border-[var(--color-primario-claro)]/30 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-primario)]/10 flex items-center justify-center text-[var(--color-primario-claro)]">
                <Ticket size={24} />
              </div>
              <button 
                onClick={() => handleDelete(cupon.id)}
                className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <h4 className="text-2xl font-black tracking-tight mb-1">{cupon.codigo}</h4>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                {cupon.mesesGratis} MESES GRATIS
              </span>
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
