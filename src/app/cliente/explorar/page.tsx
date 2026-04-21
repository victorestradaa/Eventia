'use client';

import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Heart,
  Settings2,
  Loader2,
  PlusCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatearMoneda, cn } from '@/lib/utils';
import Link from 'next/link';
import { getExplorarServicios } from '@/lib/actions/providerActions';
import { CATEGORIAS_LABELS } from '@/lib/utils';

const CATEGORIAS = [
  'Todos', 'Salones', 'Música', 'Banquetes', 'Animación', 'Foto & Video', 'Decoración', 'Recuerdos', 'Mobiliario'
];

const CATEGORIA_COLORS: Record<string, string> = {
  'Salones': '#8B5CF6',
  'Música': '#3B82F6',
  'Banquetes': '#10B981',
  'Animación': '#F59E0B',
  'Foto & Video': '#F43F5E',
  'Decoración': '#06B6D4',
  'Recuerdos': '#EC4899',
  'Mobiliario': '#64748B',
  'Todos': '#6366f1' // Indigo base for "Todos"
};


export default function ExplorarPage() {
  const [catActiva, setCatActiva] = useState('Todos');
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filtros, setFiltros] = useState({
    precioMax: 500000,
    capacidadMin: 0,
    fecha: '',
    ubicacion: ''
  });


  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getExplorarServicios();
      if (res.success) {
        setServicios(res.data || []);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Filtrado local (para mejor UX instantánea)
  const serviciosFiltrados = servicios.filter(s => {
    const normalizar = (t: string) => (t || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    
    const labelCategoria = CATEGORIAS_LABELS[s.categoria] || s.categoria || 'Servicio';
    const cumpleCat = catActiva === 'Todos' || normalizar(labelCategoria) === normalizar(catActiva);
    const cumplrePrecio = Number(s.precio) <= filtros.precioMax;
    
    // Capacidad puede ser "N/A", undefined, o un número — tratar NaN como que SÍ cumple
    const capNum = parseInt(s.capacidad?.toString() || '0');
    const cumpleCapacidad = isNaN(capNum) || capNum >= filtros.capacidadMin;
    
    const cumpleSearch = searchQuery.trim() === '' || 
                       normalizar(s.nombre).includes(normalizar(searchQuery)) || 
                       normalizar(s.ciudad || '').includes(normalizar(searchQuery));
                       
    const cumpleUbicacion = filtros.ubicacion.trim() === '' || 
                          normalizar(s.ciudad || '').includes(normalizar(filtros.ubicacion));
    
    return cumpleCat && cumpleSearch && cumplrePrecio && cumpleCapacidad && cumpleUbicacion;
  });


  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 italic">Explorar Proveedores</h1>
          <p className="text-[var(--color-texto-suave)] flex items-center gap-2 text-sm font-medium uppercase tracking-widest">
            Catálogo real de servicios disponibles en <span className="font-black text-[var(--color-acento)] px-2 bg-[var(--color-acento)]/10 rounded">Eventia</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-3 bg-[var(--color-fondo-card)] border border-white/10 rounded-2xl px-5 py-3 shadow-2xl hover:border-[var(--color-acento)]/50 transition-all group">
              <Calendar size={18} className="text-[var(--color-acento)]" />
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-black tracking-widest text-[var(--color-acento)] -mb-1">Fecha del Evento</span>
                <input 
                  type="date" 
                  value={filtros.fecha}
                  onChange={(e) => setFiltros({...filtros, fecha: e.target.value})}
                  className="bg-transparent border-none outline-none text-[11px] font-black uppercase text-[#1a1b35] cursor-pointer"
                  style={{ colorScheme: 'light' }}
                />
              </div>
           </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap gap-4 sticky top-24 z-40 bg-[var(--color-fondo)]/80 backdrop-blur-xl py-4 -mx-4 px-4">
        <div className="relative flex-1 min-w-[300px] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)] group-focus-within:text-[var(--color-acento)] transition-colors" size={20} />
          <input 
            type="text" 
            className="input pl-14 h-16 bg-[var(--color-fondo-card)]/50 border-white/5 shadow-2xl focus:border-[var(--color-acento)]/30 focus:shadow-[var(--color-acento)]/5 rounded-2xl transition-all font-medium" 
            placeholder="Buscar por nombre, ciudad o servicio..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "btn h-16 px-12 transition-all font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-2xl",
            showAdvanced 
              ? "btn-oro shadow-oro scale-[1.02]" 
              : "bg-[var(--color-fondo-card)] border border-white/10 text-[#1a1b35] hover:border-[var(--color-acento)]/50"
          )}
        >
          <Settings2 size={18} className={cn("mr-2", showAdvanced ? "text-[#1a1b35]" : "text-[var(--color-acento)]")} />
          Filtros Avanzados
        </button>

        {/* Panel de Filtros Avanzados */}
        {showAdvanced && (
          <div className="w-full animate-in slide-in-from-top duration-300">
             <div className="card border-[var(--color-primario)]/30 bg-gradient-to-br from-[var(--color-fondo-card)] to-[var(--color-fondo-input)] p-8 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-primario)]" />
                
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)]">Presupuesto Máximo</label>
                   <div className="space-y-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="500000" 
                        step="5000" 
                        value={filtros.precioMax}
                        onChange={(e) => setFiltros({...filtros, precioMax: parseInt(e.target.value)})}
                        className="w-full accent-[var(--color-primario-claro)]"
                      />
                      <div className="flex justify-between font-black text-sm italic">
                         <span>$0</span>
                         <span className="text-[var(--color-primario-claro)]">
                           {filtros.precioMax >= 500000 ? 'Sin límite' : formatearMoneda(filtros.precioMax)}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)]">Capacidad Mínima</label>
                   <div className="space-y-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="2000" 
                        step="50" 
                        value={filtros.capacidadMin}
                        onChange={(e) => setFiltros({...filtros, capacidadMin: parseInt(e.target.value)})}
                        className="w-full accent-[var(--color-primario-claro)]"
                      />
                      <div className="flex justify-between font-black text-sm italic">
                         <span>0 pers.</span>
                         <span className="text-[var(--color-primario-claro)]">{filtros.capacidadMin} pers.</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[#1a1b35]">Ubicación (Ciudad)</label>
                   <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-acento)]" />
                      <input 
                        type="text" 
                        placeholder="Ej. Guadalajara..." 
                        value={filtros.ubicacion}
                        onChange={(e) => setFiltros({...filtros, ubicacion: e.target.value})}
                        className="input pl-10 h-11 bg-[var(--color-fondo-input)] border-white/20 text-sm font-bold w-full" 
                      />
                   </div>
                </div>

                <div className="flex items-end pb-1">
                   <button 
                     onClick={() => {
                        setFiltros({ precioMax: 500000, capacidadMin: 0, fecha: '', ubicacion: '' });
                        setCatActiva('Todos');
                        setSearchQuery('');
                     }}
                     className="btn btn-fantasma w-full text-[10px] font-black uppercase tracking-widest h-11 border-[#1a1b35]/20 text-[#1a1b35]"
                   >
                     Restablecer todo
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Categorías (Pills) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar pt-2">
        {CATEGORIAS.map((cat) => {
          const isActive = catActiva === cat;
          const catColor = CATEGORIA_COLORS[cat] || '#6366f1';
          
          return (
            <button
              key={cat}
              onClick={() => setCatActiva(cat)}
              className={cn(
                "px-8 py-2.5 rounded-xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all border duration-300",
                isActive 
                  ? "text-white shadow-lg scale-105" 
                  : "bg-white/5 border-white/5 text-[var(--color-texto-muted)] hover:border-white/20 hover:text-white"
              )}
              style={isActive ? {
                backgroundColor: catColor,
                borderColor: catColor,
                boxShadow: `0 8px 20px ${catColor}40`
              } : {}}
            >
              {cat}
            </button>
          );
        })}
      </div>


      {/* Grid de Resultados */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-[var(--color-primario)]" size={48} />
          <p className="text-[var(--color-texto-suave)] font-medium">Sincronizando catálogo real...</p>
        </div>
      ) : serviciosFiltrados.length > 0 || servicios.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(serviciosFiltrados.length > 0 ? serviciosFiltrados : []).map((p) => (
            <div key={p.id} className="card group p-0 overflow-hidden relative border-none bg-gradient-to-b from-[var(--color-fondo-card)] to-[var(--color-fondo-input)]">
              {/* Header Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                 <img 
                   src={p.img} 
                   alt={p.nombre} 
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                 />
                 <button className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-[var(--color-acento)] transition-all">
                   <Heart size={20} />
                 </button>
                 {p.premium && (
                   <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primario)] text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                     <Star size={10} fill="currentColor" /> Premium
                   </div>
                 )}
                 <div className="absolute bottom-4 left-4">
                    <span className="badge badge-premium text-[10px]">{p.categoria}</span>
                 </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-[var(--color-primario-claro)] transition-colors">{p.nombre}</h3>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-texto-muted)]">
                      <MapPin size={12} /> {p.ciudad}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-1 rounded-lg text-xs font-bold">
                     <Star size={12} fill="currentColor" /> {p.calificacion}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-y border-[var(--color-borde-suave)]">
                   <div className="flex items-center gap-2 text-xs text-[var(--color-texto-suave)]">
                      <Users size={14} /> 
                      <span>Capacidad: {p.capacidad}</span>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-[var(--color-texto-muted)] uppercase font-bold">Desde</p>
                      <p className="text-lg font-black text-[var(--color-primario-claro)]">
                        {p.categoria === 'Comida' ? `${formatearMoneda(p.precio)} c/u` : formatearMoneda(p.precio)}
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/cliente/proveedor/${p.proveedorId}`} className="w-full">
                    <button className="btn btn-fantasma text-xs w-full">Ver Perfil</button>
                  </Link>
                  <Link href={`/cliente/proveedor/${p.proveedorId}`} className="w-full">
                    <button className="btn btn-primario text-xs w-full">Apartar Fecha</button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : servicios.length > 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-[var(--color-fondo-card)] rounded-[2rem] border-2 border-[var(--color-borde-suave)]">
          <div className="p-6 rounded-full bg-amber-500/10 text-amber-500">
            <Search size={64} strokeWidth={1.5} />
          </div>
          <div className="max-w-md space-y-2">
            <h2 className="text-2xl font-bold">Sin resultados</h2>
            <p className="text-[var(--color-texto-suave)]">
              No encontramos servicios que coincidan con tus filtros actuales. Intenta ajustar el presupuesto o la categoría.
            </p>
          </div>
          <button 
            onClick={() => {
              setFiltros({ precioMax: 200000, capacidadMin: 0, fecha: '', ubicacion: '' });
              setCatActiva('Todos');
            }}

            className="btn btn-primario px-8"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-[var(--color-fondo-card)] rounded-[2rem] border-2 border-dashed border-[var(--color-borde-suave)]">
          <div className="p-6 rounded-full bg-[var(--color-primario)]/10 text-[var(--color-primario)]">
            <PlusCircle size={64} strokeWidth={1.5} />
          </div>
          <div className="max-w-md space-y-2">
            <h2 className="text-2xl font-bold">Catálogo Inicializado</h2>
            <p className="text-[var(--color-texto-suave)]">
              No hay proveedores registrados todavía. Como acabas de limpiar la base de datos, ¡este es el momento perfecto para empezar a crear tus propios proveedores de prueba!
            </p>
          </div>
          <Link href="/registro">
            <button className="btn btn-primario px-8">Registrar un Proveedor</button>
          </Link>
        </div>
      )}

      {/* More info */}
      {!loading && serviciosFiltrados.length > 0 && (
        <div className="flex justify-center pt-8">
          <button className="btn btn-secundario px-10">Cargar más resultados</button>
        </div>
      )}
    </div>
  );
}

