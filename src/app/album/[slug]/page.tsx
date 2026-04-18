'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  Camera, 
  Upload, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Images, 
  Play, 
  X, 
  Loader2, 
  Lock,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { getAlbumPublic, uploadAlbumMedia } from '@/lib/actions/albumActions';
import { cn } from '@/lib/utils';

export default function GuestAlbumPage() {
  const { slug } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [album, setAlbum] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Lightbox State
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    loadAlbum();
  }, [slug]);

  async function loadAlbum() {
    setIsLoading(true);
    const res = await getAlbumPublic(slug as string);
    if (res.success && res.album) {
      setAlbum(res.album);
      const albumConfig = res.album.config as any;
      if (albumConfig?.pin) {
        setShowPinModal(true);
      } else {
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false);
  }

  const handlePinSubmit = () => {
    const albumConfig = album?.config as any;
    if (pin === albumConfig?.pin) {
      setIsAuthenticated(true);
      setShowPinModal(false);
    } else {
      setPinError(true);
      setPin('');
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !album) return;

    // Validar tipo
    const tipo = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
    
    // Validar video 30s
    if (tipo === 'VIDEO') {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 31) { // 31 seg para dar margen
          alert('El video debe durar máximo 30 segundos.');
          setIsUploading(false);
          return;
        }
        startUpload(file, tipo);
      };
      video.src = URL.createObjectURL(file);
      setIsUploading(true);
      return;
    }

    startUpload(file, tipo);
  };

  const startUpload = async (file: File, tipo: 'IMAGE' | 'VIDEO') => {
    setIsUploading(true);
    setUploadProgress(10);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('albumId', album.id);
    formData.append('tipo', tipo);

    const res = await uploadAlbumMedia(formData);
    if (res.success) {
      setUploadProgress(100);
      setAlbum({
        ...album,
        media: [res.media, ...album.media]
      });
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } else {
      alert(res.error || 'Error al subir archivo');
      setIsUploading(false);
    }
  };

  // Lightbox Handlers
  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null || !album?.media) return;
    setSelectedIndex((selectedIndex + 1) % album.media.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null || !album?.media) return;
    setSelectedIndex((selectedIndex - 1 + album.media.length) % album.media.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = e.targetTouches[0].clientX;
    const diffX = touchStartX.current - currentX;
    
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) handleNext();
      else handlePrev();
      touchStartX.current = null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#faf9f6] text-stone-900 gap-4">
        <Loader2 className="animate-spin text-[#bd9b65]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Accediedo al Álbum...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#faf9f6] text-stone-900 p-8 text-center gap-6">
        <AlertTriangle size={60} className="text-[#bd9b65] opacity-20" />
        <div className="space-y-2">
           <h1 className="text-2xl font-black uppercase tracking-tighter">Álbum no encontrado</h1>
           <p className="text-sm opacity-50">El link parece ser incorrecto o el álbum ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]/50 text-stone-900 selection:bg-[#bd9b65] selection:text-white relative overflow-x-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      
      {/* Textura de fondo sutil */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />

      {/* Header Fijo Estilo Galería */}
      <header className="sticky top-0 z-40 bg-[#faf9f6]/80 backdrop-blur-xl border-b border-stone-200/60 p-4 md:p-6 mb-8">
         <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full border border-[#bd9b65]/30 flex items-center justify-center bg-white shadow-sm">
                  <Images className="text-[#bd9b65]" size={20} />
               </div>
               <div>
                  <h1 className="text-lg font-bold font-serif italic tracking-tight leading-tight">{album.evento.nombre}</h1>
                  <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] flex items-center gap-1.5 mt-0.5">
                    <Calendar size={10} className="text-[#bd9b65]" /> {new Date(album.evento.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
               </div>
            </div>
            {album.activo && isAuthenticated && (
               <button 
                 onClick={() => !isUploading && fileInputRef.current?.click()}
                 className="bg-[#bd9b65] hover:bg-[#a67c4e] text-white h-12 px-8 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center gap-2 group"
               >
                  {isUploading ? <Loader2 className="animate-spin" size={16} /> : <><Camera size={18} className="group-hover:scale-110 transition-transform" /> <span className="hidden sm:inline">Subir Recuerdo</span><span className="sm:hidden">Subir</span></>}
               </button>
            )}
         </div>
      </header>

      <main className="max-w-5xl mx-auto p-3 sm:p-6 md:p-8 space-y-12 pb-32">
         
         {!isAuthenticated ? (
           <div className="flex flex-col items-center justify-center pt-20 text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-[2.5rem] bg-white border border-[#bd9b65]/20 flex items-center justify-center shadow-xl">
                 <Lock className="text-[#bd9b65]" size={32} />
              </div>
              <div className="space-y-4">
                 <h2 className="text-3xl font-serif italic font-bold">Álbum Privado</h2>
                 <p className="text-sm text-stone-400 max-w-xs mx-auto">Ingresa el código PIN proporcionado por los anfitriones para acceder a los recuerdos.</p>
              </div>
              
              <div className="flex flex-col items-center gap-6">
                 <input 
                   type="text" 
                   maxLength={4}
                   inputMode="numeric"
                   autoFocus
                   placeholder="____"
                   className={cn(
                     "bg-white border border-[#bd9b65]/20 w-48 h-20 rounded-2xl text-center text-4xl font-black tracking-[0.5em] focus:border-[#bd9b65] focus:ring-4 focus:ring-[#bd9b65]/5 outline-none transition-all shadow-inner",
                     pinError && "border-red-500 bg-red-50 animate-shake"
                   )}
                   value={pin}
                   onChange={(e) => {
                     const val = e.target.value.replace(/\D/g, '');
                     setPin(val);
                     if (val.length === 4) setPin(val);
                   }}
                 />
                 <button 
                   onClick={handlePinSubmit}
                   disabled={pin.length < 4}
                   className="bg-stone-900 text-white w-48 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-stone-800 transition-all disabled:opacity-20 shadow-lg active:scale-95"
                 >
                    Acceder al Álbum
                 </button>
              </div>
           </div>
         ) : (
           <>
              {/* Título de Sección */}
              <div className="flex flex-col items-center text-center space-y-4 mb-4">
                  <div className="w-12 h-1 bg-[#bd9b65]/30 rounded-full" />
                  <h2 className="font-serif italic text-3xl md:text-4xl text-stone-800">Recuerdos Compartidos</h2>
                  <p className="text-xs uppercase tracking-[0.3em] font-black opacity-30">Capturando cada momento especial</p>
              </div>

              {/* Grid de Galería Fija (No Masonry) */}
              {album.media.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-24 text-center gap-10 animate-fade-in">
                   <div className="relative">
                      <div className="absolute inset-0 bg-[#bd9b65]/10 rounded-full blur-3xl" />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-36 h-36 rounded-full border-2 border-dashed border-[#bd9b65]/40 flex items-center justify-center text-[#bd9b65] hover:bg-white hover:border-[#bd9b65] transition-all active:scale-90 shadow-sm"
                      >
                         <Camera size={52} strokeWidth={1.5} />
                      </button>
                   </div>
                   <div className="space-y-6">
                      <p className="text-sm font-medium italic font-serif text-stone-400">¡Sé el primero en compartir un momento de este gran día!</p>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-stone-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-stone-800 transition-all shadow-xl active:scale-95"
                      >
                         Comenzar Álbum
                      </button>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                   {album.media.map((item: any, idx: number) => (
                     <div 
                       key={item.id} 
                       onClick={() => setSelectedIndex(idx)}
                       className="relative group bg-white p-2 md:p-3 rounded-2xl shadow-lg border-[0.5px] border-[#bd9b65]/30 cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                     >
                        <div className="aspect-square rounded-xl overflow-hidden bg-stone-50 flex items-center justify-center">
                            {item.tipo === 'IMAGE' ? (
                              <img 
                                src={item.url} 
                                alt="Recuerdo" 
                                className="w-full h-full object-cover block transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                              />
                            ) : (
                              <div className="relative w-full h-full">
                                 <video 
                                   src={item.url} 
                                   className="w-full h-full object-cover block"
                                   muted
                                   playsInline
                                 />
                                 <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                    <div className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                                       <Play className="text-stone-900 fill-stone-900 translate-x-0.5" size={16} />
                                    </div>
                                 </div>
                              </div>
                            )}
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </>
         )}
      </main>

      {/* Lightbox / Visualizador Premium */}
      {selectedIndex !== null && album?.media[selectedIndex] && (
        <div 
          className="fixed inset-0 z-[100] bg-stone-50/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 md:p-12 animate-in fade-in duration-500 overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onClick={() => setSelectedIndex(null)}
        >
           {/* Botón cerrar */}
           <button 
             className="absolute top-6 right-6 w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center z-[110] active:scale-90 transition-all shadow-xl"
             onClick={() => setSelectedIndex(null)}
           >
              <X size={24} />
           </button>

           {/* Botones Navegación (Desktop) */}
           <button 
             className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white border border-stone-200 text-stone-900 items-center justify-center z-[110] active:scale-90 transition-all shadow-xl hover:bg-stone-50 group"
             onClick={handlePrev}
           >
              <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
           </button>
           <button 
             className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white border border-stone-200 text-stone-900 items-center justify-center z-[110] active:scale-90 transition-all shadow-xl hover:bg-stone-50 group"
             onClick={handleNext}
           >
              <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
           </button>

           {/* Imagen / Video Expandido */}
           <div 
             className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center animate-out fade-out zoom-out"
             onClick={(e) => e.stopPropagation()}
           >
              <div 
                key={album.media[selectedIndex].id}
                className="relative bg-white p-2 sm:p-4 rounded-[1.5rem] sm:rounded-[3rem] shadow-[0_0_60px_rgba(189,155,101,0.2)] border border-[#bd9b65]/20 animate-fade-in group shadow-amber-500/10"
              >
                  {/* El Brillo/Glow solicitado */}
                  <div className="absolute inset-0 bg-[#bd9b65]/5 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />

                  {album.media[selectedIndex].tipo === 'IMAGE' ? (
                    <img 
                      src={album.media[selectedIndex].url} 
                      alt="Recuerdo expandido" 
                      className="relative z-10 max-w-full max-h-[75vh] object-contain rounded-[1rem] sm:rounded-[2.5rem] drop-shadow-2xl"
                    />
                  ) : (
                    <video 
                      src={album.media[selectedIndex].url} 
                      className="relative z-10 max-w-full max-h-[75vh] object-contain rounded-[1rem] sm:rounded-[2.5rem] drop-shadow-2xl"
                      controls
                      autoPlay
                      playsInline
                    />
                  )}

                  {/* Detalle elegante al pie de la imagen */}
                  <div className="absolute -bottom-10 left-0 w-full flex justify-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-stone-900">
                      Recuerdo {selectedIndex + 1} de {album.media.length}
                    </p>
                  </div>
              </div>
           </div>

           {/* Indicador de Swipe (Móvil) */}
           <div className="md:hidden absolute bottom-10 left-0 w-full text-center flex flex-col items-center gap-2 opacity-20">
              <div className="flex gap-1.5">
                 {album.media.map((_: any, i: number) => (
                   <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all", i === selectedIndex ? "w-6 bg-[#bd9b65] opacity-80" : "bg-stone-900")} />
                 ))}
              </div>
              <p className="text-[8px] font-black uppercase tracking-widest mt-2">Desliza para navegar</p>
           </div>
        </div>
      )}

      {/* Input Oculto */}
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef}
        accept="image/*,video/*"
        capture="environment"
        onChange={handleFileChange}
      />

      {/* Botón Flotante Subir (Movil) */}
      {album.activo && isAuthenticated && !isUploading && selectedIndex === null && (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="fixed bottom-10 right-6 md:hidden w-20 h-20 rounded-full bg-[#bd9b65] text-white shadow-[0_15px_50px_rgba(189,155,101,0.5)] flex flex-col items-center justify-center hover:scale-110 active:scale-90 transition-all z-[60] border-4 border-[#faf9f6]"
        >
           <Camera size={32} strokeWidth={1.5} />
           <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Subir</span>
        </button>
      )}

      {/* Overlay de Subida Premium */}
      {isUploading && (
        <div className="fixed inset-0 z-[120] bg-[#faf9f6]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
           <div className="relative w-40 h-40 mb-10">
              <svg className="w-full h-full -rotate-90">
                 <circle 
                   cx="80" cy="80" r="76" 
                   stroke="currentColor" strokeWidth="4" fill="transparent"
                   className="text-stone-200"
                 />
                 <circle 
                   cx="80" cy="80" r="76" 
                   stroke="currentColor" strokeWidth="6" fill="transparent"
                   strokeDasharray={477}
                   strokeDashoffset={477 - (477 * uploadProgress) / 100}
                   className="text-[#bd9b65] transition-all duration-300 stroke-round"
                 />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Upload className="text-[#bd9b65] animate-bounce" size={48} strokeWidth={1.5} />
              </div>
           </div>
           <h3 className="text-2xl font-serif italic mb-2">Subiendo tu momento...</h3>
           <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em]">{uploadProgress}% Completado</p>
        </div>
      )}

      <style jsx global>{`
        body {
          background-color: #faf9f6;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
        .stroke-round {
          stroke-linecap: round;
        }
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>

    </div>
  );
}
