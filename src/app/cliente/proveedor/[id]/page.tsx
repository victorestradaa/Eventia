'use client';

import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Users, 
  Calendar as CalendarIcon, 
  Heart, 
  Share2, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn, formatearMoneda } from '@/lib/utils';
import Link from 'next/link';

export default function ProviderDetailPage() {
  const [imgActiva, setImgActiva] = useState(0);
  const [reservado, setReservado] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  
  // Novedad: Lógica interactiva de selección
  const [selectedDia, setSelectedDia] = useState<number | null>(null);
  const [selectedTurno, setSelectedTurno] = useState<string | null>(null);
  
  const fechaEvento = '2024-12-15'; // Mock de la fecha del usuario
  const estaDisponible = true; // Simulación de check en agenda del proveedor
  
  const proveedor = {
    nombre: 'Jardín Las Rosas',
    categoria: 'Salones de Eventos',
    calificacion: 4.9,
    reseñasCount: 124,
    ubicacion: 'Lomas de Chapultepec, Ciudad de México',
    descripcion: 'Un espacio mágico diseñado para crear recuerdos inolvidables. Nuestro jardín cuenta con más de 2000 m² de áreas verdes, iluminación arquitectónica y un salón de cristal climatizado para hasta 500 personas.',
    imagenes: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    ],
    amenidades: ['Estacionamiento Propio', 'Seguridad 24/7', 'Planta de Luz', 'Suite Nupcial', 'Valet Parking'],
    paquetes: [
      { id: 1, nombre: 'Boda Platino', precio: 85000, desc: 'Incluye salón, jardín, mobiliario de lujo y descorche libre.' },
      { id: 2, nombre: 'Evento Social Gold', precio: 45000, desc: 'Ideal para graduaciones o cumpleaños. Incluye montaje básico.' },
    ]
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Navigation */}
      <div className="flex items-center justify-between">
         <Link href="/cliente/explorar" className="flex items-center gap-2 text-sm text-[var(--color-texto-muted)] hover:text-white transition-colors">
            <ArrowLeft size={18} /> Volver a buscar
         </Link>
         <div className="flex gap-4">
            <button className="p-3 rounded-full bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] hover:text-red-500 transition-colors">
              <Heart size={20} />
            </button>
            <button className="p-3 rounded-full bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] hover:text-[var(--color-primario-claro)] transition-colors">
              <Share2 size={20} />
            </button>
         </div>
      </div>

      {/* Hero Gallery Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
        {/* Main large image */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden group">
           <img 
             src={proveedor.imagenes[imgActiva]} 
             alt={proveedor.nombre} 
             className="w-full h-full object-cover transition-transform duration-700" 
           />
           <button 
             onClick={() => setImgActiva((imgActiva - 1 + proveedor.imagenes.length) % proveedor.imagenes.length)}
             className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
             <ChevronLeft size={24} />
           </button>
           <button 
             onClick={() => setImgActiva((imgActiva + 1) % proveedor.imagenes.length)}
             className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
             <ChevronRight size={24} />
           </button>
        </div>
        
        {/* Sidebar thumbnails */}
        <div className="lg:col-span-4 grid grid-rows-2 gap-6 h-full">
           <div className="rounded-3xl overflow-hidden relative border border-white/5">
              <img src={proveedor.imagenes[1]} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10" />
           </div>
           <div className="rounded-3xl overflow-hidden relative border border-white/5 group">
              <img src={proveedor.imagenes[2]} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center flex-col gap-2 cursor-pointer group-hover:bg-black/20 transition-all">
                 <span className="text-2xl font-bold">+15</span>
                 <span className="text-xs uppercase font-black">Fotos & Video</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Content (Details) */}
        <div className="lg:col-span-2 space-y-10">
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <span className="badge badge-premium">{proveedor.categoria}</span>
                 <div className="flex items-center gap-1 text-amber-400 font-bold ml-2">
                    <Star size={16} fill="currentColor" /> {proveedor.calificacion} 
                    <span className="text-[var(--color-texto-muted)] font-normal ml-1">({proveedor.reseñasCount} reseñas)</span>
                 </div>
              </div>
              <h1 className="text-5xl font-extrabold">{proveedor.nombre}</h1>
              <div className="flex items-center gap-2 text-[var(--color-texto-suave)]">
                 <MapPin size={18} className="text-[var(--color-acento-claro)]" />
                 {proveedor.ubicacion}
              </div>
           </div>

           <div className="space-y-4 border-t border-[var(--color-borde-suave)] pt-8">
              <h2 className="text-2xl font-bold">Acerca del servicio</h2>
              <p className="text-[var(--color-texto-suave)] leading-relaxed">
                {proveedor.descripcion}
              </p>
           </div>

           <div className="space-y-4">
              <h2 className="text-2xl font-bold">Amenidades Destacadas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {proveedor.amenidades.map((a) => (
                  <div key={a} className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] hover:border-[var(--color-primario)]/30 transition-all">
                     <CheckCircle2 size={18} className="text-[var(--color-liquidado)]" />
                     <span className="text-sm font-medium">{a}</span>
                  </div>
                ))}
              </div>
           </div>

           <div className="space-y-6 pt-6 border-t border-[var(--color-borde-suave)]">
              <h2 className="text-2xl font-bold">Reseñas de Clientes</h2>
              <div className="space-y-4">
                 {[1].map((n) => (
                   <div key={n} className="card bg-[var(--color-fondo-input)]/50 p-6">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 overflow-hidden" />
                            <div>
                               <p className="font-bold">Valeria S.</p>
                               <p className="text-[10px] text-[var(--color-texto-muted)]">Boda en Marzo 2024</p>
                            </div>
                         </div>
                         <div className="flex items-center text-amber-400">
                            {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                         </div>
                      </div>
                      <p className="text-sm text-[var(--color-texto-suave)] leading-relaxed italic">
                        "Fue la mejor decisión para mi boda. La iluminación de noche es espectacular y el servicio del personal inmejorable. ¡Altamente recomendado!"
                      </p>
                   </div>
                 ))}
                 <button className="btn btn-fantasma w-full text-xs">Ver todas las reseñas</button>
              </div>
           </div>
        </div>

        {/* Right Sidebar (Booking / Action) */}
        <div className="space-y-6">
           <div className="card sticky top-32 p-8 border-t-4 border-t-[var(--color-primario)] shadow-2xl">
              <div className="space-y-6">
                 <div>
                    <p className="text-xs font-bold text-[var(--color-texto-muted)] uppercase tracking-widest mb-1">Precios desde</p>
                    <h3 className="text-4xl font-black gradient-texto">{formatearMoneda(45000)}</h3>
                 </div>

                 <div className="space-y-3">
                    <p className="text-sm font-bold">Selecciona un Paquete</p>
                    {proveedor.paquetes.map(p => (
                       <div key={p.id} className="p-4 rounded-xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-input)] hover:border-[var(--color-primario)]/50 transition-all cursor-pointer group">
                          <div className="flex justify-between items-center mb-1">
                             <span className="font-bold text-sm">{p.nombre}</span>
                             <span className="text-[var(--color-primario-claro)] text-sm font-bold">{formatearMoneda(p.precio)}</span>
                          </div>
                          <p className="text-[10px] text-[var(--color-texto-muted)] leading-tight">{p.desc}</p>
                       </div>
                    ))}
                 </div>

                 <hr className="border-[var(--color-borde-suave)]" />

                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                           <CheckCircle2 size={16} />
                           DISPONIBLE PARA TU FECHA
                        </div>
                        <span className="text-[10px] font-bold text-[var(--color-texto-muted)]">15 DIC 2024</span>
                     </div>

                     <button 
                       onClick={() => setMostrarCalendario(true)}
                       className="btn btn-secundario w-full font-bold text-sm py-4 flex items-center justify-center gap-2"
                     >
                        <CalendarIcon size={18} />
                        Verificar disponibilidad
                     </button>

                     <button 
                       onClick={() => setReservado(true)}
                       className="btn btn-primario w-full font-bold text-sm py-4 shadow-lg shadow-violet-500/20"
                     >
                        Reservar Fecha Ahora
                     </button>
                  </div>

                 <div className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/20">
                       <ShieldCheck size={14} /> Tu pago está protegido por Gestor Eventos
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--color-texto-muted)]">
                       <Info size={14} /> No se requieren pagos adicionales fuera de la app
                    </div>
                 </div>
              </div>
           </div>

           <div className="card p-6 bg-indigo-950/20 border-indigo-500/10">
              <h4 className="text-xs font-black uppercase text-indigo-400 mb-2">Asistente Virtual</h4>
              <p className="text-[10px] text-[var(--color-texto-suave)] leading-relaxed">
                 ¿Tienes dudas sobre este proveedor? Pregúntale a nuestra IA si se ajusta a tu presupuesto y necesidades.
              </p>
              <button className="mt-3 text-xs font-bold text-[var(--color-primario-claro)] hover:underline flex items-center gap-1">
                Iniciar Chat <ChevronRight size={14} />
              </button>
           </div>
        </div>
      </div>

      {/* Modal de Éxito Mock */}
      {reservado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="card max-w-sm w-full text-center space-y-6 py-12 border-[var(--color-primario)]/50 shadow-[0_0_50px_rgba(124,58,237,0.3)] scale-in-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                 <CheckCircle2 size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">¡Fecha Apartada!</h3>
                <p className="text-sm text-[var(--color-texto-suave)] px-4">
                  Hemos enviado tu solicitud a **{proveedor.nombre}**. El proveedor tiene 24 horas para confirmar.
                </p>
              </div>
              <div className="space-y-3 pt-4 px-6">
                <Link href="/cliente/evento/123" className="w-full">
                  <button className="btn btn-primario w-full text-xs">Ir a mi Evento</button>
                </Link>
                <button 
                  onClick={() => setReservado(false)}
                  className="btn btn-fantasma w-full text-xs"
                >
                  Seguir Explorando
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Modal de Calendario de Disponibilidad */}
      {mostrarCalendario && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="card max-w-lg w-full p-8 space-y-6 relative border-[var(--color-borde-suave)] shadow-2xl scale-in-center">
              <button 
                onClick={() => setMostrarCalendario(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 rounded-lg bg-[var(--color-primario)]/20 text-[var(--color-primario-claro)]">
                    <CalendarIcon size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold">Agenda de {proveedor.nombre}</h3>
                    <p className="text-xs text-[var(--color-texto-suave)]">Consulta las fechas libres en tiempo real</p>
                 </div>
              </div>

              {/* Mock de Calendario */}
              <div className="bg-[var(--color-fondo-input)] rounded-2xl p-6 border border-white/5">
                 <div className="flex justify-between items-center mb-6">
                    <button className="p-1 hover:text-white"><ChevronLeft size={20} /></button>
                    <span className="font-bold uppercase tracking-widest text-sm">Diciembre 2024</span>
                    <button className="p-1 hover:text-white"><ChevronRight size={20} /></button>
                 </div>
                 
                 <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black opacity-30 mb-4">
                    <span>D</span><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span>
                 </div>

                 <div className="grid grid-cols-7 gap-2">
                    {Array.from({length: 31}).map((_, i) => {
                      const dia = i + 1;
                      // Días bloqueados aleatorios
                      const ocupado = [1, 7, 14, 21, 24, 25, 31].includes(dia);
                      const esSeleccionado = selectedDia === dia;

                      return (
                        <button 
                          key={dia}
                          disabled={ocupado}
                          onClick={() => { 
                            setSelectedDia(dia);
                            setSelectedTurno(null); // Resetea el turno al cambiar de día
                          }}
                          className={cn(
                            "aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all relative border border-transparent",
                            ocupado ? "bg-red-500/5 text-red-500/30 cursor-not-allowed border-red-500/10" : 
                            esSeleccionado ? "bg-[var(--color-primario)] text-white shadow-lg shadow-[var(--color-primario)]/40 ring-1 ring-[var(--color-primario-claro)] scale-110 z-10" :
                            "bg-[var(--color-fondo-app)] hover:border-[var(--color-primario)]/50 cursor-pointer text-[var(--color-texto-suave)] shadow-sm"
                          )}
                        >
                          {dia}
                        </button>
                      );
                    })}
                 </div>

                 {/* Selector Visual de Turnos (Aparece dinámicamente) */}
                 {selectedDia && (
                   <div className="mt-6 pt-5 border-t border-[var(--color-borde-suave)] animate-in slide-in-from-top-2 duration-300">
                      <h4 className="text-sm font-bold text-[var(--color-texto-suave)] flex items-center gap-2 mb-4">
                        🕒 Selecciona tu turno para el {selectedDia} de Dic
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         
                         <div 
                           onClick={() => setSelectedTurno('09:00-14:00')}
                           className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group ${
                             selectedTurno === '09:00-14:00' 
                               ? 'border-blue-500 bg-blue-500/10 shadow-lg scale-105' 
                               : 'border-[var(--color-borde-suave)] bg-[var(--color-fondo-app)] hover:border-blue-500/50 hover:bg-black/5'
                           }`}
                         >
                           <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-400/20 text-amber-500 uppercase tracking-widest">Día</span>
                           <span className={`font-bold text-base ${selectedTurno === '09:00-14:00' ? 'text-blue-500' : 'text-[var(--color-texto-suave)]'}`}>09:00 - 14:00</span>
                           <div className="text-[10px] text-emerald-500 font-bold text-center mt-1">✓ Disponible</div>
                         </div>

                         <div 
                           className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-not-allowed opacity-50 bg-[var(--color-fondo-app)] border-red-500/20`}
                           aria-disabled="true"
                           title="Este turno ya fue reservado por otro cliente"
                         >
                           <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 uppercase tracking-widest">Noche</span>
                           <span className="font-bold text-base text-[var(--color-texto-muted)]">15:00 - 20:00</span>
                           <div className="text-[10px] text-red-500 font-bold text-center mt-1">✗ Agotado</div>
                         </div>
                         
                      </div>
                   </div>
                 )}

                 <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[9px] font-bold">
                       <div className="w-2 h-2 rounded-full bg-[var(--color-primario)]" /> TU FECHA
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold">
                       <div className="w-2 h-2 rounded-full bg-emerald-400/20 border border-emerald-400/50" /> DISPONIBLE
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold">
                       <div className="w-2 h-2 rounded-full bg-red-500/20" /> OCUPADO
                    </div>
                 </div>
              </div>

              <div className="flex gap-3 mt-4">
                 <button 
                  onClick={() => {
                    setMostrarCalendario(false);
                    setSelectedDia(null);
                    setSelectedTurno(null);
                  }}
                  className="btn btn-fantasma flex-1 text-xs h-12"
                >
                  Cerrar
                </button>
                <button 
                  disabled={!selectedDia || !selectedTurno}
                  onClick={() => {
                     setMostrarCalendario(false);
                     setReservado(true);
                  }}
                  className="btn btn-primario flex-1 text-xs h-12"
                >
                  {(!selectedDia || !selectedTurno) ? 'Selecciona Turno...' : 'Aceptar Reserva'}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
