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
  X,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { cn, formatearMoneda } from '@/lib/utils';
import Link from 'next/link';

interface ProviderDetailClientProps {
  data: any;
}

export default function ProviderDetailClient({ data }: ProviderDetailClientProps) {
  const [imgActiva, setImgActiva] = useState(0);
  const [reservado, setReservado] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  
  const [selectedDia, setSelectedDia] = useState<number | null>(null);
  const [selectedTurno, setSelectedTurno] = useState<string | null>(null);
  
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-[var(--color-primario)]" size={48} />
        <p>Cargando información real...</p>
      </div>
    );
  }

  const p = data;

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Main large image */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden group min-h-[400px]">
           <img 
             src={p.imagenes[imgActiva] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80'} 
             alt={p.nombre} 
             className="w-full h-full object-cover transition-transform duration-700" 
           />
           {p.imagenes.length > 1 && (
             <>
               <button 
                 onClick={() => setImgActiva((imgActiva - 1 + p.imagenes.length) % p.imagenes.length)}
                 className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                 <ChevronLeft size={24} />
               </button>
               <button 
                 onClick={() => setImgActiva((imgActiva + 1) % p.imagenes.length)}
                 className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                 <ChevronRight size={24} />
               </button>
             </>
           )}
        </div>
        
        {/* Sidebar thumbnails */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="flex-1 rounded-3xl overflow-hidden relative border border-white/5">
              <img src={p.imagenes[1] || p.imagenes[0]} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10" />
           </div>
           <div className="flex-1 rounded-3xl overflow-hidden relative border border-white/5 group">
              <img src={p.imagenes[2] || p.imagenes[0]} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center flex-col gap-2 cursor-pointer group-hover:bg-black/20 transition-all">
                 <span className="text-2xl font-bold">+{p.imagenes.length > 3 ? p.imagenes.length - 3 : 0}</span>
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
                 <span className="badge badge-premium">{p.categoria}</span>
                 <div className="flex items-center gap-1 text-amber-400 font-bold ml-2">
                    <Star size={16} fill="currentColor" /> {p.calificacion} 
                    <span className="text-[var(--color-texto-muted)] font-normal ml-1">({p.reseñasCount} reseñas)</span>
                 </div>
              </div>
              <h1 className="text-5xl font-extrabold">{p.nombre}</h1>
              <div className="flex items-center gap-2 text-[var(--color-texto-suave)]">
                 <MapPin size={18} className="text-[var(--color-acento-claro)]" />
                 {p.ubiacacion}
              </div>
           </div>

           <div className="space-y-4 border-t border-[var(--color-borde-suave)] pt-8">
              <h2 className="text-2xl font-bold">Acerca del servicio</h2>
              <p className="text-[var(--color-texto-suave)] leading-relaxed">
                {p.descripcion || 'Sin descripción detallada disponible.'}
              </p>
           </div>

           {/* Reseñas (Si hubiera) */}
           {p.resenas.length > 0 && (
             <div className="space-y-6 pt-6 border-t border-[var(--color-borde-suave)]">
                <h2 className="text-2xl font-bold">Reseñas de Clientes</h2>
                <div className="space-y-4">
                   {p.resenas.map((r: any) => (
                     <div key={r.id} className="card bg-[var(--color-fondo-input)]/50 p-6">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[var(--color-primario)]/20 flex items-center justify-center font-bold text-[var(--color-primario)]">
                                {r.nombre.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-bold">{r.nombre}</p>
                                 <p className="text-[10px] text-[var(--color-texto-muted)]">{new Date(r.creadoEn).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="flex items-center text-amber-400">
                              {Array.from({length: 5}).map((_, i) => (
                                <Star key={i} size={12} fill={i < r.calificacion ? "currentColor" : "none"} />
                              ))}
                           </div>
                        </div>
                        <p className="text-sm text-[var(--color-texto-suave)] leading-relaxed italic">
                          "{r.comentario || 'Sin comentario.'}"
                        </p>
                     </div>
                   ))}
                </div>
             </div>
           )}
        </div>

        {/* Right Sidebar (Booking / Action) */}
        <div className="space-y-6">
           <div className="card sticky top-32 p-8 border-t-4 border-t-[var(--color-primario)] shadow-2xl">
              <div className="space-y-6">
                 <div>
                    <p className="text-xs font-bold text-[var(--color-texto-muted)] uppercase tracking-widest mb-1">Precios desde</p>
                    <h3 className="text-4xl font-black gradient-texto">{formatearMoneda(p.servicios[0]?.precio || 0)}</h3>
                 </div>

                 <div className="space-y-3">
                    <p className="text-sm font-bold">Servicios Disponibles</p>
                    {p.servicios.map((s: any) => (
                       <div key={s.id} className="p-4 rounded-xl border border-[var(--color-borde-suave)] bg-[var(--color-fondo-input)] hover:border-[var(--color-primario)]/50 transition-all cursor-pointer group">
                          <div className="flex justify-between items-center mb-1">
                             <span className="font-bold text-sm">{s.nombre}</span>
                             <span className="text-[var(--color-primario-claro)] text-sm font-bold">{formatearMoneda(s.precio)}</span>
                          </div>
                          <p className="text-[10px] text-[var(--color-texto-muted)] leading-tight">{s.desc}</p>
                       </div>
                    ))}
                    {p.servicios.length === 0 && <p className="text-xs text-[var(--color-texto-muted)] italic">No hay servicios específicos listados todavía.</p>}
                 </div>

                 <hr className="border-[var(--color-borde-suave)]" />

                  <div className="space-y-4">
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
                <h3 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h3>
                <p className="text-sm text-[var(--color-texto-suave)] px-4">
                  Hemos enviado tu solicitud a **{p.nombre}**. El proveedor tiene 24 horas para confirmar.
                </p>
              </div>
              <div className="space-y-3 pt-4 px-6">
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

      {/* Modal de Calendario Simplificado */}
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
                    <h3 className="text-xl font-bold">Agenda de {p.nombre}</h3>
                    <p className="text-xs text-[var(--color-texto-suave)]">Consulta las fechas libres en tiempo real</p>
                 </div>
              </div>

              <div className="bg-[var(--color-fondo-input)] rounded-2xl p-6 border border-white/5 text-center">
                 <p className="text-sm text-[var(--color-texto-suave)]">El calendario interactivo de disponibilidad real se está sincronizando para este proveedor.</p>
                 <button 
                  onClick={() => setMostrarCalendario(false)}
                  className="btn btn-fantasma mt-6"
                 >
                   Regresar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
