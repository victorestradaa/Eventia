'use client';

import { Calendar, Users, Star, ArrowLeft, Archive, CheckCircle2, ChevronRight, RefreshCw, Trash2, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { restoreEvento, deleteEventoPermanently } from '@/lib/actions/eventActions';

interface HistorialClientProps {
  eventos: any[];
}

export default function HistorialClient({ eventos }: HistorialClientProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleRestore = async (id: string) => {
    setLoadingId(id);
    const res = await restoreEvento(id);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error);
    }
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    const res = await deleteEventoPermanently(id);
    if (res.success) {
      router.refresh();
      setConfirmDeleteId(null);
    } else {
      alert(res.error);
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 pb-20 mt-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Link href="/cliente/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-black transition-colors mb-4">
            <ArrowLeft size={14} /> Volver al Dashboard
          </Link>
          <h1 className="text-4xl font-serif text-black drop-shadow-sm">Historial de Eventos</h1>
          <p className="text-stone-500 text-sm">Consulta los detalles de tus eventos pasados o archivados.</p>
        </div>
        
        <div className="bg-stone-100/50 backdrop-blur-sm border border-stone-200/50 p-4 rounded-2xl flex items-center gap-6">
            <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-stone-400">Total Eventos</p>
                <p className="text-xl font-black text-black">{eventos.length}</p>
            </div>
            <div className="w-[1px] h-8 bg-stone-200"></div>
            <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-stone-400">Completados</p>
                <p className="text-xl font-black text-green-600">{eventos.filter(e => e.estado === 'COMPLETADO').length}</p>
            </div>
        </div>
      </div>

      {eventos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <Archive size={32} />
            </div>
            <div>
                <h3 className="text-lg font-bold">No hay eventos en el historial</h3>
                <p className="text-stone-500 max-w-xs mx-auto text-sm">Aquí aparecerán los eventos que hayas finalizado o archivado manualmente.</p>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {eventos.map((evt) => (
            <div key={evt.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#eadeba]/0 via-[#eadeba]/10 to-[#eadeba]/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                
                <div className="relative bg-white border border-stone-200/60 rounded-2xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col md:flex-row gap-6 overflow-hidden">
                    
                    {/* Overlay de Confirmación de Borrado */}
                    {confirmDeleteId === evt.id && (
                      <div className="absolute inset-0 z-20 bg-red-600/95 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in duration-200">
                        <AlertCircle size={32} className="mb-2" />
                        <p className="font-bold mb-1">¿Eliminar permanentemente?</p>
                        <p className="text-[10px] opacity-80 mb-4 max-w-[200px]">Esta acción borrará todos los invitados y configuraciones de este evento. No se puede deshacer.</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[10px] font-bold transition-all"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(evt.id); }}
                            className="px-4 py-1.5 rounded-full bg-white text-red-600 hover:bg-stone-100 text-[10px] font-bold transition-all shadow-lg"
                            disabled={loadingId === evt.id}
                          >
                            {loadingId === evt.id ? <Loader2 size={12} className="animate-spin" /> : 'Confirmar Eliminación'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Badge de Estado */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        {evt.estado === 'COMPLETADO' ? (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-green-100 text-green-700 px-2 py-1 rounded-md border border-green-200">
                                <CheckCircle2 size={10} /> Completado
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-amber-100 text-amber-700 px-2 py-1 rounded-md border border-amber-200">
                                <Archive size={10} /> Archivado
                            </span>
                        )}
                    </div>

                    {/* Info Principal */}
                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-[#b89547] uppercase tracking-widest">{evt.tipo}</p>
                            <h3 className="text-2xl font-serif text-black">{evt.nombre}</h3>
                            <div className="flex items-center gap-4 text-stone-500 text-xs">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Calendar size={14} className="text-stone-400" />
                                    {evt.fecha ? new Date(evt.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sin fecha'}
                                </span>
                                {evt.numInvitados && (
                                    <span className="flex items-center gap-1.5 font-medium border-l border-stone-200 pl-4">
                                        <Users size={14} className="text-stone-400" />
                                        {evt.numInvitados} Invitados
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Proveedores */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Servicios Contratados</p>
                            <div className="flex flex-wrap gap-2">
                                {evt.reservas?.length > 0 ? (
                                    evt.reservas.map((res: any) => (
                                        <div key={res.id} className="flex items-center gap-2 bg-stone-100/50 border border-stone-200/50 px-3 py-1.5 rounded-full">
                                            <div className="w-2 h-2 rounded-full bg-[#d4af37]"></div>
                                            <span className="text-xs font-bold text-stone-800">{res.proveedor?.nombre}</span>
                                            <span className="text-[10px] text-stone-400 italic">({res.servicio?.nombre})</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[11px] text-stone-400 italic">No se registraron servicios contratados.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-row md:flex-col items-center justify-center gap-3 md:border-l md:border-stone-100 md:pl-6 min-w-[120px]">
                         <button 
                           onClick={() => handleRestore(evt.id)}
                           disabled={loadingId === evt.id}
                           className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-[10px] font-black uppercase tracking-tight hover:bg-[#d4af37] hover:text-black transition-all disabled:opacity-50"
                         >
                            {loadingId === evt.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            Reactivar
                         </button>
                         <button 
                           onClick={() => setConfirmDeleteId(evt.id)}
                           disabled={loadingId === evt.id}
                           className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-tight hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50"
                         >
                            <Trash2 size={12} />
                            Eliminar
                         </button>
                         <Link href={`/cliente/evento/${evt.id}`} className="hidden md:flex items-center gap-1 text-[9px] font-bold text-stone-400 hover:text-black transition-colors uppercase mt-1">
                            Ver Detalles <ChevronRight size={10} />
                         </Link>
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
