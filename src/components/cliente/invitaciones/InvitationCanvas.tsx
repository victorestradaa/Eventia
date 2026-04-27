'use client';

import { Rnd } from 'react-rnd';
import { Calendar as CalendarIcon, MapPin, Image as ImageIcon, Map, Navigation, Compass } from 'lucide-react';
import { cn, formatearFechaCorta } from '@/lib/utils';

interface InvitationCanvasProps {
  estilos: any;
  texto: any;
  fondoUrlActivo?: string;
  isEditing?: boolean;
  onEstiloChange?: (id: string, newEstilo: any) => void;
  onTextoChange?: (id: string, newTexto: string) => void;
  evento?: any;
  archivoAdjuntoPropio?: string | null;
  modoPropia?: boolean;
  onRSVPClick?: () => void;
  config?: any;
  fuentes?: any[];
}
 import { useState, useEffect, forwardRef } from 'react';
 import { Gift, CreditCard, Copy, Check } from 'lucide-react';
 
 const InvitationCanvas = forwardRef<HTMLDivElement, InvitationCanvasProps>(({ 
   estilos, 
   texto, 
   fondoUrlActivo, 
   isEditing = false,
   onEstiloChange,
   onTextoChange,
   evento,
   archivoAdjuntoPropio,
   modoPropia = false,
   onRSVPClick,
   config = {},
   fuentes = []
 }, ref) => {
   const [copiado, setCopiado] = useState(false);
   const [selectedId, setSelectedId] = useState<string | null>(null);
   const [editingTextId, setEditingTextId] = useState<string | null>(null);

   // Deseleccionar al hacer click fuera
   useEffect(() => {
     const handleClickOutside = (e: MouseEvent | TouchEvent) => {
       const target = e.target as HTMLElement;
       // Si el click es dentro de un elemento arrastrable o la barra de herramientas, ignorar
       if (target.closest('.nodrag') || target.closest('.rnd-element')) {
         return;
       }
       setSelectedId(null);
       setEditingTextId(null);
     };
     document.addEventListener('mousedown', handleClickOutside);
     document.addEventListener('touchstart', handleClickOutside);
     return () => {
       document.removeEventListener('mousedown', handleClickOutside);
       document.removeEventListener('touchstart', handleClickOutside);
     };
   }, []);
 
  const handleCopiar = (texto: string) => {
    if (isEditing) return;
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const renderElement = (id: string, content: React.ReactNode, defaultStyles: any) => {
    // Si estilos es undefined por algún motivo de serialización fallida, usamos defaults
    const estilo = estilos?.[id] || defaultStyles;
    
    if (estilo?.visible === false) return null;

    if (isEditing) {
      const isSelected = selectedId === id;
      return (
        <Rnd 
          cancel=".nodrag"
          position={{ x: estilo?.x || 20, y: estilo?.y || 100 }} 
          size={{ width: estilo?.width || 300, height: estilo?.height || 40 }} 
          onDragStart={() => setSelectedId(id)}
          onDragStop={(e, d) => {
            setSelectedId(id);
            onEstiloChange?.(id, { ...estilo, x: d.x, y: d.y });
          }} 
          onResizeStop={(e, dir, ref, delta, pos) => onEstiloChange?.(id, { 
            ...estilo, 
            width: parseInt(ref.style.width), 
            height: parseInt(ref.style.height), 
            ...pos 
          })} 
          style={{ position: 'absolute', zIndex: isSelected ? 50 : 1 }}
          className={cn(
            "rnd-element group border transition-colors flex items-center justify-center cursor-move",
            isSelected ? "border-[var(--color-acento)]/80 border-dashed bg-[var(--color-acento)]/5" : "border-transparent hover:border-white/50 border-dashed"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedId(id);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditingTextId(id);
          }}
        >
          {isSelected && onEstiloChange && (
            <div 
              className="nodrag absolute -top-16 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 bg-[#1a1a1a]/95 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {onTextoChange && (
                <>
                  <button 
                    type="button"
                    onClick={() => setEditingTextId(editingTextId === id ? null : id)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-xl transition-colors shrink-0",
                      editingTextId === id ? "bg-[var(--color-acento)] text-white" : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                    )}
                    title="Editar texto"
                  >
                    {editingTextId === id ? <Check size={14} /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>}
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />
                </>
              )}
              
              {/* Color Picker Wrapper */}
              <div className="relative group/color w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 shadow-inner flex-shrink-0">
                <input 
                  type="color" 
                  value={estilo.color || '#ffffff'}
                  onChange={(e) => onEstiloChange(id, {...estilo, color: e.target.value})}
                  className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0 bg-transparent"
                  title="Color del texto"
                />
              </div>
              
              <div className="w-px h-6 bg-white/10 mx-1" />
              
              {/* Font Selector */}
              <div className="relative flex-shrink-0">
                <select
                  value={estilo.fuente || ''}
                  onChange={(e) => onEstiloChange(id, {...estilo, fuente: e.target.value})}
                  className="appearance-none bg-white/10 hover:bg-white/20 transition-colors border border-white/10 rounded-xl pl-3 pr-7 py-1.5 outline-none text-white text-xs font-bold cursor-pointer w-28 truncate"
                  style={{ fontFamily: estilo.fuente || 'inherit' }}
                  title="Tipo de letra"
                >
                  <option value="">Fuente</option>
                  {fuentes.map(f => (
                    <option key={f.id} value={f.nombre} style={{ fontFamily: f.nombre, color: 'black' }}>
                      {f.nombre}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                   <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                </div>
              </div>

              <div className="w-px h-6 bg-white/10 mx-1" />
              
              {/* Size Controls */}
              <div className="flex items-center gap-1 bg-white/5 rounded-xl border border-white/10 p-0.5">
                <button 
                  type="button"
                  onClick={() => onEstiloChange(id, {...estilo, fontSize: Math.max(8, (estilo.fontSize || 16) - 2)})}
                  className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                  title="Disminuir tamaño"
                >
                  -
                </button>
                <span className="text-[11px] text-white font-mono w-6 text-center">{estilo.fontSize || 16}</span>
                <button 
                  type="button"
                  onClick={() => onEstiloChange(id, {...estilo, fontSize: (estilo.fontSize || 16) + 2})}
                  className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                  title="Aumentar tamaño"
                >
                  +
                </button>
              </div>
            </div>
          )}
          {content}
        </Rnd>
      );
    }

    return (
      <div 
        style={{ 
          position: 'absolute', 
          left: estilo?.x || 0, 
          top: estilo?.y || 0, 
          width: estilo?.width || '100%', 
          height: estilo?.height || 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {content}
      </div>
    );
  };

  if (modoPropia && archivoAdjuntoPropio) {
    return (
      <div ref={ref} className="w-[400px] h-[700px] max-w-full rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-zinc-900 relative transition-all duration-500 bg-black flex items-center justify-center group">
         <img src={archivoAdjuntoPropio} alt="Invitación Cargada" className="w-full h-full object-contain" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
            <button 
              onClick={onRSVPClick}
              className="w-full py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-lg bg-[var(--color-acento)] text-white"
            >
              Confirmar Asistencia
            </button>
         </div>
      </div>
    );
  }

  if (modoPropia && !archivoAdjuntoPropio) {
    return (
       <div className="w-[400px] h-[700px] max-w-full rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-zinc-900 relative transition-all duration-500 bg-zinc-950 flex flex-col items-center justify-center text-center p-10 border-dashed">
        <ImageIcon size={48} className="text-white/20 mb-4" />
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Vista Previa</p>
        <p className="text-white/20 text-sm mt-2">Sube un archivo para previsualizar tu invitación aquí.</p>
      </div>
    );
  }
 
   return (
     <div 
       ref={ref}
       id="invitation-canvas-root"
       className="w-[400px] h-[700px] max-w-full rounded-[40px] shadow-2xl border-[8px] border-zinc-900 relative transition-all duration-500"
       style={{
         backgroundColor: fondoUrlActivo ? 'transparent' : '#1a1a1a',
       }}
     >
       {/* Capa de Fondo (Aplica Encudre Manual). Envuelto en div con overflow-hidden para mantener bordes redondeados */}
       <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none z-0">
       {fondoUrlActivo && (
         <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div 
               className="absolute inset-0 w-full h-full"
               style={{ 
                 backgroundImage: `url(${fondoUrlActivo})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 transform: `
                   scale(${(config.coverZoom || 1) * 1.15}) 
                   translate(${(50 - (config.coverAlignX || 50))}%, ${(50 - (config.coverAlignY || 50))}%)
                 `,
                 transition: 'transform 0.5s cubic-bezier(0.2, 0, 0.2, 1)'
               }}
            />
             </div>
       )}
       </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Usamos un wrapper para asegurar que los elementos absolutos se ven. Sin overflow-hidden para que los menús floten */}
        <div className="relative w-full h-full pointer-events-auto">
          {renderElement('titulo', 
            editingTextId === 'titulo' ? (
              <textarea 
                value={texto.titulo}
                onChange={(e) => onTextoChange?.('titulo', e.target.value)}
                className="tracking-[0.3em] font-black opacity-100 w-full text-center whitespace-pre-wrap bg-transparent border-none outline-none resize-none p-0 m-0 pointer-events-auto"
                style={{ fontSize: `${estilos?.titulo?.fontSize || 10}px`, color: estilos?.titulo?.color, fontFamily: estilos?.titulo?.fuente ? `'${estilos.titulo.fuente}'` : 'inherit' }}
                autoFocus
                onFocus={(e) => e.target.select()}
                onBlur={() => setEditingTextId(null)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingTextId(null); } }}
              />
            ) : (
              <p className="tracking-[0.3em] font-black opacity-80 w-full text-center whitespace-pre-wrap select-none" style={{ fontSize: `${estilos?.titulo?.fontSize || 10}px`, color: estilos?.titulo?.color, fontFamily: estilos?.titulo?.fuente ? `'${estilos.titulo.fuente}'` : 'inherit' }}>{texto.titulo}</p>
            )
          , {})}

          {renderElement('nombres', 
            editingTextId === 'nombres' ? (
              <textarea 
                value={texto.nombres}
                onChange={(e) => onTextoChange?.('nombres', e.target.value)}
                className="italic w-full text-center whitespace-pre-wrap bg-transparent border-none outline-none resize-none p-0 m-0 pointer-events-auto"
                style={{ fontSize: `${estilos?.nombres?.fontSize || 36}px`, color: estilos?.nombres?.color, fontFamily: estilos?.nombres?.fuente ? `'${estilos.nombres.fuente}'` : 'serif' }}
                autoFocus
                onFocus={(e) => e.target.select()}
                onBlur={() => setEditingTextId(null)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingTextId(null); } }}
              />
            ) : (
              <h2 className="italic w-full text-center whitespace-pre-wrap select-none" style={{ fontSize: `${estilos?.nombres?.fontSize || 36}px`, color: estilos?.nombres?.color, fontFamily: estilos?.nombres?.fuente ? `'${estilos.nombres.fuente}'` : 'serif' }}>{texto.nombres}</h2>
            )
          , {})}

          {renderElement('mensaje', 
            editingTextId === 'mensaje' ? (
              <textarea 
                value={texto.mensaje}
                onChange={(e) => onTextoChange?.('mensaje', e.target.value)}
                className="leading-relaxed opacity-100 italic w-full text-center whitespace-pre-wrap bg-transparent border-none outline-none resize-none p-0 m-0 pointer-events-auto"
                style={{ fontSize: `${estilos?.mensaje?.fontSize || 14}px`, color: estilos?.mensaje?.color, fontFamily: estilos?.mensaje?.fuente ? `'${estilos.mensaje.fuente}'` : 'inherit' }}
                autoFocus
                onFocus={(e) => e.target.select()}
                onBlur={() => setEditingTextId(null)}
              />
            ) : (
              <p className="leading-relaxed opacity-90 italic w-full text-center whitespace-pre-wrap select-none" style={{ fontSize: `${estilos?.mensaje?.fontSize || 14}px`, color: estilos?.mensaje?.color, fontFamily: estilos?.mensaje?.fuente ? `'${estilos.mensaje.fuente}'` : 'inherit' }}>"{texto.mensaje}"</p>
            )
          , {})}

          {renderElement('lugar', 
            editingTextId === 'lugar' ? (
              <div className="flex flex-col items-center justify-center font-bold tracking-widest w-full text-center pointer-events-auto" style={{ fontSize: `${estilos?.lugar?.fontSize || 12}px`, color: estilos?.lugar?.color, fontFamily: estilos?.lugar?.fuente ? `'${estilos.lugar.fuente}'` : 'inherit' }}>
                 <div className="flex items-center justify-center gap-2">
                   <CalendarIcon size={estilos?.lugar?.fontSize}/> 
                   <input type="date" value={texto.fechaEvento || ''} onChange={(e) => onTextoChange?.('fechaEvento', e.target.value)} className="bg-white/10 text-white rounded px-2 py-1 outline-none border border-white/20 text-xs" onBlur={(e) => { if(!e.currentTarget.parentElement?.parentElement?.contains(e.relatedTarget as Node)) setEditingTextId(null); }} />
                 </div>
                 <div className="flex items-center justify-center gap-2 mt-2 w-full px-2">
                   <input type="text" value={texto.lugar} onChange={(e) => onTextoChange?.('lugar', e.target.value)} className="bg-white/10 text-white rounded px-2 py-1 outline-none border border-white/20 text-center w-full text-xs" placeholder="Nombre del lugar" autoFocus onBlur={(e) => { if(!e.currentTarget.parentElement?.parentElement?.contains(e.relatedTarget as Node)) setEditingTextId(null); }} />
                 </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center font-bold tracking-widest w-full text-center select-none" style={{ fontSize: `${estilos?.lugar?.fontSize || 12}px`, color: estilos?.lugar?.color, fontFamily: estilos?.lugar?.fuente ? `'${estilos.lugar.fuente}'` : 'inherit' }}>
                 <div className="flex items-center justify-center gap-2"><CalendarIcon size={estilos?.lugar?.fontSize}/> {texto.fechaEvento ? formatearFechaCorta(texto.fechaEvento) : (evento?.fecha ? formatearFechaCorta(evento.fecha) : 'Próximamente')}</div>
                  <div className="flex items-center justify-center gap-2">
                    {texto.lugar}
                  </div>
                </div>
            )
          , {})}

          {renderElement('horaCeremonia', 
            editingTextId === 'horaCeremonia' ? (
              <div className="flex flex-col items-center justify-center w-full text-center pointer-events-auto" style={{ fontSize: `${estilos?.horaCeremonia?.fontSize || 16}px`, color: estilos?.horaCeremonia?.color || estilos?.lugar?.color, fontFamily: estilos?.horaCeremonia?.fuente ? `'${estilos.horaCeremonia.fuente}'` : 'inherit' }}>
                 <p className="font-black uppercase tracking-[0.2em] opacity-40 m-0" style={{ fontSize: '0.6em' }}>Ceremonia Religiosa</p>
                 <input type="text" value={texto.horaCeremonia || ''} onChange={(e) => onTextoChange?.('horaCeremonia', e.target.value)} className="font-bold m-0 mt-1 bg-white/10 border border-white/20 rounded px-2 outline-none text-center" autoFocus onBlur={() => setEditingTextId(null)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setEditingTextId(null); } }} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full text-center select-none" style={{ fontSize: `${estilos?.horaCeremonia?.fontSize || 16}px`, color: estilos?.horaCeremonia?.color || estilos?.lugar?.color, fontFamily: estilos?.horaCeremonia?.fuente ? `'${estilos.horaCeremonia.fuente}'` : 'inherit' }}>
                 <p className="font-black uppercase tracking-[0.2em] opacity-40 m-0" style={{ fontSize: '0.6em' }}>Ceremonia Religiosa</p>
                 <p className="font-bold m-0 mt-1">{texto.horaCeremonia || '04:00 PM'}</p>
              </div>
            )
          , {})}

          {renderElement('horaCelebracion', 
            editingTextId === 'horaCelebracion' ? (
              <div className="flex flex-col items-center justify-center w-full text-center pointer-events-auto" style={{ fontSize: `${estilos?.horaCelebracion?.fontSize || 16}px`, color: estilos?.horaCelebracion?.color || estilos?.lugar?.color, fontFamily: estilos?.horaCelebracion?.fuente ? `'${estilos.horaCelebracion.fuente}'` : 'inherit' }}>
                 <p className="font-black uppercase tracking-[0.2em] opacity-40 m-0" style={{ fontSize: '0.6em' }}>Celebración</p>
                 <input type="text" value={texto.horaCelebracion || ''} onChange={(e) => onTextoChange?.('horaCelebracion', e.target.value)} className="font-bold m-0 mt-1 bg-white/10 border border-white/20 rounded px-2 outline-none text-center" autoFocus onBlur={() => setEditingTextId(null)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setEditingTextId(null); } }} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full text-center select-none" style={{ fontSize: `${estilos?.horaCelebracion?.fontSize || 16}px`, color: estilos?.horaCelebracion?.color || estilos?.lugar?.color, fontFamily: estilos?.horaCelebracion?.fuente ? `'${estilos.horaCelebracion.fuente}'` : 'inherit' }}>
                 <p className="font-black uppercase tracking-[0.2em] opacity-40 m-0" style={{ fontSize: '0.6em' }}>Celebración</p>
                 <p className="font-bold m-0 mt-1">{texto.horaCelebracion || '06:00 PM'}</p>
              </div>
            )
          , {})}

          {renderElement('mapPin', 
             editingTextId === 'mapPin' ? (
               <div className="w-full h-full flex items-center justify-center pointer-events-auto bg-black/50 rounded-xl p-2 gap-2" onMouseLeave={() => setEditingTextId(null)}>
                 {[MapPin, Map, Navigation, Compass].map((IconComponent, idx) => (
                   <button
                     key={idx}
                     type="button"
                     className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded border border-white/20 transition-colors"
                     onClick={() => {
                       onEstiloChange?.('mapPin', { ...estilos?.mapPin, icon: ['MapPin', 'Map', 'Navigation', 'Compass'][idx] });
                       setEditingTextId(null);
                     }}
                   >
                     <IconComponent size={20} color={estilos?.mapPin?.color || estilos?.titulo?.color} />
                   </button>
                 ))}
               </div>
             ) : (
               !isEditing && texto.direccion ? (
                 <a 
                   href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(texto.direccion)}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full h-full flex items-center justify-center transition-transform hover:scale-110 pointer-events-auto"
                   onClick={(e) => e.stopPropagation()}
                   title="Ver en Google Maps"
                 >
                   {estilos?.mapPin?.icon === 'Map' ? <Map size="100%" style={{ width: '100%', height: '100%', color: estilos?.mapPin?.color || estilos?.titulo?.color }} /> :
                    estilos?.mapPin?.icon === 'Navigation' ? <Navigation size="100%" style={{ width: '100%', height: '100%', color: estilos?.mapPin?.color || estilos?.titulo?.color }} /> :
                    estilos?.mapPin?.icon === 'Compass' ? <Compass size="100%" style={{ width: '100%', height: '100%', color: estilos?.mapPin?.color || estilos?.titulo?.color }} /> :
                    <MapPin size="100%" style={{ width: '100%', height: '100%', color: estilos?.mapPin?.color || estilos?.titulo?.color }} />}
                 </a>
               ) : (
                 <div className={cn("w-full h-full flex items-center justify-center", isEditing ? "pointer-events-none" : "opacity-30")}>
                   {estilos?.mapPin?.icon === 'Map' ? <Map size="100%" style={{ width: '100%', height: '100%', color: estilos?.mapPin?.color || estilos?.titulo?.color }} /> :
                    estilos?.mapPin?.icon === 'Navigation' ? <Navigation size="100%" style={{ width: '100%', height: '100%', color: estilos?.mapPin?.color || estilos?.titulo?.color }} /> :
                    estilos?.mapPin?.icon === 'Compass' ? <Compass size="100%" style={{ width: '100%', height: '100%', color: estilos?.mapPin?.color || estilos?.titulo?.color }} /> :
                    <MapPin size="100%" style={{ width: '100%', height: '100%', color: estilos?.mapPin?.color || estilos?.titulo?.color }} />}
                 </div>
               )
             )
          , { visible: true })}

          {renderElement('vestimenta', 
            editingTextId === 'vestimenta' ? (
              <div className="flex flex-col items-center justify-center w-full text-center pointer-events-auto" style={{ fontSize: `${estilos?.vestimenta?.fontSize || 14}px`, color: estilos?.vestimenta?.color, fontFamily: estilos?.vestimenta?.fuente ? `'${estilos.vestimenta.fuente}'` : 'inherit' }}>
                 <p className="font-black uppercase tracking-[0.2em] opacity-60 m-0" style={{ fontSize: '0.6em' }}>Dress Code</p>
                 <input type="text" value={texto.vestimenta || ''} onChange={(e) => onTextoChange?.('vestimenta', e.target.value)} className="font-bold m-0 mt-1 bg-white/10 border border-white/20 rounded px-2 outline-none text-center" autoFocus onBlur={() => setEditingTextId(null)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setEditingTextId(null); } }} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full text-center select-none" style={{ fontSize: `${estilos?.vestimenta?.fontSize || 14}px`, color: estilos?.vestimenta?.color, fontFamily: estilos?.vestimenta?.fuente ? `'${estilos.vestimenta.fuente}'` : 'inherit' }}>
                 <p className="font-black uppercase tracking-[0.2em] opacity-60 m-0" style={{ fontSize: '0.6em' }}>Dress Code</p>
                 <p className="font-bold whitespace-pre-wrap m-0 mt-1">{texto.vestimenta}</p>
              </div>
            )
          , {})}

          {renderElement('regalos', 
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 select-none" style={{ color: estilos?.regalos?.color || estilos?.titulo?.color, fontFamily: estilos?.regalos?.fuente ? `'${estilos.regalos.fuente}'` : 'inherit' }}>
               {texto.regaloTipo === 'MESA' ? (
                 <a 
                   href={texto.regaloMesaUrl?.startsWith('http') ? texto.regaloMesaUrl : `https://${texto.regaloMesaUrl}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 pointer-events-auto shadow-sm"
                   onClick={(e) => e.stopPropagation()}
                   style={{ fontSize: `${estilos?.regalos?.fontSize || 12}px` }}
                 >
                   <Gift size={16} />
                   <span className="font-black uppercase tracking-widest">Mesa de Regalos</span>
                 </a>
               ) : (
                 <div 
                   onClick={() => handleCopiar(texto.regaloClabe)}
                   className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 cursor-pointer pointer-events-auto group/regalo relative min-w-[200px]"
                   style={{ fontSize: `${estilos?.regalos?.fontSize || 12}px` }}
                 >
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard size={14} className="opacity-60" />
                      <span className="font-black uppercase tracking-[0.2em] opacity-60" style={{ fontSize: '0.7em' }}>Regalo Monetario</span>
                    </div>
                    <div className="flex items-center gap-3 w-full justify-center">
                       <div className="text-center">
                          <p className="font-black opacity-40 leading-none mb-1" style={{ fontSize: '0.8em' }}>{texto.regaloBanco || 'BANCO'}</p>
                          <p className="font-mono font-bold tracking-wider leading-none" style={{ fontSize: '1.1em' }}>{texto.regaloClabe || '0000 0000 0000 0000 00'}</p>
                       </div>
                       <div className={cn(
                         "w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0",
                         copiado ? "bg-[var(--color-liquidado)] text-white" : "bg-white/10 group-hover/regalo:bg-white/20"
                       )}>
                          {copiado ? <Check size={14} /> : <Copy size={14} />}
                       </div>
                    </div>
                    {copiado && (
                      <p className="font-black uppercase tracking-widest text-[var(--color-liquidado)] absolute -top-8 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap" style={{ fontSize: '0.6em' }}>¡Copiado al portapapeles!</p>
                    )}
                 </div>
               )}
            </div>
          , { visible: true })}
        </div>
      </div>

      {(estilos?.boton?.visible !== false) && (
        <div className="absolute bottom-10 left-10 right-10 z-20">
          <button 
            onClick={onRSVPClick}
            className="w-full py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg transition-transform hover:scale-110 active:scale-95"
            style={{
              backgroundColor: estilos?.boton?.color || estilos?.titulo?.color || '#ffffff',
              color: '#000000'
            }}
          >
            Confirmar Asistencia
          </button>
        </div>
      )}
      
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-black/10 flex items-center justify-center z-20">
        <div className="w-16 h-1 rounded-full bg-white/20" />
      </div>
      <div className="absolute inset-0 bg-black/10 z-0 rounded-[32px] overflow-hidden pointer-events-none"></div>
    </div>
  );
});

export default InvitationCanvas;
