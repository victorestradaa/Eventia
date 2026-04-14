'use client';

import { Rnd } from 'react-rnd';
import { Calendar as CalendarIcon, MapPin, Image as ImageIcon } from 'lucide-react';
import { cn, formatearFechaCorta } from '@/lib/utils';

interface InvitationCanvasProps {
  estilos: any;
  texto: any;
  fondoUrlActivo?: string;
  isEditing?: boolean;
  onEstiloChange?: (id: string, newEstilo: any) => void;
  evento?: any;
  archivoAdjuntoPropio?: string | null;
  modoPropia?: boolean;
  onRSVPClick?: () => void;
}
import { useState, useEffect, forwardRef } from 'react';
import { Gift, CreditCard, Copy, Check } from 'lucide-react';

const InvitationCanvas = forwardRef<HTMLDivElement, InvitationCanvasProps>(({ 
  estilos, 
  texto, 
  fondoUrlActivo, 
  isEditing = false,
  onEstiloChange,
  evento,
  archivoAdjuntoPropio,
  modoPropia = false,
  onRSVPClick
}, ref) => {
  const [copiado, setCopiado] = useState(false);

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
      return (
        <Rnd 
          bounds="parent" 
          position={{ x: estilo?.x || 20, y: estilo?.y || 100 }} 
          size={{ width: estilo?.width || 300, height: estilo?.height || 40 }} 
          onDragStop={(e, d) => onEstiloChange?.(id, { ...estilo, x: d.x, y: d.y })} 
          onResizeStop={(e, dir, ref, delta, pos) => onEstiloChange?.(id, { 
            ...estilo, 
            width: parseInt(ref.style.width), 
            height: parseInt(ref.style.height), 
            ...pos 
          })} 
          style={{ position: 'absolute' }} // Forzar absolute
          className="group border border-transparent hover:border-white/50 border-dashed transition-colors flex items-center justify-center cursor-move"
        >
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
      className="w-[400px] h-[700px] max-w-full rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-zinc-900 relative transition-all duration-500"
      style={{
        backgroundImage: fondoUrlActivo ? `url(${fondoUrlActivo})` : 'none',
        backgroundColor: fondoUrlActivo ? 'transparent' : '#1a1a1a',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 z-10 overflow-hidden drop-shadow-md pointer-events-none">
        {/* Usamos un wrapper para asegurar que los elementos absolutos se ven */}
        <div className="relative w-full h-full pointer-events-auto">
          {renderElement('titulo', 
            <p className="uppercase tracking-[0.3em] font-black opacity-80 w-full text-center whitespace-pre-wrap select-none" style={{ fontSize: `${estilos?.titulo?.fontSize || 10}px`, color: estilos?.titulo?.color, fontFamily: estilos?.titulo?.fuente || 'inherit' }}>{texto.titulo}</p>
          , {})}

          {renderElement('nombres', 
            <h2 className="italic w-full text-center whitespace-pre-wrap select-none" style={{ fontSize: `${estilos?.nombres?.fontSize || 36}px`, color: estilos?.nombres?.color, fontFamily: estilos?.nombres?.fuente || 'serif' }}>{texto.nombres}</h2>
          , {})}

          {renderElement('mensaje', 
            <p className="leading-relaxed opacity-90 italic w-full text-center whitespace-pre-wrap select-none" style={{ fontSize: `${estilos?.mensaje?.fontSize || 14}px`, color: estilos?.mensaje?.color, fontFamily: estilos?.mensaje?.fuente || 'inherit' }}>"{texto.mensaje}"</p>
          , {})}

          {renderElement('lugar', 
            <div className="flex flex-col items-center justify-center font-bold uppercase tracking-widest w-full text-center select-none" style={{ fontSize: `${estilos?.lugar?.fontSize || 12}px`, color: estilos?.lugar?.color, fontFamily: estilos?.lugar?.fuente || 'inherit' }}>
               <div className="flex items-center justify-center gap-2"><CalendarIcon size={estilos?.lugar?.fontSize}/> {evento?.fecha ? formatearFechaCorta(evento.fecha) : 'Próximamente'}</div>
                <div className="flex items-center justify-center gap-2">
                  {texto.lugar}
                </div>
              </div>
          , {})}

          {renderElement('horaCeremonia', 
            <div className="flex flex-col items-center justify-center w-full text-center select-none" style={{ fontSize: `${estilos?.horaCeremonia?.fontSize || 16}px`, color: estilos?.horaCeremonia?.color || estilos?.lugar?.color, fontFamily: estilos?.horaCeremonia?.fuente || 'inherit' }}>
               <p className="font-black uppercase tracking-[0.2em] opacity-40 m-0" style={{ fontSize: '0.6em' }}>Ceremonia Religiosa</p>
               <p className="font-bold uppercase m-0 mt-1">{texto.horaCeremonia || '04:00 PM'}</p>
            </div>
          , {})}

          {renderElement('horaCelebracion', 
            <div className="flex flex-col items-center justify-center w-full text-center select-none" style={{ fontSize: `${estilos?.horaCelebracion?.fontSize || 16}px`, color: estilos?.horaCelebracion?.color || estilos?.lugar?.color, fontFamily: estilos?.horaCelebracion?.fuente || 'inherit' }}>
               <p className="font-black uppercase tracking-[0.2em] opacity-40 m-0" style={{ fontSize: '0.6em' }}>Celebración</p>
               <p className="font-bold uppercase m-0 mt-1">{texto.horaCelebracion || '06:00 PM'}</p>
            </div>
          , {})}

          {renderElement('mapPin', 
             !isEditing && texto.direccion ? (
               <a 
                 href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(texto.direccion)}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="w-full h-full flex items-center justify-center transition-transform hover:scale-110 pointer-events-auto"
                 onClick={(e) => e.stopPropagation()}
                 title="Ver en Google Maps"
               >
                 <MapPin 
                   size="100%" 
                   style={{ width: '100%', height: '100%', color: estilos?.mapPin?.color || estilos?.titulo?.color }} 
                 />
               </a>
             ) : (
               <div className={cn("w-full h-full flex items-center justify-center", isEditing ? "pointer-events-none" : "opacity-30")}>
                 <MapPin 
                   size="100%" 
                   style={{ width: '100%', height: '100%', color: estilos?.mapPin?.color || estilos?.titulo?.color }} 
                 />
               </div>
             )
          , { visible: true })}

          {renderElement('vestimenta', 
            <div className="flex flex-col items-center justify-center w-full text-center select-none" style={{ fontSize: `${estilos?.vestimenta?.fontSize || 14}px`, color: estilos?.vestimenta?.color, fontFamily: estilos?.vestimenta?.fuente || 'inherit' }}>
               <p className="font-black uppercase tracking-[0.2em] opacity-60 m-0" style={{ fontSize: '0.6em' }}>Dress Code</p>
               <p className="font-bold uppercase whitespace-pre-wrap m-0 mt-1">{texto.vestimenta}</p>
            </div>
          , {})}

          {renderElement('regalos', 
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 select-none" style={{ color: estilos?.regalos?.color || estilos?.titulo?.color, fontFamily: estilos?.regalos?.fuente || 'inherit' }}>
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
                          <p className="font-black uppercase opacity-40 leading-none mb-1" style={{ fontSize: '0.8em' }}>{texto.regaloBanco || 'BANCO'}</p>
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
      <div className="absolute inset-0 bg-black/10 z-0"></div>
    </div>
  );
});

export default InvitationCanvas;
