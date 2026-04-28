'use client';

import { Check, Star, Zap, Crown, DollarSign, Loader2, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPlanPreference } from '@/lib/actions/mercadopagoActions';
import { differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import confetti from 'canvas-confetti';
import { Clock } from 'lucide-react';

const PLANES = [
  {
    id: 'GRATIS',
    nombre: 'Plan Básico',
    precioMensual: 0,
    precioAnual: 0,
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
    id: 'DESTACADO', // Cambiado de INTERMEDIO para coincidir con el nombre comercial
    nombre: 'Plan Destacado',
    precioNormal: 299,
    precioMensual: 99,
    precioAnual: 990,
    comision: '7%',
    descripcion: 'Mayor visibilidad y menores comisiones.',
    icon: Star,
    features: [
      'Perfil destacado en el buscador',
      'Fotos y videos en productos',
      'Analíticas de visitas',
      'Comisión del 7% por evento',
      'Soporte prioritario',
      'Etiqueta de Verificado'
    ],
    color: 'border-blue-500/50 shadow-blue-500/10'
  },
  {
    id: 'PRO', // Cambiado de PREMIUM
    nombre: 'Plan PRO',
    precioNormal: 799,
    precioMensual: 399,
    precioAnual: 3990,
    comision: '4%',
    descripcion: 'Dominio total del mercado local.',
    icon: Crown,
    features: [
      'Aparición en el Top de resultados',
      'Mínima comisión del 4%',
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
    precioNormal: 1499,
    precioMensual: 999,
    precioAnual: 9990,
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
  proveedorId: string;
  planExpira?: Date | string | null;
}

export default function PlanesClient({ planActual, proveedorId, planExpira }: PlanesClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'mensual' | 'anual'>('mensual');
  const router = useRouter();

  const handleUpgrade = async (planId: string) => {
    if (planId === planActual && billingCycle === 'mensual') return; // Simplificado
    if (planId === 'GRATIS') return;

    setLoading(planId);
    
    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle })
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
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Potencia tu Negocio</h1>
        
        {planActual !== 'GRATIS' && planExpira && (
          <div className="max-w-md mx-auto bg-violet-500/5 border border-violet-500/20 rounded-2xl p-4 mt-6 animate-in zoom-in duration-500">
            <p className="text-sm font-bold uppercase tracking-widest text-violet-400">Plan Actual: {planActual}</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Clock size={14} className={cn(diasRestantes && diasRestantes < 3 ? "text-red-400 animate-pulse" : "text-emerald-400")} />
              <p className="text-xs font-medium">
                {diasRestantes && diasRestantes > 0 
                  ? `Te quedan ${diasRestantes} días de vigencia` 
                  : diasRestantes !== null && diasRestantes <= 0 && diasRestantes >= -3
                    ? `Plan vencido (Periodo de gracia: ${3 + diasRestantes} días)`
                    : "Tu suscripción ha expirado"}
              </p>
            </div>
            <p className="text-[10px] text-[var(--color-texto-muted)] mt-1">Siguiente pago: {expiraFormateada}</p>
          </div>
        )}

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
                2 MESES GRATIS 🎁
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-emerald-500"></span>
              </span>
            </button>
          </div>
          <p className="text-xs font-bold text-emerald-400 flex items-center gap-2">
            <Check size={14} />
            Selecciona el plan anual y obtén un descuento masivo
          </p>
        </div>

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
                  plan.id === 'GRATIS' ? "bg-white/5 text-white" : 
                  plan.id === 'INTERMEDIO' ? "bg-blue-500/10 text-blue-400" : 
                  plan.id === 'ELITE' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                )}>
                  <Icon size={24} />
                </div>
                <h3 className="text-2xl font-bold">{plan.nombre}</h3>
                <p className="text-sm text-[var(--color-texto-suave)] mt-2">{plan.descripcion}</p>
              </div>

              <div className="mb-8 space-y-2">
                <div className="flex flex-col">
                  {plan.precioNormal && (
                    <span className="text-sm text-[var(--color-texto-muted)] line-through decoration-red-500/50 decoration-2 font-bold mb-1">
                      ${billingCycle === 'mensual' ? plan.precioNormal : plan.precioNormal * 12}
                    </span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">${billingCycle === 'mensual' ? plan.precioMensual : plan.precioAnual}</span>
                    <span className="text-sm text-[var(--color-texto-muted)] uppercase font-bold">/ {billingCycle === 'mensual' ? 'mes' : 'año'}</span>
                  </div>
                </div>
                {billingCycle === 'anual' && plan.precioAnual > 0 && (
                  <p className="text-[10px] font-bold text-emerald-400 italic">Equivale a ${Math.round(plan.precioAnual/12)}/mes (Cobro de 10 meses)</p>
                )}
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit">
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

      {/* Overlay de Éxito Animado */}
      {success && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
           <div className="card max-w-sm w-full text-center space-y-6 py-12 border-[var(--color-primario)]/50 shadow-[0_0_50px_rgba(124,58,237,0.3)] scale-in-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 scale-up-center">
                 <Check size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">¡Plan Actualizado!</h3>
                <p className="text-sm text-[var(--color-texto-suave)] px-6">
                  Tu negocio ahora forma parte del **{PLANES.find(p => p.id === success)?.nombre}**.
                </p>
                <div className="text-[10px] font-black tracking-widest text-[var(--color-primario-claro)] uppercase mt-2">Prueba habilitada con éxito</div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
