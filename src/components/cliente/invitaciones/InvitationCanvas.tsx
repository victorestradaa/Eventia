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

export default function InvitationCanvas({ 
  estilos, 
  texto, 
  fondoUrlActivo, 
  isEditing = false,
  onEstiloChange,
  evento,
  archivoAdjuntoPropio,
  modoPropia = false,
  onRSVPClick
}: InvitationCanvasProps) {

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
      <div className="w-[400px] h-[700px] max-w-full rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-zinc-900 relative transition-all duration-500 bg-black flex items-center justify-center group">
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
               <div className="flex items-center justify-center gap-2 mb-1"><CalendarIcon size={estilos?.lugar?.fontSize}/> {evento?.fecha ? (typeof evento.fecha === 'string' ? formatearFechaCorta(new Date(evento.fecha)) : formatearFechaCorta(evento.fecha)) : 'Próximamente'}</div>
               <div className="flex items-center justify-center gap-2"><MapPin size={estilos?.lugar?.fontSize}/> {texto.lugar}</div>
            </div>
          , {})}

          {renderElement('vestimenta', 
            <div className="flex flex-col items-center justify-center w-full text-center select-none" style={{ fontSize: `${estilos?.vestimenta?.fontSize || 14}px`, color: estilos?.vestimenta?.color, fontFamily: estilos?.vestimenta?.fuente || 'inherit' }}>
               <p className="font-black uppercase tracking-[0.2em] opacity-60 m-0" style={{ fontSize: '0.6em' }}>Dress Code</p>
               <p className="font-bold uppercase whitespace-pre-wrap m-0 mt-1">{texto.vestimenta}</p>
            </div>
          , {})}
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
}
