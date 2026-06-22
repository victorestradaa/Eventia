'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play, Package, Users, ShoppingCart, LineChart, Lock, Unlock, Clock,
  AlertCircle, Loader2, X, ArrowRight, Receipt,
} from 'lucide-react';
import { abrirSesionCajaPV } from '@/lib/actions/puntoVentaActions';
import { formatearMoneda } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Sesion = {
  id: string;
  montoApertura: number | string;
  abiertaEn: string;
} | null;

interface Props {
  proveedorId: string;
  sesionActiva: Sesion;
}

export default function MenuPV({ proveedorId, sesionActiva }: Props) {
  const router = useRouter();
  const [showAbrir, setShowAbrir] = useState(false);
  const [montoApertura, setMontoApertura] = useState('0');
  const [notasApertura, setNotasApertura] = useState('');
  const [abriendo, setAbriendo] = useState(false);
  const [error, setError] = useState('');

  const handleIniciarVentas = () => {
    if (sesionActiva) {
      router.push('/proveedor/punto-venta/nueva');
    } else {
      setShowAbrir(true);
      setError('');
    }
  };

  const handleAbrirYVender = async () => {
    setError('');
    const monto = parseFloat(montoApertura || '0');
    if (isNaN(monto) || monto < 0) { setError('Monto inválido.'); return; }
    setAbriendo(true);
    const res = await abrirSesionCajaPV(proveedorId, monto, notasApertura);
    setAbriendo(false);
    if (!res.success) { setError(res.error || 'Error al abrir caja.'); return; }
    router.push('/proveedor/punto-venta/nueva');
  };

  return (
    <div className="space-y-6">
      {/* Banner de sesión activa */}
      {sesionActiva && (
        <section className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                <Unlock size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Sesión de caja abierta</p>
                </div>
                <p className="text-[11px] text-[var(--color-texto-suave)] mt-0.5 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1"><Clock size={11} /> {new Date(sesionActiva.abiertaEn).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span>·</span>
                  <span>Fondo inicial: <strong className="text-[var(--color-texto)]">{formatearMoneda(Number(sesionActiva.montoApertura))}</strong></span>
                </p>
              </div>
            </div>
            <Link
              href="/proveedor/punto-venta/caja"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F2937] text-white font-black uppercase text-[10px] tracking-widest hover:bg-black shrink-0"
            >
              <Lock size={12} /> Cerrar caja
            </Link>
          </div>
        </section>
      )}

      {/* Menú principal en cuadrícula */}
      <section>
        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[var(--color-texto-muted)] mb-3">
          ¿Qué quieres hacer?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Iniciar Ventas — destacado */}
          <button
            onClick={handleIniciarVentas}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fdf6e1] via-[#f4e4b9] to-[#d4af37] text-[#1F2937] p-6 text-left transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#d4af37]/30 border-2 border-[#d4af37]/30 col-span-1 sm:col-span-2 lg:col-span-1 lg:row-span-2"
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/30 rounded-full blur-2xl group-hover:bg-white/40 transition-colors" />
            <div className="relative flex flex-col h-full min-h-[200px]">
              <div className="w-14 h-14 rounded-2xl bg-black text-[#d4af37] flex items-center justify-center mb-4 shadow-xl">
                <Play size={26} fill="currentColor" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-black tracking-tight mb-2">Iniciar ventas</h3>
              <p className="text-sm text-[#1F2937]/70 mb-4">
                {sesionActiva
                  ? 'Tu caja está abierta. Cobra o crea un pedido al instante.'
                  : 'Te pediremos abrir caja con tu fondo inicial. Listo en 10 segundos.'}
              </p>
              <div className="mt-auto inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                {sesionActiva ? 'Cobrar ahora' : 'Abrir caja y vender'}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          <OpcionCard
            href="/proveedor/punto-venta/productos"
            icono={Package}
            titulo="Productos"
            descripcion="Crea y edita tu catálogo con fotos, precios y stock."
            tone="amber"
          />

          <OpcionCard
            href="/proveedor/punto-venta/clientes"
            icono={Users}
            titulo="Clientes"
            descripcion="Tu base de compradores para repetir ventas."
            tone="blue"
          />

          <OpcionCard
            href="/proveedor/punto-venta/pedidos"
            icono={ShoppingCart}
            titulo="Pedidos"
            descripcion="Avanza el estado y envía el link de tracking por WhatsApp."
            tone="violet"
          />

          <OpcionCard
            href="/proveedor/punto-venta/reportes"
            icono={LineChart}
            titulo="Reportes"
            descripcion="Ventas por día, top productos y métodos de pago."
            tone="emerald"
          />
        </div>

        {/* Acceso secundario a Caja */}
        <div className="mt-5 flex justify-center">
          <Link
            href="/proveedor/punto-venta/caja"
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--color-texto-suave)] hover:text-[#d4af37] transition-colors"
          >
            <Receipt size={12} /> Ver corte de caja y movimientos
          </Link>
        </div>
      </section>

      {/* Modal abrir caja antes de vender */}
      {showAbrir && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !abriendo && setShowAbrir(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center mb-3">
                  <Unlock size={22} />
                </div>
                <h3 className="text-lg font-black">Abrir caja para vender</h3>
                <p className="text-xs text-[var(--color-texto-suave)] mt-1">
                  Confirma el efectivo con el que abres tu turno. Una vez abierta, podrás cobrar y registrar pedidos.
                </p>
              </div>
              <button onClick={() => setShowAbrir(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-fondo-hover)]" disabled={abriendo}>
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-3 flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">Monto en efectivo (fondo inicial)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  autoFocus
                  className="input w-full pl-7 text-xl font-black"
                  value={montoApertura}
                  onChange={(e) => setMontoApertura(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-[var(--color-texto-muted)] mt-1.5">Si no tienes fondo en efectivo, deja en 0.</p>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] mb-1.5">Notas (opcional)</label>
              <input
                type="text"
                className="input w-full text-sm"
                placeholder="Ej. Turno mañana"
                value={notasApertura}
                onChange={(e) => setNotasApertura(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowAbrir(false)}
                disabled={abriendo}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAbrirYVender}
                disabled={abriendo}
                className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest hover:brightness-110 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {abriendo ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                Abrir y empezar a vender
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TONOS: Record<string, { bg: string; fg: string; ring: string }> = {
  amber:   { bg: 'bg-amber-500/10',   fg: 'text-amber-600',   ring: 'hover:ring-amber-500/30' },
  blue:    { bg: 'bg-blue-500/10',    fg: 'text-blue-600',    ring: 'hover:ring-blue-500/30' },
  violet:  { bg: 'bg-violet-500/10',  fg: 'text-violet-600',  ring: 'hover:ring-violet-500/30' },
  emerald: { bg: 'bg-emerald-500/10', fg: 'text-emerald-600', ring: 'hover:ring-emerald-500/30' },
};

function OpcionCard({
  href, icono: Icon, titulo, descripcion, tone,
}: {
  href: string;
  icono: any;
  titulo: string;
  descripcion: string;
  tone: keyof typeof TONOS;
}) {
  const t = TONOS[tone];
  return (
    <Link
      href={href}
      className={cn(
        'group relative rounded-3xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 ring-transparent',
        t.ring
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', t.bg, t.fg)}>
          <Icon size={20} />
        </div>
        <ArrowRight size={16} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[var(--color-texto-suave)]" />
      </div>
      <p className="text-lg font-black tracking-tight text-[var(--color-texto)]">{titulo}</p>
      <p className="text-xs text-[var(--color-texto-suave)] mt-1.5">{descripcion}</p>
    </Link>
  );
}
