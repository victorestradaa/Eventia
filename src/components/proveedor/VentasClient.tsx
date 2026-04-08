'use client';

import { useState } from 'react';
import { Search, Download, Filter, Calendar as CalendarIcon, Plus, Gem, X, Loader2, UserPlus } from 'lucide-react';
import { formatearMoneda, formatearFechaCorta } from '@/lib/utils';
import SaleDetailsModal from './SaleDetailsModal';
import { createManualReserva } from '@/lib/actions/salesActions';

interface VentasClientProps {
  ventasIniciales: any[];
  proveedorId: string;
  planProveedor: string;
  servicios: any[];
}

export default function VentasClient({ ventasIniciales, proveedorId, planProveedor, servicios }: VentasClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [ventas, setVentas] = useState(ventasIniciales);
  const [selectedVenta, setSelectedVenta] = useState<any | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  const isElite = planProveedor === 'ELITE';

  // Filtro de búsqueda
  const filteredVentas = ventas.filter(v => {
    const matchesSearch = v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cliente?.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.servicio?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.nombreClienteExterno?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || v.estado === statusFilter;
    const matchesService = serviceFilter === '' || v.servicioId === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  // Cálculos rápidos
  const totalBruto = ventas.reduce((acc, v) => {
    const pagado = v.transacciones?.filter((t: any) => t.estado === 'PAGADO').reduce((sum: number, t: any) => sum + Number(t.monto), 0) || 0;
    return acc + pagado;
  }, 0);

  const comisionRate = isElite ? 0 : 0.05;
  const comisiones = totalBruto * comisionRate;
  const neto = totalBruto - comisiones;

  const getClienteName = (venta: any) => {
    if (venta.esManual) return venta.nombreClienteExterno || 'Cliente Externo';
    return venta.cliente?.usuario?.nombre || 'Cliente Anónimo';
  };

  const getClienteInitial = (venta: any) => {
    const name = getClienteName(venta);
    return name.charAt(0).toUpperCase();
  };

  const getVencimientoText = (venta: any) => {
    const pendientes = venta.transacciones?.filter((t: any) => t.estado === 'PENDIENTE') || [];
    if (pendientes.length === 0) return 'Al corriente';

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const vencidos = pendientes.filter((t: any) => t.fechaVencimiento && new Date(t.fechaVencimiento) < hoy);
    if (vencidos.length > 0) {
      const montoVencido = vencidos.reduce((acc: number, t: any) => acc + Number(t.monto), 0);
      return <span className="text-red-600 font-bold uppercase text-[10px] bg-red-50 px-2 py-0.5 rounded border border-red-200 shadow-sm">VENCIDO {formatearMoneda(montoVencido)}</span>;
    }

    const proximos = pendientes
      .filter((t: any) => t.fechaVencimiento)
      .sort((a: any, b: any) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());

    if (proximos.length > 0) {
      const proximaTransaccion = proximos[0];
      const proximaFecha = new Date(proximaTransaccion.fechaVencimiento);
      const diffTime = proximaFecha.getTime() - hoy.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const montoProximo = formatearMoneda(Number(proximaTransaccion.monto));
      
      if (diffDays === 0) return <span className="text-red-500 font-bold uppercase text-[10px] animate-pulse bg-red-50 px-2 py-0.5 rounded border border-red-200">VENCE HOY {montoProximo}</span>;
      if (diffDays === 1) return <span className="text-red-500 font-bold uppercase text-[10px] bg-red-50/50 px-2 py-0.5 rounded border border-red-100">{montoProximo} VENCE MAÑANA</span>;
      return <span className="text-red-500 font-bold uppercase text-[10px] bg-red-50/30 px-2 py-0.5 rounded border border-red-100">{montoProximo} VENCE EN {diffDays} DIAS</span>;
    }

    return <span className="text-green-600 uppercase font-black tracking-widest text-[10px] bg-green-50 px-2 py-0.5 rounded border border-green-200">AL CORRIENTE</span>;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-texto xl">Registro de Ventas</h1>
          <p className="text-[var(--color-texto-suave)] mt-1">Historial detallado de transacciones, abonos y comisiones.</p>
        </div>
        <div className="flex gap-3">
          {isElite && (
            <button 
              onClick={() => setShowManualModal(true)} 
              className="btn bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all"
            >
              <UserPlus size={18} />
              Venta Manual
            </button>
          )}
          <button className="btn btn-secundario gap-2">
            <Download size={18} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Banner Elite */}
      {isElite && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Gem size={20} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-emerald-400">Plan Elite Activo — 0% Comisión</p>
            <p className="text-xs text-[var(--color-texto-muted)]">Puedes crear ventas manuales para clientes fuera de la app y apartar fechas libremente.</p>
          </div>
        </div>
      )}

      {/* Resumen rápido de ventas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-[var(--color-primario)]/10 to-[var(--color-fondo-card)] border border-[var(--color-primario)]/30">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-texto-muted)] mb-2">Total Cobrado (Histórico)</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-black text-[var(--color-texto-fuerte)]">{formatearMoneda(totalBruto)}</h2>
          </div>
        </div>
        <div className="card border border-[var(--color-borde-suave)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-500/5 transition-opacity opacity-0 group-hover:opacity-100"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-texto-muted)] mb-2">Comisiones de App ({isElite ? '0%' : '5%'})</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-black text-red-500/80">{formatearMoneda(comisiones)}</h2>
          </div>
        </div>
        <div className="card border border-[var(--color-borde-suave)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-green-500/5 transition-opacity opacity-0 group-hover:opacity-100"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-texto-muted)] mb-2">Neto Recibido</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-black text-[var(--color-liquidado)]">{formatearMoneda(neto)}</h2>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap gap-4 items-center bg-[var(--color-fondo-card)] p-4 rounded-xl border border-[var(--color-borde-suave)] shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-12 h-12 w-full text-base" 
            placeholder="Buscar por cliente, identificador o servicio..." 
          />
        </div>
        <div className="relative flex items-center gap-2 px-4 py-3 bg-[var(--color-fondo-input)] rounded-xl border border-[var(--color-borde-suave)] text-sm cursor-pointer hover:border-[var(--color-primario-claro)] hover:bg-[var(--color-primario)]/5 transition-all font-medium text-[var(--color-texto-suave)]">
          <CalendarIcon size={16} />
          <span>Todos los Tiempos</span>
        </div>
        <div 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm cursor-pointer transition-all font-medium ${showFilters ? 'bg-[var(--color-primario)]/10 border-[var(--color-primario)] text-[var(--color-primario-claro)]' : 'bg-[var(--color-fondo-input)] border-[var(--color-borde-suave)] text-[var(--color-texto-suave)] hover:border-[var(--color-primario-claro)]'}`}
        >
          <Filter size={16} />
          <span>Filtros</span>
          {(statusFilter || serviceFilter) && (
            <span className="w-2 h-2 rounded-full bg-[var(--color-primario-claro)] ml-1"></span>
          )}
        </div>
      </div>

      {/* Panel de Filtros Expandible */}
      {showFilters && (
        <div className="bg-[var(--color-fondo-card)] p-6 rounded-2xl border border-[var(--color-borde-suave)] shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-texto-muted)]">Filtros Avanzados</h3>
            <button 
              onClick={() => {
                setStatusFilter('');
                setServiceFilter('');
              }}
              className="text-[10px] font-black uppercase text-[var(--color-primario-claro)] hover:underline"
            >
              Limpiar Todo
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest pl-1">Estado de Reserva</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input w-full h-12"
              >
                <option value="">Cualquier Estado</option>
                <option value="APARTADO">Apartado</option>
                <option value="LIQUIDADO">Liquidado</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="PENDIENTE">Pendiente</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest pl-1">Servicio</label>
              <select 
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="input w-full h-12"
              >
                <option value="">Todos los Servicios</option>
                {servicios.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => setShowFilters(false)}
                className="btn btn-primario w-full h-12 uppercase font-black tracking-widest text-xs"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista Móvil (Lista de Tarjetas) */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {filteredVentas.length === 0 ? (
          <div className="card p-10 text-center text-[var(--color-texto-muted)]">
            No se encontraron reservas.
          </div>
        ) : (
          filteredVentas.map((venta) => {
            const totalPagado = venta.transacciones?.filter((t: any) => t.estado === 'PAGADO').reduce((sum: number, t: any) => sum + Number(t.monto), 0) || 0;
            const penalizaciones = venta.transacciones?.filter((t: any) => t.tipo === 'PENALIZACION').reduce((sum: number, t: any) => sum + Number(t.monto), 0) || 0;
            const totalContratado = Number(venta.montoTotal) + penalizaciones;
            const saldoRestante = totalContratado - totalPagado;
            const saldoVencido = venta.transacciones?.filter((t: any) => t.estado === 'PENDIENTE' && t.fechaVencimiento && new Date(t.fechaVencimiento) < new Date()).reduce((sum: number, t: any) => sum + Number(t.monto), 0) || 0;

            return (
              <div 
                key={venta.id} 
                onClick={() => setSelectedVenta(venta)}
                className="card bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] p-5 space-y-4 hover:border-[var(--color-acento)]/30 active:scale-95 transition-all shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${venta.esManual ? 'bg-gradient-to-tr from-emerald-500 to-emerald-400' : 'bg-gradient-to-tr from-[var(--color-primario)] to-[var(--color-primario-claro)]'}`}>
                      {getClienteInitial(venta)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm group-hover:text-[var(--color-acento)] transition-colors">{getClienteName(venta)}</h4>
                      <span className="text-[10px] font-mono text-[var(--color-texto-muted)]">#{venta.id.split('-')[0].substring(0,8).toUpperCase()}</span>
                    </div>
                  </div>
                  <span className={`badge badge-${venta.estado.toLowerCase()} text-[9px] font-black tracking-widest`}>
                    {venta.estado}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-[var(--color-borde-suave)]">
                  <div>
                    <p className="text-[9px] uppercase font-black tracking-widest text-[var(--color-texto-muted)] mb-1">Fecha</p>
                    <p className="text-xs font-bold">{formatearFechaCorta(venta.fechaEvento)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-black tracking-widest text-[var(--color-texto-muted)] mb-1">Restante</p>
                    <p className="text-sm font-black text-orange-500">{formatearMoneda(saldoRestante)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[9px] uppercase font-black tracking-widest text-[var(--color-texto-muted)] mb-1">Estatus Pago</p>
                    <div className="text-xs font-bold mt-1">
                      {getVencimientoText(venta)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-black tracking-widest text-[var(--color-texto-muted)] mb-1">Total</p>
                    <p className="text-xs font-medium">{formatearMoneda(totalContratado)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tabla de Ventas (Escritorio) */}
      <div className="card p-0 overflow-hidden shadow-xl border border-[var(--color-borde-suave)] hidden sm:block">
        <div className="overflow-x-auto">
          <table className="tabla w-full whitespace-nowrap">
            <thead className="bg-[var(--color-fondo-input)] text-[var(--color-texto-suave)] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold text-left">Reserva</th>
                <th className="px-6 py-4 font-bold text-left">Cliente</th>
                <th className="px-6 py-4 font-bold text-left">Fecha Evento</th>
                <th className="px-6 py-4 font-bold text-left">Servicio</th>
                <th className="px-6 py-4 font-bold text-right">Contratado</th>
                <th className="px-6 py-4 font-bold text-right">Restante</th>
                <th className="px-6 py-4 font-bold text-right">Saldo Vencido</th>
                <th className="px-6 py-4 font-bold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-borde-suave)]">
              {filteredVentas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[var(--color-texto-muted)]">
                    No se encontraron reservas que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredVentas.map((venta) => {
                  const totalPagado = venta.transacciones?.filter((t: any) => t.estado === 'PAGADO').reduce((sum: number, t: any) => sum + Number(t.monto), 0) || 0;
                  const penalizaciones = venta.transacciones?.filter((t: any) => t.tipo === 'PENALIZACION').reduce((sum: number, t: any) => sum + Number(t.monto), 0) || 0;
                  const totalContratado = Number(venta.montoTotal) + penalizaciones;
                  const saldoRestante = totalContratado - totalPagado;
                  const saldoVencido = venta.transacciones?.filter((t: any) => t.estado === 'PENDIENTE' && t.fechaVencimiento && new Date(t.fechaVencimiento) < new Date()).reduce((sum: number, t: any) => sum + Number(t.monto), 0) || 0;

                  return (
                    <tr 
                      key={venta.id} 
                      onClick={() => setSelectedVenta(venta)}
                      className="cursor-pointer group hover:bg-[var(--color-primario)]/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[var(--color-texto-muted)] group-hover:text-[var(--color-primario-claro)] transition-colors">
                            {venta.id.split('-')[0].substring(0,8).toUpperCase()}
                          </span>
                          {venta.esManual && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500">Manual</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${venta.esManual ? 'bg-gradient-to-tr from-emerald-500 to-emerald-400' : 'bg-gradient-to-tr from-[var(--color-primario)] to-[var(--color-primario-claro)]'}`}>
                            {getClienteInitial(venta)}
                          </div>
                          <div>
                            <span className="font-semibold text-sm">{getClienteName(venta)}</span>
                            {venta.esManual && venta.telefonoClienteExterno && (
                              <p className="text-[10px] text-[var(--color-texto-muted)]">{venta.telefonoClienteExterno}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-texto-suave)]">
                        {formatearFechaCorta(venta.fechaEvento)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[var(--color-texto-fuerte)]">
                        {venta.servicio?.nombre || 'Servicio Desconocido'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-[var(--color-texto-fuerte)] text-sm">
                          {formatearMoneda(totalContratado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-orange-500 text-sm">
                          {formatearMoneda(saldoRestante)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-xs font-black">
                          {getVencimientoText(venta)}
                        </div>
                        {saldoVencido > 0 && <span className="text-[10px] text-red-400 block">{formatearMoneda(saldoVencido)} vencido</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`badge badge-${venta.estado.toLowerCase()} text-[10px] shadow-sm`}>
                          {venta.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles de Venta */}
      {selectedVenta && (
        <SaleDetailsModal 
          venta={selectedVenta} 
          onClose={() => setSelectedVenta(null)}
          onUpdate={(updatedData: any) => {
             setVentas(prev => prev.map(v => v.id === updatedData.id ? updatedData : v));
             setSelectedVenta(updatedData);
          }}
        />
      )}

      {/* Modal de Venta Manual — Solo Elite */}
      {showManualModal && isElite && (
        <ManualSaleModal
          proveedorId={proveedorId}
          servicios={servicios}
          onClose={() => setShowManualModal(false)}
          onCreated={(newVenta: any) => {
            // Enriquecer la venta con la relación del servicio para la tabla
            const servicio = servicios.find((s: any) => s.id === newVenta.servicioId);
            const ventaEnriquecida = {
              ...newVenta,
              servicio,
              transacciones: newVenta.transacciones || [],
            };
            setVentas(prev => [ventaEnriquecida, ...prev]);
            setShowManualModal(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Modal Interno: Crear Venta Manual ────────────────────────────────────────
function ManualSaleModal({ proveedorId, servicios, onClose, onCreated }: {
  proveedorId: string;
  servicios: any[];
  onClose: () => void;
  onCreated: (venta: any) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    nombreCliente: '',
    telefonoCliente: '',
    servicioId: servicios.length > 0 ? servicios[0].id : '',
    fechaEvento: '',
    montoTotal: '',
    notas: '',
    tieneAnticipo: false,
    anticipoMonto: '',
    anticipoMetodo: 'EFECTIVO',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombreCliente || !form.servicioId || !form.fechaEvento || !form.montoTotal) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    setIsSubmitting(true);

    const res = await createManualReserva({
      proveedorId,
      servicioId: form.servicioId,
      nombreCliente: form.nombreCliente,
      telefonoCliente: form.telefonoCliente || undefined,
      fechaEvento: new Date(form.fechaEvento),
      montoTotal: parseFloat(form.montoTotal),
      notas: form.notas || undefined,
      anticipoMonto: form.tieneAnticipo ? parseFloat(form.anticipoMonto) || 0 : undefined,
      anticipoMetodo: form.tieneAnticipo ? form.anticipoMetodo : undefined,
    });

    if (res.success && res.data) {
      onCreated(res.data);
    } else {
      alert(res.error || 'Error al crear la venta manual.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-fondo-card)] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-emerald-500/20 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-5 border-b border-[var(--color-borde-suave)] flex justify-between items-center bg-[var(--color-fondo-app)]/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <UserPlus size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Nueva Venta Manual</h2>
              <p className="text-xs text-[var(--color-texto-muted)]">Registra una venta para un cliente fuera de la app</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-2 rounded-full hover:bg-[var(--color-fondo-input)] text-[var(--color-texto-suave)] transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Datos del Cliente Externo */}
          <div className="space-y-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <UserPlus size={16} /> Datos del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--color-texto-suave)]">Nombre del Cliente <span className="text-red-500">*</span></label>
                <input 
                  required
                  value={form.nombreCliente}
                  onChange={e => setForm({...form, nombreCliente: e.target.value})}
                  type="text" 
                  className="input w-full h-12" 
                  placeholder="Ej. María García López" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--color-texto-suave)]">Teléfono <span className="text-[10px] font-normal">(Opcional)</span></label>
                <input 
                  value={form.telefonoCliente}
                  onChange={e => setForm({...form, telefonoCliente: e.target.value})}
                  type="tel" 
                  className="input w-full h-12" 
                  placeholder="Ej. 33 1234 5678" 
                />
              </div>
            </div>
          </div>

          {/* Servicio y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-texto-suave)]">Servicio / Paquete <span className="text-red-500">*</span></label>
              <select
                required
                value={form.servicioId}
                onChange={e => {
                  const sid = e.target.value;
                  const servicio = servicios.find((s: any) => s.id === sid);
                  setForm({
                    ...form, 
                    servicioId: sid,
                    montoTotal: servicio ? Number(servicio.precio).toString() : form.montoTotal
                  });
                }}
                className="input w-full h-12"
              >
                {servicios.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.nombre} — ${Number(s.precio).toLocaleString()}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-texto-suave)]">Fecha del Evento <span className="text-red-500">*</span></label>
              <input 
                required
                value={form.fechaEvento}
                onChange={e => setForm({...form, fechaEvento: e.target.value})}
                type="date" 
                className="input w-full h-12" 
              />
            </div>
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--color-texto-suave)]">Monto Total Contratado (MXN) <span className="text-red-500">*</span></label>
            <input 
              required
              value={form.montoTotal}
              onChange={e => setForm({...form, montoTotal: e.target.value})}
              type="number" step="0.01" min="0" 
              className="input w-full h-12 text-lg font-bold" 
              placeholder="Ej. 15000" 
            />
          </div>

          {/* Anticipo */}
          <div className="space-y-4 bg-[var(--color-fondo-input)] rounded-2xl p-5 border border-[var(--color-borde-suave)]">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={form.tieneAnticipo}
                onChange={e => setForm({...form, tieneAnticipo: e.target.checked})}
                className="w-5 h-5 rounded accent-emerald-500"
              />
              <span className="text-sm font-bold">¿Registrar un anticipo ahora?</span>
            </label>

            {form.tieneAnticipo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-texto-suave)]">Monto del Anticipo</label>
                  <input 
                    value={form.anticipoMonto}
                    onChange={e => setForm({...form, anticipoMonto: e.target.value})}
                    type="number" step="0.01" min="0" 
                    className="input w-full h-12" 
                    placeholder="Ej. 5000" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-texto-suave)]">Método de Pago</label>
                  <select 
                    value={form.anticipoMetodo}
                    onChange={e => setForm({...form, anticipoMetodo: e.target.value})}
                    className="input w-full h-12"
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="TARJETA">Tarjeta</option>
                    <option value="DEPOSITO">Depósito</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--color-texto-suave)]">Notas <span className="text-[10px] font-normal">(Opcional)</span></label>
            <textarea 
              value={form.notas}
              onChange={e => setForm({...form, notas: e.target.value})}
              className="input w-full min-h-[80px] py-3 resize-y" 
              placeholder="Detalles adicionales sobre la venta..."
            ></textarea>
          </div>

          {/* Acciones */}
          <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-borde-suave)]">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn bg-[var(--color-fondo-input)] hover:bg-[var(--color-borde-fuerte)] h-12 px-6">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn bg-emerald-600 hover:bg-emerald-500 text-white h-12 px-8 shadow-lg shadow-emerald-500/20">
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Registrar Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
