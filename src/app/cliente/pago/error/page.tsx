
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, AlertCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';

function PagoErrorContent() {
  const searchParams = useSearchParams();
  const reservaId = searchParams.get('reservaId');

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-rose-500/10 rounded-full" />
          <div className="relative bg-rose-500 text-white rounded-full p-6 shadow-2xl shadow-rose-500/40">
            <XCircle size={48} strokeWidth={3} />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">¡Ups! Algo falló</h1>
          <p className="text-[var(--color-texto-suave)] font-medium leading-relaxed">
            No pudimos procesar tu pago en este momento. No se ha realizado ningún cargo a tu cuenta.
          </p>
        </div>

        <div className="card bg-rose-500/5 border-rose-500/10 p-6 space-y-4">
          <div className="flex items-start gap-3 text-left">
            <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <p className="text-sm font-bold text-rose-200">Motivos posibles:</p>
              <ul className="text-xs text-rose-300/70 list-disc pl-4 space-y-1">
                <li>Fondos insuficientes en la tarjeta.</li>
                <li>La sesión de Mercado Pago expiró.</li>
                <li>La tarjeta fue rechazada por el banco emisor.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Link href="/cliente/dashboard">
            <button className="btn btn-secundario w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <ArrowLeft size={18} />
              Reintentar más tarde
            </button>
          </Link>
          <button className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] hover:text-white transition-colors">
            <MessageCircle size={14} />
            ¿Necesitas ayuda? Contactar soporte
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PagoErrorPage() {
  return (
    <Suspense fallback={null}>
      <PagoErrorContent />
    </Suspense>
  );
}
