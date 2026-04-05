'use client';

import { Calendar, Users, Wallet, ChevronRight, Star, Clock, Heart, X, Loader2 } from 'lucide-react';
import { formatearMoneda } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { createEvento } from '@/lib/actions/eventActions';
import { useRouter } from 'next/navigation';

interface DashboardClientProps {
  initialEventos: any[];
  perfil: any;
}

export default function DashboardClient({ initialEventos, perfil }: DashboardClientProps) {
  const router = useRouter();
  const [eventos, setEventos] = useState(initialEventos);
  const [loading, setLoading] = useState(false);
  
  const usuario = {
    plan: perfil?.cliente?.plan || 'FREE',
  };

  const isPlanner = usuario.plan === 'PLANNER';
  const isOro = usuario.plan === 'ORO';
  const isFree = usuario.plan === 'FREE';

  const [eventoId, setEventoId] = useState(eventos.length > 0 ? eventos[0].id : null);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  
  // States para el nuevo evento
  const [nuevoEvento, setNuevoEvento] = useState({
    nombre: '',
    invitados: '',
    fecha: '',
    presupuesto: '',
    tipo: 'Boda'
  });

  const eventTypes = ['Boda', 'XV Años', 'Fiesta Infantil', 'Graduación', 'Fiesta', 'Bautizo'];

  const proximoEvento = eventos.find(e => e.id === eventoId) || eventos[0] || null;
  
  // Cálculo de vigencia del evento
  const mesesVigencia = isFree ? 3 : (isOro ? 12 : Infinity);
  
  let fechaExpiracion = new Date();
  if (proximoEvento) {
    fechaExpiracion = new Date(proximoEvento.creadoEn);
    if (mesesVigencia !== Infinity) {
      fechaExpiracion.setMonth(fechaExpiracion.getMonth() + mesesVigencia);
    }
  }

  const handleCrearEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoEvento.nombre.trim() || !nuevoEvento.invitados || !nuevoEvento.tipo) return;

    setLoading(true);
    const res = await createEvento({
      clienteId: perfil.cliente?.id || '',
      nombre: nuevoEvento.nombre,
      tipo: nuevoEvento.tipo,
      fecha: nuevoEvento.fecha || undefined,
      presupuesto: parseFloat(nuevoEvento.presupuesto) || 0,
      invitados: parseInt(nuevoEvento.invitados) || 0,
    });

    if (res.success) {
      // En lugar de actualizar el estado local, refrescamos la página para que el Server Component vuelva a traer todo
      router.refresh();
      setIsNewEventModalOpen(false);
      setNuevoEvento({ nombre: '', invitados: '', fecha: '', presupuesto: '', tipo: 'Boda' });
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const proveedoresRecomendados = [
    { id: 1, nombre: 'Jardín Las Rosas', categoria: 'Salón', calificacion: 4.9, precio: 35000, img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80' },
    { id: 2, nombre: 'DJ SoundWave', categoria: 'Música', calificacion: 4.8, precio: 8500, img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
    { id: 3, nombre: 'Gourmet Express', categoria: 'Comida', calificacion: 5.0, precio: 250, img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80' },
  ];

  // Estado vacío: sin eventos
  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-3xl">🎉</div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">¡Bienvenido a Gestor de Eventos!</h2>
          <p className="text-[var(--color-texto-suave)] max-w-md">Empieza creando tu primer evento para organizar cada detalle de tu gran día.</p>
        </div>
        <button 
          onClick={() => setIsNewEventModalOpen(true)}
          className="btn btn-primario px-8 py-4 font-bold shadow-lg shadow-violet-500/20"
        >
          Crear mi primer evento
        </button>

        {/* Modal siempre se renderiza aquí cuando está abierto */}
        {isNewEventModalOpen && renderModal()}
      </div>
    );
  }

  function renderModal() {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="card max-w-xl w-full p-8 space-y-8 animate-in zoom-in-95 duration-300">
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold uppercase italic tracking-tighter decoration-[var(--color-primario-claro)] underline underline-offset-8">Nuevo Evento</h2>
              <button onClick={() => setIsNewEventModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full" disabled={loading}><X size={20} /></button>
           </div>
           <form onSubmit={handleCrearEvento} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Nombre del Evento *</label>
                  <input 
                    type="text" required autoFocus
                    value={nuevoEvento.nombre}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, nombre: e.target.value})}
                    placeholder="Ej: Boda de Laura y David"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" 
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Tipo de Evento *</label>
                  <select 
                    required
                    value={nuevoEvento.tipo}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, tipo: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all"
                    disabled={loading}
                  >
                    {eventTypes.map(t => <option key={t} value={t} className="bg-[#1a1a1a]">{t}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Nº de Invitados *</label>
                  <input 
                    type="number" required min="1"
                    value={nuevoEvento.invitados}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, invitados: e.target.value})}
                    placeholder="Ej: 150"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" 
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] flex justify-between">
                    Fecha del Evento <span className="text-[8px] opacity-40 font-normal italic">(Opcional)</span>
                  </label>
                  <input 
                    type="date"
                    value={nuevoEvento.fecha}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" 
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] flex justify-between">
                    Presupuesto Estimado <span className="text-[8px] opacity-40 font-normal italic">(Opcional)</span>
                  </label>
                  <input 
                    type="number"
                    value={nuevoEvento.presupuesto}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, presupuesto: e.target.value})}
                    placeholder="Ej: 50000"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primario-claro)] transition-all" 
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                 <button type="button" onClick={() => setIsNewEventModalOpen(false)} className="btn btn-secundario flex-1 py-4" disabled={loading}>Cancelar</button>
                 <button type="submit" className="btn btn-primario flex-1 py-4 font-bold shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2" disabled={loading}>
                   {loading ? <Loader2 className="animate-spin" size={20} /> : 'Crear Evento'}
                 </button>
              </div>
           </form>
        </div>
      </div>
    );
  }

  // Prevenir errores si no hay evento activo (pero hay eventos en la lista)
  if (!proximoEvento) return null;

  // Calculamos días restantes reales si hay fecha
  const hoy = new Date();
  const fechaEvt = proximoEvento.fecha ? new Date(proximoEvento.fecha) : null;
  const diasRestantes = fechaEvt ? Math.max(0, Math.ceil((fechaEvt.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="space-y-10">
      {/* Event Selection (Solo para Planner) */}
      {isPlanner && (
        <section className="flex items-center gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-style">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-texto-muted)] whitespace-nowrap mr-2">
            Mis Eventos (Planner):
          </h2>
          {eventos.map((evt) => (
            <button 
              key={evt.id}
              onClick={() => setEventoId(evt.id)}
              className={`px-4 py-2 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${
                evt.id === proximoEvento.id 
                ? 'bg-[var(--color-primario)] border-[var(--color-primario)] text-white shadow-lg' 
                : 'bg-[var(--color-fondo-input)] border-[var(--color-borde-suave)] text-[var(--color-texto-suave)] hover:border-[var(--color-primario-claro)] hover:text-white'
              }`}
            >
              {evt.nombre}
            </button>
          ))}
          <button 
            onClick={() => setIsNewEventModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-[var(--color-primario-claro)] text-[var(--color-primario-claro)] text-sm font-bold hover:bg-[var(--color-primario)]/10 transition-all whitespace-nowrap"
          >
            <span>+</span> Nuevo Evento
          </button>
        </section>
      )}

      {/* Hero / Countdown */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primario-oscuro)] to-[var(--color-acento)] p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-widest">
                Próximo Gran Evento
              </span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm ${
                isPlanner ? 'bg-amber-500/80' : isOro ? 'bg-yellow-400/80 text-black' : 'bg-gray-400/80'
              }`}>
                Plan {usuario.plan}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{proximoEvento.nombre}</h1>
            <div className="flex items-center gap-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">{diasRestantes}</span>
                <span className="text-sm font-medium opacity-80">días restantes</span>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-sm opacity-80">Expira gestion</span>
                <span className="font-bold">
                  {mesesVigencia === Infinity ? 'Ilimitado' : fechaExpiracion.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <Link href={`/cliente/evento/${proximoEvento.id}`}>
            <button className="btn bg-white text-[var(--color-primario-oscuro)] hover:bg-white/90 px-8 py-4 text-lg shadow-xl shadow-black/20">
              Gestionar Mi Evento
            </button>
          </Link>
        </div>
        
        {/* Abstract background blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl" />
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400">
              <Wallet size={24} />
            </div>
            <Link href={`/cliente/evento/${proximoEvento.id}`} className="text-xs text-[var(--color-texto-muted)] hover:text-white">Ver más</Link>
          </div>
          <p className="text-sm font-medium text-[var(--color-texto-suave)]">Presupuesto</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold">{formatearMoneda(0)}</h3>
            <span className="text-xs text-[var(--color-texto-muted)]">de {formatearMoneda(proximoEvento.presupuestoTotal)}</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--color-fondo-input)] rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-acento)]" 
              style={{ width: `0%` }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-fuchsia-500/10 text-fuchsia-400">
              <Users size={24} />
            </div>
            <Link href={`/cliente/evento/${proximoEvento.id}`} className="text-xs text-[var(--color-texto-muted)] hover:text-white">Lista completa</Link>
          </div>
          <p className="text-sm font-medium text-[var(--color-texto-suave)]">Invitados</p>
          <h3 className="text-2xl font-bold">0 / {proximoEvento.numInvitados || 0}</h3>
          <p className="text-xs text-[var(--color-texto-muted)] mt-1">Confirmados (0%)</p>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
              <Star size={24} />
            </div>
            <Link href="/cliente/explorar" className="text-xs text-[var(--color-texto-muted)] hover:text-white">Buscar más</Link>
          </div>
          <p className="text-sm font-medium text-[var(--color-texto-suave)]">Proveedores</p>
          <h3 className="text-2xl font-bold">0 Contratados</h3>
          <p className="text-xs text-[var(--color-texto-muted)] mt-1">¡Empieza a buscar!</p>
        </div>
      </div>

      {/* Recommended Providers */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Proveedores Recomendados</h2>
          <Link href="/cliente/explorar" className="text-[var(--color-primario-claro)] text-sm font-bold flex items-center gap-1 hover:underline">
            Explorar todo <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {proveedoresRecomendados.map((prov) => (
            <div key={prov.id} className="card group p-0 overflow-hidden">
              <div className="relative aspect-video">
                <img src={prov.img} alt={prov.nombre} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <button className="absolute top-4 right-4 p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:text-red-500 hover:bg-white transition-all">
                  <Heart size={18} />
                </button>
                <div className="absolute bottom-4 left-4">
                   <span className="badge badge-premium text-[10px]">{prov.categoria}</span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{prov.nombre}</h3>
                  <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
                    <Star size={14} fill="currentColor" /> {prov.calificacion}
                  </div>
                </div>
                <p className="text-sm text-[var(--color-texto-suave)]">Desde {formatearMoneda(prov.precio)}</p>
                <Link href={`/cliente/proveedor/${prov.id}`}>
                  <button className="btn btn-fantasma w-full text-xs py-2 mt-2">Ver Detalles</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL NUEVO EVENTO (Reutilizado) */}
      {isNewEventModalOpen && renderModal()}
    </div>
  );
}
