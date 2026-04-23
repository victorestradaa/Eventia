'use client';

import React from 'react';
import { User, MapPin, Phone, CheckCircle2, ChevronRight, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ProfileCompleteModalProps {
  onClose: () => void;
}

export default function ProfileCompleteModal({ onClose }: ProfileCompleteModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-[#111] border border-[#d4af37]/30 max-w-lg w-full rounded-[3.5rem] shadow-[0_0_100px_rgba(212,175,55,0.15)] relative overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2" />
        
        <div className="p-10 relative z-10 flex flex-col items-center text-center space-y-8">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-8 p-2 rounded-full hover:bg-white/5 text-[var(--color-texto-muted)] transition-colors"
          >
            <X size={24} />
          </button>

          <div className="w-24 h-24 rounded-[2.5rem] bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/20 shadow-inner">
            <AlertCircle size={48} strokeWidth={1.5} className="animate-pulse" />
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">¡Casi Listo!</h2>
            <p className="text-[var(--color-texto-suave)] text-base font-medium max-w-sm mx-auto leading-relaxed">
              Para empezar a crear eventos y disfrutar de todos los beneficios "ORO", primero necesitamos completar tu perfil personal.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 gap-3 py-6">
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 text-left transition-all hover:border-[#d4af37]/20 group">
              <div className="p-3 bg-[#d4af37]/10 text-[#d4af37] rounded-2xl group-hover:bg-[#d4af37] group-hover:text-black transition-all">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest leading-none mb-1">Paso 1</p>
                <p className="text-sm font-bold text-white">Información Básica y Contacto</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 text-left transition-all hover:border-[#d4af37]/20 group">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest leading-none mb-1">Paso 2</p>
                <p className="text-sm font-bold text-white">Estado y Ciudad de Residencia</p>
              </div>
            </div>
          </div>

          <Link href="/cliente/perfil" className="w-full">
            <button className="w-full bg-gradient-to-r from-[#d4af37] to-[#b89547] text-black py-5 rounded-[2rem] font-black uppercase italic text-sm shadow-2xl shadow-[#d4af37]/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              Completar Perfil Ahora <ChevronRight size={20} strokeWidth={3} />
            </button>
          </Link>

          <p className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest italic opacity-50">Tardará menos de 1 minuto</p>
        </div>
      </div>
    </div>
  );
}
