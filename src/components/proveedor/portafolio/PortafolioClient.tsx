'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Upload, 
  X, 
  Loader2,
  Camera,
  Layers
} from 'lucide-react';
import { 
  addPortfolioItem, 
  deletePortfolioItem, 
  updatePortfolioOrder 
} from '@/lib/actions/portfolioActions';
import { uploadPortfolioImage } from '@/lib/actions/uploadActions';
import { cn } from '@/lib/utils';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PortfolioItem {
  id: string;
  url: string;
  titulo?: string;
  descripcion?: string;
  categoria?: string;
  orden: number;
}

interface PortafolioClientProps {
  items: PortfolioItem[];
  proveedor: any;
}

export default function PortafolioClient({ items: initialItems, proveedor }: PortafolioClientProps) {
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [isUploading, setIsUploading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!isMounted) return <div className="animate-pulse space-y-6">
    <div className="h-64 bg-[var(--color-fondo-input)] rounded-3xl" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-[var(--color-fondo-input)] rounded-2xl" />)}
    </div>
  </div>;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('proveedorId', proveedor.id);

        const uploadRes = await uploadPortfolioImage(formData);
        if (uploadRes.success && uploadRes.url) {
          const addRes = await addPortfolioItem({
            url: uploadRes.url,
            titulo: file.name.split('.')[0]
          });
          
          if (addRes.success && addRes.data) {
            setItems(prev => [...prev, addRes.data as PortfolioItem]);
          }
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Hubo un error al subir algunas imágenes.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen del portafolio?')) return;

    const res = await deletePortfolioItem(id);
    if (res.success) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        
        const newArray = arrayMove(prev, oldIndex, newIndex);
        
        // Actualizar órdenes en segundo plano
        const updates = newArray.map((item, index) => ({ id: item.id, orden: index }));
        updatePortfolioOrder(updates);
        
        return newArray;
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Zona de Carga */}
      <div 
        className="relative group cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="border-2 border-dashed border-[var(--color-borde-suave)] rounded-3xl p-12 flex flex-col items-center justify-center transition-all hover:bg-[var(--color-primario)]/5 hover:border-[var(--color-primario)]">
          <div className="w-16 h-16 rounded-full bg-[var(--color-primario)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="text-[var(--color-primario)]" size={32} />
          </div>
          <h3 className="text-xl font-bold">Subir nuevas fotografías</h3>
          <p className="text-[var(--color-texto-suave)] mt-2">
            Arrastra tus fotos aquí o haz clic para buscarlas.
          </p>
          <p className="text-xs text-[var(--color-texto-muted)] mt-4 uppercase tracking-widest font-bold">
            JPG, PNG, WEBP (MÁX. 10MB CADA UNA)
          </p>
        </div>
        
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm z-10">
            <Loader2 className="animate-spin text-[var(--color-primario)] mb-4" size={48} />
            <p className="font-bold">Subiendo tus recuerdos...</p>
          </div>
        )}
      </div>

      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {/* Grid de Portafolio */}
      <div className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Camera className="text-[var(--color-primario)]" size={24} />
          <h2 className="text-2xl font-bold">Tu Galería</h2>
          <span className="text-sm font-medium px-2 py-0.5 bg-[var(--color-primario)]/10 text-[var(--color-primario)] rounded-full lowercase">
            {items.length} imágenes
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-fondo-input)] rounded-3xl border border-[var(--color-borde-suave)]">
            <Layers className="mx-auto text-[var(--color-texto-muted)] mb-4" size={48} />
            <p className="text-[var(--color-texto-suave)]">Aún no tienes fotos en tu portafolio.</p>
            <p className="text-sm text-[var(--color-texto-muted)]">Sube tus mejores trabajos para que los clientes te elijan.</p>
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={items.map(i => i.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {items.map((item) => (
                  <SortableItem 
                    key={item.id} 
                    item={item} 
                    onDelete={() => handleDelete(item.id)} 
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function SortableItem({ item, onDelete }: { item: PortfolioItem, onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "group relative aspect-square rounded-2xl overflow-hidden border-2",
        isDragging ? "border-[var(--color-primario)] shadow-2xl" : "border-transparent"
      )}
    >
      <Image 
        src={item.url} 
        alt={item.titulo || 'Portfolio image'} 
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      
      {/* Overlay de Control */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
        <button 
          className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white cursor-grab active:cursor-grabbing hover:bg-white/20 transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} />
        </button>
        <button 
          onClick={onDelete}
          className="p-3 bg-red-500/80 backdrop-blur-md rounded-xl text-white hover:bg-red-600 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Badge de Orden */}
      <div className="absolute top-3 left-3 w-7 h-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-white/20">
        {item.orden + 1}
      </div>
    </div>
  );
}
