'use client';

import { Check, Star, Zap, Crown, DollarSign, Loader2, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { createCheckoutSession } from '@/lib/actions/stripeActions';

const PLANES = [
  {
    id: 'FREE',
    nombre: 'Plan Básico',
    precio: 0,
    comision: '10%',
    descripcion: 'Para proveedores que están empezando.',
    icon: Zap,
    features: [
      'Hasta 3 fotos por producto',
      'Gestión de calendario básica',
      'Comisión del 10% por evento',
      'Soporte vía email'
    ],
    color: 'border-white/10'
  },
  {
    id: 'INTERMEDIO',
    nombre: 'Plan Destacado',
    precio: 199,
    comision: '6%',
    descripcion: 'Mayor visibilidad y menores comisiones.',
    icon: Star,
    features: [
      'Perfil destacado en el buscador',
      'Fotos y videos en productos',
      'Analíticas de visitas',
      'Comisión del 6% por evento',
      'Soporte prioritario',
      'Etiqueta de Verificado'
    ],
    color: 'border-blue-500/50 shadow-blue-500/10'
  },
  {
    id: 'PREMIUM',
    nombre: 'Plan PRO',
    precio: 649,
    comision: '3%',
    descripcion: 'Dominio total del mercado local.',
    icon: Crown,
    features: [
      'Aparición en el Top de resultados',
      'Mínima comisión del 3%',
      'Sello de Proveedor Premium',
      'Soporte 24/7 dedicado',
      'Publicidad en el Dashboard cliente',
      'Panel de reportes avanzado',
      'Control de ventas total'
    ],
    color: 'border-amber-500/50 shadow-amber-500/10'
  },
  {
    id: 'ELITE',
    nombre: 'Plan Elite',
    precio: 999,
    comision: '0%',
    descripcion: 'Sin comisiones. Libertad absoluta.',
    icon: Gem,
    features: [
      'Todo lo del Plan PRO incluido',
      '0% de comisión por evento',
      'Ventas manuales fuera de la app',
      'Congelar y apartar fechas sin restricción',
      'Registro de clientes externos',
      'Máxima prioridad en soporte',
      'Acceso anticipado a nuevas funciones'
    ],
    color: 'border-emerald-500/50 shadow-emerald-500/10'
  }
];

interface PlanesClientProps {
  planActual: string;
}

export default function PlanesClient({ planActual }: PlanesClientProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === 'FREE') return;
    
    setLoading(planId);
    // Mapeo al ID esperado por Stripe Actions
    const stripePlanId = `PROVEEDOR_${planId}` as any;
    
    const res = await createCheckoutSession(stripePlanId);
    
    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      alert(res.error || 'No se pudo iniciar el proceso de pago.');
      setLoading(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Potencia tu Negocio</h1>
        <p className="text-[var(--color-texto-suave)] max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tu nivel de crecimiento. Más visibilidad significa más eventos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANES.map((plan) => {
          const isActual = planActual === plan.id;
          const isSelected = loading === plan.id;
          const Icon = plan.icon;

          return (
            <div 
              key={plan.id} 
              className={cn(
                "card relative flex flex-col p-8 transition-all hover:scale-[1.02]",
                plan.color,
                isActual && "ring-2 ring-[var(--color-primario-claro)]"
              )}
            >
              {isActual && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-primario-claro)] text-white text-[10px] font-black uppercase px-4 py-1 rounded-full shadow-lg">
                  Tu Plan Actual
                </div>
              )}

              <div className="mb-8">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                  plan.id === 'FREE' ? "bg-white/5 text-white" : 
                  plan.id === 'INTERMEDIO' ? "bg-blue-500/10 text-blue-400" : 
                  plan.id === 'ELITE' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                )}>
                  <Icon size={24} />
                </div>
                <h3 className="text-2xl font-bold">{plan.nombre}</h3>
                <p className="text-sm text-[var(--color-texto-suave)] mt-2">{plan.descripcion}</p>
              </div>

              <div className="mb-8 space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">${plan.precio}</span>
                  <span className="text-sm text-[var(--color-texto-muted)] uppercase font-bold">/ mes</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <DollarSign size={14} />
                  <span>Comisión por evento: {plan.comision}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-texto-suave)]">
                    <Check className="text-[var(--color-primario-claro)] mt-0.5" size={16} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleUpgrade(plan.id)}
                className={cn(
                  "btn w-full py-4 font-bold shadow-xl flex items-center justify-center gap-2 transition-all",
                  isActual 
                    ? "bg-white/5 text-[var(--color-texto-muted)] cursor-not-allowed" 
                    : "btn-primario shadow-violet-500/20 active:scale-95"
                )}
                disabled={isActual || !!loading}
              >
                {isSelected ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  isActual ? 'Plan Actual' : `Cambiar al Plan ${plan.nombre.split(' ')[1]}`
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Preguntas Frecuentes Rapidas */}
      <section className="card bg-white/5 border-none p-8">
        <h3 className="text-xl font-bold mb-6">Preguntas sobre comisiones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <p className="font-bold text-[var(--color-primario-claro)] text-sm italic underline underline-offset-4">¿Cuándo se paga la comisión?</p>
            <p className="text-sm text-[var(--color-texto-suave)] leading-relaxed">
              La comisión se descuenta automáticamente al momento de recibir el pago final del cliente a través de nuestra plataforma.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-[var(--color-primario-claro)] text-sm italic underline underline-offset-4">¿Puedo cambiar de plan en cualquier momento?</p>
            <p className="text-sm text-[var(--color-texto-suave)] leading-relaxed">
              Sí, puedes hacer el upgrade o downgrade cuando quieras. Los cambios de tarifa de comisión se aplicarán a los nuevos eventos contratados después del cambio.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
