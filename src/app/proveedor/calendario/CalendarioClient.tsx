'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Info, Clock, CalendarDays, Loader2, X } from 'lucide-react';
import { cn, ESTADOS_RESERVA_COLORES, ESTADOS_RESERVA_LABELS, formatearMoneda } from '@/lib/utils';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { createBloqueoRapido } from '@/lib/actions/providerActions';

interface CalendarioClientProps {
  reservas: any[];
  proveedor: any;
  servicios: any[];
}

export default function CalendarioClient({ reservas: initialReservas, proveedor, servicios }: CalendarioClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservas, setReservas] = useState(initialReservas);
  
  // Modal de Bloqueo Rápido
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    servicioId: servicios.length > 0 ? servicios[0].id : '',
    tipoReserva: 'DIA_COMPLETO' as 'DIA_COMPLETO' | 'POR_HORAS',
    horaInicio: proveedor.horarioApertura || '09:00',
    horaFin: proveedor.horarioCierre || '14:00',
    clienteAproximado: '',
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const openBlockModal = (date: Date = new Date()) => {
    setSelectedDate(date);
    setForm(prev => ({
      ...prev,
      servicioId: servicios.length > 0 ? servicios[0].id : '',
      tipoReserva: 'DIA_COMPLETO',
      clienteAproximado: ''
    }));
    setModalOpen(true);
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !form.servicioId) return;
    
    setIsSubmitting(true);
    const res = await createBloqueoRapido({
      proveedorId: proveedor.id,
      servicioId: form.servicioId,
      fechaEvento: selectedDate,
      tipoReserva: form.tipoReserva,
      horaInicio: form.tipoReserva === 'POR_HORAS' ? form.horaInicio : undefined,
      horaFin: form.tipoReserva === 'POR_HORAS' ? form.horaFin : undefined,
      clienteAproximado: form.clienteAproximado || 'Bloqueo Interno'
    });

    if (res.success && res.data) {
      // Re-fetch or optimally update local state. For now we just push it to local state to reflect immediately
      // Formatting the new reserva to match the display requirement
      const newReserva = {
        ...res.data,
        cliente: { usuario: { nombre: res.data.nombreClienteExterno } },
        servicio: servicios.find(s => s.id === form.servicioId) || { nombre: 'Bloqueo' }
      };
      setReservas(prev => [...prev, newReserva]);
      setModalOpen(false);
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const ventasEsteMes = reservas.filter(r => isSameMonth(new Date(r.fechaEvento), currentDate));
  const totalMontoMes = ventasEsteMes.reduce((acc, curr) => acc + (curr.montoTotal || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold">Agenda de Eventos</h1>
          <p className="text-[var(--color-texto-suave)]">Gestiona la disponibilidad de tus servicios.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[var(--color-fondo-input)] p-1.5 rounded-full border border-[var(--color-borde-suave)]">
          <button onClick={prevMonth} className="btn-fantasma w-10 h-10 rounded-full border-none flex items-center justify-center hover:bg-[var(--color-fondo-hover)]">
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-bold min-w-[160px] text-center capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </span>
          <button onClick={nextMonth} className="btn-fantasma w-10 h-10 rounded-full border-none flex items-center justify-center hover:bg-[var(--color-fondo-hover)]">
            <ChevronRight size={20} />
          </button>
        </div>

        <button onClick={() => openBlockModal(new Date())} className="btn btn-primario gap-2">
          <Plus size={18} /> Bloquear Fecha
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendario Principal */}
        <div className="lg:col-span-3 card p-6">
          <div className="grid grid-cols-7 mb-4">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-xs font-bold text-[var(--color-texto-muted)] uppercase tracking-widest pb-4">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-[var(--color-borde-suave)] rounded-lg overflow-hidden border border-[var(--color-borde-suave)]">
            {calendarDays.map((day, idx) => {
              const reservasHoy = reservas.filter(r => isSameDay(new Date(r.fechaEvento), day));
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={idx} 
                  className={cn(
                    "min-h-[130px] bg-[var(--color-fondo-card)] p-2 relative group transition-all hover:bg-[var(--color-fondo-hover)] flex flex-col",
                    !isCurrentMonth && "opacity-30"
                  )}
                  onClick={() => openBlockModal(day)}
                >
                  <span className={cn(
                    "inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full mb-1",
                    isToday ? "bg-[var(--color-primario)] text-white" : "text-[var(--color-texto-suave)]"
                  )}>
                    {format(day, 'd')}
                  </span>

                  <div className="flex-1 space-y-1 overflow-y-auto hidden-scrollbar">
                    {reservasHoy.map(r => (
                      <div 
                        key={r.id}
                        className="p-1.5 rounded text-[9px] font-bold border-l-4 shadow-sm"
                        style={{ 
                          backgroundColor: `${ESTADOS_RESERVA_COLORES[r.estado as keyof typeof ESTADOS_RESERVA_COLORES]}15`,
                          borderColor: ESTADOS_RESERVA_COLORES[r.estado as keyof typeof ESTADOS_RESERVA_COLORES],
                          color: ESTADOS_RESERVA_COLORES[r.estado as keyof typeof ESTADOS_RESERVA_COLORES]
                        }}
                      >
                        <div className="truncate mb-0.5">
                          {r.esManual ? (r.nombreClienteExterno || 'Manual') : (r.cliente?.usuario?.nombre || 'App')}
                        </div>
                        {r.tipoReserva === 'POR_HORAS' ? (
                          <div className="flex items-center gap-1 opacity-80 text-[8px] tracking-wider">
                            <Clock size={8} /> {r.horaInicio} - {r.horaFin}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 opacity-80 text-[8px] tracking-wider uppercase">
                             Día Completo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button 
                    className="absolute top-2 right-2 p-1 rounded-full bg-[var(--color-fondo-input)] opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-texto-muted)] hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      openBlockModal(day);
                    }}
                    title="Agregar o bloquear fecha"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Informativa / Detalles */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-texto-muted)] mb-4">Código de Estados</h3>
            <div className="space-y-3">
              {Object.entries(ESTADOS_RESERVA_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ESTADOS_RESERVA_COLORES[key as keyof typeof ESTADOS_RESERVA_COLORES] }} />
                  <span className="text-xs font-medium text-[var(--color-texto-suave)]">{label}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-[var(--color-borde-suave)] flex items-center justify-between text-xs font-bold text-[var(--color-texto-suave)]">
              <span>Reservas por Fracción</span>
              <div className="w-8 h-4 rounded-full bg-[var(--color-fondo-input)] relative">
                <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${proveedor.permiteReservasPorHora ? 'bg-emerald-500 right-0.5' : 'bg-gray-400 left-0.5'}`} />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-[var(--color-primario)]/10 to-[var(--color-acento)]/10 border-[var(--color-primario)]/20">
            <div className="flex items-start gap-3">
              <Info className="text-[var(--color-primario-claro)] shrink-0" size={18} />
              <div className="text-xs space-y-2">
                <p className="font-bold">Recordatorio</p>
                <p className="text-[var(--color-texto-suave)] leading-relaxed">
                  Las fechas en <span className="text-[var(--color-temporal)] font-bold">naranja</span> vencerán automáticamente si no se confirma el anticipo en 48 horas tras su creación.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-texto-muted)] mb-4">Resumen de {format(currentDate, 'MMMM', {locale: es})}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--color-texto-suave)]">Eventos Confirmados</span>
                <span className="font-bold">{ventasEsteMes.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--color-texto-suave)]">Potencial Generado</span>
                <span className="font-bold">{formatearMoneda(totalMontoMes)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL BLOQUEO RÁPIDO */}
      {modalOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-fondo-card)] w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-[var(--color-borde-suave)] animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 z-10 px-6 py-5 border-b border-[var(--color-borde-suave)] flex justify-between items-center bg-[var(--color-fondo-app)]/90 backdrop-blur">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-[var(--color-primario)]/20 flex items-center justify-center">
                   <CalendarDays size={20} className="text-[var(--color-primario-claro)]" />
                 </div>
                 <div>
                   <h2 className="text-lg font-bold">Bloqueo Rápido</h2>
                   <p className="text-xs text-[var(--color-texto-suave)]">Aparta la fecha internamente</p>
                 </div>
               </div>
               <button onClick={() => setModalOpen(false)} disabled={isSubmitting} className="p-2 rounded-full hover:bg-[var(--color-fondo-input)]">
                 <X size={20} />
               </button>
            </div>
            
            <form onSubmit={handleBlockSubmit} className="p-6 space-y-6">
              <div className="p-4 rounded-xl bg-[var(--color-fondo-input)] flex justify-between items-center">
                 <span className="text-sm text-[var(--color-texto-suave)] font-bold">Fecha Seleccionada</span>
                 <span className="font-black text-[var(--color-primario-claro)]">{format(selectedDate, 'dd MMMM, yyyy', {locale: es})}</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--color-texto-suave)]">¿Qué servicio vas a bloquear?</label>
                <select 
                  required
                  value={form.servicioId}
                  onChange={e => {
                    const serv = servicios.find(s => s.id === e.target.value);
                    let initialHStart = form.horaInicio;
                    let initialHEnd = form.horaFin;
                    if (serv && serv.bloquesHorario && serv.bloquesHorario.length > 0) {
                      const [hS, hE] = serv.bloquesHorario[0].split('-');
                      initialHStart = hS;
                      initialHEnd = hE;
                    }
                    setForm({...form, servicioId: e.target.value, horaInicio: initialHStart, horaFin: initialHEnd});
                  }}
                  className="input w-full h-12"
                >
                  <option value="" disabled>Selecciona un servicio</option>
                  {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>

              {proveedor.permiteReservasPorHora ? (
                (() => {
                  const servicioElegido = servicios.find(s => s.id === form.servicioId);
                  const tieneBloques = servicioElegido?.bloquesHorario?.length > 0;
                  
                  return (
                    <div className="space-y-4 pt-2">
                       <label className="text-sm font-bold text-[var(--color-texto-suave)]">Duración del Evento</label>
                       
                       <div className="flex bg-[var(--color-fondo-input)] p-1 rounded-xl">
                          <button 
                            type="button"
                            onClick={() => setForm({...form, tipoReserva: 'DIA_COMPLETO'})}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${form.tipoReserva === 'DIA_COMPLETO' ? 'bg-[var(--color-fondo-card)] shadow text-[var(--color-texto)]' : 'text-[var(--color-texto-muted)]'}`}
                          >
                             Día Completo
                          </button>
                          <button 
                            type="button"
                            onClick={() => setForm({...form, tipoReserva: 'POR_HORAS'})}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${form.tipoReserva === 'POR_HORAS' ? 'bg-[var(--color-fondo-card)] shadow text-[var(--color-texto)]' : 'text-[var(--color-texto-muted)]'}`}
                          >
                             {tieneBloques ? 'Por Turno' : 'Por Horas'}
                          </button>
                       </div>

                       {form.tipoReserva === 'POR_HORAS' && (
                         tieneBloques ? (
                           <div className="space-y-2 pt-2 animate-in slide-in-from-top-2">
                             <label className="text-xs font-bold text-[var(--color-texto-suave)]">Selecciona el Turno Predefinido</label>
                             <div className="grid grid-cols-2 gap-2">
                               {servicioElegido.bloquesHorario.map((bloque: string) => {
                                 const [hI, hF] = bloque.split('-');
                                 const isActive = form.horaInicio === hI && form.horaFin === hF;
                                 return (
                                   <button
                                     key={bloque}
                                     type="button"
                                     onClick={() => setForm({...form, horaInicio: hI, horaFin: hF})}
                                     className={`p-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-1 ${isActive ? 'bg-[var(--color-primario)]/10 border-[var(--color-primario)] text-[var(--color-primario)] ring-2 ring-[var(--color-primario)]/20' : 'border-[var(--color-borde-fuerte)] text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-input)] hover:border-[var(--color-borde-suave)]'}`}
                                   >
                                     <Clock size={16} className={isActive ? "text-[var(--color-primario)]" : "text-[var(--color-texto-muted)]"} />
                                     <span>{bloque}</span>
                                   </button>
                                 )
                               })}
                             </div>
                           </div>
                         ) : (
                           <div className="grid grid-cols-2 gap-4 pt-2 animate-in slide-in-from-top-2">
                             <div className="space-y-2">
                               <label className="text-xs font-bold text-[var(--color-texto-suave)]">Hora Inicial</label>
                               <input 
                                 type="time" 
                                 required 
                                 value={form.horaInicio}
                                 onChange={e => setForm({...form, horaInicio: e.target.value})}
                                 className="input w-full" 
                               />
                             </div>
                             <div className="space-y-2">
                               <label className="text-xs font-bold text-[var(--color-texto-suave)]">Hora Final</label>
                               <input 
                                 type="time" 
                                 required 
                                 value={form.horaFin}
                                 onChange={e => setForm({...form, horaFin: e.target.value})}
                                 className="input w-full" 
                               />
                             </div>
                           </div>
                         )
                       )}
                    </div>
                  );
                })()
              ) : (
                <div className="p-4 border border-[var(--color-primario)]/30 bg-[var(--color-primario)]/5 rounded-xl">
                  <p className="text-xs text-[var(--color-texto-suave)]">
                    <Info size={14} className="inline mr-1 text-[var(--color-primario-claro)]" />
                    Tienes desactivadas las reservas por hora en tu Configuración. Este bloqueo abarcará todo el día completo.
                  </p>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <label className="text-sm font-bold text-[var(--color-texto-suave)]">Identificador / Nombre <span className="text-[10px] font-normal">(Opcional)</span></label>
                <input 
                  type="text"
                  value={form.clienteAproximado}
                  onChange={e => setForm({...form, clienteAproximado: e.target.value})}
                  className="input w-full h-12"
                  placeholder="Ej. Boda Martínez Sánchez"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borde-suave)]">
                <button type="button" onClick={() => setModalOpen(false)} disabled={isSubmitting} className="btn bg-[var(--color-fondo-input)] hover:bg-[var(--color-borde-fuerte)] px-6">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primario px-8 shadow-lg shadow-[var(--color-primario)]/20">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Bloqueo'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
