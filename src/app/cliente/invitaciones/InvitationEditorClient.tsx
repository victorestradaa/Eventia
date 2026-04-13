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
  FileBox,
  EyeOff,
  MessageCircle,
  Mail,
  Copy,
  Users
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import InvitationCanvas from '@/components/cliente/invitaciones/InvitationCanvas';

interface InvitationEditorClientProps {
  evento: any;
  fondos?: any[];
  fuentes?: any[];
}

export default function InvitationEditorClient({ evento, fondos = [], fuentes = [] }: InvitationEditorClientProps) {
  const router = useRouter();
  
  // Pestañas
  const [tabActiva, setTabActiva] = useState<'EDITOR' | 'ENVIAR'>('EDITOR');
  
  // Modos de editor
  const [modoPropia, setModoPropia] = useState(evento?.invitacion?.isInvitacionPropia || false);
  const [archivoAdjuntoBase64, setArchivoAdjuntoBase64] = useState<string | null>(evento?.invitacion?.archivoAdjunto || null);
  const [fondoUrlActivo, setFondoUrlActivo] = useState(evento?.invitacion?.fondoUrl || '');

  const getInitialEstilos = () => {
    const defCol = evento?.invitacion?.colorTexto && !evento.invitacion.colorTexto.startsWith('{') 
      ? evento.invitacion.colorTexto : '#ffffff';
      
    const defaults: any = {
      titulo: { color: defCol, fuente: '', fontSize: 10, x: 28, y: 120, width: 344, height: 40, visible: true },
      nombres: { color: defCol, fuente: '', fontSize: 36, x: 28, y: 160, width: 344, height: 60, visible: true },
      mensaje: { color: defCol, fuente: '', fontSize: 14, x: 28, y: 260, width: 344, height: 80, visible: true },
      lugar: { color: defCol, fuente: '', fontSize: 12, x: 28, y: 400, width: 344, height: 60, visible: true },
      vestimenta: { color: defCol, fuente: '', fontSize: 14, x: 28, y: 490, width: 344, height: 60, visible: true },
      boton: { color: defCol, visible: true }
    };

    try {
      if (evento?.invitacion?.colorTexto) {
         const parsed = typeof evento.invitacion.colorTexto === 'string' 
           ? JSON.parse(evento.invitacion.colorTexto) 
           : evento.invitacion.colorTexto;
           
         if (parsed && typeof parsed === 'object') {
           const merged = { ...defaults };
           Object.keys(merged).forEach(k => {
              if (parsed[k]) {
                merged[k] = { ...merged[k], ...parsed[k] };
              }
           });
           return merged;
         }
      }
    } catch(e) {
      console.error("Error al parsear estilos de invitación", e);
    }
    
    return defaults;
  };

  const [estilos, setEstilos] = useState(getInitialEstilos());
  
  const [texto, setTexto] = useState({
    titulo: evento?.invitacion?.titulo || (evento?.tipo === 'BODA' ? '¡Nos Casamos!' : '¡Estás Invitado!'),
    nombres: evento?.nombre || 'Mi Evento Especial',
    mensaje: evento?.invitacion?.mensaje || 'Queremos compartir este día tan especial contigo. Tu presencia es nuestro mejor regalo.',
    vestimenta: evento?.invitacion?.vestimenta || 'Formal / Gala',
    lugar: evento?.invitacion?.lugarTexto || 'Sin asignar'
  });

  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitialCategoria = () => {
    const t = evento?.tipo?.toUpperCase() || '';
    if (t.includes('BODA')) return 'BODA';
    if (t.includes('XV')) return 'XV_ANOS';
    if (t.includes('BAUTIZO')) return 'BAUTIZO';
    if (t.includes('INFANTIL')) return 'FIESTA_INFANTIL';
    return 'TODAS';
  };

  const [filtroCategoria, setFiltroCategoria] = useState(getInitialCategoria());
  const fondosFiltrados = fondos.filter(f => 
    filtroCategoria === 'TODAS' ? true : (f.categoria === filtroCategoria || f.categoria === 'TODAS')
  );

  useEffect(() => {
    if (fondosFiltrados.length > 0 && !fondoUrlActivo) {
      setFondoUrlActivo(fondosFiltrados[0].url);
    }
  }, [filtroCategoria, fondosFiltrados, fondoUrlActivo]);


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
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setArchivoAdjuntoBase64(reader.result as string);
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
        plantilla: 'custom', 
        fondoUrl: fondoUrlActivo,
        colorTexto: JSON.stringify(estilos),
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

      if (!res.ok) throw new Error('Error al guardar la invitación');
      alert('Invitación guardada exitosamente');
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = (id: string) => {
    setEstilos({
      ...estilos,
      [id]: { ...estilos[id], visible: !estilos[id].visible }
    });
  };

  const renderCampo = (id: keyof typeof texto, label: string, isTextarea = false) => (
    <div className={cn("space-y-1 relative mb-4 transition-opacity", !estilos[id]?.visible && "opacity-40")}>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
           <button 
             onClick={() => toggleVisibility(id)}
             className={cn("p-1 rounded hover:bg-white/10 transition-colors", estilos[id]?.visible ? "text-white/80" : "text-amber-500")}
             title={estilos[id]?.visible ? "Ocultar campo" : "Mostrar campo"}
           >
             {estilos[id]?.visible ? <Eye size={14} /> : <EyeOff size={14} />}
           </button>
           <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] block truncate max-w-[120px]">{label}</label>
        </div>
        <div className="flex items-center gap-1.5">
           <input 
             type="color" 
             value={estilos[id]?.color || '#ffffff'}
             onChange={(e) => setEstilos({...estilos, [id]: {...estilos[id], color: e.target.value}})}
             className="h-5 w-5 rounded cursor-pointer border-0 p-0 shadow-sm flex-shrink-0"
           />
           <input 
             type="number"
             value={estilos[id]?.fontSize || 16}
             onChange={(e) => setEstilos({...estilos, [id]: {...estilos[id], fontSize: Number(e.target.value)}})}
             className="w-10 text-[10px] bg-black/40 border border-white/10 rounded px-1 py-1 outline-none text-white/80"
           />
           <select
             value={estilos[id]?.fuente || ''}
             onChange={(e) => setEstilos({...estilos, [id]: {...estilos[id], fuente: e.target.value}})}
             className="text-[10px] bg-black/40 border border-white/10 rounded px-1 py-1 outline-none text-white/80 max-w-[70px]"
           >
             <option value="">Fuentes</option>
             {fuentes.map(f => <option key={f.id} value={f.nombre}>{f.nombre}</option>)}
           </select>
        </div>
      </div>
      {isTextarea ? (
        <textarea 
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all text-sm min-h-[80px] resize-none" 
          value={texto[id]}
          onChange={(e) => setTexto({...texto, [id]: e.target.value})}
        />
      ) : (
        <input 
          type="text" 
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all text-sm" 
          value={texto[id]} 
          onChange={(e) => setTexto({...texto, [id]: e.target.value})}
        />
      )}
    </div>
  );

  const handleShareWhatsApp = (invitado: any) => {
    const url = `${window.location.origin}/invitacion/${invitado.rsvpToken}`;
    const mensaje = `¡Hola ${invitado.nombre}! Te invito a mi evento, aquí tienes tu invitación digital para confirmar tu asistencia: ${url}`;
    window.open(`https://wa.me/${invitado.telefono?.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/invitacion/${token}`;
    navigator.clipboard.writeText(url);
    alert('¡Enlace copiado al portapapeles!');
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <style dangerouslySetInnerHTML={{__html: fuentes.map(f => `
        @font-face {
          font-family: '${f.nombre}';
          src: url('${f.url}');
        }
      `).join('\n')}} />

      {/* Header Fijo dentro del contenedor del cliente */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
           <Link href={`/cliente/evento/${evento.id}`} className="flex items-center gap-2 text-xs text-[var(--color-texto-muted)] hover:text-white transition-colors mb-2">
            <ArrowLeft size={14} /> Volver al evento
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-black italic tracking-tighter uppercase whitespace-nowrap">Gestor de Invitaciones</h1>
            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-white/50 uppercase tracking-widest">
              {evento.tipo?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
            <button 
              onClick={() => setTabActiva('EDITOR')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 flex items-center gap-2.5", 
                tabActiva === 'EDITOR' 
                  ? "bg-white text-black shadow-lg scale-105" 
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <Palette size={14} className={tabActiva === 'EDITOR' ? "text-black" : "text-white/40"} /> 
              Diseñador
            </button>
            <button 
              onClick={() => setTabActiva('ENVIAR')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 flex items-center gap-2.5", 
                tabActiva === 'ENVIAR' 
                  ? "bg-white text-black shadow-lg scale-105" 
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <Users size={14} className={tabActiva === 'ENVIAR' ? "text-black" : "text-white/40"} /> 
              Enviar ({evento.invitados?.length || 0})
            </button>
          </div>
          {tabActiva === 'EDITOR' && (
            <button onClick={handleSave} className="btn btn-primario gap-2 px-6 shadow-xl" disabled={saving}>
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
              {saving ? 'Guardando...' : 'Guardar Diseño'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Panel Izquierdo: Controles */}
        <div className="lg:col-span-4 space-y-6">
          {tabActiva === 'EDITOR' ? (
            <>
              <div className="flex bg-black/60 p-1.5 rounded-2xl w-full border border-white/5">
                <button 
                  onClick={() => setModoPropia(false)}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", 
                    !modoPropia ? "bg-[var(--color-primario)] text-white shadow-lg" : "text-white/60 hover:text-white"
                  )}
                >
                  <Sparkles size={16} /> Automático
                </button>
                <button 
                  onClick={() => setModoPropia(true)}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", 
                    modoPropia ? "bg-[var(--color-acento)] text-white shadow-lg" : "text-white/60 hover:text-white"
                  )}
                >
                  <Upload size={16} /> Mi Diseño
                </button>
              </div>

              {!modoPropia ? (
                <>
                  <div className="card space-y-4">
                    <h3 className="font-black flex items-center gap-2 uppercase text-[10px] tracking-widest text-white/30"><Palette size={14} className="text-[var(--color-primario-claro)]" /> Galería de Estilos</h3>
                    <div>
                      <select 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[var(--color-primario-claro)] mb-4" 
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                      >
                        <option value="TODAS">Todos los temas</option>
                        <option value="BODA">Boda</option>
                        <option value="XV_ANOS">XV Años</option>
                        <option value="BAUTIZO">Bautizo</option>
                      </select>
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {fondosFiltrados.map((f) => (
                          <button 
                            key={f.id}
                            onClick={() => setFondoUrlActivo(f.url)}
                            className={cn(
                              "relative rounded-lg border transition-all overflow-hidden aspect-[9/16]",
                              fondoUrlActivo === f.url ? "border-[var(--color-primario)] ring-2 ring-[var(--color-primario)] scale-95" : "border-white/5 hover:border-white/20"
                            )}
                          >
                            <img src={f.url} alt={f.nombre} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card space-y-4">
                    <h3 className="font-black flex items-center gap-2 uppercase text-[10px] tracking-widest text-white/30"><Type size={14} className="text-[var(--color-acento-claro)]" /> Tipografías y Textos</h3>
                    <div className="space-y-1">
                      {renderCampo('titulo', 'Frase inicial')}
                      {renderCampo('nombres', 'Protagonistas')}
                      {renderCampo('mensaje', 'Mensaje Invitación', true)}
                      {renderCampo('lugar', 'Ubicación')}
                      {renderCampo('vestimenta', 'Vestimenta')}
                    </div>
                    <div className="pt-4 border-t border-white/5">
                       <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => toggleVisibility('boton')}
                              className={cn("p-1.5 rounded-lg transition-colors", estilos.boton?.visible ? "bg-white/5 text-white" : "bg-amber-500/10 text-amber-500")}
                            >
                              {estilos.boton?.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                            <label className="text-[10px] font-black uppercase text-white/50 tracking-widest">Botón RSVP</label>
                          </div>
                          <input 
                            type="color" 
                            value={estilos.boton?.color || '#ffffff'}
                            onChange={(e) => setEstilos({...estilos, boton: {...estilos.boton, color: e.target.value}})}
                            className="h-8 w-8 rounded-lg cursor-pointer border-0 p-0 shadow-lg"
                          />
                       </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="card space-y-6">
                   <h3 className="font-black flex items-center gap-2 uppercase text-[10px] tracking-widest text-white/30"><FileBox size={14} /> Tu Archivo Maestro</h3>
                   <div 
                    className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 hover:bg-white/5 hover:border-[var(--color-acento)] transition-all cursor-pointer text-center group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={32} className="text-white/20 group-hover:text-[var(--color-acento)] transition-all" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tighter">Arrastra tu diseño aquí</p>
                      <p className="text-[10px] text-white/20 mt-1">Soporta PNG, JPG, WEBP (Max 5MB)</p>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                  </div>
                  {archivoAdjuntoBase64 && (
                    <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl flex items-center gap-4">
                       <div className="w-12 h-12 rounded bg-black overflow-hidden"><img src={archivoAdjuntoBase64} className="w-full h-full object-cover" /></div>
                       <p className="text-[10px] font-black uppercase text-green-500">Diseño cargado con éxito</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="card space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black flex items-center gap-2 uppercase text-xs tracking-widest"><Users size={16} /> Lista de Invitados</h3>
                <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-white/40">{evento.invitados?.length || 0}</span>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {evento.invitados?.map((invitado: any) => (
                  <div key={invitado.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-[var(--color-primario)]/30 transition-all">
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{invitado.nombre}</p>
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-wider">{invitado.telefono || 'Sin teléfono'}</p>
                    </div>
                    <div className="flex gap-2">
                      {invitado.telefono && (
                        <button 
                          onClick={() => handleShareWhatsApp(invitado)}
                          className="p-2.5 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-lg"
                        >
                          <MessageCircle size={16} />
                        </button>
                      )}
                      <button 
                         onClick={() => copyToClipboard(invitado.rsvpToken)}
                         className="p-2.5 bg-white/5 text-white/40 rounded-xl hover:bg-white/20 hover:text-white transition-all"
                      >
                         <Copy size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {(!evento.invitados || evento.invitados.length === 0) && (
                  <div className="text-center py-20 opacity-30">
                    <Users size={48} className="mx-auto mb-4 text-white/20" />
                    <p className="text-sm font-bold uppercase tracking-widest">No hay invitados aún</p>
                    <Link href={`/cliente/evento/${evento.id}`} className="text-xs underline mt-4 inline-block hover:text-white">Registrar invitados</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Panel Derecho: Simulador Fijo */}
        <div className="lg:col-span-8 flex justify-center sticky top-10">
           <div className="relative group">
             {/* Glow decorativo detrás del canvas */}
             <div className="absolute -inset-10 bg-[var(--color-primario)]/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-[var(--color-primario)]/10 transition-all duration-1000" />
             <InvitationCanvas 
              estilos={estilos} 
              texto={texto} 
              fondoUrlActivo={fondoUrlActivo} 
              isEditing={tabActiva === 'EDITOR'} 
              onEstiloChange={(id, val) => setEstilos({...estilos, [id]: val})} 
              evento={evento}
              archivoAdjuntoPropio={archivoAdjuntoBase64}
              modoPropia={modoPropia}
              onRSVPClick={() => alert('Esto abrirá el formulario RSVP para tu invitado')}
             />
           </div>
        </div>
      </div>
    </div>
  );
}
