'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  QrCode, 
  Download, 
  Settings2, 
  Trash2, 
  Plus, 
  Images, 
  Lock, 
  Unlock,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getOrCreateAlbum, updateAlbumConfig, deleteAlbumMedia } from '@/lib/actions/albumActions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AlbumDashboardPage() {
  const { id: eventoId } = useParams();
  const [album, setAlbum] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [pin, setPin] = useState('');

  useEffect(() => {
    loadAlbum();
  }, [eventoId]);

  async function loadAlbum() {
    setIsLoading(true);
    const res = await getOrCreateAlbum(eventoId as string);
    if (res.success) {
      setAlbum(res.album);
      setPin((res.album.config as any)?.pin || '');
    }
    setIsLoading(false);
  }

  const handleToggleActive = async () => {
    if (!album) return;
    setIsSaving(true);
    const newConfig = { ...(album.config as any), activo: !album.activo };
    const res = await updateAlbumConfig(album.id, { ...newConfig, activo: !album.activo });
    if (res.success) {
      setAlbum({ ...album, activo: !album.activo, config: newConfig });
    }
    setIsSaving(false);
  };

  const handleUpdatePin = async () => {
    if (!album) return;
    setIsSaving(true);
    const newConfig = { ...(album.config as any), pin: pin || null };
    const res = await updateAlbumConfig(album.id, newConfig);
    if (res.success) {
      setAlbum({ ...album, config: newConfig });
      setShowConfig(false);
    }
    setIsSaving(false);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este recuerdo?')) return;
    const res = await deleteAlbumMedia(mediaId, album.id);
    if (res.success) {
      setAlbum({
        ...album,
        media: album.media.filter((m: any) => m.id !== mediaId)
      });
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('album-qr');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      ctx?.drawImage(img, 0, 0, 1000, 1000);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-Album-${album.slug}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[var(--color-acento)]" size={40} />
        <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Cargando Álbum Digital...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
        <AlertCircle size={48} className="text-red-500 opacity-20" />
        <h2 className="text-xl font-black uppercase tracking-widest">Error al cargar</h2>
        <p className="text-sm opacity-60">No pudimos inicializar tu álbum. Intenta refrescar la página.</p>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/album/${album.slug}`;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      
      {/* Botón Volver */}
      <Link 
        href={`/cliente/evento/${eventoId}`}
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Volver al Evento
      </Link>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--color-borde-suave)]">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-[var(--color-acento)]/10 flex items-center justify-center">
                <Images className="text-[var(--color-acento)]" size={24} />
             </div>
             <h1 className="text-3xl font-black italic uppercase tracking-tighter">Álbum Digital</h1>
          </div>
          <p className="text-sm opacity-60 max-w-xl">
             Tus invitados pueden escanear el QR para subir sus mejores momentos y ver la galería compartida.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => setShowConfig(!showConfig)}
             className={cn(
               "btn bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] px-6 py-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all text-[var(--color-texto)]",
               showConfig && "border-[var(--color-acento)] bg-[var(--color-acento)]/5"
             )}
           >
              <Settings2 size={16} /> Configuración
           </button>
           <button 
             onClick={handleToggleActive}
             disabled={isSaving}
             className={cn(
               "btn px-8 py-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95",
               album.activo ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-zinc-200 text-zinc-500 hover:bg-zinc-300"
             )}
           >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : (album.activo ? <><Unlock size={16} /> Álbum Activo</> : <><Lock size={16} /> Álbum Pausado</>)}
           </button>
        </div>
      </header>

      {showConfig && (
        <div className="card-premium p-8 rounded-3xl border border-[var(--color-acento)]/30 bg-[var(--color-acento)]/5 animate-in slide-in-from-top-4 duration-500 flex flex-col md:flex-row items-center gap-8">
           <div className="flex-1 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest">Protección con PIN</h3>
              <p className="text-xs opacity-60 leading-relaxed">
                 Si quieres mayor privacidad, puedes configurar un PIN de 4 dígitos. Los invitados deberán ingresarlo antes de subir contenido. Deja en blanco para acceso libre.
              </p>
              <div className="flex gap-4">
                 <input 
                   type="text" 
                   maxLength={4} 
                   placeholder="Ej. 1234"
                   className="input bg-white w-32 tracking-[0.5em] font-black text-center"
                   value={pin}
                   onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                 />
                 <button 
                   onClick={handleUpdatePin}
                   disabled={isSaving}
                   className="btn-premium px-8 py-4 rounded-xl text-[10px] font-black uppercase"
                 >
                    {isSaving ? 'Guardando...' : 'Guardar PIN'}
                 </button>
              </div>
           </div>
           <div className="w-[1px] h-24 bg-current opacity-10 hidden md:block" />
           <div className="flex-1 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest">Estado del Álbum</h3>
              <p className="text-xs opacity-60 leading-relaxed">
                 Cuando el álbum está pausado, los invitados podrán ver las fotos pero no subir nuevas. Útil para cerrar el álbum después del evento.
              </p>
           </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Lado Izquierdo: QR y Link */}
        <div className="lg:col-span-1 space-y-6">
           <div className="card-premium p-8 rounded-[2.5rem] border border-[var(--color-borde-suave)] bg-white text-center space-y-6 shadow-2xl">
              <div className="relative group inline-block p-4 bg-zinc-50 rounded-3xl border-2 border-zinc-100 shadow-inner">
                <QRCodeSVG 
                  id="album-qr"
                  value={publicUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-xl"
                />
              </div>
              
              <div className="space-y-4">
                 <div className="p-4 bg-zinc-100 rounded-2xl border border-zinc-200">
                    <p className="text-[10px] font-bold uppercase opacity-30 mb-1">Link Compartible</p>
                    <p className="text-[10px] font-bold truncate text-[var(--color-texto)]">{publicUrl}</p>
                 </div>
                 
                 <div className="flex flex-col gap-3">
                    <button 
                      onClick={downloadQR}
                      className="btn w-full bg-zinc-900 text-white flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-black transition-all active:scale-95"
                    >
                       <Download size={16} /> Descargar QR Imprimible
                    </button>
                    <a 
                      href={publicUrl}
                      target="_blank"
                      className="btn w-full bg-white border border-zinc-200 flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-50 transition-all text-zinc-900"
                    >
                       <ExternalLink size={16} /> Ver Vista Invitados
                    </a>
                 </div>
              </div>
           </div>
        </div>

        {/* Lado Derecho: Galería */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Fotos y Videos compartidos</h2>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{album.media.length} Recuerdos</span>
           </div>

           {album.media.length === 0 ? (
             <div className="card-premium h-[400px] border-2 border-dashed border-[var(--color-borde-suave)] rounded-[3rem] flex flex-col items-center justify-center gap-4 text-center p-12 opacity-40">
                <div className="w-20 h-20 rounded-full bg-[var(--color-fondo-input)] flex items-center justify-center">
                   <Images size={40} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest max-w-[200px]">Aún no hay fotos. ¡Comparte el QR con tus invitados!</p>
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {album.media.map((item: any) => (
                  <div key={item.id} className="relative group aspect-square rounded-[2rem] overflow-hidden shadow-lg border border-white/10 bg-zinc-100">
                     {item.tipo === 'IMAGE' ? (
                       <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                     ) : (
                       <video src={item.url} className="w-full h-full object-cover" />
                     )}
                     
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => handleDeleteMedia(item.id)}
                          className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-90"
                        >
                           <Trash2 size={20} />
                        </button>
                     </div>

                     {item.tipo === 'VIDEO' && (
                       <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                          <Plus size={12} className="text-white rotate-45" />
                       </div>
                     )}
                  </div>
                ))}
             </div>
           )}
        </div>

      </div>

    </div>
  );
}
