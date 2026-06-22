'use client';

import { Check, Star, Zap, Crown, DollarSign, Loader2, Gem, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPlanPreference } from '@/lib/actions/mercadopagoActions';
import { aplicarCupon } from '@/lib/actions/cuponActions';
import { cancelarSuscripcionProveedor, reactivarSuscripcionProveedor } from '@/lib/actions/suscripcionActions';
import { differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import confetti from 'canvas-confetti';
import { Clock } from 'lucide-react';

// 3 planes. TODOS con 0% de comisión. La única diferencia entre ellos es
// la posición que tendrán en los resultados de búsqueda del cliente.
// El id 'GRATIS' del schema corresponde al plan Emprendedor; 'INTERMEDIO' a
// Destacado; 'ELITE' a Elite. (PREMIUM legacy → tratado como Destacado.)
const PLANES = [
  {
    id: 'GRATIS',
    nombre: 'Plan Emprendedor',
    precioMensual: 0,
    precioAnual: 0,
    descripcion: 'Tu plan al registrarte. Vende sin comisiones desde el primer día.',
    icon: Zap,
    features: [
      'Sin comisiones por evento (0%)',
      'Acepta pagos en efectivo y tarjeta',
      'Gestión completa de calendario y reservas',
      'Catálogo de servicios con fotos',
      'Soporte vía correo',
    ],
    color: 'border-white/10',
    ranking: 'Aparece después de los planes pagados en las búsquedas.',
  },
  {
    id: 'INTERMEDIO',
    nombre: 'Plan Destacado',
    precioNormal: 299,
    precioMensual: 99,
    precioAnual: 990,
    descripcion: 'Mejor posicionamiento para que más clientes te encuentren.',
    icon: Star,
    features: [
      'Sin comisiones por evento (0%)',
      'Acepta pagos en efectivo y tarjeta',
      'Posición media en los resultados de búsqueda',
      'Etiqueta "Destacado" visible en tu perfil',
      'Soporte prioritario',
    ],
    color: 'border-blue-500/50 shadow-blue-500/10',
    ranking: 'Aparece por encima de los proveedores Emprendedor.',
  },
  {
    id: 'ELITE',
    nombre: 'Plan Elite',
    precioNormal: 1499,
    precioMensual: 999,
    precioAnual: 9990,
    descripcion: 'Máxima visibilidad. Siempre aparecerás primero.',
    icon: Gem,
    features: [
      'Sin comisiones por evento (0%)',
      'Acepta pagos en efectivo y tarjeta',
      'Posición TOP — siempre primero en búsquedas',
      'Etiqueta "Elite" destacada en tu perfil',
      'Máxima prioridad en soporte',
      'Acceso anticipado a nuevas funciones',
    ],
    color: 'border-emerald-500/50 shadow-emerald-500/10',
    ranking: 'Siempre aparece en primer lugar, por encima de todos los demás planes.',
  },
];

interface PlanesClientProps {
  planActual: string;
  proveedorId: string;
  planExpira?: Date | string | null;
  planCancelado?: boolean;
  planConfigs?: any[];
}

export default function PlanesClient({ planActual, proveedorId, planExpira, planCancelado = false, planConfigs = [] }: PlanesClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'mensual' | 'anual'>('mensual');
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const router = useRouter();

  const DB_PLAN_ID_MAP: Record<string, string> = {
    'GRATIS': 'EMPRENDEDOR',
    'INTERMEDIO': 'DESTACADO',
    'ELITE': 'ELITE'
  };

  const dynamicPlanes = PLANES.map(plan => {
    const dbPlanId = DB_PLAN_ID_MAP[plan.id];
    const config = planConfigs?.find(c => c.planId === dbPlanId);
    
    if (config) {
      const isPromoActive = config.precioPromo !== null && config.precioPromo !== undefined && 
                            (!config.promoDesde || new Date(config.promoDesde) <= new Date()) && 
                            (!config.promoHasta || new Date(config.promoHasta) >= new Date());
                            
      const precioMensual = isPromoActive ? config.precioPromo : config.precioNormal;
      const precioNormalAntiguo = isPromoActive ? config.precioNormal : null;
      
      return {
        ...plan,
        precioNormal: precioNormalAntiguo,
        precioMensual: precioMensual,
        precioAnual: precioMensual * 10
      };
    }
    return plan;
  });

  const handleCancelarSuscripcion = async () => {
    setCancelLoading(true);
    const res = await cancelarSuscripcionProveedor(proveedorId);
    setCancelLoading(false);
    if (res.success) {
      setShowCancelConfirm(false);
      router.refresh();
    } else {
      alert(res.error || 'Error al cancelar la suscripción.');
    }
  };

  const handleReactivarSuscripcion = async () => {
    setCancelLoading(true);
    const res = await reactivarSuscripcionProveedor(proveedorId);
    setCancelLoading(false);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Error al reactivar la suscripción.');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    setCouponMessage(null);
    
    const res = await aplicarCupon(couponCode, proveedorId);
    
    if (res.success) {
      setCouponMessage({ text: res.message || 'Cupón aplicado con éxito.', type: 'success' });
      setCouponCode('');
      setTimeout(() => window.location.reload(), 2000);
    } else {
      setCouponMessage({ text: res.error || 'Error al aplicar cupón.', type: 'error' });
    }
    setCouponLoading(false);
  };

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
          <div className={cn(
            "max-w-md mx-auto rounded-2xl p-4 mt-6 animate-in zoom-in duration-500",
            planCancelado
              ? "bg-amber-500/10 border border-amber-500/30"
              : "bg-violet-500/5 border border-violet-500/20"
          )}>
            <p className={cn(
              "text-sm font-bold uppercase tracking-widest",
              planCancelado ? "text-amber-500" : "text-violet-400"
            )}>
              Plan Actual: {planActual}
              {planCancelado && <span className="ml-2 text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">CANCELADO</span>}
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Clock size={14} className={cn(diasRestantes && diasRestantes < 3 ? "text-red-400 animate-pulse" : planCancelado ? "text-amber-500" : "text-emerald-400")} />
              <p className="text-xs font-medium">
                {diasRestantes && diasRestantes > 0
                  ? `Te quedan ${diasRestantes} días de vigencia`
                  : diasRestantes !== null && diasRestantes <= 0 && diasRestantes >= -3
                    ? `Plan vencido (Periodo de gracia: ${3 + diasRestantes} días)`
                    : "Tu suscripción ha expirado"}
              </p>
            </div>
            <p className="text-[10px] text-[var(--color-texto-muted)] mt-1">
              {planCancelado
                ? `Termina el ${expiraFormateada}. Disfrutas todos los beneficios hasta entonces.`
                : `Siguiente pago: ${expiraFormateada}`}
            </p>

            {/* Botón cancelar / reactivar */}
            <div className="mt-3 pt-3 border-t border-current/10">
              {planCancelado ? (
                <button
                  onClick={handleReactivarSuscripcion}
                  disabled={cancelLoading}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
                >
                  {cancelLoading ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                  Reactivar renovación automática
                </button>
              ) : (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-texto-muted)] hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                  Cancelar suscripción
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal de confirmación de cancelación */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowCancelConfirm(false)}>
            <div onClick={(e) => e.stopPropagation()} className="card max-w-md w-full p-8 text-center border-amber-500/30 space-y-5 animate-in zoom-in duration-200">
              <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                <X size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold">¿Cancelar suscripción?</h3>
                <p className="text-sm text-[var(--color-texto-suave)] mt-2">
                  Seguirás disfrutando todos los beneficios del <strong className="text-[var(--color-texto)]">Plan {planActual}</strong> hasta el <strong className="text-[var(--color-texto)]">{expiraFormateada}</strong>. Después tu cuenta pasará al Plan Básico (GRATIS).
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelLoading}
                  className="flex-1 py-3 rounded-xl text-sm font-bold border border-[var(--color-borde-suave)] hover:bg-[var(--color-fondo-hover)] transition-colors disabled:opacity-50"
                >
                  Conservar suscripción
                </button>
                <button
                  onClick={handleCancelarSuscripcion}
                  disabled={cancelLoading}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelLoading ? <Loader2 size={16} className="animate-spin" /> : 'Sí, cancelar'}
                </button>
              </div>
            </div>
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

          {/* Sección de Cupón */}
          <div className="mt-8 w-full max-w-sm mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-acento)] rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition-opacity"></div>
              <div className="relative bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-2xl p-4 flex gap-2">
                <input 
                  type="text" 
                  placeholder="¿Tienes un cupón?" 
                  className="bg-transparent border-none focus:ring-0 text-sm font-bold text-[var(--color-texto)] placeholder:text-[var(--color-texto-muted)] w-full uppercase outline-none"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button 
                  onClick={handleApplyCoupon}
                  disabled={!couponCode || couponLoading}
                  className="btn btn-primario py-2 px-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap disabled:opacity-50"
                >
                  {couponLoading ? <Loader2 className="animate-spin" size={14} /> : 'Aplicar'}
                </button>
              </div>
            </div>
            {couponMessage && (
              <p className={cn(
                "text-[10px] font-black mt-2 text-center animate-in fade-in slide-in-from-top-1",
                couponMessage.type === 'error' ? "text-red-400" : "text-emerald-400"
              )}>
                {couponMessage.text}
              </p>
            )}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dynamicPlanes.map((plan) => {
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
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded">ANTES</span>
                      <span className="text-xl text-[var(--color-texto-muted)] line-through decoration-red-500 decoration-2 font-bold opacity-70">
                        ${billingCycle === 'mensual' ? plan.precioNormal : plan.precioNormal * 12}
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tight">${billingCycle === 'mensual' ? plan.precioMensual : plan.precioAnual}</span>
                    <span className="text-sm text-[var(--color-texto-muted)] uppercase font-bold">/ {billingCycle === 'mensual' ? 'mes' : 'año'}</span>
                  </div>
                </div>
                {billingCycle === 'anual' && plan.precioAnual > 0 && (
                  <p className="text-[10px] font-bold text-emerald-400 italic">Equivale a ${Math.round(plan.precioAnual/12)}/mes (Cobro de 10 meses)</p>
                )}
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit">
                  <DollarSign size={14} />
                  <span>0% comisión por evento</span>
                </div>
                {plan.ranking && (
                  <p className="text-[11px] text-[var(--color-texto-suave)] italic leading-snug">
                    📍 {plan.ranking}
                  </p>
                )}
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
                  Tu negocio ahora forma parte del **{dynamicPlanes.find(p => p.id === success)?.nombre}**.
                </p>
                <div className="text-[10px] font-black tracking-widest text-[var(--color-primario-claro)] uppercase mt-2">Prueba habilitada con éxito</div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
