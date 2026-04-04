'use client';

import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Heart, 
  CheckCircle2, 
  Settings2,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { formatearMoneda, cn } from '@/lib/utils';
import Link from 'next/link';

const CATEGORIAS = [
  'Todos', 'Salón', 'Música', 'Comida', 'Animación', 'Fotografía', 'Decoración', 'Recuerdos'
];

export default function ExplorarPage() {
  const [catActiva, setCatActiva] = useState('Todos');

  const proveedores = [
    { id: 1, nombre: 'Mansión Real', categoria: 'Salón', calificacion: 4.9, reseñas: 124, precio: 45000, ciudad: 'Ciudad de México', capacidad: '200-500', premium: true, img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80' },
    { id: 2, nombre: 'Orquesta Imperial', categoria: 'Música', calificacion: 4.8, reseñas: 89, precio: 12000, ciudad: 'Guadalajara', capacidad: 'N/A', premium: true, img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80' },
    { id: 3, nombre: 'Banquete Elegance', categoria: 'Comida', calificacion: 4.7, reseñas: 56, precio: 350, ciudad: 'Querétaro', capacidad: '50-1000', premium: false, img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80' },
    { id: 4, nombre: 'Focus Video', categoria: 'Fotografía', calificacion: 5.0, reseñas: 32, precio: 18000, ciudad: 'Puebla', capacidad: 'N/A', premium: false, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80' },
    { id: 5, nombre: 'Globos y Magia', categoria: 'Decoración', calificacion: 4.6, reseñas: 45, precio: 5000, ciudad: 'Estado de México', capacidad: 'N/A', premium: true, img: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=800&q=80' },
    { id: 6, nombre: 'Show Diversión', categoria: 'Animación', calificacion: 4.5, reseñas: 78, precio: 7500, ciudad: 'Ciudad de México', capacidad: 'N/A', premium: false, img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explorar Proveedores</h1>
          <p className="text-[var(--color-texto-suave)] flex items-center gap-2">
            Buscando servicios para <span className="font-bold text-white bg-[var(--color-primario)]/20 px-2 py-0.5 rounded border border-[var(--color-primario)]/30">Mi Boda Mágica</span>
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

      {/* Providers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {proveedores.map((p) => (
          <div key={p.id} className="card group p-0 overflow-hidden relative border-none bg-gradient-to-b from-[var(--color-fondo-card)] to-[var(--color-fondo-input)]">
            {/* Header Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
               <img 
                 src={p.img} 
                 alt={p.nombre} 
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
               />
               <button className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-[var(--color-acento)] transition-all">
                 <Heart size={20} fill={p.id === 1 ? "currentColor" : "none"} />
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
                <Link href={`/cliente/proveedor/${p.id}`} className="w-full">
                  <button className="btn btn-fantasma text-xs w-full">Ver Perfil</button>
                </Link>
                <Link href={`/cliente/proveedor/${p.id}`} className="w-full">
                  <button className="btn btn-primario text-xs w-full">Apartar Fecha</button>
                </Link>
              </div>
            </div>
            
            {/* Hover subtle glow */}
            <div className="absolute inset-0 border border-transparent group-hover:border-[var(--color-primario)]/30 rounded-xl pointer-events-none transition-all" />
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-8">
        <button className="btn btn-secundario px-10">Cargar más resultados</button>
      </div>
    </div>
  );
}
