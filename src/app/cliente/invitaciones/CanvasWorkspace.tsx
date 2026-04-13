'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Type, Image as ImageIcon, Settings, Save, Trash2, BoxSelect, UploadCloud } from 'lucide-react';
import { getAssetsByTipo, CategoriaEvento } from '@/lib/assetsInvitaciones';

// Precargar dinámicamente el componente puro de Konva (evita errores SSR con canvas de HTML5)
const KonvaEditor = dynamic(() => import('@/components/cliente/KonvaEditor'), { ssr: false });

interface ElementProps {
  id: string;
  type: 'image' | 'text' | 'shape';
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  src?: string;
  opacity?: number;
  rotation?: number;
  draggable?: boolean;
}

export default function CanvasWorkspace({ evento, canvasDataInicial, onSave }: { evento: any, canvasDataInicial: any, onSave: (data: any) => void }) {
  const [elements, setElements] = useState<ElementProps[]>(() => {
    try {
      if (canvasDataInicial && typeof canvasDataInicial === 'string') {
        const parsed = JSON.parse(canvasDataInicial);
        return parsed.elements || [];
      } else if (canvasDataInicial?.elements) {
        return canvasDataInicial.elements;
      }
    } catch (e) {}
    
    // Elementos base por defecto
    return [
      { id: 't1', type: 'text', x: 200, y: 100, text: evento?.invitacion?.titulo || 'Mi Evento', fontSize: 32, fill: '#000000', fontFamily: 'Georgia, serif' },
      { id: 't2', type: 'text', x: 200, y: 300, text: evento?.invitacion?.mensaje || 'Acompáñanos en este día tan especial', fontSize: 20, fill: '#333333', fontFamily: 'Arial' },
      { id: 't3', type: 'text', x: 200, y: 500, text: evento?.invitacion?.lugarTexto || 'Lugar por definir', fontSize: 16, fill: '#666666', fontFamily: 'Arial' }
    ];
  });
  
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(() => {
    try {
      if (canvasDataInicial && typeof canvasDataInicial === 'string') {
        return JSON.parse(canvasDataInicial).backgroundUrl || null;
      } else if (canvasDataInicial?.backgroundUrl) {
        return canvasDataInicial.backgroundUrl;
      }
    } catch (e) {}
    return null;
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>(evento?.tipo || 'FIESTA_GENERAL');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const assets = getAssetsByTipo(categoriaSeleccionada);

  // Focus and keyboard delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedId && (e.key === 'Delete' || e.key === 'Backspace')) {
        // Prevent default if in input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements]);

  const addText = () => {
    setElements([...elements, { 
      id: Date.now().toString(), 
      type: 'text', 
      x: 100, y: 100, 
      text: 'Doble clic para editar', 
      fontSize: 24, 
      fill: '#000000',
      fontFamily: 'Arial'
    }]);
  };

  const addImage = (url: string) => {
    setElements([...elements, {
      id: Date.now().toString(),
      type: 'image',
      x: 100, y: 100,
      width: 200, height: 200, // starting size, will respect ratio inside KonvaEditor
      src: url
    }]);
  };

  const deleteSelected = () => {
    if (selectedId) {
      setElements(prev => prev.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveWorkspace = () => {
    const payload = {
      elements,
      backgroundUrl
    };
    onSave(JSON.stringify(payload));
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div className="flex h-[800px] bg-zinc-800 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Sidebar Tool Panel */}
      <div className="w-80 bg-zinc-950 border-r border-white/5 flex flex-col z-10 shadow-xl">
        <div className="p-4 border-b border-white/5 bg-black/20">
          <h2 className="text-white font-bold text-sm tracking-wide mb-3 flex items-center gap-2"><ImageIcon size={18} className="text-[var(--color-primario)]"/> Galería de Diseño</h2>
          <select 
            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg p-2 focus:border-[var(--color-primario)] outline-none"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="BODA">🤵 Boda</option>
            <option value="XV_ANOS">👑 XV Años</option>
            <option value="BAUTIZO">🕊️ Bautizo</option>
            <option value="FIESTA_INFANTIL">🎈 Fiesta Infantil</option>
            <option value="FIESTA_GENERAL">🎉 Fiesta General</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          
          <div className="space-y-3">
             <h3 className="font-bold flex items-center gap-2 text-xs text-white/60 uppercase tracking-widest"><ImageIcon size={14} /> Plantillas Base</h3>
             <div className="grid grid-cols-2 gap-3">
               {assets.backgrounds.map((bg) => (
                 <button 
                   key={bg.id} 
                   onClick={() => setBackgroundUrl(bg.url)}
                   className={`aspect-[9/16] rounded-xl overflow-hidden border-2 hover:border-[var(--color-primario)] focus:border-[var(--color-primario)] transition-all ${backgroundUrl === bg.url ? 'border-[var(--color-primario)] shadow-[0_0_15px_rgba(200,160,80,0.5)]' : 'border-transparent'}`}
                 >
                   <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                 </button>
               ))}
             </div>
             
             <div className="pt-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/png, image/jpeg, image/jpg" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-bold hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <UploadCloud size={18} /> Subir mi propio fondo
                </button>
             </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-3">
             <h3 className="font-bold flex items-center gap-2 text-xs text-white/60 uppercase tracking-widest"><BoxSelect size={14} /> Stickers</h3>
             <div className="grid grid-cols-3 gap-2">
              {assets.stickers.map((st) => (
                <button key={st.id} onClick={() => addImage(st.url)} className="aspect-square bg-white border border-white/10 rounded-xl p-2 hover:scale-105 active:scale-95 transition-all">
                  <img src={st.url} alt={st.name} className="w-full h-full object-contain drop-shadow" />
                </button>
              ))}
             </div>
          </div>

          <div className="pt-4 border-t border-white/5">
             <button onClick={addText} className="w-full py-3 bg-[var(--color-primario)] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all">
              <Type size={16} /> Agregar Texto Libre
            </button>
          </div>

        </div>
        
        {/* Properties Panel for Selected item */}
        {selectedElement && selectedElement.type === 'text' && (
           <div className="bg-black/60 p-4 border-t border-white/10 space-y-4 animate-in slide-in-from-bottom-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-[var(--color-primario)]">Modificar Texto</h4>
                <button onClick={deleteSelected} className="text-rose-400 p-1 hover:bg-rose-500/10 rounded-lg" title="Eliminar"><Trash2 size={16} /></button>
              </div>
              <div>
                <label className="text-[10px] text-white/50 font-bold uppercase mb-1 block">Contenido</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs" 
                  value={selectedElement.text}
                  onChange={(e) => {
                    setElements(elements.map(el => el.id === selectedId ? { ...el, text: e.target.value } : el));
                  }}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/50 font-bold uppercase mb-1 block">Color</label>
                  <input 
                    type="color" 
                    className="w-full h-8 rounded cursor-pointer bg-transparent" 
                    value={selectedElement.fill || '#000000'}
                    onChange={(e) => {
                      setElements(elements.map(el => el.id === selectedId ? { ...el, fill: e.target.value } : el));
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/50 font-bold uppercase mb-1 block">Fuente</label>
                  <select 
                     className="w-full h-8 bg-white/5 border border-white/10 rounded text-xs px-1"
                     value={selectedElement.fontFamily}
                     onChange={(e) => {
                      setElements(elements.map(el => el.id === selectedId ? { ...el, fontFamily: e.target.value } : el));
                     }}
                  >
                    {assets.fonts.map(f => (
                      <option key={f.name} value={f.family}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>
           </div>
        )}
        
        {selectedElement && selectedElement.type === 'image' && (
           <div className="bg-black/60 p-4 border-t border-white/10 space-y-4 animate-in slide-in-from-bottom-5">
             <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-[var(--color-acento)]">Opciones de Objeto</h4>
                <button onClick={deleteSelected} className="btn bg-rose-500/20 text-rose-400 py-1 text-xs gap-1 hover:bg-rose-500/30 font-bold w-full active:scale-95 transition-all justify-center"><Trash2 size={14} /> Eliminar Elemento</button>
              </div>
           </div>
        )}

      </div>

      {/* Editor Content Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden" 
           style={{ background: 'radial-gradient(circle at center, #333 0%, #111 100%)' }}>
        
        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all">
            <KonvaEditor 
              elements={elements} 
              setElements={setElements} 
              selectedId={selectedId} 
              setSelectedId={setSelectedId}
              backgroundUrl={backgroundUrl}
            />
          </div>
        </div>

        {/* Global Controls Overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
            {backgroundUrl && (
              <button 
                onClick={() => setBackgroundUrl(null)} 
                className="bg-black/50 hover:bg-rose-500/80 text-white backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                <Trash2 size={16} /> Limpiar Fondo
              </button>
            )}
            <button 
              onClick={handleSaveWorkspace} 
              className="bg-[var(--color-primario)] text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-[0_0_15px_var(--color-primario)] hover:brightness-110 active:scale-95 transition-all"
            >
              <Save size={16} /> Guardar Cambios
            </button>
        </div>
      </div>
    </div>
  );
}
