'use client';

import React from 'react';
import { X, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface ProfileCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileCompleteModal({ isOpen, onClose }: ProfileCompleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-[var(--color-fondo-card)] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-amber-500/30">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-[var(--color-fondo-input)] text-[var(--color-texto-muted)] hover:text-[var(--color-texto)] hover:bg-[var(--color-fondo-hover)] transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="relative pt-12 pb-10 px-8 text-center">
            <div className="w-24 h-24 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-6 mx-auto border-2 border-amber-500/20">
               <AlertCircle className="text-amber-500" size={48} />
            </div>

            <h3 className="text-2xl font-serif italic font-bold text-white mb-4">
               ¡Casi listo para vender!
            </h3>
            
            <p className="text-[var(--color-texto-suave)] text-sm leading-relaxed mb-8 max-w-sm mx-auto">
               Para poder crear y publicar tus servicios en <span className="text-white font-bold">Eventia</span>, es necesario completar primero los datos básicos de tu negocio (Estado, Municipio, Dirección y Categoría).
            </p>

            <div className="space-y-3 bg-[var(--color-fondo-input)]/50 p-6 rounded-3xl border border-[var(--color-borde-suave)] mb-8 text-left">
               <div className="flex items-center gap-3 text-xs font-bold text-[var(--color-texto-suave)]">
                  <ShieldCheck size={16} className="text-blue-400" /> Datos Requeridos:
               </div>
               <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Estado', 'Municipio', 'Dirección', 'Categoría', 'Nombre'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[11px] text-[var(--color-texto-muted)] font-bold uppercase tracking-widest bg-black/20 px-3 py-2 rounded-xl">
                       <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                       {item}
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex flex-col gap-3">
               <Link 
                  href="/proveedor/configuracion"
                  className="w-full bg-[#d4af37] text-black py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest hover:bg-[#ffe594] transition-all shadow-xl shadow-[#d4af37]/20"
               >
                  Completar Perfil Ahora
                  <ArrowRight size={16} />
               </Link>
               <button 
                  onClick={onClose}
                  className="w-full py-4 text-[var(--color-texto-muted)] text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
               >
                  Hacerlo más tarde
               </button>
            </div>
        </div>
      </div>
    </div>
  );
}
