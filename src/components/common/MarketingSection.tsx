'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  CreditCard, 
  QrCode, 
  LayoutDashboard, 
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  Send,
  Briefcase,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface FeatureCardProps {
  title: string;
  description: string;
  image: string;
  icon: any;
  index: number;
}

function FeatureCard({ title, description, image, icon: Icon, index }: FeatureCardProps) {
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-[2.5rem] border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2",
        index % 3 === 0 ? "md:col-span-2" : "md:col-span-1"
      )}
    >
      <div className="flex flex-col h-full items-center">
        <div className="p-8 pb-4 relative z-10 flex flex-col items-center text-center w-full">
          <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] mb-6 group-hover:scale-110 transition-transform duration-500">
            <Icon size={24} />
          </div>
          <h3 className="text-2xl font-serif text-[var(--color-texto)] mb-3 leading-tight w-full">{title}</h3>
          <p className="text-[var(--color-texto-suave)] text-sm leading-relaxed max-w-md mx-auto">{description}</p>
        </div>
        <div className={cn(
          "relative mt-auto pt-4 overflow-hidden mask-fade-top w-full",
          index % 3 === 0 ? "aspect-video" : "aspect-[4/5]"
        )}>
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-fondo-card)] via-transparent to-transparent opacity-60" />
        </div>
      </div>
    </div>
  );
}

export function MarketingSection() {
  const [activeTab, setActiveTab] = useState<'CLIENTE' | 'PROVEEDOR'>('CLIENTE');

  const clienteFeatures = [
    {
      title: "Invitación Digital Premium",
      description: "Crea experiencias interactivas que enamoran a tus invitados desde el primer clic.",
      image: "/marketing/invitation.png",
      icon: Send
    },
    {
      title: "Confirmación 100% Digital",
      description: "Gestiona tu lista de invitados con RSVP en tiempo real y asignación de mesas inteligente.",
      image: "/marketing/guests.png",
      icon: Users
    },
    {
      title: "Control de Presupuesto",
      description: "Lleva el control de cada abono y pago a proveedores sin complicaciones ni sorpresas.",
      image: "/marketing/payments.png",
      icon: CreditCard
    },
    {
      title: "Álbum QR Interactivo",
      description: "Tus invitados suben fotos en tiempo real que aparecen al instante en una galería compartida.",
      image: "/marketing/album.png",
      icon: QrCode
    }
  ];

  const proveedorFeatures = [
    {
      title: "Panel de Gestión Profesional",
      description: "Controla tus reservas, calendario y finanzas desde un centro de mando intuitivo.",
      image: "/marketing/provider_dashboard.png",
      icon: LayoutDashboard
    },
    {
      title: "Portafolio de Élite",
      description: "Muestra la calidad de tu trabajo con galerías de alta resolución diseñadas para vender.",
      image: "/marketing/portfolio.png",
      icon: ImageIcon
    }
  ];

  return (
    <section className="w-full pt-8 pb-24 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 flex flex-col items-center">
      <div className="w-full text-center max-w-4xl mx-auto space-y-6 flex flex-col items-center px-4">
        <h2 className="text-5xl md:text-6xl font-serif text-[var(--color-texto)] tracking-tight italic">
          Todo lo que necesitas para tu <span className="text-[#d4af37]">momento especial</span>
        </h2>
        <p className="text-[var(--color-texto-suave)] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          La plataforma más completa para organizar eventos y hacer crecer tu negocio de servicios.
        </p>
      </div>

      {/* --- SELECTOR DE PESTAÑAS (TAMAÑO REAL, SIN SCALE PARA EVITAR TRASLAPE) --- */}
      <div className="flex justify-center pt-16 pb-20 md:pt-12 md:pb-16">
        <div className="relative p-2 bg-[var(--color-fondo-card)] rounded-full shadow-2xl flex items-center border-[2px] border-[var(--color-borde)] overflow-hidden">
          <div 
            className={cn(
              "absolute top-[2px] bottom-[2px] w-[calc(50%-4px)] bg-gradient-to-br from-[#f3cf6d] via-[#d4af37] to-[#b89547] rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 shadow-lg shadow-[#d4af37]/20",
              activeTab === 'CLIENTE' ? "left-[2px]" : "left-[calc(50%+2px)]"
            )}
          />
          <button
            onClick={() => setActiveTab('CLIENTE')}
            className={cn(
              "relative z-10 px-6 py-4 sm:px-12 sm:py-5 rounded-full text-[9px] sm:text-[13px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2 sm:gap-4 min-w-[140px] sm:min-w-[280px]",
              activeTab === 'CLIENTE' ? "text-black" : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
            )}
          >
            <User size={18} className="sm:w-6 sm:h-6" fill={activeTab === 'CLIENTE' ? "black" : "none"} strokeWidth={activeTab === 'CLIENTE' ? 3 : 2} />
            <span className="whitespace-nowrap">Beneficios Usuarios</span>
          </button>
          <button
            onClick={() => setActiveTab('PROVEEDOR')}
            className={cn(
              "relative z-10 px-6 py-4 sm:px-12 sm:py-5 rounded-full text-[9px] sm:text-[13px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2 sm:gap-4 min-w-[140px] sm:min-w-[280px]",
              activeTab === 'PROVEEDOR' ? "text-black" : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
            )}
          >
            <Briefcase size={18} className="sm:w-6 sm:h-6" fill={activeTab === 'PROVEEDOR' ? "black" : "none"} strokeWidth={activeTab === 'PROVEEDOR' ? 3 : 2} />
            <span className="whitespace-nowrap">Beneficios Proveedores</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1200px] px-6">
        {(activeTab === 'CLIENTE' ? clienteFeatures : proveedorFeatures).map((feature, i) => (
          <FeatureCard 
            key={feature.title}
            {...feature}
            index={i}
          />
        ))}

        {/* BANNER CTA HORIZONTAL (OPTIMIZADO PARA MÓVIL: MENOS ALTO) */}
        <div className="md:col-span-3 mt-12 group relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-r from-[#d4af37] via-[#f3cf6d] to-[#b89547] p-6 md:p-12 flex flex-col md:flex-row items-center justify-between text-black shadow-glow-oro hover:shadow-2xl transition-all duration-700 border border-black/5 gap-6 md:gap-16">
           {/* Decoración de fondo */}
           <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-colors duration-700" />
           
           <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 z-10 w-full md:w-auto">
              <div className="shrink-0 w-12 h-12 md:w-20 md:h-20 rounded-full bg-black flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform duration-500">
                <Sparkles size={24} className="md:w-10 md:h-10 text-[#d4af37]" />
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1 md:space-y-2">
                 <h3 className="text-2xl md:text-5xl font-serif leading-tight">Empieza hoy mismo</h3>
                 <p className="text-black/80 text-[8px] md:text-[12px] font-black uppercase tracking-[0.2em]">
                   ES GRATIS Y TE TOMARÁ MENOS DE UN MINUTO.
                 </p>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-12 z-10 w-full md:w-auto">
              <ul className="flex flex-row md:flex-col gap-4 md:gap-2.5">
                 {['Sin tarjetas', 'Acceso total'].map(text => (
                   <li key={text} className="flex items-center gap-2 text-[9px] md:text-[11px] font-black uppercase tracking-[0.15em] text-black/90">
                      <CheckCircle2 size={10} className="text-black" />
                      {text}
                   </li>
                 ))}
                 <li className="hidden md:flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.15em] text-black/90">
                    <CheckCircle2 size={10} className="text-black" /> Soporte VIP
                 </li>
              </ul>

              <Link href="/registro" className="group/btn flex items-center justify-center gap-3 w-full sm:w-auto min-w-[200px] md:min-w-[240px] bg-black text-white px-6 md:px-10 py-3.5 md:py-5 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] hover:translate-y-[-5px] hover:scale-[1.03] transition-all shadow-2xl hover:shadow-black/40">
                 Registrarme Ahora
                 <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-2 transition-transform" />
              </Link>
           </div>
        </div>
      </div>
    </section>
  );
}
