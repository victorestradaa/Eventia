'use client';

import { Check, Star, Zap, Crown, DollarSign, Loader2, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { createCheckoutSession } from '@/lib/actions/stripeActions';

const PLANES_CLIENTE = [
  {
    id: 'FREE',
    nombre: 'Plan Básico',
    precio: 0,
    descripcion: 'Para organizar un solo evento especial.',
    icon: Heart,
    features: [
      'Gestión de 1 evento activo',
      'Buscador de proveedores estándar',
      'Lista de invitados básica',
      'Control de presupuesto',
      'Acceso por 3 meses'
    ],
    color: 'border-white/10'
  },
  {
    id: 'ORO',
    nombre: 'Plan Oro',
    precio: 99,
    descripcion: 'Para quienes buscan la excelencia.',
    icon: Sparkles,
    features: [
      'Gestión de 2 eventos activos',
      'Herramientas de asientos inteligentes',
      'Exportación de reportes PDF',
      'Acceso por 12 meses',
      'Sin publicidad de terceros',
      'Soporte prioritario'
    ],
    color: 'border-yellow-500/50 shadow-yellow-500/10'
  },
  {
    id: 'PLANNER',
    nombre: 'Plan Planner',
    precio: 299,
    descripcion: 'El estándar para profesionales.',
    icon: Crown,
    features: [
      'Eventos ILIMITADOS activos',
      'Panel de multi-eventos avanzado',
      'Colaboración con otros usuarios',
      'Acceso ILIMITADO en el tiempo',
      'Personalización de marca blanca',
      'Gestión de pagos a proveedores'
    ],
    popular: true,
    color: 'border-[var(--color-primario-claro)] shadow-[var(--color-primario)]/20'
  }
];

interface ClientPlanesClientProps {
  planActual: string;
}

export default function ClientPlanesClient({ planActual }: ClientPlanesClientProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === 'FREE') return;
    
    setLoading(planId);
    const stripePlanId = `CLIENTE_${planId}` as any;
    
    const res = await createCheckoutSession(stripePlanId);
    
    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      alert(res.error || 'No se pudo iniciar el proceso de pago.');
      setLoading(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-1 rounded-full bg-[var(--color-primario)]/10 text-[var(--color-primario-claro)] text-[10px] font-black uppercase tracking-widest mb-2">
          Membresías Premium
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Lleva tu organización al siguiente nivel</h1>
        <p className="text-[var(--color-texto-suave)] max-w-2xl mx-auto text-lg">
          Desbloquea herramientas avanzadas y gestiona múltiples eventos sin límites.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {PLANES_CLIENTE.map((plan) => {
          const isActual = planActual === plan.id;
          const isSelected = loading === plan.id;
          const Icon = plan.icon;

          return (
            <div 
              key={plan.id} 
              className={cn(
                "card relative flex flex-col p-8 transition-all hover:translate-y-[-8px] duration-300",
                plan.color,
                isActual && "ring-2 ring-[var(--color-primario-claro)]",
                plan.popular && "bg-gradient-to-b from-white/[0.03] to-transparent"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[10px] font-black uppercase px-6 py-1.5 rounded-full shadow-xl">
                  Más Popular
                </div>
              )}

              {isActual && !plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase px-4 py-1 rounded-full border border-white/20">
                  Tu Plan Actual
                </div>
              )}

              <div className="mb-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner",
                  plan.id === 'FREE' ? "bg-white/5 text-white" : 
                  plan.id === 'ORO' ? "bg-yellow-500/10 text-yellow-500" : "bg-violet-500/10 text-violet-400"
                )}>
                  <Icon size={28} />
                </div>
                <h3 className="text-2xl font-black tracking-tight">{plan.nombre}</h3>
                <p className="text-sm text-[var(--color-texto-suave)] mt-2 font-medium">{plan.descripcion}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter">${plan.precio}</span>
                  <span className="text-sm text-[var(--color-texto-muted)] uppercase font-extrabold">MXN</span>
                </div>
                {plan.precio > 0 && (
                  <p className="text-[10px] text-[var(--color-primario-claro)] font-bold mt-1 uppercase tracking-widest">
                    Pago único según vigencia
                  </p>
                )}
              </div>

              <div className="space-y-5 mb-10 flex-grow">
                <p className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest">Incluye:</p>
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-[var(--color-texto-suave)]">
                      <div className="mt-1 p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check size={12} strokeWidth={4} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => handleUpgrade(plan.id)}
                className={cn(
                  "btn w-full py-5 font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95",
                  isActual 
                    ? "bg-white/5 text-[var(--color-texto-muted)] cursor-not-allowed border border-white/5" 
                    : plan.popular 
                      ? "btn-primario bg-gradient-to-r from-violet-600 to-fuchsia-600 border-none hover:shadow-violet-500/40"
                      : "btn-secundario hover:bg-white/10"
                )}
                disabled={isActual || !!loading}
              >
                {isSelected ? (
                  <Loader2 className="animate-spin mx-auto" size={20} />
                ) : (
                  isActual ? 'Plan Activo' : `Obtener ${plan.nombre}`
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparison or Trust Badge Section */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-12 py-8 border-t border-white/5">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
               <Check size={24} />
            </div>
            <div>
               <p className="font-bold text-sm">Pago Seguro</p>
               <p className="text-[10px] text-[var(--color-texto-muted)]">Cifrado de 256 bits vía Stripe</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
               <Zap size={24} />
            </div>
            <div>
               <p className="font-bold text-sm">Activación Instantánea</p>
               <p className="text-[10px] text-[var(--color-texto-muted)]">Tus funciones se activan al pagar</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
               <Star size={24} />
            </div>
            <div>
               <p className="font-bold text-sm">Garantía de Satisfacción</p>
               <p className="text-[10px] text-[var(--color-texto-muted)]">Soporte dedicado para tu gran día</p>
            </div>
         </div>
      </section>
    </div>
  );
}
