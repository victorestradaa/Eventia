
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function PagoExitoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reservaId = searchParams.get('reservaId');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirigir al dashboard o al evento si tenemos el ID
          // Como no tenemos el eventoId aquí fácilmente sin consultar la BD, 
          // redirigimos al dashboard de eventos del cliente.
          router.push('/cliente/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
          <div className="relative bg-emerald-500 text-white rounded-full p-6 shadow-2xl shadow-emerald-500/40">
            <CheckCircle2 size={48} strokeWidth={3} />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">¡Pago Exitoso!</h1>
          <p className="text-[var(--color-texto-suave)] font-medium leading-relaxed">
            Tu abono ha sido procesado correctamente. Hemos notificado al proveedor y actualizado tu presupuesto.
          </p>
        </div>

        <div className="card bg-white/5 border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[var(--color-texto-muted)]">
            <span>Referencia</span>
            <span className="text-white">{reservaId?.slice(-8).toUpperCase() || 'N/A'}</span>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold italic">
            <Calendar size={16} />
            <span>Reserva confirmada</span>
          </div>
        </div>

        <div className="space-y-4">
          <Link href="/cliente/dashboard" className="w-full">
            <button className="btn btn-primario w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 group">
              Volver a mis eventos
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <p className="text-[10px] text-[var(--color-texto-muted)] font-bold uppercase tracking-widest">
            Serás redirigido automáticamente en {countdown} segundos...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PagoExitoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-fondo)]">
        <Loader2 className="animate-spin text-[var(--color-primario-claro)]" size={48} />
      </div>
    }>
      <PagoExitoContent />
    </Suspense>
  );
}
