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
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function InvitationEditorPage() {
  const [plantillaActiva, setPlantillaActiva] = useState('gold');
  const [texto, setTexto] = useState({
    titulo: '¡Nos Casamos!',
    nombres: 'Claudia & Roberto',
    mensaje: 'Queremos compartir este día tan especial contigo. Tu presencia es nuestro mejor regalo.',
    vestimenta: 'Formal / Gala',
    lugar: 'Jardín Las Rosas, CDMX'
  });

  const PLANTILLAS = [
    { id: 'gold', name: 'Golden Elegant', color: 'bg-[#C5A059]' },
    { id: 'dark', name: 'Midnight Premium', color: 'bg-indigo-950' },
    { id: 'floral', name: 'Spring Blossom', color: 'bg-rose-100' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <Link href="/cliente/dashboard" className="flex items-center gap-2 text-sm text-[var(--color-texto-muted)] hover:text-white transition-colors mb-2">
            <ArrowLeft size={16} /> Volver al evento
          </Link>
          <h1 className="text-3xl font-bold">Editor de Invitación Digital</h1>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secundario gap-2">
            <Eye size={18} /> Previsualización
          </button>
          <button className="btn btn-primario gap-2">
            <Send size={18} /> Enviar a Invitados
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Panel de Edición (Izquierda) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card space-y-6">
            <h3 className="font-bold flex items-center gap-2"><Palette size={18} className="text-[var(--color-primario-claro)]" /> Estilo y Plantilla</h3>
            <div className="grid grid-cols-1 gap-3">
              {PLANTILLAS.map((p) => (
                <button 
                  key={p.id}
                  onClick={() => setPlantillaActiva(p.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                    plantillaActiva === p.id ? "border-[var(--color-primario)] bg-[var(--color-primario)]/10" : "border-[var(--color-borde-suave)] hover:border-white/20"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-lg shadow-inner", p.color)} />
                  <span className="text-sm font-medium">{p.name}</span>
                  {plantillaActiva === p.id && <CheckCircle2 size={16} className="ml-auto text-[var(--color-primario-claro)]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="card space-y-6">
            <h3 className="font-bold flex items-center gap-2"><Type size={18} className="text-[var(--color-acento-claro)]" /> Información del Evento</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Título</label>
                <input 
                  type="text" 
                  className="input text-sm" 
                  value={texto.titulo} 
                  onChange={(e) => setTexto({...texto, titulo: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Nombres / Protagonistas</label>
                <input 
                  type="text" 
                  className="input text-sm" 
                  value={texto.nombres}
                  onChange={(e) => setTexto({...texto, nombres: e.target.value})} 
                />
              </div>
              <div>
                <label className="label">Mensaje de bienvenida</label>
                <textarea 
                  className="input text-sm min-h-[100px] resize-none" 
                  value={texto.mensaje}
                  onChange={(e) => setTexto({...texto, mensaje: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Código de Vestimenta</label>
                <input 
                  type="text" 
                  className="input text-sm" 
                  value={texto.vestimenta}
                  onChange={(e) => setTexto({...texto, vestimenta: e.target.value})}
                />
              </div>
            </div>
          </div>

           <div className="card bg-gradient-to-br from-[var(--color-primario)]/20 to-transparent border-[var(--color-primario)]/30">
              <div className="flex gap-3">
                 <Sparkles className="text-amber-400 shrink-0" size={20} />
                 <p className="text-xs text-[var(--color-texto-suave)] leading-relaxed">
                   Las invitaciones digitales incluyen un link único de **RSVP** para cada invitado. Podrás ver quién confirma en tiempo real en tu lista de invitados.
                 </p>
              </div>
           </div>
        </div>

        {/* Simulador de Invitación (Derecha) */}
        <div className="lg:col-span-8">
           <div className="sticky top-32 flex justify-center">
              <div className={cn(
                "w-full max-w-[400px] aspect-[9/16] rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-zinc-900 relative transition-all duration-500",
                plantillaActiva === 'gold' ? "bg-[#1a1a1a] text-[#C5A059]" : plantillaActiva === 'dark' ? "bg-black text-indigo-400" : "bg-white text-rose-500"
              )}>
                 {/* Decorative elements based on template */}
                 {plantillaActiva === 'gold' && (
                    <div className="absolute inset-0 border-[20px] border-[#C5A059]/10 pointer-events-none" />
                 )}

                 <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-6">
                    <p className="uppercase tracking-[0.3em] text-xs font-bold opacity-80">{texto.titulo}</p>
                    <h2 className={cn(
                      "text-4xl font-serif italic",
                      plantillaActiva === 'gold' ? "text-[#C5A059]" : "text-inherit"
                    )}>{texto.nombres}</h2>
                    
                    <div className="w-12 h-px bg-current opacity-30 my-4" />
                    
                    <p className="text-sm leading-relaxed opacity-90 italic">"{texto.mensaje}"</p>
                    
                    <div className="space-y-4 pt-10">
                       <div className="flex items-center gap-2 justify-center text-xs font-bold">
                          <CalendarIcon size={14} /> 15 · DICIEMBRE · 2024
                       </div>
                       <div className="flex items-center gap-2 justify-center text-xs font-bold">
                          <MapPin size={14} /> {texto.lugar}
                       </div>
                    </div>

                    <div className="pt-10 space-y-2">
                       <p className="text-[10px] uppercase tracking-widest opacity-60">Dress Code</p>
                       <p className="text-sm font-bold uppercase">{texto.vestimenta}</p>
                    </div>

                    <div className="mt-auto w-full pt-10">
                       <button className={cn(
                         "w-full py-4 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg",
                         plantillaActiva === 'gold' ? "bg-[#C5A059] text-black" : "bg-indigo-600 text-white"
                       )}>
                         Confirmar Asistencia
                       </button>
                    </div>
                 </div>
                 
                 {/* Top mock status bar */}
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

// Helper para clases dinámicas (replicando el utils.ts por si no está disponible o para claridad)
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
