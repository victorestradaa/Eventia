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
  PlusCircle,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatearMoneda, cn } from '@/lib/utils';
import Link from 'next/link';
import { getExplorarServicios } from '@/lib/actions/providerActions';
import { CATEGORIAS_LABELS } from '@/lib/utils';
import { RegisterModal } from './RegisterModal';
import { useSearchParams } from 'next/navigation';
import Logo from '@/components/common/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

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
  'Todos': '#6366f1'
};

interface ExploreClientProps {
  isPublic?: boolean;
}

export default function ExploreClient({ isPublic = false }: ExploreClientProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('categoria');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Modal de registro
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedProviderName, setSelectedProviderName] = useState('');

  useEffect(() => {
    // Si viene una categoría en la URL, la activamos
    if (initialCategory) {
        // Encontrar el label que coincida con el ID (ej. SALON -> Salones)
        const matched = CATEGORIAS.find(c => {
            const normal = c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");
            return normal.includes(initialCategory.toLowerCase());
        });
        if (matched) setCatActiva(matched);
    }
  }, [initialCategory]);

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

  const handleCardClick = (p: any) => {
    if (isPublic) {
      setSelectedProviderName(p.nombre);
      setIsRegisterModalOpen(true);
    }
  };

  // Filtrado local
  const serviciosFiltrados = servicios.filter(s => {
    const normalizar = (t: string) => (t || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    
    const labelCategoria = CATEGORIAS_LABELS[s.categoria] || s.categoria || 'Servicio';
    const cumpleCat = catActiva === 'Todos' || normalizar(labelCategoria) === normalizar(catActiva);
    
    // Filtros que solo aplican en modo privado
    const cumplrePrecio = isPublic ? true : Number(s.precio) <= filtros.precioMax;
    const capNum = parseInt(s.capacidad?.toString() || '0');
    const cumpleCapacidad = isPublic || isNaN(capNum) || capNum >= filtros.capacidadMin;
    
    const cumpleSearch = searchQuery.trim() === '' || 
                       normalizar(s.nombre).includes(normalizar(searchQuery)) || 
                       normalizar(s.ciudad || '').includes(normalizar(searchQuery));
                       
    const cumpleUbicacion = filtros.ubicacion.trim() === '' || 
                          normalizar(s.ciudad || '').includes(normalizar(filtros.ubicacion));
    
    return cumpleCat && cumpleSearch && cumplrePrecio && cumpleCapacidad && cumpleUbicacion;
  });

  return (
    <div className={cn("flex flex-col min-h-screen font-sans bg-[var(--color-fondo)] text-[var(--color-texto)]", isPublic ? "" : "pb-10")}>
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
        providerName={selectedProviderName}
      />

      {/* ──────────── Public Header ──────────── */}
      {isPublic && (
        <header className="sticky top-0 z-[100] py-4 px-8 bg-[var(--color-fondo)]/80 backdrop-blur-md border-b border-[var(--color-borde-suave)]">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            <Link href="/" className="shrink-0">
              <Logo width={120} height={40} className="w-auto h-9 object-contain" />
            </Link>

            <div className="flex items-center gap-4 lg:gap-8">
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-6">
                <Link href="/login" className="text-[10px] font-black uppercase tracking-widest hover:text-[#d4af37] transition-colors">
                  Entrar
                </Link>
                <Link href="/registro" className="px-6 py-2.5 rounded-full bg-[var(--color-primario)] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-acento)] hover:text-black transition-all">
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className={cn("flex-1 space-y-8", isPublic ? "max-w-7xl mx-auto px-6 py-12" : "pt-2")}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--color-borde-suave)] pb-8">
        <div>
          <h1 className="text-4xl font-serif text-[var(--color-texto)] tracking-tight mb-2 italic">
            Explorar {isPublic && 'Proveedores'}
          </h1>
          <p className="text-[var(--color-texto-suave)] flex items-center gap-2 text-xs font-bold uppercase tracking-widest leading-loose">
            {isPublic 
              ? "Encuentra la inspiración perfecta para tu próximo gran evento" 
              : <>Catálogo real de servicios en <span className="font-black text-black px-2 bg-[#d4af37]/20 rounded">Eventia</span></>
            }
          </p>
        </div>
        
        {!isPublic && (
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-3 bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-2xl px-5 py-3 shadow-sm hover:border-[#d4af37]/50 transition-all group">
                <Calendar size={18} className="text-[#d4af37]" />
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-black tracking-widest text-[#d4af37] -mb-1">Fecha del Evento</span>
                  <input 
                    type="date" 
                    value={filtros.fecha}
                    onChange={(e) => setFiltros({...filtros, fecha: e.target.value})}
                    className="bg-transparent border-none outline-none text-[11px] font-black uppercase text-[var(--color-texto)] cursor-pointer"
                  />
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className={cn("flex flex-wrap gap-4 z-40 bg-[var(--color-fondo)]/80 backdrop-blur-xl py-4", isPublic ? "sticky top-20" : "sticky top-24 -mx-4 px-4")}>
        <div className="relative flex-1 min-w-[300px] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)] group-focus-within:text-[#d4af37] transition-colors" size={20} />
          <input 
            type="text" 
            className="w-full pl-14 h-16 bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] shadow-sm focus:border-[#d4af37]/30 focus:shadow-lg rounded-2xl transition-all font-medium outline-none" 
            placeholder="Buscar por nombre o ciudad..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative group">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)] group-focus-within:text-[#d4af37] transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Filtrar por ciudad..." 
                value={filtros.ubicacion}
                onChange={(e) => setFiltros({...filtros, ubicacion: e.target.value})}
                className="w-full sm:w-[240px] pl-14 h-16 bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] shadow-sm focus:border-[#d4af37]/30 focus:shadow-lg rounded-2xl transition-all font-medium outline-none" 
            />
        </div>

        {!isPublic && (
            <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={cn(
                    "h-16 px-12 transition-all font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-sm border",
                    showAdvanced 
                    ? "bg-[#d4af37] border-[#d4af37] text-white shadow-lg scale-[1.02]" 
                    : "bg-[var(--color-fondo-card)] border-[var(--color-borde-suave)] text-[var(--color-texto-suave)] hover:border-[#d4af37]/50"
                )}
            >
                <Settings2 size={18} className={cn("mr-2 inline", showAdvanced ? "text-white" : "text-[#d4af37]")} />
                Filtros Especiales
            </button>
        )}

        {/* Panel de Filtros Avanzados (Solo Privado) */}
        {!isPublic && showAdvanced && (
          <div className="w-full animate-in slide-in-from-top duration-300">
             <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]" />
                
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
                        className="w-full accent-[#d4af37]"
                      />
                      <div className="flex justify-between font-black text-sm italic">
                         <span>$0</span>
                         <span className="text-[#b89547]">
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
                        className="w-full accent-[#d4af37]"
                      />
                      <div className="flex justify-between font-black text-sm italic">
                         <span>0 pers.</span>
                         <span className="text-[#b89547]">{filtros.capacidadMin} pers.</span>
                      </div>
                   </div>
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
                "px-10 py-4 rounded-xl whitespace-nowrap text-[13px] font-black uppercase tracking-[0.1em] transition-all border duration-300 shadow-sm",
                isActive 
                  ? "text-white shadow-xl scale-105 active:scale-95" 
                  : "bg-[var(--color-fondo-input)] border-[var(--color-borde-suave)] text-[var(--color-texto-muted)] hover:border-stone-500 hover:text-[var(--color-texto)]"
              )}
              style={isActive ? {
                backgroundColor: catColor,
                borderColor: catColor,
                boxShadow: `0 8px 25px ${catColor}50`
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
          <Loader2 className="animate-spin text-[#d4af37]" size={48} />
          <p className="text-[var(--color-texto-suave)] font-medium">Actualizando catálogo...</p>
        </div>
      ) : serviciosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviciosFiltrados.map((p) => (
            <div 
              key={p.id} 
              onClick={() => handleCardClick(p)}
              className={cn(
                "group rounded-[2rem] overflow-hidden relative border border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] transition-all hover:shadow-2xl hover:-translate-y-1",
                isPublic ? "cursor-pointer" : ""
              )}
            >
              {/* Header Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                 <img 
                   src={p.img || '/placeholder_provider.png'} 
                   alt={p.nombre} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                 />
                 {!isPublic && (
                   <button className="absolute top-4 right-4 p-2.5 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-red-500 transition-all">
                     <Heart size={20} />
                   </button>
                 )}
                 {p.premium && (
                   <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primario-oscuro)] text-white text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20">
                     <Star size={10} fill="#d4af37" className="text-[#d4af37]" /> Premium
                   </div>
                 )}
                 <div className="absolute bottom-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-stone-100">{p.categoria}</span>
                 </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-serif text-[var(--color-texto)] mb-1 group-hover:text-[#b89547] transition-colors line-clamp-1">{p.nombre}</h3>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-texto-suave)] font-medium">
                      <MapPin size={12} className="text-[#d4af37]" /> {p.ciudad}
                    </div>
                  </div>
                  {!isPublic && (
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-xs font-black border border-amber-100">
                       <Star size={12} fill="currentColor" /> {p.calificacion}
                    </div>
                  )}
                </div>

                {isPublic ? (
                    <div className="pt-4 border-t border-[var(--color-borde-suave)] flex items-center justify-between group/btn">
                         <span className="text-[10px] font-black uppercase text-[#b89547] tracking-widest group-hover:translate-x-1 transition-transform">Ver detalles del proveedor</span>
                         <div className="w-8 h-8 rounded-full bg-[var(--color-fondo-hover)] flex items-center justify-center text-[var(--color-texto-muted)] group-hover/btn:bg-[#d4af37] group-hover/btn:text-white transition-all">
                            <ChevronRight size={16} />
                         </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between py-3 border-y border-[var(--color-borde-suave)]">
                           <div className="flex items-center gap-2 text-xs text-[var(--color-texto-suave)] font-bold">
                              <Users size={14} className="text-[var(--color-texto-muted)]" /> 
                              <span>Capacidad: {p.capacidad}</span>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] text-[var(--color-texto-muted)] uppercase font-black">Desde</p>
                              <p className="text-lg font-black text-[#b89547]">
                                {p.categoria === 'Comida' ? `${formatearMoneda(p.precio)} c/u` : formatearMoneda(p.precio)}
                              </p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <Link href={`/cliente/proveedor/${p.proveedorId}`} className="w-full">
                            <button className="w-full py-3 rounded-xl border border-[var(--color-borde-suave)] text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)] transition-all">Ver Perfil</button>
                          </Link>
                          <Link href={`/cliente/proveedor/${p.proveedorId}`} className="w-full">
                            <button className="w-full py-3 rounded-xl bg-[var(--color-primario)] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-acento)] hover:text-black transition-all shadow-md">Apartar Fecha</button>
                          </Link>
                        </div>
                    </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-[var(--color-fondo-card)] rounded-[3rem] border border-[var(--color-borde-suave)]">
          <div className="w-20 h-20 rounded-full bg-[var(--color-fondo-hover)] flex items-center justify-center text-[var(--color-texto-muted)]">
            <Search size={40} />
          </div>
          <div className="max-w-md space-y-2">
            <h2 className="text-2xl font-serif text-[var(--color-texto)]">Sin resultados</h2>
            <p className="text-[var(--color-texto-suave)] text-sm">
              No encontramos proveedores que coincidan con tus filtros actuales en esta zona.
            </p>
          </div>
          <button 
            onClick={() => {
              setFiltros({ precioMax: 500000, capacidadMin: 0, fecha: '', ubicacion: '' });
              setCatActiva('Todos');
              setSearchQuery('');
            }}
            className="px-8 py-3 rounded-full bg-[var(--color-primario)] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-acento)] hover:text-black transition-all"
          >
            Limpiar Filtros
          </button>
        </div>
      )}
      </div>

      {isPublic && (
        <footer className="py-12 px-8 border-t border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] mt-auto">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="shrink-0">
              <Logo width={110} height={35} className="w-auto h-8 opacity-40 grayscale" />
            </div>

            <p className="text-[11px] text-[var(--color-texto-muted)] font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Eventia. Hecho con ❤️ para momentos especiales.
            </p>

            <div className="flex items-center gap-8 text-[10px] uppercase tracking-widest font-black text-[var(--color-texto-muted)]">
              <Link href="#" className="hover:text-black transition-colors">Privacidad</Link>
              <Link href="#" className="hover:text-black transition-colors">Términos</Link>
              <Link href="#" className="hover:text-black transition-colors">Contacto</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
