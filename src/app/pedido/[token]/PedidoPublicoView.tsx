'use client';

import { useEffect, useState } from 'react';
import {
  Clock, Package, CheckCircle2, Truck, XCircle, Phone, MapPin, Calendar, Hash, RefreshCw, MessageCircle, ImageOff, Sparkles,
} from 'lucide-react';
import { getPedidoPublicoPV } from '@/lib/actions/puntoVentaActions';
import { cn, formatearMoneda } from '@/lib/utils';

type EstadoPV = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';

interface Pedido {
  folio: number;
  tipo: 'VENTA_DIRECTA' | 'PEDIDO';
  estado: EstadoPV;
  total: number | string;
  pagado: number | string;
  subtotal: number | string;
  descuento: number | string;
  fechaEntrega: string | null;
  creadoEn: string;
  nombreCliente: string | null;
  lineas: Array<{
    id: string;
    nombre: string;
    cantidad: number;
    precioUnit: number | string;
    subtotal: number | string;
    imagen: string | null;
  }>;
  historial: Array<{ id: string; estado: EstadoPV; nota: string | null; creadoEn: string }>;
  proveedor: {
    nombre?: string;
    logoUrl?: string | null;
    ciudad?: string;
    estado?: string;
    telefono?: string | null;
  };
}

const PASOS: EstadoPV[] = ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'];

const META: Record<EstadoPV, { label: string; emoji: string; icon: any; color: string; bg: string; descripcion: string }> = {
  PENDIENTE:       { label: 'Confirmado',    emoji: '📝', icon: Clock,        color: 'text-amber-500',   bg: 'bg-amber-500',   descripcion: 'Tu pedido fue recibido.' },
  EN_PREPARACION:  { label: 'En preparación', emoji: '👨‍🍳', icon: Package,      color: 'text-blue-500',    bg: 'bg-blue-500',    descripcion: 'Lo estamos preparando con cuidado.' },
  LISTO:           { label: 'Listo',          emoji: '✨', icon: Sparkles,     color: 'text-violet-500',  bg: 'bg-violet-500',  descripcion: '¡Ya está listo para entregar!' },
  ENTREGADO:       { label: 'Entregado',      emoji: '🎉', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500', descripcion: 'Pedido entregado. ¡Gracias por tu compra!' },
  CANCELADO:       { label: 'Cancelado',      emoji: '🚫', icon: XCircle,      color: 'text-rose-500',    bg: 'bg-rose-500',    descripcion: 'Este pedido fue cancelado.' },
};

export default function PedidoPublicoView({ pedido: pedidoInicial, token }: { pedido: Pedido; token: string }) {
  const [pedido, setPedido] = useState<Pedido>(pedidoInicial);
  const [refrescando, setRefrescando] = useState(false);
  const [ultimoUpdate, setUltimoUpdate] = useState<Date>(new Date());

  // Auto-refresh cada 45 segundos (solo si no está cancelado/entregado)
  useEffect(() => {
    const terminado = pedido.estado === 'ENTREGADO' || pedido.estado === 'CANCELADO';
    if (terminado) return;

    const intervalo = setInterval(async () => {
      const res = await getPedidoPublicoPV(token);
      if (res.success && res.data) {
        setPedido(res.data as Pedido);
        setUltimoUpdate(new Date());
      }
    }, 45000);

    return () => clearInterval(intervalo);
  }, [pedido.estado, token]);

  const refrescarManual = async () => {
    setRefrescando(true);
    const res = await getPedidoPublicoPV(token);
    if (res.success && res.data) {
      setPedido(res.data as Pedido);
      setUltimoUpdate(new Date());
    }
    setRefrescando(false);
  };

  const meta = META[pedido.estado];
  const idxActual = PASOS.indexOf(pedido.estado);
  const esCancelado = pedido.estado === 'CANCELADO';

  const totalNum = Number(pedido.total);
  const pagadoNum = Number(pedido.pagado);
  const pendiente = totalNum - pagadoNum;

  const llamarProveedor = () => {
    if (pedido.proveedor.telefono) {
      window.open(`tel:${pedido.proveedor.telefono}`, '_self');
    }
  };

  const whatsappProveedor = () => {
    const tel = (pedido.proveedor.telefono || '').replace(/\D/g, '');
    if (!tel) return;
    const mensaje = `¡Hola! Soy ${pedido.nombreCliente || 'tu cliente'}. Tengo una duda sobre mi pedido #${pedido.folio}.`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf6e1] via-white to-[#fdf6e1] text-[#1F2937]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#d4af37]/20 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          {pedido.proveedor.logoUrl ? (
            <img src={pedido.proveedor.logoUrl} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#d4af37]/30" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] font-black">
              {pedido.proveedor.nombre?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest font-black text-[#d4af37]">Seguimiento de pedido</p>
            <p className="text-sm font-black truncate">{pedido.proveedor.nombre}</p>
          </div>
          <button
            onClick={refrescarManual}
            disabled={refrescando}
            className="p-2 rounded-lg hover:bg-[#d4af37]/10 transition-colors"
            aria-label="Actualizar"
          >
            <RefreshCw size={16} className={cn('text-[#1F2937]/60', refrescando && 'animate-spin')} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-6 pb-24">
        {/* Hero del estado */}
        <section className="text-center pt-2">
          <div className="text-6xl mb-3">{meta.emoji}</div>
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#d4af37]/30 shadow-sm mb-3">
            <Hash size={12} className="text-[#d4af37]" />
            <span className="text-xs font-black uppercase tracking-widest">Folio #{pedido.folio}</span>
          </p>
          <h1 className={cn('text-3xl md:text-4xl font-black tracking-tight mb-2', meta.color)}>
            {meta.label}
          </h1>
          <p className="text-[#1F2937]/70 max-w-md mx-auto">{meta.descripcion}</p>
          {pedido.fechaEntrega && !esCancelado && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#d4af37]/30">
              <Calendar size={14} className="text-[#d4af37]" />
              <span className="text-sm font-bold">
                Entrega: {new Date(pedido.fechaEntrega).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
          )}
        </section>

        {/* Timeline progresivo (solo si no es cancelado) */}
        {!esCancelado && (
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#d4af37]/15">
            <p className="text-[10px] uppercase tracking-widest font-black text-[#1F2937]/60 mb-4">Progreso</p>
            <div className="relative">
              {/* Línea de fondo */}
              <div className="absolute top-5 left-5 right-5 h-1 bg-[#d4af37]/15 rounded-full" />
              {/* Línea de progreso */}
              <div
                className="absolute top-5 left-5 h-1 bg-gradient-to-r from-[#d4af37] to-[#b89547] rounded-full transition-all duration-700"
                style={{ width: idxActual >= 0 ? `${(idxActual / (PASOS.length - 1)) * (100 - (10 / PASOS.length))}%` : '0%' }}
              />
              <div className="grid grid-cols-4 relative">
                {PASOS.map((paso, i) => {
                  const m = META[paso];
                  const Icon = m.icon;
                  const completado = i <= idxActual;
                  const actual = i === idxActual;
                  return (
                    <div key={paso} className="flex flex-col items-center text-center gap-2">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center z-10 ring-4 ring-white transition-all',
                          completado
                            ? `${m.bg} text-white shadow-lg`
                            : 'bg-[#d4af37]/10 text-[#1F2937]/30',
                          actual && 'scale-110 shadow-xl animate-pulse'
                        )}
                      >
                        <Icon size={16} />
                      </div>
                      <p className={cn(
                        'text-[10px] font-black uppercase tracking-tight leading-tight max-w-[80px]',
                        completado ? 'text-[#1F2937]' : 'text-[#1F2937]/40'
                      )}>
                        {m.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Historial (con notas si las hay) */}
        {pedido.historial.length > 0 && (
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#d4af37]/15">
            <p className="text-[10px] uppercase tracking-widest font-black text-[#1F2937]/60 mb-4">Historial</p>
            <ol className="space-y-4">
              {[...pedido.historial].reverse().map((h, i) => {
                const m = META[h.estado];
                return (
                  <li key={h.id} className="flex items-start gap-3">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0', m.bg)}>
                      <span className="text-sm">{m.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn('text-sm font-black uppercase tracking-tight', m.color)}>{m.label}</p>
                        {i === 0 && <span className="text-[9px] font-black uppercase tracking-widest bg-[#d4af37]/20 text-[#1F2937] px-2 py-0.5 rounded-full">Actual</span>}
                      </div>
                      <p className="text-[11px] text-[#1F2937]/50">
                        {new Date(h.creadoEn).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {h.nota && (
                        <p className="text-xs italic text-[#1F2937]/70 mt-1 bg-[#d4af37]/5 border-l-2 border-[#d4af37]/40 pl-3 py-1">"{h.nota}"</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Productos */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#d4af37]/15">
          <p className="text-[10px] uppercase tracking-widest font-black text-[#1F2937]/60 mb-4">
            Tu pedido ({pedido.lineas.length} {pedido.lineas.length === 1 ? 'producto' : 'productos'})
          </p>
          <ul className="space-y-3 mb-5">
            {pedido.lineas.map((l) => (
              <li key={l.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#fdf6e1] overflow-hidden flex items-center justify-center shrink-0">
                  {l.imagen ? (
                    <img src={l.imagen} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageOff size={16} className="text-[#1F2937]/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{l.nombre}</p>
                  <p className="text-[11px] text-[#1F2937]/60">
                    {l.cantidad} × {formatearMoneda(Number(l.precioUnit))}
                  </p>
                </div>
                <p className="text-sm font-black whitespace-nowrap">{formatearMoneda(Number(l.subtotal))}</p>
              </li>
            ))}
          </ul>

          <div className="border-t border-[#d4af37]/20 pt-4 space-y-2">
            <Linea label="Subtotal" value={formatearMoneda(Number(pedido.subtotal))} />
            {Number(pedido.descuento) > 0 && (
              <Linea label="Descuento" value={`- ${formatearMoneda(Number(pedido.descuento))}`} />
            )}
            <Linea label="Total" value={formatearMoneda(totalNum)} highlight />
            {pagadoNum > 0 && (
              <Linea label="Pagado" value={formatearMoneda(pagadoNum)} className="text-emerald-600" />
            )}
            {pendiente > 0 && !esCancelado && (
              <Linea label="Por pagar" value={formatearMoneda(pendiente)} className="text-rose-600" bold />
            )}
          </div>
        </section>

        {/* Contacto con el proveedor */}
        {pedido.proveedor.telefono && (
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#d4af37]/15 text-center">
            <p className="text-[10px] uppercase tracking-widest font-black text-[#1F2937]/60 mb-2">¿Alguna duda?</p>
            <p className="text-sm font-bold mb-4">Contacta a {pedido.proveedor.nombre}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={whatsappProveedor}
                style={{ backgroundColor: '#25D366' }}
                className="flex-1 max-w-[200px] py-3 rounded-xl text-white font-black uppercase text-xs tracking-widest hover:brightness-110 inline-flex items-center justify-center gap-2"
              >
                <MessageCircle size={14} fill="currentColor" strokeWidth={0} /> WhatsApp
              </button>
              <button
                onClick={llamarProveedor}
                className="flex-1 max-w-[200px] py-3 rounded-xl border-2 border-[#1F2937] text-[#1F2937] font-black uppercase text-xs tracking-widest hover:bg-[#1F2937] hover:text-white transition-colors inline-flex items-center justify-center gap-2"
              >
                <Phone size={14} /> Llamar
              </button>
            </div>
          </section>
        )}

        {/* Footer info */}
        <section className="text-center text-[11px] text-[#1F2937]/50 space-y-1 pt-2">
          {pedido.proveedor.ciudad && (
            <p className="inline-flex items-center gap-1.5">
              <MapPin size={11} /> {pedido.proveedor.ciudad}{pedido.proveedor.estado ? `, ${pedido.proveedor.estado}` : ''}
            </p>
          )}
          <p className="font-bold">Actualizado {ultimoUpdate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
          {!esCancelado && pedido.estado !== 'ENTREGADO' && (
            <p>Esta página se actualiza sola cada minuto.</p>
          )}
          <p className="pt-3 text-[10px]">Pedido creado el {new Date(pedido.creadoEn).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </section>
      </main>
    </div>
  );
}

function Linea({ label, value, className = '', highlight = false, bold = false }: {
  label: string; value: string; className?: string; highlight?: boolean; bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-xs font-bold', highlight ? 'text-sm' : 'text-[#1F2937]/70', className)}>{label}</span>
      <span className={cn(
        highlight ? 'text-lg font-black text-[#1F2937]' : bold ? 'text-base font-black' : 'text-sm font-bold',
        className
      )}>{value}</span>
    </div>
  );
}
