'use client';

import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Trash2,
  Users,
  Wallet,
  Store,
  Loader2,
  Mail,
} from 'lucide-react';
import { formatearMoneda, cn } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { eliminarEventoAdmin, getEventoDetalleAdmin } from '@/lib/actions/adminActions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type EventoRow = {
  id: string;
  nombre: string;
  tipo: string;
  fecha: string | Date | null;
  presupuestoTotal: number | string;
  estado: string;
  creadoEn: string | Date;
  cliente?: {
    id: string;
    usuario?: { nombre?: string | null; email?: string | null } | null;
  } | null;
  _count?: { invitados: number };
};

interface Props {
  initialEventos: EventoRow[];
}

const ESTADO_META: Record<string, { label: string; color: string; Icon: any }> = {
  ACTIVO:     { label: 'En Proceso', color: 'text-blue-500',    Icon: Clock },
  CANCELADO:  { label: 'Cancelado',  color: 'text-red-500',     Icon: AlertCircle },
  FINALIZADO: { label: 'Finalizado', color: 'text-emerald-500', Icon: CheckCircle2 },
};

export default function EventosAdminClient({ initialEventos }: Props) {
  const [eventos, setEventos] = useState<EventoRow[]>(initialEventos);
  const [termino, setTermino] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [detalleData, setDetalleData] = useState<any | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Cierra el menú al hacer click fuera
  useEffect(() => {
    if (!menuOpenId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpenId]);

  // Carga el detalle al abrir el modal
  useEffect(() => {
    if (!detalleId) {
      setDetalleData(null);
      return;
    }
    setDetalleLoading(true);
    setDetalleData(null);
    getEventoDetalleAdmin(detalleId).then((res) => {
      if (res.success) setDetalleData(res.data);
      setDetalleLoading(false);
    });
  }, [detalleId]);

  const filtrados = useMemo(() => {
    const q = termino.trim().toLowerCase();
    if (!q) return eventos;
    return eventos.filter((e) => {
      const cliente = e.cliente?.usuario?.nombre?.toLowerCase() || '';
      const email = e.cliente?.usuario?.email?.toLowerCase() || '';
      return (
        e.id.toLowerCase().includes(q) ||
        e.nombre.toLowerCase().includes(q) ||
        cliente.includes(q) ||
        email.includes(q)
      );
    });
  }, [eventos, termino]);

  const stats = useMemo(() => {
    const total = eventos.length;
    const activos = eventos.filter((e) => e.estado === 'ACTIVO').length;
    const finalizados = eventos.filter((e) => e.estado === 'FINALIZADO').length;
    const ahora = new Date();
    const en30 = eventos.filter((e) => {
      if (!e.fecha) return false;
      const f = new Date(e.fecha);
      const diff = (f.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    }).length;
    return { total, activos, en30, finalizados };
  }, [eventos]);

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este evento? Se borrarán invitados, presupuesto, álbum e invitación. Las reservas existentes se desvincularán.')) {
      setMenuOpenId(null);
      return;
    }
    setEliminando(id);
    const res = await eliminarEventoAdmin(id);
    if (res.success) {
      setEventos((prev) => prev.filter((e) => e.id !== id));
      setMenuOpenId(null);
      if (detalleId === id) setDetalleId(null);
    } else {
      alert(`Error: ${res.error}`);
    }
    setEliminando(null);
  };

  const fechaCorta = (f: string | Date | null | undefined) => {
    if (!f) return '—';
    try { return format(new Date(f), 'dd MMM yyyy', { locale: es }); } catch { return '—'; }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Monitoreo Global de Eventos</h1>
          <p className="text-[var(--color-texto-suave)]">Supervisión de todos los proyectos activos en la plataforma.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" size={18} />
            <input
              type="text"
              placeholder="Buscar por cliente o ID..."
              className="bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-[var(--color-primario-claro)] transition-all w-64"
              value={termino}
              onChange={(e) => setTermino(e.target.value)}
            />
          </div>
          <button className="btn btn-secundario px-4 py-2 flex items-center gap-2 text-sm">
            <Filter size={16} /> Filtros
          </button>
        </div>
      </div>

      {/* Grid de Resumen Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { l: 'Total Eventos',     v: String(stats.total),       c: 'text-[var(--color-texto)]' },
          { l: 'En Proceso',        v: String(stats.activos),     c: 'text-blue-500' },
          { l: 'Próximos 30 días',  v: String(stats.en30),        c: 'text-amber-500' },
          { l: 'Finalizados',       v: String(stats.finalizados), c: 'text-emerald-500' },
        ].map((s, i) => (
          <div key={i} className="card p-4 border-none bg-[var(--color-fondo-card)]">
            <p className="text-[10px] uppercase font-black tracking-widest text-[var(--color-texto-muted)] mb-1">{s.l}</p>
            <p className={cn('text-2xl font-black', s.c)}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-visible p-0">
        <div className="overflow-x-auto">
          <table className="tabla w-full">
            <thead>
              <tr className="bg-[var(--color-fondo-card)]">
                <th className="px-6 py-4 text-left">ID & Cliente</th>
                <th className="px-6 py-4 text-left">Tipo</th>
                <th className="px-6 py-4 text-left">Fecha</th>
                <th className="px-6 py-4 text-left">Presupuesto</th>
                <th className="px-6 py-4 text-right">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-borde-suave)]">
              {filtrados.map((evt) => {
                const meta = ESTADO_META[evt.estado] || ESTADO_META.ACTIVO;
                const Icon = meta.Icon;
                const presupuesto = Number(evt.presupuestoTotal) || 0;
                return (
                  <tr key={evt.id} className="hover:bg-[var(--color-fondo-hover)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{evt.cliente?.usuario?.nombre || 'Sin cliente'}</div>
                      <div className="text-[11px] text-[var(--color-texto-muted)] font-mono uppercase truncate max-w-[180px]">{evt.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-premium text-[10px]">{evt.tipo}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{fechaCorta(evt.fecha)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold">{formatearMoneda(presupuesto)}</div>
                      <div className="text-[10px] text-[var(--color-texto-muted)]">
                        {evt._count?.invitados ?? 0} invitados
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={cn('flex items-center justify-end gap-1.5 text-xs font-bold', meta.color)}>
                        <Icon size={14} />
                        {meta.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 relative">
                        <button
                          type="button"
                          onClick={() => setDetalleId(evt.id)}
                          className="p-2 hover:bg-[var(--color-fondo-hover)] rounded-lg transition-colors text-[var(--color-primario-claro)]"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setMenuOpenId(menuOpenId === evt.id ? null : evt.id)}
                          className="p-2 hover:bg-[var(--color-fondo-hover)] rounded-lg transition-colors text-[var(--color-texto-muted)]"
                          title="Más opciones"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {menuOpenId === evt.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] shadow-lg z-20 overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => { setMenuOpenId(null); setDetalleId(evt.id); }}
                              className="w-full text-left px-4 py-3 text-sm font-bold text-[var(--color-texto)] hover:bg-[var(--color-fondo-hover)] flex items-center gap-2"
                            >
                              <Eye size={14} /> Ver detalles
                            </button>
                            <button
                              type="button"
                              disabled={eliminando === evt.id}
                              onClick={() => handleEliminar(evt.id)}
                              className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-2 disabled:opacity-50"
                            >
                              {eliminando === evt.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              Eliminar evento
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-texto-muted)] text-sm">
                    No hay eventos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALLE */}
      {detalleId && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
          onClick={() => setDetalleId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 bg-[var(--color-fondo-card)] border-b border-[var(--color-borde-suave)] px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-black tracking-tight text-[var(--color-texto)]">
                Detalles del evento
              </h3>
              <button
                type="button"
                onClick={() => setDetalleId(null)}
                className="p-2 hover:bg-[var(--color-fondo-hover)] rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {detalleLoading && (
                <div className="flex items-center justify-center py-16 text-[var(--color-texto-muted)]">
                  <Loader2 className="animate-spin mr-2" size={20} /> Cargando…
                </div>
              )}

              {!detalleLoading && detalleData && (
                <>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-[var(--color-texto-muted)]">{detalleData.tipo}</p>
                    <h2 className="text-2xl font-black text-[var(--color-texto)]">{detalleData.nombre}</h2>
                    <p className="text-sm text-[var(--color-texto-suave)] mt-1">
                      {fechaCorta(detalleData.fecha)} · Presupuesto {formatearMoneda(Number(detalleData.presupuestoTotal) || 0)}
                    </p>
                  </div>

                  <section>
                    <p className="text-[10px] uppercase font-black tracking-widest text-[var(--color-texto-muted)] mb-2">Cliente</p>
                    <div className="rounded-xl bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] px-4 py-3">
                      <p className="text-sm font-bold text-[var(--color-texto)]">
                        {detalleData.cliente?.usuario?.nombre || 'Sin nombre'}
                      </p>
                      <p className="text-xs text-[var(--color-texto-suave)] flex items-center gap-1.5 mt-1">
                        <Mail size={12} /> {detalleData.cliente?.usuario?.email || '—'}
                      </p>
                    </div>
                  </section>

                  <div className="grid grid-cols-3 gap-3">
                    <Stat icon={Users} label="Invitados" value={detalleData.invitados?.length ?? 0} color="text-blue-500" />
                    <Stat icon={Store} label="Reservas" value={detalleData.reservas?.length ?? 0} color="text-amber-500" />
                    <Stat icon={Wallet} label="Líneas presupuesto" value={detalleData.lineasPresupuesto?.length ?? 0} color="text-emerald-500" />
                  </div>

                  {detalleData.reservas?.length > 0 && (
                    <section>
                      <p className="text-[10px] uppercase font-black tracking-widest text-[var(--color-texto-muted)] mb-2">Proveedores reservados</p>
                      <div className="space-y-2">
                        {detalleData.reservas.map((r: any) => (
                          <div key={r.id} className="rounded-xl bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] px-4 py-3 flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-[var(--color-texto)] truncate">{r.servicio?.nombre || 'Servicio'}</p>
                              <p className="text-xs text-[var(--color-texto-suave)] truncate">{r.proveedor?.nombre || '—'}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-[var(--color-texto)]">{formatearMoneda(Number(r.montoTotal) || 0)}</p>
                              <p className="text-[10px] uppercase font-black tracking-widest text-[var(--color-texto-muted)]">{r.estado}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-[var(--color-fondo-card)] border-t border-[var(--color-borde-suave)] px-6 py-4 flex items-center justify-between">
              <button
                type="button"
                disabled={eliminando === detalleId}
                onClick={() => detalleId && handleEliminar(detalleId)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {eliminando === detalleId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Eliminar evento
              </button>
              <button
                type="button"
                onClick={() => setDetalleId(null)}
                className="px-6 py-2 rounded-xl text-sm font-bold text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-xl bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] px-3 py-3">
      <p className={cn('flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest', color)}>
        <Icon size={12} /> {label}
      </p>
      <p className="text-xl font-black text-[var(--color-texto)] mt-1">{value}</p>
    </div>
  );
}
