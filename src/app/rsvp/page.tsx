'use client';

import { CheckCircle2, XCircle, Mail, MapPin, Calendar as CalendarIcon, Users } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function RSVPPage() {
  const [estado, setEstado] = useState<'IDLE' | 'CONFIRMADO' | 'RECHAZADO'>('IDLE');
  const [invitadosCount, setInvitadosCount] = useState(1);
  const [comentario, setComentario] = useState('');

  const evento = {
    nombres: 'Claudia & Roberto',
    fecha: '15 de Diciembre, 2024',
    lugar: 'Jardín Las Rosas, Ciudad de México',
    dressCode: 'Formal / Gala',
    mensaje: 'Esperamos contar con tu presencia en este momento inolvidable.'
  };

  if (estado !== 'IDLE') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]">
        <div className="card max-w-md w-full text-center space-y-6 pt-12 pb-12 border-[var(--color-primario)]/50 shadow-[0_0_50px_rgba(124,58,237,0.2)]">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
            {estado === 'CONFIRMADO' ? <CheckCircle2 size={48} /> : <Mail size={48} />}
          </div>
          <h1 className="text-3xl font-bold">
            {estado === 'CONFIRMADO' ? '¡Gracias por confirmar!' : 'Entendido'}
          </h1>
          <p className="text-[var(--color-texto-suave)] leading-relaxed px-4">
            {estado === 'CONFIRMADO' 
              ? `Hemos registrado tu asistencia (${invitadosCount} personas) para el evento de ${evento.nombres}. ¡Te esperamos!` 
              : `Lamentamos que no puedas acompañarnos, pero agradecemos que nos hayas avisado.`}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-fantasma text-xs px-8"
          >
            Volver a la Invitación
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#C5A059] selection:text-black">
      {/* Background patterns */}
      <div className="fixed inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      
      <div className="relative max-w-2xl mx-auto pt-20 pb-20 px-6 space-y-16">
        {/* Invitation Card */}
        <section className="text-center space-y-8 animate-fade-in">
          <p className="uppercase tracking-[0.5em] text-[10px] font-bold text-[#C5A059]">Nuestra Boda</p>
          <h1 className="text-5xl md:text-7xl font-serif italic text-[#C5A059]">{evento.nombres}</h1>
          <div className="w-20 h-px bg-[#C5A059] mx-auto opacity-50" />
          <p className="text-lg md:text-xl font-light italic leading-relaxed text-zinc-300">
            {evento.mensaje}
          </p>
        </section>

        {/* Info Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="card bg-zinc-900/50 border-zinc-800 p-8 flex flex-col items-center text-center gap-4">
              <CalendarIcon className="text-[#C5A059]" size={32} />
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Cuándo</p>
                <p className="font-bold text-lg">{evento.fecha}</p>
              </div>
           </div>
           <div className="card bg-zinc-900/50 border-zinc-800 p-8 flex flex-col items-center text-center gap-4">
              <MapPin className="text-[#C5A059]" size={32} />
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Dónde</p>
                <p className="font-bold text-lg">{evento.lugar}</p>
              </div>
           </div>
        </section>

        {/* RSVP Form */}
        <section className="card bg-[#111] border-[#C5A059]/30 p-8 md:p-12 space-y-8 shadow-2xl">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-[#C5A059]">Confirmar Asistencia</h2>
            <p className="text-sm text-zinc-500 italic">Por favor, confirma antes del 15 de Noviembre</p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <button 
                onClick={() => setEstado('CONFIRMADO')}
                className="flex-1 btn bg-[#C5A059] text-black hover:bg-[#d4b574] py-4 font-black uppercase text-xs tracking-widest"
              >
                Asistiré
              </button>
              <button 
                onClick={() => setEstado('RECHAZADO')}
                className="flex-1 btn btn-fantasma border-zinc-700 py-4 font-black uppercase text-xs tracking-widest"
              >
                No podré ir
              </button>
            </div>

            {/* Sub-form shown when confirmed (simplified for demo) */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
               <div>
                  <label className="label text-[10px] text-zinc-500">Número de Personas</label>
                  <select 
                    className="input bg-zinc-900 border-zinc-800 text-sm h-12"
                    value={invitadosCount}
                    onChange={(e) => setInvitadosCount(parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Persona' : 'Personas'}</option>)}
                  </select>
               </div>
               <div>
                  <label className="label text-[10px] text-zinc-500">¿Alguna alergia o mensaje especial?</label>
                  <textarea 
                    className="input bg-zinc-900 border-zinc-800 text-sm min-h-[80px] pt-3"
                    placeholder="Escribe aquí..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                  />
               </div>
            </div>
          </div>
        </section>

        <footer className="text-center text-zinc-600 text-[10px] uppercase tracking-widest pt-10">
          Powered by Gestor Eventos Premium
        </footer>
      </div>
    </div>
  );
}
