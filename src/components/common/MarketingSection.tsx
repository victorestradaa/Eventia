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
  Send
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
      <div className="flex flex-col h-full">
        <div className="p-8 pb-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] mb-6 group-hover:scale-110 transition-transform duration-500">
            <Icon size={24} />
          </div>
          <h3 className="text-2xl font-serif text-[var(--color-texto)] mb-3 leading-tight">{title}</h3>
          <p className="text-[var(--color-texto-suave)] text-sm leading-relaxed max-w-xs">{description}</p>
        </div>
        
        <div className={cn(
          "relative mt-auto pt-4 overflow-hidden mask-fade-top",
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
      <div className="w-full text-center max-w-4xl mx-auto space-y-6 flex flex-col items-center">
        <h2 className="text-5xl md:text-6xl font-serif text-[var(--color-texto)] tracking-tight italic">
          Todo lo que necesitas para tu <span className="text-[#d4af37]">momento especial</span>
        </h2>
        <p className="text-[var(--color-texto-suave)] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          La plataforma más completa para organizar eventos y hacer crecer tu negocio de servicios.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-full shadow-inner">
          <button
            onClick={() => setActiveTab('CLIENTE')}
            className={cn(
              "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300",
              activeTab === 'CLIENTE' 
                ? "bg-[var(--color-primario)] text-white shadow-lg" 
                : "text-[var(--color-texto-muted)] hover:text-[var(--color-texto)]"
            )}
          >
            Para Organizadores
          </button>
          <button
            onClick={() => setActiveTab('PROVEEDOR')}
            className={cn(
              "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300",
              activeTab === 'PROVEEDOR' 
                ? "bg-[var(--color-primario)] text-white shadow-lg" 
                : "text-[var(--color-texto-muted)] hover:text-[var(--color-texto)]"
            )}
          >
            Para Proveedores
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(activeTab === 'CLIENTE' ? clienteFeatures : proveedorFeatures).map((feature, i) => (
          <FeatureCard 
            key={feature.title}
            {...feature}
            index={i}
          />
        ))}

        {/* CTA Card */}
        <div className="md:col-span-1 group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#d4af37] to-[#b89547] p-10 flex flex-col justify-between text-black shadow-2xl hover:scale-[1.02] transition-all duration-500">
           <div className="space-y-4">
              <Sparkles size={32} className="mb-4" />
              <h3 className="text-4xl font-serif leading-tight">Empieza hoy mismo</h3>
              <p className="text-black/80 text-sm font-bold uppercase tracking-widest">Es gratis y te tomará menos de un minuto.</p>
           </div>
           
           <div className="space-y-6">
              <ul className="space-y-3">
                 {['Sin tarjetas de crédito', 'Acceso instantáneo', 'Soporte VIP'].map(text => (
                   <li key={text} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 size={14} /> {text}
                   </li>
                 ))}
              </ul>
              
              <Link href="/registro" className="group/btn flex items-center justify-between w-full bg-black text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all shadow-xl">
                 Registrarme Ahora
                 <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
           </div>
        </div>
      </div>
    </section>
  );
}
