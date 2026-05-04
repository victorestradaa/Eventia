'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Info, ShieldCheck, Wallet, ArrowRight } from 'lucide-react';

interface EarningsCalculatorProps {
  // Acepta el enum del schema (GRATIS/INTERMEDIO/PREMIUM/ELITE) o nombres legacy.
  planProveedor: 'GRATIS' | 'INTERMEDIO' | 'PREMIUM' | 'ELITE' | 'DESTACADO' | 'PRO';
  precioTotal: number;
  metodosPagoSelected?: string[];
  onAdvanceChange?: (percentage: number, amount: number) => void;
}

const TARIFA_MP = 0.04; // 4% estimado de pasarela
// Comisiones por plan. Acepta tanto los nombres del schema (INTERMEDIO/PREMIUM)
// como los legacy (DESTACADO/PRO) por compatibilidad.
const PLAN_FEES: Record<string, number> = {
  GRATIS: 0.10,
  INTERMEDIO: 0.07,   // schema
  DESTACADO: 0.07,    // alias legacy
  PREMIUM: 0.04,      // schema
  PRO: 0.04,          // alias legacy
  ELITE: 0.00,
};

// Etiqueta visible en UI según el plan
const PLAN_LABELS: Record<string, string> = {
  GRATIS: 'Gratis',
  INTERMEDIO: 'Destacado',
  DESTACADO: 'Destacado',
  PREMIUM: 'Premium',
  PRO: 'Premium',
  ELITE: 'Elite',
};

export default function EarningsCalculator({ planProveedor, precioTotal, metodosPagoSelected = ['TARJETA'], onAdvanceChange }: EarningsCalculatorProps) {
  const [percentage, setPercentage] = useState<number>(30);

  const hasTarjeta = metodosPagoSelected.includes('TARJETA');
  const eventiaFeePercent = PLAN_FEES[planProveedor] ?? 0.10;
  const planLabel = PLAN_LABELS[planProveedor] ?? planProveedor;
  
  // Si no hay tarjeta, no hay comisiones de pasarela ni de Eventium sobre el anticipo (cobro directo)
  const currentMPFeePercent = hasTarjeta ? TARIFA_MP : 0;
  const currentEventiumFeePercent = hasTarjeta ? eventiaFeePercent : 0;

  // Cálculo de Anticipo Mínimo Protegido
  const minAdvanceAmount = precioTotal > 0 ? (precioTotal * currentEventiumFeePercent) / (1 - currentMPFeePercent) : 0;
  const minPercentage = precioTotal > 0 && currentEventiumFeePercent > 0 ? Math.ceil((minAdvanceAmount / precioTotal) * 100) : 10;
  
  // Ajustar porcentaje si baja del mínimo
  useEffect(() => {
    if (percentage < minPercentage) {
      setPercentage(minPercentage);
    }
  }, [minPercentage, percentage]);

  const advanceAmount = (precioTotal * percentage) / 100;
  const mpFee = hasTarjeta ? advanceAmount * TARIFA_MP : 0;
  const eventiaFee = hasTarjeta ? precioTotal * eventiaFeePercent : 0;
  const netoHoy = advanceAmount - mpFee - eventiaFee;
  const pagoPendiente = precioTotal - advanceAmount;
  const gananciaTotalNeta = precioTotal - mpFee - eventiaFee;

  useEffect(() => {
    onAdvanceChange?.(percentage, advanceAmount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentage, advanceAmount]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-[var(--color-fondo-card)] backdrop-blur-xl border border-[var(--color-borde-suave)] rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-[var(--color-texto)]">Calculadora de Ganancias</h3>
            <p className="text-[10px] text-[var(--color-texto-muted)] uppercase font-bold tracking-widest">Plan Actual: <span className="text-emerald-500">{planLabel}</span> ({currentEventiumFeePercent * 100}%)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Inputs */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest">Porcentaje de Anticipo</label>
                <span className="text-2xl font-black text-emerald-500">{percentage}%</span>
              </div>
              <input
                type="range"
                min={minPercentage}
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full h-2 bg-[var(--color-fondo-hover)] rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[9px] font-black text-[var(--color-texto-muted)] uppercase">
                <span>Mín. Protegido ({minPercentage}%)</span>
                <span>Pago Total (100%)</span>
              </div>
            </div>
          </div>

          {/* Desglose Visual */}
          <div className="bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-3xl p-6 space-y-6">
            <div>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Wallet size={14} /> Cobro Hoy (Vía Eventium)
              </p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-texto-suave)]">Anticipo del Cliente</span>
                  <span className="font-bold text-[var(--color-texto)]">${advanceAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-red-500">
                  <span className="flex items-center gap-1">Comisión Bancaria (~4%) <Info size={10} /></span>
                  <span className="font-bold">-${mpFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-red-500">
                  <span className="flex items-center gap-1">Comisión Eventium ({eventiaFeePercent * 100}%)</span>
                  <span className="font-bold">-${eventiaFee.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-[var(--color-borde-suave)] flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-[var(--color-texto-muted)]">NETO EN TU MERCADOPAGO</span>
                  <span className="text-xl font-black text-emerald-500">+${netoHoy.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ArrowRight size={14} /> Pago Pendiente
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--color-texto-suave)]">Cobro directo al cliente</span>
                <span className="text-xl font-black text-blue-500">+${pagoPendiente.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen Final */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-texto)]">Ganancia Total Neta</p>
              <p className="text-[10px] text-[var(--color-texto-muted)] uppercase font-bold">Tras comisiones e impuestos de pasarela</p>
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">
            ${gananciaTotalNeta.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 text-[10px] text-[var(--color-texto-muted)] font-bold uppercase tracking-widest">
        <Info size={12} />
        La calculadora utiliza estimaciones. Los montos finales pueden variar según las políticas de Mercado Pago.
      </div>
    </div>
  );
}
