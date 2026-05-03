
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

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
    <>
      {/* MÓVIL */}
      <div className="md:hidden bg-[var(--color-fondo)] -mx-6 -my-6 px-5 pt-12 pb-[calc(80px+env(safe-area-inset-bottom))] min-h-[calc(100vh-4rem)] flex flex-col items-center text-center">
        <div className="relative mx-auto w-20 h-20 mb-5">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
          <div className="relative bg-emerald-500 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
            <CheckCircle2 size={42} strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-texto)] tracking-tight mb-2">¡Pago exitoso!</h1>
        <p className="text-[14px] text-[var(--color-texto-suave)] leading-relaxed max-w-xs mb-6">
          Tu abono se procesó correctamente. Notificamos al proveedor y actualizamos tu presupuesto.
        </p>

        <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl shadow-sm p-4 w-full max-w-xs space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-texto-suave)]">Referencia</span>
            <span className="text-[12px] font-bold text-[var(--color-texto)] tabular-nums">{reservaId?.slice(-8).toUpperCase() || 'N/A'}</span>
          </div>
          <div className="h-px bg-[var(--color-borde-suave)]" />
          <div className="flex items-center justify-center gap-2 text-emerald-700 text-[13px] font-semibold">
            <Calendar size={15} />
            Reserva confirmada
          </div>
        </div>

        <Link href="/cliente/dashboard" className="w-full max-w-xs">
          <button className="w-full py-3.5 rounded-2xl bg-[var(--color-primario)] text-white text-[14px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm">
            Volver a mis eventos <ArrowRight size={16} />
          </button>
        </Link>
        <p className="text-[11px] text-[var(--color-texto-muted)] mt-3">Te redirigimos en {countdown} segundos…</p>
      </div>

      {/* ESCRITORIO */}
      <div className="hidden md:flex min-h-screen bg-[var(--color-fondo)] items-center justify-center p-6">
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

          <div className="card bg-[var(--color-fondo-card)]/5 border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[var(--color-texto-muted)]">
              <span>Referencia</span>
              <span className="text-white">{reservaId?.slice(-8).toUpperCase() || 'N/A'}</span>
            </div>
            <div className="h-px bg-[var(--color-fondo-card)]/5" />
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
    </>
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
