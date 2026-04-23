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

      {/* --- SELECTOR DE PESTAÑAS (FONDO BLANCO, PILL GRUESO) --- */}
      <div className="flex justify-center pt-4">
        <div className="relative p-1 bg-[var(--color-fondo-card)] rounded-full shadow-2xl flex items-center border-[2px] border-[var(--color-borde)] overflow-hidden scale-110">
          <div 
            className={cn(
              "absolute top-[3px] bottom-[3px] w-[calc(50%-4px)] bg-gradient-to-br from-[#f3cf6d] via-[#d4af37] to-[#b89547] rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 shadow-lg shadow-[#d4af37]/20",
              activeTab === 'CLIENTE' ? "left-[3px]" : "left-[calc(50%+1px)]"
            )}
          />
          <button
            onClick={() => setActiveTab('CLIENTE')}
            className={cn(
              "relative z-10 px-10 py-3.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] transition-all duration-500 flex items-center justify-center gap-3 min-w-[160px] sm:min-w-[200px]",
              activeTab === 'CLIENTE' ? "text-black" : "text-[var(--color-texto-muted)] hover:text-[var(--color-texto)]"
            )}
          >
            <User size={18} fill={activeTab === 'CLIENTE' ? "black" : "none"} strokeWidth={activeTab === 'CLIENTE' ? 3 : 2} />
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab('PROVEEDOR')}
            className={cn(
              "relative z-10 px-10 py-3.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] transition-all duration-500 flex items-center justify-center gap-3 min-w-[160px] sm:min-w-[200px]",
              activeTab === 'PROVEEDOR' ? "text-black" : "text-[var(--color-texto-muted)] hover:text-[var(--color-texto)]"
            )}
          >
            <Briefcase size={18} fill={activeTab === 'PROVEEDOR' ? "black" : "none"} strokeWidth={activeTab === 'PROVEEDOR' ? 3 : 2} />
            Proveedores
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

        {/* CTA Card (MÁS COMPACTA Y CENTRADA) */}
        <div className="md:col-span-1 md:col-start-2 group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#d4af37] to-[#b89547] p-8 flex flex-col items-center justify-center text-black shadow-2xl hover:scale-[1.02] transition-all duration-500 text-center gap-8 border border-black/5">
           <div className="space-y-3 flex flex-col items-center">
              <Sparkles size={28} className="text-black" />
              <h3 className="text-3xl font-serif leading-tight">Empieza hoy mismo</h3>
              <p className="text-black/70 text-[10px] font-black uppercase tracking-[0.15em] px-4 max-w-xs">
                ES GRATIS Y TE TOMARÁ MENOS DE UN MINUTO.
              </p>
           </div>
           
           <div className="space-y-6 w-full flex flex-col items-center">
              <ul className="grid grid-cols-1 gap-2">
                 {['Sin tarjetas de crédito', 'Acceso instantáneo', 'Soporte VIP'].map(text => (
                   <li key={text} className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-black/60">
                      <CheckCircle2 size={12} className="text-black" /> {text}
                   </li>
                 ))}
              </ul>
              
              <Link href="/registro" className="group/btn flex items-center justify-between w-full max-w-[240px] bg-black text-white px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:translate-y-[-2px] transition-all shadow-xl">
                 Registrarme Ahora
                 <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
           </div>
        </div>
      </div>
    </section>
  );
}
