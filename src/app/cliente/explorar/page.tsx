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
  'Todos', 'Salones', 'Música', 'Banquetes', 'Animación', 'Foto & Video', 'Decoración', 'Recuerdos', 'Inmobiliario'
];

export default function ExplorarPage() {
  const [catActiva, setCatActiva] = useState('Todos');
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    // Normalizar para comparación (Salón vs SALON)
    const labelCategoria = CATEGORIAS_LABELS[s.categoria] || s.categoria;
    const cumpleCat = catActiva === 'Todos' || labelCategoria.toLowerCase() === catActiva.toLowerCase();
    const cumpleSearch = s.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       s.ciudad.toLowerCase().includes(searchQuery.toLowerCase());
    return cumpleCat && cumpleSearch;
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explorar Proveedores</h1>
          <p className="text-[var(--color-texto-suave)] flex items-center gap-2">
            Catálogo real de servicios disponibles en <span className="font-bold text-white bg-[var(--color-primario)]/20 px-2 py-0.5 rounded border border-[var(--color-primario)]/30">Eventia</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button className="btn btn-secundario gap-2">
             <Calendar size={18} />
             Ver Disponibles
           </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap gap-4 sticky top-24 z-40">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" size={20} />
          <input 
            type="text" 
            className="input pl-12 h-14 bg-[var(--color-fondo-card)] border-[var(--color-borde-suave)] shadow-xl" 
            placeholder="Buscar por nombre, ciudad o servicio..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-secundario h-14 px-6 border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] shadow-xl">
          <Settings2 size={20} className="mr-2" />
          Filtros Avanzados
        </button>
      </div>

      {/* Categorías (Pills) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCatActiva(cat)}
            className={cn(
              "px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold border transition-all",
              catActiva === cat 
                ? "bg-[var(--color-primario)] border-[var(--color-primario)] text-white shadow-lg shadow-violet-500/30" 
                : "bg-[var(--color-fondo-card)] border-[var(--color-borde-suave)] text-[var(--color-texto-suave)] hover:border-[var(--color-primario-claro)]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Resultados */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-[var(--color-primario)]" size={48} />
          <p className="text-[var(--color-texto-suave)] font-medium">Sincronizando catálogo real...</p>
        </div>
      ) : serviciosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviciosFiltrados.map((p) => (
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

