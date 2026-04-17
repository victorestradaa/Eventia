'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  Camera, 
  Upload, 
  Plus, 
  ChevronLeft, 
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#faf9f6] text-stone-900 gap-4">
        <Loader2 className="animate-spin text-[#bd9b65]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Acceding al Álbum...</p>
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
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 selection:bg-[#bd9b65] selection:text-white relative">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      
      {/* Textura de fondo sutil */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />

      {/* Header Fijo Estilo Galería */}
      <header className="sticky top-0 z-50 bg-[#faf9f6]/80 backdrop-blur-xl border-b border-stone-200/60 p-4 md:p-6 mb-8">
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

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-12 pb-32">
         
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

              {/* Grid de Galería Minimalista */}
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
                <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
                   {album.media.map((item: any) => (
                     <div 
                       key={item.id} 
                       className="relative group bg-white p-3 md:p-4 rounded-[2rem] shadow-xl border border-stone-200/40 break-inside-avoid hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                       style={{ rotate: `${(Math.random() * 2 - 1).toFixed(1)}deg` }}
                     >
                        {/* Marco elegante (Polaroid look) */}
                        <div className="rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 flex items-center justify-center min-h-[150px]">
                            {item.tipo === 'IMAGE' ? (
                              <img 
                                src={item.url} 
                                alt="Recuerdo" 
                                loading="lazy"
                                className="w-full h-auto block transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                              />
                            ) : (
                              <div className="relative w-full">
                                 <video 
                                   src={item.url} 
                                   className="w-full h-auto block"
                                   controls={false}
                                   muted
                                   loop
                                   playsInline
                                 />
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-14 h-14 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                                       <Play className="text-stone-900 fill-stone-900 translate-x-0.5" size={20} />
                                    </div>
                                 </div>
                              </div>
                            )}
                        </div>
                        
                        {/* Pequeño detalle inferior del marco */}
                        <div className="mt-4 flex items-center justify-between px-1">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-[#bd9b65]/30" />
                              <span className="text-[9px] font-black uppercase tracking-widest opacity-20">Recuerdo · {new Date(item.createdAt).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}</span>
                           </div>
                           <CheckCircle2 size={12} className="text-[#bd9b65]/20" />
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </>
         )}
      </main>

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
      {album.activo && isAuthenticated && !isUploading && (
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
        <div className="fixed inset-0 z-[100] bg-[#faf9f6]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
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
      `}</style>

    </div>
  );
}
