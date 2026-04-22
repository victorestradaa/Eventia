'use client';

import { X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerName: string;
}

export function RegisterModal({ isOpen, onClose, providerName }: RegisterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-[var(--color-fondo-card)] rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-[var(--color-borde-suave)]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-[var(--color-fondo-input)] text-[var(--color-texto-muted)] hover:text-[var(--color-texto)] hover:bg-[var(--color-fondo-hover)] transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="relative">
          {/* Header Image/Background */}
          <div className="h-32 bg-stone-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--color-fondo-card)] to-transparent" />
          </div>

          <div className="px-8 pb-10 -mt-12 relative">
            <div className="w-20 h-20 bg-[#d4af37] rounded-3xl shadow-xl flex items-center justify-center mb-6 mx-auto border-4 border-[var(--color-fondo-card)] transform -rotate-6">
               <Sparkles className="text-white" size={40} />
            </div>

            <div className="text-center space-y-4 max-w-sm mx-auto">
              <h3 className="text-2xl font-serif text-[var(--color-texto)] leading-tight">
                ¡Descubre todo lo que <span className="text-[#b89547] italic">{providerName}</span> tiene para ti!
              </h3>
              <p className="text-[var(--color-texto-suave)] text-sm leading-relaxed">
                Regístrate gratis en <span className="font-bold text-[var(--color-texto)]">Eventia</span> para acceder a toda la información exclusiva y organizar tu evento sin estrés.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {[
                'Consulta paquetes y precios actualizados',
                'Verifica disponibilidad en tiempo real',
                'Cotiza y reserva directamente',
                'Gestiona todo desde tu panel personal'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 bg-[var(--color-fondo-input)] p-3 rounded-2xl border border-[var(--color-borde-suave)] hover:border-[#eadeba] transition-colors group">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0 group-hover:bg-green-500 group-hover:text-white transition-all">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="text-xs font-bold text-[var(--color-texto)]">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3">
              <Link 
                href="/registro"
                className="w-full bg-[var(--color-primario)] text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest hover:bg-[var(--color-acento)] hover:text-black transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
              >
                Registrarme Ahora
                <ArrowRight size={16} />
              </Link>
              <button 
                onClick={onClose}
                className="w-full py-4 text-[var(--color-texto-muted)] text-[10px] font-black uppercase tracking-widest hover:text-[var(--color-texto)] transition-colors"
              >
                Tal vez más tarde
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
