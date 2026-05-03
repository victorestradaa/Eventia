'use client';

import { Check, Star, Zap, Crown, DollarSign, Loader2, Sparkles, Heart, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { createPlanPreference } from '@/lib/actions/mercadopagoActions';
import { differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  MobilePageShell,
  MobileTopBar,
  MobileSection,
  MobileCard,
} from '@/components/cliente/mobile/primitives';

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
    precioNormal: 299,
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
    precioNormal: 799,
    precioMensual: 299,
    precioAnual: 2990,
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
  planExpira?: Date | string | null;
}

export default function ClientPlanesClient({ planActual, planExpira }: ClientPlanesClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'mensual' | 'anual'>('mensual');

  const handleUpgrade = async (planId: string) => {
    if (planId === 'FREE') return;
    
    setLoading(planId);
    // Para Clientes, ORO es siempre único. PLANNER depende del toggle.
    const cycle = planId === 'ORO' ? 'unico' : billingCycle;
    
    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle: cycle })
      });
      
      const res = await response.json();
      
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        alert(res.error || 'No se pudo iniciar el proceso de pago.');
        setLoading(null);
      }
    } catch (err) {
      alert('Error de conexión al procesar el pago.');
      setLoading(null);
    }
  };

  const diasRestantes = planExpira ? differenceInDays(new Date(planExpira), new Date()) : null;
  const expiraFormateada = planExpira ? format(new Date(planExpira), "d 'de' MMMM, yyyy", { locale: es }) : null;

  return (
    <>
      {/* VISTA MÓVIL */}
      <MobilePageShell>
        <MobileTopBar
          title="Mi plan"
          backHref="/cliente/perfil"
          subtitle={`Plan actual: ${planActual}`}
        />

        {/* Estado del plan actual */}
        {planActual !== 'FREE' && planExpira && (
          <MobileCard className="p-4 mb-5 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Plan vigente</p>
            <p className="text-[18px] font-bold text-[var(--color-texto)] mb-1">{planActual}</p>
            <div className="flex items-center gap-2 text-[12px] text-[var(--color-texto)]">
              <Clock size={13} className={diasRestantes !== null && diasRestantes < 3 ? 'text-rose-600' : 'text-amber-700'} />
              <span>
                {diasRestantes && diasRestantes > 0
                  ? `${diasRestantes} días de vigencia`
                  : diasRestantes !== null && diasRestantes <= 0 && diasRestantes >= -3
                  ? `Plan vencido — ${3 + diasRestantes} días de gracia`
                  : 'Plan expirado'}
              </span>
            </div>
            {expiraFormateada && (
              <p className="text-[11px] text-[var(--color-texto-suave)] mt-1">Vence el {expiraFormateada}</p>
            )}
          </MobileCard>
        )}

        {/* Toggle de ciclo */}
        <div className="bg-[var(--color-fondo-hover)] p-1 rounded-full grid grid-cols-2 mb-5">
          <button
            type="button"
            onClick={() => setBillingCycle('mensual')}
            className={cn(
              'py-2 rounded-full text-[12px] font-semibold transition-all',
              billingCycle === 'mensual' ? 'bg-white text-[var(--color-texto)] shadow-sm' : 'text-[var(--color-texto-suave)]',
            )}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('anual')}
            className={cn(
              'py-2 rounded-full text-[12px] font-semibold transition-all',
              billingCycle === 'anual' ? 'bg-emerald-500 text-white shadow-sm' : 'text-[var(--color-texto-suave)]',
            )}
          >
            Anual · Ahorra 2 meses
          </button>
        </div>

        <MobileSection title="Planes disponibles">
          <div className="space-y-3">
            {PLANES_CLIENTE.map((plan) => {
              const isActual = planActual === plan.id;
              const isLoadingThis = loading === plan.id;
              const Icon = plan.icon;
              const precioActual =
                plan.id === 'FREE'
                  ? 0
                  : plan.id === 'ORO'
                  ? plan.precio
                  : billingCycle === 'mensual'
                  ? plan.precioMensual
                  : plan.precioAnual;
              const cicloLabel =
                plan.id === 'FREE'
                  ? 'Sin costo'
                  : plan.id === 'ORO'
                  ? 'Pago único'
                  : billingCycle === 'mensual'
                  ? 'MXN / mes'
                  : 'MXN / año';
              return (
                <MobileCard
                  key={plan.id}
                  className={cn(
                    'p-5',
                    isActual && 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[var(--color-fondo)]',
                    plan.popular && 'border-violet-200',
                  )}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
                        plan.id === 'FREE' && 'bg-[var(--color-fondo-hover)] text-[var(--color-texto)]',
                        plan.id === 'ORO' && 'bg-amber-50 text-amber-700',
                        plan.id === 'PLANNER' && 'bg-violet-50 text-violet-700',
                      )}
                    >
                      <Icon size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[16px] font-semibold text-[var(--color-texto)]">{plan.nombre}</h3>
                        {plan.popular && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        {isActual && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[var(--color-texto-suave)]">{plan.descripcion}</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-[var(--color-texto)] tracking-tight">
                      ${precioActual}
                    </span>
                    <span className="text-[12px] text-[var(--color-texto-suave)] font-semibold">{cicloLabel}</span>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--color-texto)]">
                        <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isActual || !!loading}
                    className={cn(
                      'w-full py-3 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98]',
                      isActual
                        ? 'bg-[var(--color-fondo-hover)] text-[var(--color-texto-suave)] cursor-not-allowed'
                        : 'bg-[var(--color-primario)] text-white shadow-sm',
                      isLoadingThis && 'opacity-70',
                    )}
                  >
                    {isLoadingThis ? (
                      <Loader2 className="animate-spin mx-auto" size={18} />
                    ) : isActual ? (
                      'Plan activo'
                    ) : (
                      `Obtener ${plan.nombre}`
                    )}
                  </button>
                </MobileCard>
              );
            })}
          </div>
        </MobileSection>

        <p className="text-center text-[11px] text-[var(--color-texto-muted)] mt-2">
          Pago seguro vía Mercado Pago · Activación instantánea
        </p>
      </MobilePageShell>

      {/* VISTA ESCRITORIO */}
      <div className="hidden md:block space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-1 rounded-full bg-[var(--color-primario)]/10 text-[var(--color-primario-claro)] text-[10px] font-black uppercase tracking-widest mb-2">
          Membresías Premium
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Lleva tu organización al siguiente nivel</h1>
        
        {/* Selector de Ciclo de Facturación Premium */}
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl flex items-center gap-2 shadow-2xl">
            <button
              onClick={() => setBillingCycle('mensual')}
              className={cn(
                "px-8 py-3 rounded-xl text-sm font-black transition-all duration-300",
                billingCycle === 'mensual' 
                  ? "bg-white text-black shadow-lg scale-105" 
                  : "text-[var(--color-texto-muted)] hover:text-white"
              )}
            >
              MENSUAL
            </button>
            <button
              onClick={() => setBillingCycle('anual')}
              className={cn(
                "px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 relative",
                billingCycle === 'anual' 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105" 
                  : "text-[var(--color-texto-muted)] hover:text-white"
              )}
            >
              ANUAL
              <span className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] px-3 py-1 rounded-full font-black shadow-lg animate-bounce whitespace-nowrap">
                AHORRA 2 MESES 🎁
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-emerald-500"></span>
              </span>
            </button>
          </div>
          <p className="text-xs font-bold text-emerald-400 flex items-center gap-2">
            <Sparkles size={14} />
            ¡Ahorra pagando anualmente y obtén 2 meses de regalo!
          </p>
        </div>

        {planActual !== 'FREE' && planExpira && (
          <div className="max-w-md mx-auto bg-[var(--color-primario)]/5 border border-[var(--color-primario)]/20 rounded-2xl p-4 mt-6 animate-in zoom-in duration-500">
            <p className="text-sm font-bold">Plan Actual: <span className="text-[var(--color-primario-claro)]">{planActual}</span></p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Clock size={14} className={cn(diasRestantes && diasRestantes < 3 ? "text-red-400 animate-pulse" : "text-[var(--color-primario-claro)]")} />
              <p className="text-xs font-medium">
                {diasRestantes && diasRestantes > 0 
                  ? `Te quedan ${diasRestantes} días de vigencia` 
                  : diasRestantes !== null && diasRestantes <= 0 && diasRestantes >= -3
                    ? `Tu plan venció, pero tienes ${3 + diasRestantes} días de gracia`
                    : "Tu plan ha expirado"}
              </p>
            </div>
            <p className="text-[10px] text-[var(--color-texto-muted)] mt-1">Vence el {expiraFormateada}</p>
          </div>
        )}

        <p className="text-[var(--color-texto-suave)] max-w-2xl mx-auto text-lg mt-4">
          Desbloquea herramientas avanzadas y gestiona múltiples eventos sin límites.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
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
                <div className="flex flex-col mb-2">
                  {(plan as any).precioNormal && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded">ANTES</span>
                      <span className="text-xl text-[var(--color-texto-muted)] line-through decoration-red-500 decoration-2 font-bold opacity-70">
                        ${plan.id === 'ORO' ? (plan as any).precioNormal : (billingCycle === 'mensual' ? (plan as any).precioNormal : (plan as any).precioNormal * 12)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter">
                      ${plan.id === 'ORO' ? plan.precio : (billingCycle === 'mensual' ? plan.precioMensual : plan.precioAnual)}
                    </span>
                    <span className="text-sm text-[var(--color-texto-muted)] uppercase font-extrabold">
                      {plan.id === 'ORO' ? 'MXN/único' : (billingCycle === 'mensual' ? 'MXN/mes' : 'MXN/año')}
                    </span>
                  </div>
                </div>
                {plan.id === 'PLANNER' && billingCycle === 'anual' && (
                  <p className="text-[10px] font-bold text-emerald-400 mt-2 flex items-center gap-1">
                    <Check size={12} /> Equivale a ${Math.round(plan.precioAnual / 12)} / mes
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
      </div>

      {/* Comparison or Trust Badge Section */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-12 py-8 border-t border-white/5">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
               <Check size={24} />
            </div>
            <div>
               <p className="font-bold text-sm">Pago Seguro</p>
               <p className="text-[10px] text-[var(--color-texto-muted)]">Cifrado de 256 bits vía Mercado Pago</p>
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
      </div>{/* fin desktop */}
    </>
  );
}
