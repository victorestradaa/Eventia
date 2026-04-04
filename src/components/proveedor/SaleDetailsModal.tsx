'use client';

import { useState } from 'react';
import { X, Calendar as CalendarIcon, DollarSign, AlertCircle, CheckCircle, RotateCcw, Plus, CalendarDays } from 'lucide-react';
import { formatearMoneda, formatearFechaCorta } from '@/lib/utils';
import { updateReservaStatus, addTransaction, payTransaction, rescheduleReserva } from '@/lib/actions/salesActions';

interface Props {
  venta: any;
  onClose: () => void;
  onUpdate: (updatedVenta: any) => void;
}

export default function SaleDetailsModal({ venta, onClose, onUpdate }: Props) {
  const [estado, setEstado] = useState(venta.estado);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Forms State
  const [showAbonoForm, setShowAbonoForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  
  // Abono Payload
  const [abono, setAbono] = useState({
    monto: '',
    tipo: 'ABONO',
    metodoPago: 'TRANSFERENCIA',
    estado: 'PAGADO',
    notas: '',
    fechaVencimiento: ''
  });

  // Reschedule Payload
  const [reschedule, setReschedule] = useState({
    nuevaFecha: '',
    aplicarPenalidad: false,
    montoPenalidad: '',
    notas: ''
  });

  // Cálculos Financieros
  const pagosPagados = venta.transacciones?.filter((t: any) => t.estado === 'PAGADO') || [];
  const pagosPendientes = venta.transacciones?.filter((t: any) => t.estado === 'PENDIENTE') || [];
  
  const totalPagado = pagosPagados.reduce((sum: number, t: any) => sum + Number(t.monto), 0);
  
  // El Total Adeudado Original (monto total) + Todas las penalizaciones generadas
  const penalizaciones = venta.transacciones?.filter((t: any) => t.tipo === 'PENALIZACION').reduce((sum: number, t: any) => sum + Number(t.monto), 0) || 0;
  const totalContratado = Number(venta.montoTotal) + penalizaciones;
  const saldoRestante = totalContratado - totalPagado;

  const handleStatusChange = async (nuevoEstado: any) => {
    setIsSubmitting(true);
    const res = await updateReservaStatus(venta.id, nuevoEstado);
    if (res.success) {
      setEstado(nuevoEstado);
      onUpdate({ ...venta, estado: nuevoEstado });
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handlePagarTransaccion = async (id: string) => {
    const metodo = prompt('¿Método de pago? (EJ: EFECTIVO, TRANSFERENCIA, TARJETA)', 'EFECTIVO');
    if (!metodo) return;

    setIsSubmitting(true);
    const res = await payTransaction(id, metodo.toUpperCase());
    if (res.success) {
      // Simular cambio local
      const updatedTx = venta.transacciones.map((t: any) => t.id === id ? { ...t, estado: 'PAGADO', metodoPago: metodo.toUpperCase(), fechaPago: new Date() } : t);
      onUpdate({ ...venta, transacciones: updatedTx });
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleAddAbono = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      reservaId: venta.id,
      monto: Number(abono.monto),
      tipo: abono.tipo,
      metodoPago: abono.estado === 'PENDIENTE' ? 'N/A' : abono.metodoPago,
      estado: abono.estado,
      notas: abono.notas,
      fechaVencimiento: abono.fechaVencimiento ? new Date(abono.fechaVencimiento) : null
    };

    const res = await addTransaction(payload);
    if (res.success) {
      alert('Transacción Registrada Exitosamente. Actualiza la página si no ves los cambios (WIP local state update).');
      setShowAbonoForm(false);
      // Idealmente, haríamos un re-fetch de la venta aquí, por ahora cerramos para forzar refresh
      onClose();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const penalty = reschedule.aplicarPenalidad ? Number(reschedule.montoPenalidad) : 0;
    
    const res = await rescheduleReserva(
      venta.id, 
      new Date(reschedule.nuevaFecha), 
      penalty, 
      reschedule.notas
    );
    
    if (res.success) {
      alert('Fecha reprogramada. Actualiza la página si no ves los cambios (WIP local state update).');
      setShowRescheduleForm(false);
      onClose();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-fondo-card)] w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl border border-[var(--color-borde-suave)] animate-in zoom-in-95 duration-200 relative">
        <div className="sticky top-0 z-10 px-6 py-5 border-b border-[var(--color-borde-suave)] flex justify-between items-center bg-[var(--color-fondo-app)]/90 backdrop-blur">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Detalle Financiero 
              <span className={`badge badge-${estado.toLowerCase()} text-[10px]`}>{estado}</span>
            </h2>
            <p className="text-sm font-mono text-[var(--color-texto-muted)]">Reserva ID: {venta.id}</p>
          </div>
          <button disabled={isSubmitting} onClick={onClose} className="p-2 rounded-full hover:bg-[var(--color-fondo-input)]">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          
          {/* Header Resumen Reserva */}
          <div className="flex flex-wrap gap-6 items-start bg-[var(--color-fondo-input)]/50 p-6 rounded-2xl border border-[var(--color-borde-suave)]">
            <div className="flex-1 min-w-[200px]">
              <h3 className="text-sm font-bold text-[var(--color-texto-muted)] uppercase tracking-wider mb-1">Cliente</h3>
              <div className="flex items-center gap-2">
                <p className="font-bold text-lg">{venta.esManual ? (venta.nombreClienteExterno || 'Cliente Externo') : (venta.cliente?.usuario?.nombre || 'N/A')}</p>
                {venta.esManual && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500">Manual</span>
                )}
              </div>
              <p className="text-sm text-[var(--color-texto-suave)]">
                {venta.esManual ? (venta.telefonoClienteExterno || 'Sin teléfono') : venta.cliente?.usuario?.email}
              </p>
            </div>
            <div className="flex-1 min-w-[200px]">
              <h3 className="text-sm font-bold text-[var(--color-texto-muted)] uppercase tracking-wider mb-1">Servicio</h3>
              <p className="font-bold text-lg">{venta.servicio?.nombre}</p>
              <p className="text-sm text-[var(--color-texto-suave)] flex items-center gap-1">
                <CalendarIcon size={14} /> Fecha: {formatearFechaCorta(venta.fechaEvento)}
              </p>
            </div>
            <div className="w-full sm:w-auto flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider">Cambiar Estado Operativo</label>
              <select 
                value={estado} 
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isSubmitting}
                className="input h-10 text-sm font-bold focus:ring-[var(--color-primario)]"
              >
                <option value="TEMPORAL">TEMPORAL (Sin Pagos)</option>
                <option value="APARTADO">APARTADO (Confirmado)</option>
                <option value="LIQUIDADO">LIQUIDADO (Todo Pagado)</option>
                <option value="CANCELADO">CANCELADO</option>
              </select>
            </div>
          </div>

          {/* Resumen Financiero Matemático */}
          <div>
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <DollarSign className="text-[var(--color-primario)]" /> 
              Resumen Financiero
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4 border border-[var(--color-borde-suave)]">
                <p className="text-[10px] font-bold uppercase mb-1 text-[var(--color-texto-muted)]">Total Contratado</p>
                <p className="text-xl font-black">{formatearMoneda(totalContratado)}</p>
                {penalizaciones > 0 && <span className="text-xs text-red-500 font-medium">+ {formatearMoneda(penalizaciones)} en penalidades</span>}
              </div>
              <div className="card p-4 border border-[var(--color-liquidado)]/30 bg-[var(--color-liquidado)]/5">
                <p className="text-[10px] font-bold uppercase mb-1 text-[var(--color-liquidado)]">Total Pagado</p>
                <p className="text-xl font-black text-[var(--color-liquidado)]">{formatearMoneda(totalPagado)}</p>
              </div>
              <div className="card p-4 border border-orange-500/30 bg-orange-500/5">
                <p className="text-[10px] font-bold uppercase mb-1 text-orange-600">Saldo Restante</p>
                <p className="text-xl font-black text-orange-600">{formatearMoneda(saldoRestante)}</p>
              </div>
              <div className="card p-4 border border-red-500/30 bg-red-500/5">
                <p className="text-[10px] font-bold uppercase mb-1 text-red-600">Deuda Vencida</p>
                <p className="text-xl font-black text-red-600">
                  {formatearMoneda(pagosPendientes.filter((t:any) => t.fechaVencimiento && new Date(t.fechaVencimiento) < new Date()).reduce((acc: number, t:any) => acc + Number(t.monto), 0))}
                </p>
              </div>
            </div>
          </div>

          <hr className="border-[var(--color-borde-suave)]" />

          {/* Panel de Control de Acciones */}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => { setShowAbonoForm(!showAbonoForm); setShowRescheduleForm(false); }} className="btn btn-primario py-2 text-sm gap-2">
              <Plus size={16} /> Agregar Abono o Pagaré
            </button>
            <button onClick={() => { setShowRescheduleForm(!showRescheduleForm); setShowAbonoForm(false); }} className="btn bg-[var(--color-fondo-input)] hover:bg-[var(--color-borde-fuerte)] text-[var(--color-texto-suave)] py-2 text-sm gap-2">
              <CalendarDays size={16} /> Reprogramar Evento
            </button>
          </div>

          {/* Forms Condicionales */}
          {showAbonoForm && (
            <form onSubmit={handleAddAbono} className="card bg-[var(--color-fondo-input)]/30 p-5 space-y-4 border border-[var(--color-primario)]/30 animate-in slide-in-from-top-4">
              <h4 className="font-bold">Nuevo Abono / Compromiso de Pago</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--color-texto-suave)]">Monto $</label>
                  <input required value={abono.monto} onChange={e=>setAbono({...abono, monto: e.target.value})} type="number" min="0" step="0.01" className="input w-full mt-1 bg-white dark:bg-black" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--color-texto-suave)]">Tipo</label>
                  <select value={abono.tipo} onChange={e=>setAbono({...abono, tipo: e.target.value})} className="input w-full mt-1 bg-white dark:bg-black">
                    <option value="ABONO">ABONO</option>
                    <option value="ANTICIPO">ANTICIPO</option>
                    <option value="PENALIZACION">PENALIZACIÓN</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--color-texto-suave)]">Estatus</label>
                  <select value={abono.estado} onChange={e=>setAbono({...abono, estado: e.target.value})} className="input w-full mt-1 bg-white dark:bg-black text-[var(--color-primario)] font-bold">
                    <option value="PAGADO">✅ Dinero Recibido</option>
                    <option value="PENDIENTE">⏳ Pagaré / Compromiso Futuro</option>
                  </select>
                </div>
                {abono.estado === 'PAGADO' && (
                  <div>
                    <label className="text-xs font-bold text-[var(--color-texto-suave)]">Método de Pago</label>
                    <select value={abono.metodoPago} onChange={e=>setAbono({...abono, metodoPago: e.target.value})} className="input w-full mt-1 bg-white dark:bg-black">
                      <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                      <option value="EFECTIVO">EFECTIVO</option>
                      <option value="TARJETA">TARJETA</option>
                    </select>
                  </div>
                )}
                {abono.estado === 'PENDIENTE' && (
                  <div>
                    <label className="text-xs font-bold text-[var(--color-texto-suave)]">Vence él (Opcional)</label>
                    <input value={abono.fechaVencimiento} onChange={e=>setAbono({...abono, fechaVencimiento: e.target.value})} type="date" className="input w-full mt-1 bg-white dark:bg-black" />
                  </div>
                )}
              </div>
              <textarea value={abono.notas} onChange={e=>setAbono({...abono, notas: e.target.value})} className="input w-full p-2 h-16 min-h-[64px]" placeholder="Notas (Ej: Fue pagado por el padrino)"></textarea>
              <div className="flex justify-end pt-2">
                <button disabled={isSubmitting} type="submit" className="btn btn-primario py-2 px-6">Registrar Transacción</button>
              </div>
            </form>
          )}

          {showRescheduleForm && (
            <form onSubmit={handleReschedule} className="card bg-[var(--color-fondo-input)]/30 p-5 space-y-4 border border-[var(--color-primario)]/30 animate-in slide-in-from-top-4">
              <h4 className="font-bold flex items-center gap-2"><RotateCcw size={18} /> Reprogramar Fecha de Evento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-[var(--color-texto-suave)]">Nueva Fecha del Evento</label>
                  <input required value={reschedule.nuevaFecha} onChange={e=>setReschedule({...reschedule, nuevaFecha: e.target.value})} type="date" className="input w-full mt-1 bg-white dark:bg-black" />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="penalo" checked={reschedule.aplicarPenalidad} onChange={e=>setReschedule({...reschedule, aplicarPenalidad: e.target.checked})} className="w-5 h-5 accent-[var(--color-primario)]" />
                  <label htmlFor="penalo" className="text-sm font-bold">Aplicar penalidad económica por la modificación</label>
                </div>
                
                {reschedule.aplicarPenalidad && (
                  <div className="md:col-span-2 grid grid-cols-2 gap-4 p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                     <div>
                      <label className="text-xs font-bold text-red-600">Monto Penalidad $</label>
                      <input required value={reschedule.montoPenalidad} onChange={e=>setReschedule({...reschedule, montoPenalidad: e.target.value})} type="number" min="1" className="input w-full mt-1" />
                    </div>
                     <div>
                      <label className="text-xs font-bold text-red-600">Comentario</label>
                      <input required value={reschedule.notas} onChange={e=>setReschedule({...reschedule, notas: e.target.value})} type="text" className="input w-full mt-1" placeholder="Ej: Cambio faltando solo 1 mes..." />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-2">
                <button disabled={isSubmitting} type="submit" className="btn btn-primario py-2 px-6">Confirmar Reprogramación</button>
              </div>
            </form>
          )}

          {/* Historial de Transacciones (Ledger) */}
          <div>
            <h3 className="text-lg font-black mb-4">Libro Mayor de Pagos (Ledger)</h3>
            <div className="card p-0 overflow-hidden border border-[var(--color-borde-suave)]">
              <table className="tabla w-full text-sm">
                <thead className="bg-[var(--color-fondo-input)]">
                  <tr>
                    <th className="text-left py-3 px-4">Fecha / Vencimiento</th>
                    <th className="text-left py-3 px-4">Tipo</th>
                    <th className="text-right py-3 px-4">Monto</th>
                    <th className="text-left py-3 px-4">Método</th>
                    <th className="text-center py-3 px-4">Estado</th>
                    <th className="text-center py-3 px-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-borde-suave)]">
                  {venta.transacciones && venta.transacciones.length > 0 ? (
                    venta.transacciones.map((tx: any) => (
                      <tr key={tx.id} className={tx.estado === 'PENDIENTE' ? 'bg-orange-500/5' : ''}>
                        <td className="py-3 px-4">
                          <span className="block font-bold">{formatearFechaCorta(tx.fechaPago || tx.creadoEn)}</span>
                          {tx.fechaVencimiento && tx.estado === 'PENDIENTE' && (
                            <span className="text-xs text-red-500 font-medium">Vence: {formatearFechaCorta(tx.fechaVencimiento)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-bold tracking-widest">{tx.tipo}</span>
                          {tx.notas && <span className="block text-[10px] text-[var(--color-texto-muted)]">{tx.notas}</span>}
                        </td>
                        <td className="py-3 px-4 text-right font-black">
                          {formatearMoneda(tx.monto)}
                        </td>
                        <td className="py-3 px-4 text-[10px] uppercase font-medium text-[var(--color-texto-suave)]">
                          {tx.metodoPago}
                        </td>
                        <td className="py-3 px-4 text-center">
                           <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${tx.estado === 'PAGADO' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                             {tx.estado}
                           </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {tx.estado === 'PENDIENTE' ? (
                            <button disabled={isSubmitting} onClick={() => handlePagarTransaccion(tx.id)} className="btn bg-[var(--color-primario)] text-white hover:opacity-90 py-1 px-3 text-xs w-full">Liquidar</button>
                          ) : (
                            <span className="text-[var(--color-texto-muted)] text-xs flex justify-center"><CheckCircle size={16} /></span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--color-texto-muted)]">No hay transacciones registradas aún.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
