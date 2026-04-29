
'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, Unlink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { desvincularMercadoPago } from '@/lib/actions/mercadopagoActions';
import { useRouter } from 'next/navigation';

interface MercadoPagoClientProps {
  proveedor: any;
  authUrl: string;
}

export default function MercadoPagoClient({ proveedor, authUrl }: MercadoPagoClientProps) {
  const router = useRouter();
  const [vinculado, setVinculado] = useState(proveedor.mpVinculado || false);
  const [loading, setLoading] = useState(false);

  const handleDesvincular = async () => {
    if (!confirm('¿Estás seguro de que deseas desvincular tu cuenta de Mercado Pago? No podrás recibir pagos con tarjeta hasta que la vincules de nuevo.')) return;
    
    setLoading(true);
    try {
      const res = await desvincularMercadoPago();
      if (res.success) {
        setVinculado(false);
        router.refresh();
      } else {
        alert(res.error || 'Error al desvincular.');
      }
    } catch (error) {
      alert('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Mercado Pago Connect</h1>
          <p className="text-[var(--color-texto-suave)] font-medium">
            Vincula tu cuenta para recibir pagos directos con tarjeta.
          </p>
        </div>
        
        <div className={cn(
          "px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
          vinculado ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        )}>
          {vinculado ? <><CheckCircle2 size={14} /> Cuenta Vinculada</> : <><AlertCircle size={14} /> Sin Vincular</>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-8 bg-white/5 border-white/10 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <CreditCard size={120} />
            </div>
            
            <div className="relative space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {vinculado ? '¡Todo listo!' : '¿Por qué vincular tu cuenta?'}
              </h2>
              
              <div className="space-y-4 text-[var(--color-texto-suave)] text-sm leading-relaxed">
                <p>
                  Al vincular tu cuenta de Mercado Pago, permites que los clientes paguen sus anticipos y abonos con <strong>Tarjeta de Crédito o Débito</strong> directamente desde Eventia.
                </p>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--color-primario-claro)] shrink-0" />
                    <span><strong>Pagos Directos:</strong> El dinero se deposita en tu cuenta de Mercado Pago automáticamente.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--color-primario-claro)] shrink-0" />
                    <span><strong>Transparencia Fiscal:</strong> Solo la comisión de la plataforma se retiene, el resto es tuyo.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--color-primario-claro)] shrink-0" />
                    <span><strong>Automatización:</strong> Las fechas se apartan automáticamente al confirmarse el pago.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                {vinculado ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Cuenta vinculada correctamente</p>
                        <p className="text-[10px] text-emerald-400/60 uppercase font-black">ID MP: {proveedor.mpUserId || 'Oculto'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleDesvincular}
                      disabled={loading}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors group relative flex items-center justify-center min-w-[40px] min-h-[40px]"
                      title="Desvincular cuenta"
                    >
                      {loading ? <Loader2 size={20} className="animate-spin" /> : <Unlink size={20} />}
                    </button>
                  </div>
                ) : (
                  <a 
                    href={authUrl}
                    className="btn btn-primario py-4 px-8 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-violet-500/20 hover:scale-[1.02] active:scale-95 transition-all w-fit"
                  >
                    Vincular con Mercado Pago
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 bg-amber-500/5 border border-amber-500/10 space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle size={20} />
              <h3 className="font-bold text-sm uppercase tracking-tight">Importante</h3>
            </div>
            <p className="text-xs text-amber-200/60 leading-relaxed">
              Eventia utiliza el modelo de <strong>Marketplace</strong> de Mercado Pago. Al vincular tu cuenta, autorizas a la plataforma a procesar pagos en tu nombre y retener la comisión acordada según tu plan.
            </p>
          </div>

          <div className="card p-6 bg-white/5 border border-white/5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Ayuda</h3>
            <p className="text-xs text-[var(--color-texto-muted)] leading-relaxed">
              ¿No tienes una cuenta de Mercado Pago? <a href="https://www.mercadopago.com.mx/" target="_blank" className="text-[var(--color-primario-claro)] hover:underline">Crea una aquí</a> en pocos minutos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
