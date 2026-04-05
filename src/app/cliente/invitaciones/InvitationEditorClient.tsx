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
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { cn, formatearFechaCorta } from '@/lib/utils';

interface InvitationEditorClientProps {
  evento: any;
}

export default function InvitationEditorClient({ evento }: InvitationEditorClientProps) {
  const [plantillaActiva, setPlantillaActiva] = useState(evento?.invitacion?.plantilla || 'gold');
  
  // Usar datos reales del evento como valores iniciales
  const [texto, setTexto] = useState({
    titulo: evento?.invitacion?.titulo || (evento?.tipo === 'Boda' ? '¡Nos Casamos!' : '¡Estás Invitado!'),
    nombres: evento?.nombre || 'Mi Evento Especial',
    mensaje: evento?.invitacion?.mensaje || 'Queremos compartir este día tan especial contigo. Tu presencia es nuestro mejor regalo.',
    vestimenta: evento?.invitacion?.vestimenta || 'Formal / Gala',
    lugar: evento?.invitacion?.lugarTexto || 'Sin asignar'
  });

  const [saving, setSaving] = useState(false);

  const PLANTILLAS = [
    { id: 'gold', name: 'Golden Elegant', color: 'bg-[#C5A059]' },
    { id: 'dark', name: 'Midnight Premium', color: 'bg-indigo-950' },
    { id: 'floral', name: 'Spring Blossom', color: 'bg-rose-100' },
  ];

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

  const handleSave = () => {
    setSaving(true);
    // Aquí iría la acción de guardar en DB (pendiente de implementar en eventActions)
    setTimeout(() => {
      setSaving(false);
      alert('Invitación guardada (Simulación por ahora, pero con datos reales)');
    }, 1000);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <Link href={`/cliente/evento/${evento.id}`} className="flex items-center gap-2 text-sm text-[var(--color-texto-muted)] hover:text-white transition-colors mb-2">
            <ArrowLeft size={16} /> Volver al evento
          </Link>
          <h1 className="text-3xl font-bold italic tracking-tighter uppercase">Editor de Invitación Digital</h1>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secundario gap-2">
            <Eye size={18} /> Previsualizar
          </button>
          <button onClick={handleSave} className="btn btn-primario gap-2" disabled={saving}>
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
            {saving ? 'Guardando...' : 'Guardar y Enviar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Panel de Edición */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card space-y-6">
            <h3 className="font-bold flex items-center gap-2 uppercase text-xs tracking-widest"><Palette size={16} className="text-[var(--color-primario-claro)]" /> Estilo y Plantilla</h3>
            <div className="grid grid-cols-1 gap-3">
              {PLANTILLAS.map((p) => (
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
        </div>

        {/* Simulador de Invitación */}
        <div className="lg:col-span-8">
           <div className="sticky top-32 flex justify-center">
              <div className={cn(
                "w-full max-w-[400px] aspect-[9/16] rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-zinc-900 relative transition-all duration-500",
                plantillaActiva === 'gold' ? "bg-[#1a1a1a] text-[#C5A059]" : plantillaActiva === 'dark' ? "bg-black text-indigo-400" : "bg-white text-rose-500"
              )}>
                 <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-6">
                    <p className="uppercase tracking-[0.3em] text-[10px] font-black opacity-80">{texto.titulo}</p>
                    <h2 className="text-4xl font-serif italic">{texto.nombres}</h2>
                    
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
                         "w-full py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg",
                         plantillaActiva === 'gold' ? "bg-[#C5A059] text-black" : plantillaActiva === 'dark' ? "bg-indigo-600 text-white" : "bg-rose-500 text-white"
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
           </div>
        </div>
      </div>
    </div>
  );
}
