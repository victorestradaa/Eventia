'use client';

import { 
  ArrowLeft, 
  Plus, 
  Users, 
  LayoutGrid, 
  Trash2,
  Save,
  Grid3X3,
  Circle,
  Square,
  X,
  Sparkles,
  Heart,
  UserPlus,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getInvitadosByEvento } from '@/lib/actions/eventActions';

interface Invitado {
  id: string;
  nombre: string;
  lado?: string | null;
  categoria?: string | null;
}

interface Mesa {
  id: string;
  nombre: string;
  capacidad: number;
  tipo: 'circular' | 'cuadrada';
  x: number;
  y: number;
  escala: number;
  invitados: Invitado[];
}

export default function SeatingPage() {
  const params = useParams();
  const eventoId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [invitadosSinMesa, setInvitadosSinMesa] = useState<Invitado[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([
    { id: '1', nombre: 'Mesa Principal', capacidad: 10, tipo: 'circular', x: 450, y: 50, escala: 1.2, invitados: [] },
  ]);

  const [draggedMesa, setDraggedMesa] = useState<string | null>(null);
  const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAutoModal, setShowAutoModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await getInvitadosByEvento(eventoId);
      if (res.success) {
        setInvitadosSinMesa(res.data || []);
      }
      setLoading(false);
    }
    loadData();
  }, [eventoId]);

  const handleMouseDown = (e: React.MouseEvent, id: string, x: number, y: number) => {
    setDraggedMesa(id);
    setDragOffset({
      x: e.clientX - x,
      y: e.clientY - y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedMesa === null) return;
    
    setMesas(mesas.map(m => {
      if (m.id === draggedMesa) {
        return {
          ...m,
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        };
      }
      return m;
    }));
  };

  const handleMouseUp = () => {
    setDraggedMesa(null);
  };

  const asignarInvitadoAMesa = (invitado: Invitado, mesaId: string, seatIndex?: number) => {
    setMesas(mesas.map(m => {
      if (m.id === mesaId) {
        if (m.invitados.length >= m.capacidad && seatIndex === undefined) return m;

        let nuevosInvitados = [...m.invitados];
        if (seatIndex !== undefined) {
          // Si el asiento ya está ocupado, devolvemos el ocupante a la lista
          if (nuevosInvitados[seatIndex]) {
            setInvitadosSinMesa(prev => [...prev, nuevosInvitados[seatIndex]]);
          }
          nuevosInvitados[seatIndex] = invitado;
        } else {
          // Buscar primer hueco libre o añadir al final si no hay huecos
          let assigned = false;
          for (let i = 0; i < m.capacidad; i++) {
            if (!nuevosInvitados[i]) {
              nuevosInvitados[i] = invitado;
              assigned = true;
              break;
            }
          }
          if (!assigned) nuevosInvitados.push(invitado);
        }

        return {
          ...m,
          invitados: nuevosInvitados
        };
      }
      return m;
    }));

    setInvitadosSinMesa(prev => prev.filter(i => i.id !== invitado.id));
  };

  const removerInvitadoDeMesa = (mesaId: string, invitadoId: string) => {
    const mesa = mesas.find(m => m.id === mesaId);
    if (!mesa) return;

    const invitado = mesa.invitados.find(i => i.id === invitadoId);
    if (!invitado) return;

    setMesas(mesas.map(m => {
      if (m.id === mesaId) {
        return {
          ...m,
          invitados: m.invitados.filter(i => i.id !== invitadoId)
        };
      }
      return m;
    }));

    setInvitadosSinMesa([...invitadosSinMesa, invitado]);
  };

  const agregarMesa = (tipo: 'circular' | 'cuadrada') => {
    const nuevaMesa: Mesa = {
      id: Date.now().toString(),
      nombre: `Mesa ${mesas.length + 1}`,
      capacidad: 10,
      tipo,
      x: 300,
      y: 300,
      escala: 1,
      invitados: []
    };
    setMesas([...mesas, nuevaMesa]);
  };

  const eliminarMesa = (id: string) => {
    const mesa = mesas.find(m => m.id === id);
    if (mesa && mesa.invitados.length > 0) {
      setInvitadosSinMesa([...invitadosSinMesa, ...mesa.invitados]);
    }
    setMesas(mesas.filter(m => m.id !== id));
    if (selectedMesaId === id) setSelectedMesaId(null);
  };

  const actualizarMesa = (id: string, cambios: Partial<Mesa>) => {
    setMesas(mesas.map(m => m.id === id ? { ...m, ...cambios } : m));
  };

  const mesaSeleccionada = mesas.find(m => m.id === selectedMesaId);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-[#D4AF37] mx-auto" />
          <p className="text-slate-500 font-medium animate-pulse">Cargando plano y lista de invitados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f1f5f9] text-slate-800">
      {/* Navbar Moderno (Estilo Claro) */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-50">
        <div className="flex items-center gap-6">
          <Link href={`/cliente/evento/${eventoId}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
            <ArrowLeft size={20} className="text-slate-400 group-hover:text-slate-800" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Organizador de Mesas
              <span className="bg-[#F5E6BE] text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#D4AF37]/20">Smart Floor</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-tight">Diseña la distribución perfecta para tu evento</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
            <Save size={18} /> Guardar
          </button>
          <button 
            onClick={() => setShowAutoModal(true)}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#F5E6BE] transition-all active:scale-95"
          >
            <Sparkles size={18} /> Asistente Mágico
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Herramientas (Claro) */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-6 flex-1 overflow-y-auto no-scrollbar space-y-8">
            
            {/* Si no hay mesa seleccionada: Herramientas Generales */}
            {!mesaSeleccionada ? (
              <>
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Agregar Elementos</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => agregarMesa('circular')} className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[#F5E6BE]/10 border-2 border-dashed border-[#D4AF37]/20 hover:border-[#D4AF37] hover:bg-[#F5E6BE]/20 transition-all group">
                      <div className="w-12 h-12 rounded-full border-2 border-[#F5E6BE] group-hover:border-[#D4AF37] group-hover:scale-110 flex items-center justify-center transition-all bg-white shadow-sm text-[#D4AF37]">
                        <Circle size={20} fill="currentColor" fillOpacity={0.1} />
                      </div>
                      <span className="text-[10px] font-black text-[#D4AF37]/60 group-hover:text-[#D4AF37] uppercase">Circular</span>
                    </button>
                    <button onClick={() => agregarMesa('cuadrada')} className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-slate-50/50 border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-100 transition-all group text-slate-500">
                      <div className="w-12 h-12 rounded-lg border-2 border-slate-300 group-hover:border-slate-500 group-hover:scale-110 flex items-center justify-center transition-all bg-white shadow-sm">
                        <Square size={20} fill="currentColor" fillOpacity={0.1} />
                      </div>
                      <span className="text-[10px] font-black group-hover:text-slate-700 uppercase">Imperial</span>
                    </button>
                  </div>
                </section>

                <section className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Invitados Disponibles</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">{invitadosSinMesa.length}</span>
                  </div>
                  <div className="space-y-2 overflow-y-auto pr-1">
                    {invitadosSinMesa.map(i => (
                      <div 
                        key={i.id} 
                        draggable="true"
                        onDragStart={(e) => {
                          e.dataTransfer.setData('invitadoId', i.id);
                        }}
                        className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center gap-3 group hover:border-[#D4AF37] transition-all cursor-grab active:cursor-grabbing hover:shadow-md"
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-offset-1",
                          i.lado === 'NOVIA' ? "bg-pink-100 text-pink-600 ring-pink-50" : i.lado === 'NOVIO' ? "bg-blue-100 text-blue-600 ring-blue-50" : "bg-[#F5E6BE] text-[#D4AF37] ring-[#F5E6BE]/30"
                        )}>
                          {i.nombre[0]}
                        </div>
                        <div className="flex-1 truncate">
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">{i.nombre}</p>
                          <p className="text-[9px] text-slate-400 uppercase font-bold">{i.categoria || 'Invitado'}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Grid3X3 size={14} className="text-slate-300" />
                        </div>
                      </div>
                    ))}
                    {invitadosSinMesa.length === 0 && (
                      <div className="text-center py-12 px-6">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500"><Heart size={24} fill="currentColor" /></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase leading-relaxed">¡Todo en orden! Todos tus invitados están sentados.</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            ) : (
              /* PANEL DE EDICIÓN DE MESA PEQUEÑO/MODERNO */
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Ajustes de {mesaSeleccionada.nombre}</h3>
                  </div>
                  <button onClick={() => setSelectedMesaId(null)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><X size={16} /></button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nombre de la Mesa</label>
                    <input 
                      type="text" 
                      value={mesaSeleccionada.nombre} 
                      onChange={(e) => actualizarMesa(mesaSeleccionada.id, { nombre: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:bg-white focus:border-[#D4AF37] outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asientos ({mesaSeleccionada.capacidad})</label>
                      <input type="range" min="2" max="12" step="2" value={mesaSeleccionada.capacidad} onChange={(e) => actualizarMesa(mesaSeleccionada.id, { capacidad: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none accent-[#D4AF37]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Escala ({Math.round(mesaSeleccionada.escala * 100)}%)</label>
                      <input type="range" min="0.5" max="1.5" step="0.1" value={mesaSeleccionada.escala} onChange={(e) => actualizarMesa(mesaSeleccionada.id, { escala: parseFloat(e.target.value) })} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none accent-[#D4AF37]" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asignar Invitados</h3>
                    <div className="max-h-60 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                      {invitadosSinMesa.map(i => (
                        <button 
                          key={i.id}
                          onClick={() => asignarInvitadoAMesa(i, (mesaSeleccionada as Mesa).id)}
                          className="w-full group flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:border-[#D4AF37] hover:bg-[#F5E6BE]/20 transition-all text-left"
                        >
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">{i.nombre[0]}</div>
                             <span className="text-[11px] font-bold text-slate-700 truncate w-32">{i.nombre}</span>
                          </div>
                          <Plus size={14} className="text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sentados en esta mesa</h3>
                    <div className="flex flex-wrap gap-2">
                      {mesaSeleccionada.invitados.map(i => (
                        <div key={i.id} className="group relative">
                          <div title={i.nombre} className="w-8 h-8 rounded-full bg-white border border-[#D4AF37] shadow-sm flex items-center justify-center font-bold text-[10px] text-[#D4AF37] ring-2 ring-offset-1 ring-[#F5E6BE]">
                            {i.nombre[0]}
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); removerInvitadoDeMesa(mesaSeleccionada.id, i.id); }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {mesaSeleccionada.invitados.length === 0 && <p className="text-[10px] italic text-slate-400">Ningún invitado sentando aún.</p>}
                    </div>
                  </div>

                  <button 
                    onClick={() => eliminarMesa(mesaSeleccionada.id)}
                    className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Eliminar Mesa
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Canvas de Diseño (SKETCH / LIGHT THEME) */}
        <main className="flex-1 relative overflow-hidden bg-[#f1f5f9] select-none">
           {/* Grid de ayuda visual suave */}
           <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#94a3b8 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
           
           {/* Dance Floor Placeholder (Estilo Dorado Sketch) */}
           <div className="absolute top-[350px] left-1/2 -translate-x-1/2 w-[400px] h-[150px] border-4 border-dashed border-[#D4AF37]/40 flex flex-col items-center justify-center text-[#D4AF37]/30 font-black uppercase tracking-[0.5em] pointer-events-none rounded-xl bg-[#F5E6BE]/10 backdrop-blur-[1px]">
              <span className="text-3xl italic">Pista de Baile</span>
           </div>

           <div 
             className="w-full h-full relative"
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
             onClick={() => setSelectedMesaId(null)}
           >
              {mesas.map((m) => (
                <div
                  key={m.id}
                  onMouseDown={(e) => handleMouseDown(e, m.id, m.x, m.y)}
                  onClick={(e) => { e.stopPropagation(); setSelectedMesaId(m.id); }}
                  style={{ left: m.x, top: m.y, transform: `scale(${m.escala})` }}
                  className={cn(
                    "absolute transition-all z-10",
                    draggedMesa === m.id ? "z-50 cursor-grabbing duration-0" : "cursor-grab",
                    selectedMesaId === m.id && "z-40"
                  )}
                >
                   {/* DISEÑO DE MESA REDISEÑADO (TIPO SKETCH / PREMIUM) */}
                   <div className="relative group">
                      {/* Mesa Central */}
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.stopPropagation();
                          const invId = e.dataTransfer.getData('invitadoId');
                          const invitado = invitadosSinMesa.find(i => i.id === invId);
                          if (invitado) asignarInvitadoAMesa(invitado, m.id);
                        }}
                        className={cn(
                        "w-32 h-32 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] border-2 flex flex-col items-center justify-center transition-all",
                        m.tipo === 'circular' ? "rounded-full" : "rounded-2xl",
                        selectedMesaId === m.id ? "border-[#D4AF37] ring-4 ring-[#F5E6BE]/50" : "border-[#F5E6BE] group-hover:border-[#D4AF37]/50"
                      )}>
                         <span className="text-[10px] font-black text-[#D4AF37]/80 uppercase tracking-widest">{m.nombre}</span>
                         <span className="text-[8px] font-bold text-slate-300 mt-1">{m.invitados.length} / {m.capacidad}</span>
                      </div>

                      {/* Chairs (Representadas como Invitados Reales) */}
                      {Array.from({length: m.capacidad}).map((_, index) => {
                        const inv = m.invitados[index];
                        const angle = (index * 360) / m.capacidad;
                        const radius = 74; // Distancia desde el centro
                        const translateX = radius * Math.cos((angle * Math.PI) / 180);
                        const translateY = radius * Math.sin((angle * Math.PI) / 180);

                        return (
                          <div 
                            key={index}
                            className="absolute flex flex-col items-center gap-1.5 transition-all duration-500"
                            style={{ 
                              left: '50%', 
                              top: '50%', 
                              transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px))` 
                            }}
                          >
                             {/* Chair / Avatar */}
                              <div 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.stopPropagation();
                                  const invId = e.dataTransfer.getData('invitadoId');
                                  const invitado = invitadosSinMesa.find(i => i.id === invId);
                                  if (invitado) asignarInvitadoAMesa(invitado, m.id, index);
                                }}
                                className={cn(
                                 "w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center font-bold text-[10px] shadow-sm",
                                 inv 
                                  ? (inv.lado === 'NOVIA' ? "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600" : inv.lado === 'NOVIO' ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-[#F5E6BE] border-[#D4AF37] text-[#D4AF37]")
                                  : "bg-white border-[#F5E6BE] border-dashed text-slate-300 hover:border-[#D4AF37] hover:bg-[#F5E6BE]/10"
                               )}
                              >
                                 {inv ? inv.nombre[0] : ''}
                              </div>
                             
                             {/* Guest Name (Lighter Style) */}
                             {inv && (
                               <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter max-w-[50px] truncate bg-white/80 px-1 rounded backdrop-blur-[1px]">
                                 {inv.nombre.split(' ')[0]}
                               </span>
                             )}
                          </div>
                        );
                      })}
                   </div>
                </div>
              ))}
           </div>
        </main>
      </div>

      {/* MODAL ASISTENTE INTELIGENTE */}
      {showAutoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white max-w-lg w-full p-10 rounded-[32px] shadow-2xl border border-slate-100 space-y-8 animate-in zoom-in-95">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-[#F5E6BE]/30 text-[#D4AF37] rounded-2xl">
                              <Sparkles size={24} />
                           </div>
                           <div>
                              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Wedding Intelligence</h2>
                              <p className="text-xs text-slate-400 font-medium">Automatiza la distribución de tu plano</p>
                           </div>
                        </div>
                        <button onClick={() => setShowAutoModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>
                     </div>

              <div className="grid grid-cols-1 gap-4">
                  <button className="flex items-center justify-between p-6 rounded-2xl border-2 border-slate-100 hover:border-[#D4AF37] hover:bg-[#F5E6BE]/10 transition-all text-left group">
                     <div>
                        <p className="font-black text-slate-900 uppercase text-xs mb-1">Cálculo de Mesas</p>
                        <p className="text-[10px] text-slate-400 font-medium tracking-tight">Crea automáticamente las mesas necesarias para {invitadosSinMesa.length} personas.</p>
                     </div>
                     <LayoutGrid size={24} className="text-slate-300 group-hover:text-[#D4AF37] group-hover:scale-110 transition-all" />
                  </button>
                 
                 <button className="flex items-center justify-between p-6 rounded-2xl border-2 border-slate-100 hover:border-pink-500 hover:bg-pink-50/30 transition-all text-left group">
                    <div>
                       <p className="font-black text-slate-900 uppercase text-xs mb-1">Algoritmo de Bandos</p>
                       <p className="text-[10px] text-slate-400 font-medium tracking-tight text-pink-400/80">Separa automáticamente a familiares de la Novia y el Novio.</p>
                    </div>
                    <Heart size={24} className="text-slate-300 group-hover:text-pink-500 group-hover:scale-110 transition-all" />
                 </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-4">
                 <button onClick={() => setShowAutoModal(false)} className="flex-1 py-4 text-xs font-black uppercase text-slate-400 hover:text-slate-800 transition-colors">Cerrar</button>
                 <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-slate-200">Empezar de cero</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
