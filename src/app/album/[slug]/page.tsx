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
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white gap-4">
        <Loader2 className="animate-spin text-amber-500" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Accediendo al Álbum...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-8 text-center gap-6">
        <AlertTriangle size={60} className="text-amber-500 opacity-20" />
        <div className="space-y-2">
           <h1 className="text-2xl font-black uppercase tracking-tighter">Álbum no encontrado</h1>
           <p className="text-sm opacity-50">El link parece ser incorrecto o el álbum ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-amber-500 selection:text-black">
      
      {/* Header Fijo */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 p-4 md:p-6">
         <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <Images className="text-black" size={20} />
               </div>
               <div>
                  <h1 className="text-sm font-black uppercase tracking-widest">{album.evento.nombre}</h1>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={10} /> {new Date(album.evento.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
                  </p>
               </div>
            </div>
            {album.activo && isAuthenticated && (
               <button 
                 onClick={() => !isUploading && fileInputRef.current?.click()}
                 className="bg-amber-500 hover:bg-amber-400 text-black h-12 px-6 rounded-full font-black text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-90 flex items-center gap-2"
               >
                  {isUploading ? <Loader2 className="animate-spin" size={16} /> : <><Camera size={18} /> <span className="hidden sm:inline">Subir Recuerdo</span><span className="sm:hidden">Subir</span></>}
               </button>
            )}
         </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-8 pb-24">
         
         {!isAuthenticated ? (
           <div className="flex flex-col items-center justify-center pt-20 text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-[2rem] bg-zinc-900 border border-white/10 flex items-center justify-center">
                 <Lock className="text-amber-500" size={32} />
              </div>
              <div className="space-y-4">
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter">Álbum Protegido</h2>
                 <p className="text-sm opacity-40 max-w-xs mx-auto">Ingresa el código PIN proporcionado por los anfitriones para acceder.</p>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                 <input 
                   type="text" 
                   maxLength={4}
                   inputMode="numeric"
                   autoFocus
                   placeholder="____"
                   className={cn(
                     "bg-zinc-900 border border-white/10 w-40 h-16 rounded-2xl text-center text-3xl font-black tracking-[0.5em] focus:border-amber-500/50 outline-none transition-all",
                     pinError && "border-red-500 bg-red-500/5 animate-shake"
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
                   className="btn-premium w-40 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                 >
                    Acceder
                 </button>
              </div>
           </div>
         ) : (
           <>
              {/* Grid de Galería */}
              {album.media.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-24 text-center gap-8 animate-pulse-slow">
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-32 h-32 rounded-full border-2 border-dashed border-amber-500/50 flex items-center justify-center text-amber-500 hover:bg-amber-500/10 hover:border-amber-500 transition-all active:scale-90"
                   >
                      <Camera size={48} />
                   </button>
                   <div className="space-y-4">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">¡Sé el primero en subir un recuerdo!</p>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-premium px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em]"
                      >
                         Tocar para subir
                      </button>
                   </div>
                </div>
              ) : (
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                   {album.media.map((item: any) => (
                     <div key={item.id} className="relative group rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 break-inside-avoid">
                        {item.tipo === 'IMAGE' ? (
                          <img 
                            src={item.url} 
                            alt="Recuerdo" 
                            className="w-full h-auto block transform group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="relative">
                             <video 
                               src={item.url} 
                               className="w-full h-auto block"
                               controls={false}
                               muted
                               loop
                               playsInline
                             />
                             <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                                   <Play className="text-white fill-current translate-x-0.5" size={20} />
                                </div>
                             </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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

      {/* Floating Upload Button (Solo Movil + Autenticado) */}
      {album.activo && isAuthenticated && !isUploading && (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="fixed bottom-12 right-6 md:hidden w-20 h-20 rounded-full bg-amber-500 text-black shadow-[0_15px_50px_rgba(245,158,11,0.6)] flex flex-col items-center justify-center hover:scale-110 active:scale-90 transition-all z-[60] border-4 border-black box-content"
        >
           <Camera size={32} />
           <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Subir</span>
        </button>
      )}

      {/* Overlay de Subida */}
      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="relative w-32 h-32 mb-8">
              <svg className="w-full h-full -rotate-90">
                 <circle 
                   cx="64" cy="64" r="60" 
                   stroke="currentColor" strokeWidth="8" fill="transparent"
                   className="text-white/10"
                 />
                 <circle 
                   cx="64" cy="64" r="60" 
                   stroke="currentColor" strokeWidth="8" fill="transparent"
                   strokeDasharray={377}
                   strokeDashoffset={377 - (377 * uploadProgress) / 100}
                   className="text-amber-500 transition-all duration-300 stroke-round"
                 />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Upload className="text-amber-500 animate-bounce" size={40} />
              </div>
           </div>
           <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Subiendo Momento</h3>
           <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">{uploadProgress}% Completado</p>
        </div>
      )}

      <style jsx global>{`
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
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
}
