'use client';

import { useState } from 'react';
import { X, AlertTriangle, Archive, Trash2, Loader2 } from 'lucide-react';
import { archiveEvento } from '@/lib/actions/eventActions';

interface ArchiveEventModalProps {
  evento: { id: string; nombre: string };
  onClose: () => void;
  onSuccess: () => void;
}

export default function ArchiveEventModal({ evento, onClose, onSuccess }: ArchiveEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [option, setOption] = useState<'archive' | 'delete' | null>(null);

  const handleConfirm = async () => {
    if (!option) return;

    setLoading(true);
    const res = await archiveEvento(evento.id, { 
      borrarDatos: option === 'delete' 
    });

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="card max-w-md w-full p-8 space-y-6 border border-white/10 shadow-2xl relative overflow-hidden group">
        {/* Decoración de fondo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-colors"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-3 text-red-400">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tighter">Gestionar Evento</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors" disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 relative z-10">
          <p className="text-[var(--color-texto-suave)] text-sm leading-relaxed">
            Estás a punto de quitar el evento <span className="text-white font-bold">"{evento.nombre}"</span> de tu tablero principal. 
            El evento se moverá al <span className="text-[var(--color-primario-claro)]">Historial</span> para preservar los registros financieros de tus proveedores.
          </p>

          <div className="space-y-3 pt-2">
            <button 
              onClick={() => setOption('archive')}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left group/btn ${
                option === 'archive' 
                ? 'bg-[var(--color-primario-claro)]/10 border-[var(--color-primario-claro)]' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`p-2 rounded-lg ${option === 'archive' ? 'bg-[var(--color-primario-claro)] text-black' : 'bg-white/5'}`}>
                <Archive size={20} />
              </div>
              <div className="flex-1">
                <p className={`font-bold text-sm ${option === 'archive' ? 'text-[var(--color-primario-claro)]' : 'text-white'}`}>Archivar y Preservar</p>
                <p className="text-[10px] text-white/50 leading-tight mt-1">Mantiene invitados, invitaciones y planos de mesa para consulta futura.</p>
              </div>
            </button>

            <button 
              onClick={() => setOption('delete')}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left group/btn ${
                option === 'delete' 
                ? 'bg-red-500/10 border-red-500' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`p-2 rounded-lg ${option === 'delete' ? 'bg-red-500 text-white' : 'bg-white/5'}`}>
                <Trash2 size={20} />
              </div>
              <div className="flex-1">
                <p className={`font-bold text-sm ${option === 'delete' ? 'text-red-400' : 'text-white'}`}>Borrar por Completo</p>
                <p className="text-[10px] text-white/50 leading-tight mt-1 text-red-500/70 font-semibold">CUIDADO: Elimina permanentemente invitados y diseños. No se puede deshacer.</p>
              </div>
            </button>
          </div>
        </div>

        <div className="flex gap-4 pt-4 relative z-10">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-all" 
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white text-sm font-bold shadow-lg shadow-red-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:scale-100" 
            disabled={!option || loading}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
