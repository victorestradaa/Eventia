'use client';

import { useState } from 'react';
import { X, Calendar as CalendarIcon, DollarSign, AlertCircle, CheckCircle, RotateCcw, Plus, CalendarDays, Loader2 } from 'lucide-react';
import { formatearMoneda, formatearFechaCorta, cn } from '@/lib/utils';
import { updateReservaStatus, payTransaction, rescheduleReserva, updateManualClientName } from '@/lib/actions/salesActions';
import { registrarAbono, aprobarTransaccion, rechazarTransaccion } from '@/lib/actions/paymentActions';
import { Edit2, Check, Eye, CheckCircle2, XCircle } from 'lucide-react';

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
  const [payConfirmData, setPayConfirmData] = useState<{ id: string, metodo: string } | null>(null);
  const [confirmAprobarId, setConfirmAprobarId] = useState<string | null>(null);
  
  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(venta.nombreClienteExterno || '');
  
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

  const handlePagarTransaccion = (id: string) => {
    setPayConfirmData({ id, metodo: 'EFECTIVO' });
  };
  const confirmLiquidation = async () => {
    if (!payConfirmData) return;
    
    const originalTx = venta.transacciones?.find((t: any) => t.id === payConfirmData.id);
    const montoALiquidar = originalTx ? Number(originalTx.monto) : 0;

    setIsSubmitting(true);
    try {
      const apiRes = await fetch('/api/abonos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservaId: venta.id,
          monto: montoALiquidar,
          metodoPago: payConfirmData.metodo,
          tipo: 'ABONO',
          transaccionId: payConfirmData.id,
          esCliente: false
        })
      });
      const res = await apiRes.json();

      if (res.success && res.data) {
        // Usar los datos retornados por el servidor para una actualización real
        onUpdate({ 
          ...venta, 
          estado: res.data.reserva.estado,
          transacciones: venta.transacciones.map((t: any) => 
            t.id === payConfirmData.id ? res.data.transaccion : t
          )
        });
        setPayConfirmData(null);
      } else {
        alert(res.error || 'No se pudo procesar el pago.');
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error de conexión al procesar el pago. Detalle: ${err?.message || JSON.stringify(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAbono = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!abono.monto || Number(abono.monto) <= 0) return alert('Ingresa un monto válido');
    
    setIsSubmitting(true);
    try {
      const apiRes = await fetch('/api/abonos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservaId: venta.id,
          monto: Number(abono.monto),
          tipo: abono.tipo,
          metodoPago: abono.metodoPago,
          estado: abono.estado,
          fechaVencimiento: abono.fechaVencimiento,
          notas: abono.notas,
          esCliente: false
        })
      });
      const res = await apiRes.json();

      if (res.success && res.data) {
        alert('Abono registrado y sincronizado con el presupuesto del cliente.');
        setShowAbonoForm(false);
        // Actualizar el estado local antes de cerrar para que se vea el cambio
        const nuevaTx = res.data.transaccion;
        onUpdate({ 
          ...venta, 
          estado: res.data.reserva.estado,
          montoAnticipo: res.data.reserva.montoAnticipo,
          transacciones: [...(venta.transacciones || []), nuevaTx] 
        });
        // Reset abono form
        setAbono({
          monto: '',
          tipo: 'ABONO',
          metodoPago: 'TRANSFERENCIA',
          estado: 'PAGADO',
          notas: '',
          fechaVencimiento: ''
        });
      } else {
        alert(res.error || 'No se pudo registrar el abono');
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error de conexión al registrar el abono. Detalle: ${err?.message || JSON.stringify(err)}`);
    } finally {
      setIsSubmitting(false);
    }
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
      setShowRescheduleForm(false);
      // Para reschedule no tenemos retorno de data fácil, pero podemos forzar un refresh o actualizar campos básicos
      onUpdate({
        ...venta,
        fechaEvento: new Date(reschedule.nuevaFecha),
        // Si hubo penalidad, el total contratado cambiará, pero aquí solo actualizamos lo que sabemos
        // Lo ideal sería retornar la reserva actualizada desde el server
      });
      alert('Fecha actualizada correctamente.');
      onClose();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleUpdateName = async () => {
    if (!editedName.trim()) return;
    setIsSubmitting(true);
    const res = await updateManualClientName(venta.id, editedName);
    if (res.success) {
      setIsEditingName(false);
      onUpdate({ ...venta, nombreClienteExterno: editedName });
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleAprobarTransaccion = (id: string) => {
    setConfirmAprobarId(id);
  };

  const confirmAprobarTransaccion = async () => {
    if (!confirmAprobarId) return;
    setIsSubmitting(true);
    const res = await aprobarTransaccion(confirmAprobarId);
    if (res.success) {
      onUpdate(res.data);
      setConfirmAprobarId(null);
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleRechazarTransaccion = async (id: string) => {
    const motivo = prompt('Ingresa el motivo del rechazo (opcional):');
    if (motivo === null) return;
    setIsSubmitting(true);
    const res = await rechazarTransaccion(id, motivo);
    if (res.success) {
      onUpdate(res.data);
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
                {venta.esManual ? (
                  isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input 
                        value={editedName} 
                        onChange={e => setEditedName(e.target.value)}
                        className="input h-10 py-1 px-3 text-lg font-bold bg-white dark:bg-black border-[var(--color-acento)] focus:ring-1 focus:ring-[var(--color-acento)]" 
                        autoFocus
                      />
                      <button onClick={handleUpdateName} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        <Check size={18} />
                      </button>
                      <button onClick={() => setIsEditingName(false)} className="p-2 bg-red-400/20 text-red-500 rounded-lg hover:bg-red-400/30">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/name">
                      <p className="font-bold text-lg">{venta.nombreClienteExterno || 'Cliente Externo'}</p>
                      <button 
                         onClick={() => setIsEditingName(true)} 
                         className="p-1.5 opacity-0 group-hover/name:opacity-100 text-[var(--color-acento)] hover:bg-[var(--color-acento)]/10 rounded-md transition-all"
                         title="Editar nombre"
                      >
                        <Edit2 size={14} />
                      </button>
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500">Manual</span>
                    </div>
                  )
                ) : (
                  <p className="font-bold text-lg">{venta.cliente?.usuario?.nombre || 'N/A'}</p>
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
                <button disabled={isSubmitting} type="submit" className="btn btn-primario py-2 px-6 flex items-center justify-center gap-2 min-w-[200px]">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-white" />
                      Registrando...
                    </>
                  ) : (
                    'Registrar Transacción'
                  )}
                </button>
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
                <button disabled={isSubmitting} type="submit" className="btn btn-primario py-2 px-6 flex items-center justify-center gap-2 min-w-[220px]">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-white" />
                      Guardando...
                    </>
                  ) : (
                    'Confirmar Reprogramación'
                  )}
                </button>
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
                           <span className={cn(
                             "px-2 py-1 rounded-full text-[10px] font-bold",
                             tx.estado === 'PAGADO' ? 'bg-emerald-100 text-emerald-700' : 
                             tx.estado === 'RECHAZADO' ? 'bg-rose-100 text-rose-700' :
                             'bg-amber-100 text-amber-700'
                           )}>
                             {tx.estado}
                           </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                             {tx.estado === 'PENDIENTE' ? (
                               <>
                                 {tx.comprobanteUrl && (
                                   <a href={tx.comprobanteUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-violet-500/10 text-violet-500 rounded-lg hover:bg-violet-500/20 transition-colors" title="Ver Comprobante">
                                     <Eye size={16} />
                                   </a>
                                 )}
                                 <button disabled={isSubmitting} onClick={() => handleAprobarTransaccion(tx.id)} className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors" title="Aprobar">
                                   <CheckCircle2 size={16} />
                                 </button>
                                 <button disabled={isSubmitting} onClick={() => handleRechazarTransaccion(tx.id)} className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors" title="Rechazar">
                                   <XCircle size={16} />
                                 </button>
                                 {!tx.comprobanteUrl && (
                                   <button disabled={isSubmitting} onClick={() => handlePagarTransaccion(tx.id)} className="btn bg-[var(--color-primario)] text-white hover:opacity-90 py-1 px-3 text-[10px] h-auto">Liquidar</button>
                                 )}
                               </>
                             ) : tx.estado === 'RECHAZADO' ? (
                               <XCircle size={16} className="text-rose-500 opacity-30" />
                             ) : (
                               <CheckCircle size={16} className="text-emerald-500" />
                             )}
                          </div>
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

      {/* Confirmation Modal for Aprobar Transaccion */}
      {confirmAprobarId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-fondo-card)] w-full max-w-md rounded-3xl shadow-2xl border border-[var(--color-borde-suave)] p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-amber-500" />
              </div>
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-center mb-2">Aprobar Abono</h3>
            <p className="text-sm text-[var(--color-texto-suave)] text-center mb-6 leading-relaxed">
              ¿Estás seguro de que deseas confirmar este pago? <br/><br/>
              <span className="text-amber-500 font-bold uppercase tracking-widest text-[10px]">Recordatorio:</span><br/>
              Asegúrate de haber verificado primero el comprobante de pago. Una vez aprobado, el monto se sumará al total pagado por el cliente.
            </p>
            <div className="flex gap-3">
              <button 
                disabled={isSubmitting} 
                onClick={() => setConfirmAprobarId(null)} 
                className="btn btn-secundario flex-1 py-3 text-xs uppercase font-black tracking-widest"
              >
                Cancelar
              </button>
              <button 
                disabled={isSubmitting} 
                onClick={confirmAprobarTransaccion} 
                className="btn btn-primario flex-1 py-3 text-xs uppercase font-black tracking-widest flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Sí, Aprobar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Liquidation */}
      {payConfirmData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-[var(--color-fondo-card)] w-full max-w-sm rounded-3xl shadow-2xl border border-[var(--color-borde-suave)] p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2">Confirmar Liquidación</h3>
            <p className="text-sm text-[var(--color-texto-suave)] mb-6">Selecciona el método de pago para registrar la entrada de dinero.</p>
            
            <div className="space-y-4 mb-8">
               <div className="space-y-1">
                 <label className="text-xs font-bold uppercase text-[var(--color-texto-muted)]">Método de Pago</label>
                 <select 
                   value={payConfirmData.metodo}
                   onChange={e => setPayConfirmData({...payConfirmData, metodo: e.target.value})}
                   className="input w-full h-12 text-lg font-bold"
                 >
                   <option value="EFECTIVO">💵 EFECTIVO</option>
                   <option value="TRANSFERENCIA">📱 TRANSFERENCIA</option>
                   <option value="TARJETA">💳 TARJETA</option>
                   <option value="DEPOSITO">🏦 DEPOSITO</option>
                 </select>
               </div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                disabled={isSubmitting}
                onClick={confirmLiquidation}
                className="btn btn-primario w-full h-12 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Pago'}
              </button>
              <button 
                disabled={isSubmitting}
                onClick={() => setPayConfirmData(null)}
                className="btn bg-[var(--color-fondo-input)] hover:bg-[var(--color-borde-fuerte)] w-full h-12"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
