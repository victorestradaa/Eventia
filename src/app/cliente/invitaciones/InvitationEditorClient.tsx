'use client';

import { 
  ArrowLeft, 
  Eye, 
  Send, 
  Type, 
  Calendar as CalendarIcon, 
  MapPin, 
  Image as ImageIcon, 
  Palette, 
  CheckCircle2,
  Sparkles,
  Loader2,
  Upload,
  FileBox
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn, formatearFechaCorta } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface InvitationEditorClientProps {
  evento: any;
}

export default function InvitationEditorClient({ evento }: InvitationEditorClientProps) {
  const router = useRouter();
  
  // Modos de editor
  const [modoPropia, setModoPropia] = useState(evento?.invitacion?.isInvitacionPropia || false);
  const [archivoAdjuntoBase64, setArchivoAdjuntoBase64] = useState<string | null>(evento?.invitacion?.archivoAdjunto || null);

  const [plantillaActiva, setPlantillaActiva] = useState(evento?.invitacion?.plantilla || 'gold');
  
  // Usar datos reales del evento como valores iniciales
  const [texto, setTexto] = useState({
    titulo: evento?.invitacion?.titulo || (evento?.tipo === 'BODA' ? '¡Nos Casamos!' : '¡Estás Invitado!'),
    nombres: evento?.nombre || 'Mi Evento Especial',
    mensaje: evento?.invitacion?.mensaje || 'Queremos compartir este día tan especial contigo. Tu presencia es nuestro mejor regalo.',
    vestimenta: evento?.invitacion?.vestimenta || 'Formal / Gala',
    lugar: evento?.invitacion?.lugarTexto || 'Sin asignar'
  });

  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PLANTILLAS_TODAS = [
    { id: 'gold', name: 'Golden Elegant', color: 'bg-[#C5A059]', tipos: ['BODA', 'XV_ANOS', 'TODOS'] },
    { id: 'dark', name: 'Midnight Premium', color: 'bg-indigo-950', tipos: ['BODA', 'XV_ANOS', 'FIESTA_GENERAL', 'TODOS'] },
    { id: 'floral', name: 'Spring Blossom', color: 'bg-rose-100', tipos: ['BODA', 'XV_ANOS', 'BAUTIZO', 'TODOS'] },
    { id: 'fun', name: 'Kids Fun', color: 'bg-blue-400', tipos: ['FIESTA_INFANTIL', 'BAUTIZO', 'TODOS'] },
    { id: 'party', name: 'Neon Party', color: 'bg-fuchsia-500', tipos: ['XV_ANOS', 'FIESTA_GENERAL', 'TODOS'] },
  ];

  // Filtrar plantillas basándose en el tipo de evento
  const plantillasFiltradas = PLANTILLAS_TODAS.filter(p => p.tipos.includes(evento?.tipo || 'TODOS'));

  useEffect(() => {
    // Si la plantilla activa actual no está en la lista filtrada, cambiar a la primera disponible
    if (plantillasFiltradas.length > 0 && !plantillasFiltradas.find(p => p.id === plantillaActiva)) {
      setPlantillaActiva(plantillasFiltradas[0].id);
    }
  }, [evento?.tipo]);


  if (!evento) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="p-6 rounded-full bg-amber-500/10 text-amber-500">
          <CalendarIcon size={64} />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-bold">No tienes eventos activos</h2>
          <p className="text-[var(--color-texto-suave)] mt-2">
            Primero debes crear un evento antes de poder diseñar tu invitación digital.
          </p>
        </div>
        <Link href="/cliente/dashboard">
          <button className="btn btn-primario">Ir al Dashboard</button>
        </Link>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Límite de 5MB
        alert("El archivo es demasiado grande. Máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setArchivoAdjuntoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const payload = {
        eventoId: evento.id,
        isInvitacionPropia: modoPropia,
        archivoAdjunto: modoPropia ? archivoAdjuntoBase64 : null,
        plantilla: plantillaActiva,
        titulo: texto.titulo,
        mensaje: texto.mensaje,
        lugarTexto: texto.lugar,
        vestimenta: texto.vestimenta
      };

      const res = await fetch('/api/invitaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar la invitación');
      }

      alert('Invitación guardada exitosamente');
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <Link href={`/cliente/evento/${evento.id}`} className="flex items-center gap-2 text-sm text-[var(--color-texto-muted)] hover:text-white transition-colors mb-2">
            <ArrowLeft size={16} /> Volver al evento
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold italic tracking-tighter uppercase">Editor de Invitación Digital</h1>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white uppercase tracking-widest">
              {evento.tipo?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secundario gap-2">
            <Eye size={18} /> Previsualizar
          </button>
          <button onClick={handleSave} className="btn btn-primario gap-2" disabled={saving}>
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
            {saving ? 'Guardando...' : 'Guardar Invitación'}
          </button>
        </div>
      </div>

      {/* Toggle de Modo */}
      <div className="flex bg-black/60 p-1 rounded-2xl w-fit border border-white/5 mx-auto lg:mx-0">
        <button 
          onClick={() => setModoPropia(false)}
          className={cn(
            "px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2", 
            !modoPropia ? "bg-[var(--color-primario)] text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Sparkles size={18} />
          Creador Automático
        </button>
        <button 
          onClick={() => setModoPropia(true)}
          className={cn(
            "px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2", 
            modoPropia ? "bg-[var(--color-acento)] text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Upload size={18} />
          Subir mi Diseño
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Panel de Edición Lado Izquierdo */}
        <div className="lg:col-span-4 space-y-6">
          {!modoPropia ? (
            <>
              <div className="card space-y-6">
                <h3 className="font-bold flex items-center gap-2 uppercase text-xs tracking-widest"><Palette size={16} className="text-[var(--color-primario-claro)]" /> Estilo y Plantilla ({plantillasFiltradas.length})</h3>
                <div className="grid grid-cols-1 gap-3">
                  {plantillasFiltradas.map((p) => (
                    <button 
                      key={p.id}
                      onClick={() => setPlantillaActiva(p.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all text-left bg-[var(--color-fondo-input)]",
                        plantillaActiva === p.id ? "border-[var(--color-primario)]" : "border-white/5 hover:border-white/20"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-lg shadow-inner", p.color)} />
                      <span className="text-sm font-bold">{p.name}</span>
                      {plantillaActiva === p.id && <CheckCircle2 size={16} className="ml-auto text-[var(--color-primario-claro)]" />}
                    </button>
                  ))}
                  {plantillasFiltradas.length === 0 && (
                    <p className="text-xs text-white/50 italic">No hay plantillas específicas para este tipo de evento.</p>
                  )}
                </div>
              </div>

              <div className="card space-y-6">
                <h3 className="font-bold flex items-center gap-2 uppercase text-xs tracking-widest"><Type size={16} className="text-[var(--color-acento-claro)]" /> Personalización de Contenido</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-1 block">Frase o Título</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all text-sm" 
                      value={texto.titulo} 
                      onChange={(e) => setTexto({...texto, titulo: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-1 block">Protagonista / Nombre del Evento</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all text-sm" 
                      value={texto.nombres}
                      onChange={(e) => setTexto({...texto, nombres: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-1 block">Mensaje especial</label>
                    <textarea 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all text-sm min-h-[100px] resize-none" 
                      value={texto.mensaje}
                      onChange={(e) => setTexto({...texto, mensaje: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-1 block">Lugar / Dirección</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all text-sm" 
                      value={texto.lugar}
                      onChange={(e) => setTexto({...texto, lugar: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-1 block">Código de Vestimenta</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all text-sm" 
                      value={texto.vestimenta}
                      onChange={(e) => setTexto({...texto, vestimenta: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card space-y-6">
              <h3 className="font-bold flex items-center gap-2 uppercase text-xs tracking-widest"><FileBox size={16} className="text-[var(--color-acento-claro)]" /> Archivo de Invitación</h3>
              <p className="text-sm text-white/70">
                Sube tu invitación terminada (Imagen o PDF). Esta será la que se envíe a tus invitados.
              </p>
              
              <div 
                className="border-2 border-dashed border-white/20 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 hover:bg-white/5 hover:border-[var(--color-acento)] transition-all cursor-pointer text-center group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:text-[var(--color-acento)] group-hover:bg-[var(--color-acento)]/20 transition-all">
                  <Upload size={28} />
                </div>
                <div>
                  <p className="font-bold">Haz clic para buscar tu archivo</p>
                  <p className="text-xs text-white/50 mt-1">Soporta PNG, JPG, WEBP (Max 5MB)</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {archivoAdjuntoBase64 && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-black/50 overflow-hidden flex-shrink-0">
                    <img src={archivoAdjuntoBase64} alt="Vista previa" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">Archivo adjunto listo</p>
                    <p className="text-xs text-green-400">Guardado temporalmente</p>
                  </div>
                  <button onClick={() => setArchivoAdjuntoBase64(null)} className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1 bg-rose-500/10 rounded-full">
                    Quitar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Simulador de Invitación Lado Derecho */}
        <div className="lg:col-span-8">
           <div className="sticky top-32 flex justify-center">
            {modoPropia && archivoAdjuntoBase64 ? (
              <div className="w-full max-w-[400px] aspect-[9/16] rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-zinc-900 relative transition-all duration-500 bg-black flex items-center justify-center group">
                 <img src={archivoAdjuntoBase64} alt="Invitación Cargada" className="w-full h-full object-contain" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <button className="w-full py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-lg bg-[var(--color-acento)] text-white">
                      Confirmar Asistencia (Preview)
                    </button>
                 </div>
              </div>
            ) : modoPropia && !archivoAdjuntoBase64 ? (
              <div className="w-full max-w-[400px] aspect-[9/16] rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-zinc-900 relative transition-all duration-500 bg-zinc-950 flex flex-col items-center justify-center text-center p-10 border-dashed">
                <ImageIcon size={48} className="text-white/20 mb-4" />
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Vista Previa</p>
                <p className="text-white/20 text-sm mt-2">Sube un archivo para previsualizar tu invitación aquí.</p>
              </div>
            ) : (
              <div className={cn(
                "w-full max-w-[400px] aspect-[9/16] rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-zinc-900 relative transition-all duration-500",
                plantillaActiva === 'gold' ? "bg-[#1a1a1a] text-[#C5A059]" : 
                plantillaActiva === 'dark' ? "bg-black text-indigo-400" : 
                plantillaActiva === 'floral' ? "bg-white text-rose-500" :
                plantillaActiva === 'fun' ? "bg-blue-50 text-blue-600 font-comic" :
                "bg-zinc-900 text-fuchsia-400"
              )}>
                 <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-6">
                    <p className="uppercase tracking-[0.3em] text-[10px] font-black opacity-80">{texto.titulo}</p>
                    <h2 className={cn("text-4xl italic", plantillaActiva === 'fun' ? "font-black" : "font-serif")}>{texto.nombres}</h2>
                    
                    <div className="w-12 h-px bg-current opacity-30 my-4" />
                    
                    <p className="text-sm leading-relaxed opacity-90 italic">"{texto.mensaje}"</p>
                    
                    <div className="space-y-4 pt-10">
                       <div className="flex items-center gap-2 justify-center text-xs font-bold uppercase tracking-widest">
                          <CalendarIcon size={14} /> {evento.fecha ? formatearFechaCorta(evento.fecha) : 'Próximamente'}
                       </div>
                       <div className="flex items-center gap-2 justify-center text-xs font-bold uppercase tracking-widest">
                          <MapPin size={14} /> {texto.lugar}
                       </div>
                    </div>

                    <div className="pt-10 space-y-2">
                       <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Dress Code</p>
                       <p className="text-sm font-bold uppercase">{texto.vestimenta}</p>
                    </div>

                    <div className="mt-auto w-full pt-10">
                       <button className={cn(
                         "w-full py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg transition-transform hover:scale-105 active:scale-95",
                         plantillaActiva === 'gold' ? "bg-[#C5A059] text-black" : 
                         plantillaActiva === 'dark' ? "bg-indigo-600 text-white" : 
                         plantillaActiva === 'fun' ? "bg-orange-500 text-white" :
                         plantillaActiva === 'party' ? "bg-fuchsia-500 text-white" :
                         "bg-rose-500 text-white"
                       )}>
                         Confirmar Asistencia
                       </button>
                    </div>
                 </div>
                 
                 {/* Status Bar */}
                 <div className="absolute top-0 left-0 right-0 h-8 bg-black/10 flex items-center justify-center">
                    <div className="w-16 h-1 rounded-full bg-white/20" />
                 </div>
              </div>
            )}
           </div>
        </div>
      </div>
    </div>
  );
}
