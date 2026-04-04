'use client';

import { 
  ArrowLeft, 
  Plus, 
  Users, 
  LayoutGrid, 
  Maximize2, 
  Trash2,
  Save,
  Grid3X3,
  Circle,
  Square,
  Edit2,
  X,
  Sparkles,
  Heart,
  UserPlus
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Invitado {
  id: number;
  nombre: string;
  familia: string;
  bando: 'novio' | 'novia' | 'general';
}

interface Mesa {
  id: number;
  nombre: string;
  capacidad: number;
  tipo: 'circular' | 'cuadrada';
  x: number;
  y: number;
  escala: number;
  invitadosIds: number[];
  bando?: 'novio' | 'novia' | 'mixto' | 'general';
}

export default function SeatingPage() {
  const [mesas, setMesas] = useState<Mesa[]>([
    { id: 1, nombre: 'Mesa Principal', capacidad: 10, tipo: 'circular', x: 450, y: 50, escala: 1.2, invitadosIds: [], bando: 'mixto' },
  ]);

  const [draggedMesa, setDraggedMesa] = useState<number | null>(null);
  const [selectedMesaId, setSelectedMesaId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [invitadosSinMesa, setInvitadosSinMesa] = useState<Invitado[]>([
    { id: 101, nombre: 'Valeria R.', familia: 'Familia Novia', bando: 'novia' },
    { id: 102, nombre: 'Roberto M.', familia: 'Familia Novia', bando: 'novia' },
    { id: 103, nombre: 'Sofía L.', familia: 'Amigos Novio', bando: 'novio' },
    { id: 104, nombre: 'Miguel A.', familia: 'Amigos Novio', bando: 'novio' },
    { id: 105, nombre: 'Lucía G.', familia: 'Familia Novio', bando: 'novio' },
    { id: 106, nombre: 'Andrés Q.', familia: 'Trabajo', bando: 'general' },
    { id: 107, nombre: 'Elena F.', familia: 'Familia Novia', bando: 'novia' },
    { id: 108, nombre: 'Carlos D.', familia: 'Familia Novio', bando: 'novio' },
  ]);

  const [esModoBoda, setEsModoBoda] = useState(true);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [numMesasAuto, setNumMesasAuto] = useState(0);

  const handleMouseDown = (e: React.MouseEvent, id: number, x: number, y: number) => {
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

  const asignarInvitadoAMesa = (invitadoId: number) => {
    if (!selectedMesaId) return;
    
    setMesas(mesas.map(m => {
      if (m.id === selectedMesaId) {
        if (m.invitadosIds.length >= m.capacidad) return m;
        return {
          ...m,
          invitadosIds: [...m.invitadosIds, invitadoId]
        };
      }
      return m;
    }));

    setInvitadosSinMesa(invitadosSinMesa.filter(i => i.id !== invitadoId));
  };

  const agregarMesa = (tipo: 'circular' | 'cuadrada') => {
    const nuevaMesa: Mesa = {
      id: Date.now(),
      nombre: `Mesa ${mesas.length + 1}`,
      capacidad: 10,
      tipo,
      x: 300,
      y: 300,
      escala: 1,
      invitadosIds: [],
      bando: 'general'
    };
    setMesas([...mesas, nuevaMesa]);
  };

  const eliminarMesa = (id: number) => {
    setMesas(mesas.filter(m => m.id !== id));
    if (selectedMesaId === id) setSelectedMesaId(null);
  };

  const actualizarMesa = (id: number, cambios: Partial<Mesa>) => {
    setMesas(mesas.map(m => m.id === id ? { ...m, ...cambios } : m));
  };

  const mesaSeleccionada = mesas.find(m => m.id === selectedMesaId);

  const ejecutarAutoAcomodar = (cantidadExtra: number = 0) => {
    let mesasBase = [...mesas];
    
    let mesasFinales = cantidadExtra;
    if (cantidadExtra === -1) {
       const totalInvitados = invitadosSinMesa.length + mesas.reduce((acc, m) => acc + m.invitadosIds.length, 0);
       mesasFinales = Math.max(0, Math.ceil(totalInvitados / 10) - mesas.length);
    }

    if (mesasFinales > 0) {
      for (let i = 0; i < mesasFinales; i++) {
        mesasBase.push({
          id: Date.now() + i,
          nombre: `Mesa ${mesasBase.length + 1}`,
          capacidad: 10,
          tipo: 'circular',
          x: 0,
          y: 0,
          escala: 1,
          invitadosIds: [],
          bando: 'general'
        });
      }
    }

    const marginX = 80;
    const marginY = 180;
    const itemWidth = 220;
    const itemHeight = 220;
    const cols = 4;

    const mesasProcesadas = mesasBase.map((m, index) => {
      // La mesa principal (id 1) se queda arriba
      if (m.id === 1) return m;

      const adjIndex = index - (mesasBase.findIndex(mb => mb.id === 1) !== -1 ? 0 : -1);
      const row = Math.floor(adjIndex / cols);
      const col = adjIndex % cols;
      
      let finalX = marginX + col * itemWidth;
      let finalY = marginY + row * itemHeight;

      if (finalX > 350 && finalX < 650 && finalY > 300 && finalY < 500) {
        finalY += 250; 
      }

      finalX = Math.min(Math.max(finalX, 50), 900);
      finalY = Math.min(Math.max(finalY, 50), 700);

      return { ...m, x: finalX, y: finalY };
    });

    setMesas(mesasProcesadas);
    setShowAutoModal(false);
  };

  const autoAsignarInvitados = (estrategia: 'bando' | 'mixto') => {
    let nuevasMesas = [...mesas];
    let nuevosInvitados = [...invitadosSinMesa];

    if (estrategia === 'bando') {
       // Separar invitados por bando
       const novia = nuevosInvitados.filter(i => i.bando === 'novia');
       const novio = nuevosInvitados.filter(i => i.bando === 'novio');
       const general = nuevosInvitados.filter(i => i.bando === 'general');

       // Asignar los de la novia a mesas vacías o marcadas como 'novia'
       nuevasMesas = nuevasMesas.map(m => {
          if (m.invitadosIds.length < m.capacidad) {
             const espacioDisp = m.capacidad - m.invitadosIds.length;
             // Si la mesa es 'novia' o está vacía, prioridad novia
             if (m.bando === 'novia' || m.invitadosIds.length === 0) {
                const aSentar = novia.splice(0, espacioDisp);
                return { ...m, invitadosIds: [...m.invitadosIds, ...aSentar.map(i => i.id)], bando: 'novia' };
             }
          }
          return m;
       });

       // Asignar los del novio
       nuevasMesas = nuevasMesas.map(m => {
          if (m.invitadosIds.length < m.capacidad) {
             const espacioDisp = m.capacidad - m.invitadosIds.length;
             if (m.bando === 'novio' || (m.invitadosIds.length === 0 && novia.length === 0)) {
                const aSentar = novio.splice(0, espacioDisp);
                return { ...m, invitadosIds: [...m.invitadosIds, ...aSentar.map(i => i.id)], bando: 'novio' };
             }
          }
          return m;
       });
       
       // El resto (mixto)
       const resto = [...novia, ...novio, ...general];
       nuevasMesas = nuevasMesas.map(m => {
          if (m.invitadosIds.length < m.capacidad) {
             const espacioDisp = m.capacidad - m.invitadosIds.length;
             const aSentar = resto.splice(0, espacioDisp);
             return { ...m, invitadosIds: [...m.invitadosIds, ...aSentar.map(i => i.id)], bando: m.invitadosIds.length > 0 ? 'mixto' : 'general' };
          }
          return m;
       });
       
       setInvitadosSinMesa(resto);
    } else {
       // Estrategia Mixta: Llenar por orden
       nuevasMesas = nuevasMesas.map(m => {
          const espacioDisp = m.capacidad - m.invitadosIds.length;
          const aSentar = nuevosInvitados.splice(0, espacioDisp);
          return { ...m, invitadosIds: [...m.invitadosIds, ...aSentar.map(i => i.id)], bando: 'mixto' };
       });
       setInvitadosSinMesa(nuevosInvitados);
    }

    setMesas(nuevasMesas);
    setShowAutoModal(false);
  };

  return (
    <div className="space-y-8 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div>
           <Link href="/cliente/evento/123" className="flex items-center gap-2 text-sm text-[var(--color-texto-muted)] hover:text-white transition-colors mb-2">
            <ArrowLeft size={16} /> Volver al evento
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tighter uppercase italic">Floor Plan Assistant</h1>
            {esModoBoda && (
              <span className="badge badge-premium flex items-center gap-1.5 py-1 px-3">
                <Heart size={10} fill="currentColor" /> Wedding Intelligence Active
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secundario gap-2">
            <Save size={18} /> Guardar Plano
          </button>
          <button 
            onClick={() => setShowAutoModal(true)}
            className="btn btn-primario gap-2 shadow-lg shadow-violet-500/20"
          >
            <Sparkles size={18} /> Asistente Inteligente
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2 no-scrollbar">
          {/* Properties Panel (PRIORITY) */}
          {mesaSeleccionada ? (
            <div className="card space-y-4 border-[var(--color-primario)] bg-[var(--color-primario)]/5 shrink-0 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[var(--color-primario-claro)] animate-pulse" />
                   <h3 className="font-bold text-[10px] uppercase tracking-widest text-[var(--color-primario-claro)]">Editando Mesa</h3>
                </div>
                <button onClick={() => setSelectedMesaId(null)} className="text-[var(--color-texto-muted)] hover:text-white transition-colors"><X size={14} /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-[var(--color-texto-muted)]">Nombre</label>
                  <input type="text" value={mesaSeleccionada.nombre} onChange={(e) => actualizarMesa(mesaSeleccionada.id, { nombre: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-[var(--color-primario-claro)] outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[var(--color-texto-muted)]">Sillas ({mesaSeleccionada.capacidad})</label>
                      <input type="range" min="2" max="12" step="2" value={mesaSeleccionada.capacidad} onChange={(e) => actualizarMesa(mesaSeleccionada.id, { capacidad: parseInt(e.target.value) })} className="w-full accent-[var(--color-primario-claro)]" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-[var(--color-texto-muted)]">Escala ({Math.round(mesaSeleccionada.escala * 100)}%)</label>
                      <input type="range" min="0.5" max="1.5" step="0.1" value={mesaSeleccionada.escala} onChange={(e) => actualizarMesa(mesaSeleccionada.id, { escala: parseFloat(e.target.value) })} className="w-full accent-blue-400" />
                   </div>
                </div>
                {esModoBoda && (
                  <div className="space-y-1">
                     <label className="text-[9px] font-black uppercase text-[var(--color-texto-muted)]">Bando Predominante</label>
                     <div className="flex gap-2">
                        {['novia', 'novio', 'mixto'].map((b) => (
                           <button 
                             key={b}
                             onClick={() => actualizarMesa(mesaSeleccionada.id, { bando: b as any })}
                             className={cn(
                               "flex-1 py-2 rounded-lg text-[9px] font-bold uppercase border transition-all",
                               mesaSeleccionada.bando === b 
                                 ? b === 'novia' ? "bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300" : b === 'novio' ? "bg-blue-500/20 border-blue-500 text-blue-300" : "bg-violet-500/20 border-violet-500 text-violet-300"
                                 : "bg-white/5 border-white/5 text-[var(--color-texto-muted)] hover:border-white/20"
                             )}
                           >
                             {b}
                           </button>
                        ))}
                     </div>
                  </div>
                )}
                <div className="pt-2">
                   <h4 className="text-[9px] font-black uppercase text-[var(--color-texto-muted)] mb-2">Composición</h4>
                   <div className="flex flex-wrap gap-1.5">
                      {mesaSeleccionada.invitadosIds.map(id => {
                        const inv = [...invitadosSinMesa, ].find(i => i.id === id); // Mock search
                        return (
                          <div key={id} className={cn(
                            "px-2 py-1 rounded-md text-[9px] font-bold flex items-center gap-1",
                            "bg-white/5 border border-white/10"
                          )}>
                             ID: {id}
                          </div>
                        )
                      })}
                      {mesaSeleccionada.invitadosIds.length === 0 && <p className="text-[10px] italic text-[var(--color-texto-muted)]">Mesa vacía</p>}
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card space-y-6">
              <h3 className="font-bold text-sm uppercase tracking-widest text-[var(--color-texto-muted)]">Componentes</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => agregarMesa('circular')} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[var(--color-primario)]/50 transition-all group">
                   <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/20 group-hover:border-[var(--color-primario-claro)] flex items-center justify-center transition-colors"><Circle size={16} /></div>
                   <span className="text-[10px] font-bold uppercase">Circular</span>
                </button>
                <button onClick={() => agregarMesa('cuadrada')} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[var(--color-primario)]/50 transition-all group">
                   <div className="w-10 h-10 rounded-lg border-2 border-dashed border-white/20 group-hover:border-[var(--color-primario-claro)] flex items-center justify-center transition-colors"><Square size={16} /></div>
                   <span className="text-[10px] font-bold uppercase">Imperial</span>
                </button>
              </div>
            </div>
          )}

          {/* Guest List */}
          <div className="card flex-1 flex flex-col min-h-0">
            <h3 className="font-bold text-sm uppercase tracking-widest text-[var(--color-texto-muted)] mb-4">Invitados Disponibles ({invitadosSinMesa.length})</h3>
            <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
               {invitadosSinMesa.map(i => (
                 <button 
                   key={i.id} 
                   disabled={!selectedMesaId}
                   onClick={() => asignarInvitadoAMesa(i.id)}
                   className={cn(
                     "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                     "bg-[var(--color-fondo-input)] border-white/5 hover:border-[var(--color-primario)]/50",
                     "disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
                   )}
                 >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-lg",
                      i.bando === 'novia' ? "bg-fuchsia-500/20 text-fuchsia-400" : i.bando === 'novio' ? "bg-blue-500/20 text-blue-400" : "bg-violet-500/20 text-violet-400"
                    )}>
                       {i.nombre[0]}
                    </div>
                    <div className="flex-1 truncate">
                       <p className="text-xs font-bold leading-none mb-1">{i.nombre}</p>
                       <p className="text-[9px] text-[var(--color-texto-muted)] uppercase tracking-tighter">{i.familia}</p>
                    </div>
                    {selectedMesaId && <UserPlus size={14} className="text-[var(--color-primario-claro)]" />}
                 </button>
               ))}
               {invitadosSinMesa.length === 0 && (
                 <div className="text-center py-10">
                    <Sparkles className="mx-auto text-violet-500/30 mb-2" size={32} />
                    <p className="text-xs text-[var(--color-texto-muted)] italic px-6">Todos los invitados han sido asignados perfectamente.</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Floor Plan Canvas */}
        <div className="flex-1 card p-0 overflow-hidden bg-[var(--color-fondo-input)] relative group">
           <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
           
           <div className="absolute top-6 left-6 flex gap-3">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest shadow-2xl">
                 <Grid3X3 size={11} className="text-violet-400" /> Canvas 1200x800
              </div>
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest shadow-2xl">
                 <Users size={11} className="text-emerald-400" /> {invitadosSinMesa.length} Pendientes
              </div>
           </div>

           {/* Interactive Area */}
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
                    "absolute transition-transform z-10",
                    draggedMesa === m.id ? "z-50 cursor-grabbing scale-[1.05]" : "cursor-grab select-none",
                    selectedMesaId === m.id && "ring-4 ring-[var(--color-primario-claro)] ring-offset-4 ring-offset-[#1a1a1a] rounded-full"
                  )}
                >
                  <div className={cn(
                    "w-36 h-36 flex flex-col items-center justify-center relative group/mesa shadow-2xl transition-all duration-300",
                    "bg-[#1a1a1a] border-2",
                    m.bando === 'novia' ? "border-fuchsia-500/40 shadow-fuchsia-500/10" : m.bando === 'novio' ? "border-blue-500/40 shadow-blue-500/10" : "border-white/10 shadow-black/50",
                    m.tipo === 'circular' ? "rounded-full" : "rounded-3xl",
                    "hover:border-[var(--color-primario-claro)]"
                  )}>
                    {/* Chairs */}
                    {Array.from({length: m.capacidad}).map((_, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "absolute w-3 h-3 rounded-full border shadow-sm",
                          m.invitadosIds[i] ? "bg-[var(--color-primario-claro)] border-white/20" : "bg-white/5 border-white/10"
                        )}
                        style={{
                          left: `${50 + 64 * Math.cos(2 * Math.PI * i / m.capacidad)}%`,
                          top: `${50 + 64 * Math.sin(2 * Math.PI * i / m.capacidad)}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    ))}

                    <span className="text-[11px] font-black uppercase text-white/90 tracking-tighter z-10">{m.nombre}</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-texto-muted)] mt-1">
                      <Users size={10} /> {m.invitadosIds.length} / {m.capacidad}
                    </div>

                    {/* Side Indicator Badge */}
                    {m.bando && m.bando !== 'general' && (
                       <div className={cn(
                         "absolute -bottom-2 px-3 py-1 rounded-full text-[8px] font-black uppercase border shadow-lg",
                         m.bando === 'novia' ? "bg-fuchsia-500 text-white border-fuchsia-400" : m.bando === 'novio' ? "bg-blue-500 text-white border-blue-400" : "bg-violet-600 text-white border-violet-400"
                       )}>
                          {m.bando}
                       </div>
                    )}

                    {/* Actions Overlay */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); eliminarMesa(m.id); }}
                      className="absolute -top-1 -right-1 p-1.5 rounded-full bg-red-550 border border-red-400 text-white opacity-0 group-hover/mesa:opacity-100 transition-all scale-75 hover:scale-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[180px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/5 font-black uppercase tracking-[1em] pointer-events-none">
                 <span className="text-4xl">Dance Floor</span>
                 <span className="text-xs tracking-widest mt-4">Keep this area clear</span>
              </div>
           </div>
        </div>
      </div>

      {/* INTELLIGENT WIZARD MODAL */}
      {showAutoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="card max-w-lg w-full p-10 space-y-8 animate-in zoom-in-95 duration-300 border-[var(--color-primario)]/30 shadow-[0_0_50px_rgba(139,92,246,0.15)]">
             <div className="flex justify-between items-start">
                <div>
                   <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-2 underline decoration-[var(--color-primario-claro)] underline-offset-8">Smart Seating Wizard</h2>
                   <p className="text-xs text-[var(--color-texto-muted)]">Cálculo automatizado basado en tu lista de invitados.</p>
                </div>
                <button onClick={() => setShowAutoModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
             </div>

             <div className="grid grid-cols-1 gap-6">
                {/* Statistics Banner */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-[10px] font-bold text-[var(--color-texto-muted)] uppercase mb-1">Invitados Totales</p>
                      <p className="text-2xl font-black text-white">{invitadosSinMesa.length + mesas.reduce((acc, m) => acc + m.invitadosIds.length, 0)}</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-[10px] font-bold text-[var(--color-texto-muted)] uppercase mb-1">Mesas Sugeridas</p>
                      <p className="text-2xl font-black text-[var(--color-primario-claro)]">{Math.ceil((invitadosSinMesa.length + mesas.reduce((acc, m) => acc + m.invitadosIds.length, 0)) / 10)}</p>
                   </div>
                </div>

                {/* Section: Floor Plan */}
                <div className="space-y-4">
                   <h3 className="text-sm font-black uppercase text-violet-400 flex items-center gap-2 italic">1. Estructura del Plano</h3>
                   <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => ejecutarAutoAcomodar(-1)}
                        className="btn btn-secundario py-4 justify-between px-6 border-white/10 bg-white/[0.03] group hover:border-[var(--color-primario-claro)]/50 transition-all"
                      >
                         <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform"><LayoutGrid size={20} /></div>
                            <div className="text-left">
                               <p className="font-extrabold text-sm uppercase">Cálculo Automático</p>
                               <p className="text-[10px] opacity-60">Crear exactamente las mesas necesarias ({Math.ceil(invitadosSinMesa.length / 10)} más)</p>
                            </div>
                         </div>
                         <ArrowLeft size={18} className="rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                      <button 
                         onClick={() => ejecutarAutoAcomodar(0)}
                         className="btn btn-fantasma py-3 text-[10px] uppercase font-bold border-dashed border border-white/10"
                      >
                         Solo Re-organizar mesas actuales
                      </button>
                   </div>
                </div>

                {/* Section: Assignment */}
                {invitadosSinMesa.length > 0 && (
                   <div className="space-y-4 pt-4 border-t border-white/5">
                      <h3 className="text-sm font-black uppercase text-pink-400 flex items-center gap-2 italic">2. Asignación de Invitados</h3>
                      <div className="grid grid-cols-2 gap-4">
                         <button 
                           onClick={() => autoAsignarInvitados('bando')}
                           className="flex flex-col gap-2 p-5 rounded-2xl bg-fuchsia-500/5 border border-fuchsia-500/20 hover:bg-fuchsia-500/10 transition-all text-left group"
                         >
                            <div className="flex justify-between items-center mb-1">
                               <Users size={20} className="text-fuchsia-400 group-hover:scale-110 transition-transform" />
                               <span className="text-[8px] font-black bg-fuchsia-500 text-white px-2 py-0.5 rounded-full">Recomendado</span>
                            </div>
                            <p className="font-extrabold text-xs uppercase text-fuchsia-200">Por Bando</p>
                            <p className="text-[9px] text-fuchsia-300/60 leading-tight">Agrupa familias de Novio y Novia en mesas separadas.</p>
                         </button>
                         <button 
                           onClick={() => autoAsignarInvitados('mixto')}
                           className="flex flex-col gap-2 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-all text-left group"
                         >
                            <Users size={20} className="text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
                            <p className="font-extrabold text-xs uppercase text-blue-200">Estrategia Mixta</p>
                            <p className="text-[9px] text-blue-300/60 leading-tight">Mezcla invitados para una mayor integración en el evento.</p>
                         </button>
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
