'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  Gift, 
  Palette,
  Clock,
  Layout,
  Search,
  Calendar,
  Settings2,
  GripVertical,
  ChevronDown,
  Building2,
  Banknote,
  Church,
  Shirt,
  GlassWater,
  Images,
  QrCode,
  Trash2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  APIProvider, 
  useMapsLibrary 
} from '@vis.gl/react-google-maps';
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
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface PremiumEditorPanelProps {
  config: any;
  onChange: (newConfig: any) => void;
  evento: any;
}

// --- SUB-COMPONENTE: Autocomplete de Direcciones ---
const PlaceAutocomplete = ({ onPlaceSelect, defaultValue }: { onPlaceSelect: (address: string, mapsUrl: string) => void, defaultValue: string }) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const places = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'formatted_address', 'url'],
      componentRestrictions: { country: 'mx' }
    };

    const autocomplete = new places.Autocomplete(inputRef.current, options);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const address = place.formatted_address || '';
      const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
      setInputValue(address);
      onPlaceSelect(address, embedUrl);
    });
  }, [places, onPlaceSelect, defaultValue]);

  return (
    <div className="relative">
      <input 
        ref={inputRef}
        type="text" 
        placeholder="Busca el lugar o dirección..."
        className="w-full h-12 bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl px-12 text-xs font-medium shadow-inner outline-none focus:border-[var(--color-acento)] transition-all text-[var(--color-texto)]"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
    </div>
  );
};

// --- SUB-COMPONENTE: Item de Módulo Sortable ---
const SortableModuleItem = ({ 
  id, 
  label, 
  icon: Icon, 
  active, 
  onToggle, 
  isExpanded, 
  onExpand, 
  children 
}: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "group bg-[var(--color-fondo-input)] rounded-3xl border border-[var(--color-borde-suave)] overflow-hidden transition-all duration-300 shadow-sm",
        isDragging && "shadow-2xl border-[var(--color-acento)]/50",
        active ? "border-[var(--color-borde-suave)]" : "opacity-70 bg-zinc-100/50"
      )}
    >
      <div className="flex items-center justify-between p-4 gap-2">
        <div className="flex items-center gap-3 flex-1">
          <button 
            {...attributes} 
            {...listeners}
            className="p-2 cursor-grab active:cursor-grabbing hover:bg-black/5 rounded-xl transition-colors text-[var(--color-texto-muted)]"
          >
            <GripVertical size={18} />
          </button>
          
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            active ? "bg-[var(--color-acento)] text-white shadow-lg" : "bg-[var(--color-fondo-card)] text-[var(--color-texto-muted)] shadow-inner"
          )}>
            <Icon size={18} />
          </div>
          
          <span className={cn(
            "text-[11px] font-black uppercase tracking-widest", 
            active ? "text-[var(--color-texto)]" : "text-[var(--color-texto-muted)]"
          )}>
            {label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onExpand}
            className={cn(
              "p-3 rounded-xl transition-all duration-300",
              isExpanded ? "bg-[var(--color-acento)]/10 text-[var(--color-acento)] rotate-180" : "text-[var(--color-texto-muted)] hover:bg-black/5"
            )}
          >
            <Settings2 size={18} />
          </button>
          
          <button 
            onClick={onToggle}
            className={cn(
              "w-12 h-6 rounded-full relative transition-all duration-500",
              active ? "bg-[var(--color-acento)] shadow-[0_4px_10px_var(--color-acento)]/30" : "bg-zinc-300"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-sm",
              active ? "right-1" : "left-1"
            )} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-4 duration-300 space-y-4 border-t border-[var(--color-borde-suave)] bg-white/50">
          {children}
        </div>
      )}
    </div>
  );
};

export default function PremiumEditorPanel({ config, onChange, evento }: PremiumEditorPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Sensores para DND
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 0.4 * 1024 * 1024) {
        alert("La imagen es muy pesada. Máximo 400KB para asegurar el funcionamiento.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig('coverUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentPhotos = config.galeriaFotos || [];
    
    if (currentPhotos.length + files.length > 6) {
      alert("Máximo 6 fotografías permitidas.");
      return;
    }

    files.forEach(file => {
      if (file.size > 0.4 * 1024 * 1024) {
        alert(`La foto "${file.name}" supera los 400KB. Optimizala antes de subir.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        updateConfig('galeriaFotos', [...(config.galeriaFotos || []), result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const getLocalValue = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - tzOffset);
      return localDate.toISOString().slice(0, 16);
    } catch (e) {
      return '';
    }
  };

  // Manejo de ordenamiento
  const defaultModules = ['mostrarContador', 'mostrarCeremonia', 'mostrarCelebracion', 'mostrarDressCode', 'mostrarGaleria', 'mostrarMapa', 'mostrarRegalos', 'mostrarRSVP', 'mostrarAlbumQR'];
  const modulesOrder = config.ordenModulos 
    ? [...config.ordenModulos, ...defaultModules.filter(m => !config.ordenModulos.includes(m))]
    : defaultModules;
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = modulesOrder.indexOf(active.id);
      const newIndex = modulesOrder.indexOf(over?.id);
      updateConfig('ordenModulos', arrayMove(modulesOrder, oldIndex, newIndex));
    }
  };

  const themes = [
    { id: 'dark', name: 'Dark Elegant', colors: 'bg-zinc-900 border-zinc-700' },
    { id: 'light', name: 'Floral Claro', colors: 'bg-stone-50 border-stone-200' },
    { id: 'minimal', name: 'Minimalista', colors: 'bg-white border-zinc-100' },
    { id: 'gold', name: 'Oro Real', colors: 'bg-[#0f0f0f] border-[#bd9b65]/30' },
  ];

  const renderModuleSettings = (id: string) => {
    switch(id) {
      case 'mostrarCeremonia':
        return (
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--color-texto)] tracking-widest ml-1">Nombre del Lugar / Parroquia</label>
                <input 
                  type="text" 
                  placeholder="Ej. Parroquia de Nuestra Señora"
                  className="input w-full text-xs"
                  value={config.ceremoniaNombre || ''}
                  onChange={(e) => updateConfig('ceremoniaNombre', e.target.value)}
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--color-texto)] tracking-widest ml-1">Fecha y Hora de Ceremonia</label>
                <div className="relative">
                  <input 
                    type="datetime-local" 
                    className="input w-full"
                    value={getLocalValue(config.ceremoniaFecha)}
                    onChange={(e) => updateConfig('ceremoniaFecha', e.target.value)}
                  />
                  <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--color-texto)] tracking-widest ml-1">Ubicación de Ceremonia</label>
                <PlaceAutocomplete 
                  defaultValue={config.ceremoniaDireccion || ''}
                  onPlaceSelect={(address, url) => {
                    onChange({
                      ...config,
                      ceremoniaDireccion: address,
                      ceremoniaMapsUrl: url
                    });
                  }}
                />
             </div>
             <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest ml-1 text-center block">Fondo Sección</label>
                  <div className="flex items-center gap-2 bg-[var(--color-fondo-card)] p-2 rounded-xl border border-[var(--color-borde-suave)]">
                    <input 
                      type="color" 
                      className="w-10 h-8 rounded-lg cursor-pointer bg-transparent"
                      value={config.ceremoniaBgColor || '#fafafa'}
                      onChange={(e) => updateConfig('ceremoniaBgColor', e.target.value)}
                    />
                    <span className="text-[9px] font-mono opacity-50 uppercase">{config.ceremoniaBgColor || '#fafafa'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest ml-1 text-center block">Color Texto</label>
                  <div className="flex items-center gap-2 bg-[var(--color-fondo-card)] p-2 rounded-xl border border-[var(--color-borde-suave)]">
                    <input 
                      type="color" 
                      className="w-10 h-8 rounded-lg cursor-pointer bg-transparent"
                      value={config.ceremoniaTextColor || '#8b7355'}
                      onChange={(e) => updateConfig('ceremoniaTextColor', e.target.value)}
                    />
                    <span className="text-[9px] font-mono opacity-50 uppercase">{config.ceremoniaTextColor || '#8b7355'}</span>
                  </div>
                </div>
             </div>
          </div>
        );

      case 'mostrarCelebracion':
        return (
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--color-texto)] tracking-widest ml-1">Nombre del Lugar de Celebración</label>
                <input 
                  type="text" 
                  placeholder="Ej. Hacienda del Sol"
                  className="input w-full text-xs"
                  value={config.celebracionNombre || ''}
                  onChange={(e) => updateConfig('celebracionNombre', e.target.value)}
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--color-texto)] tracking-widest ml-1">Fecha y Hora de Celebración</label>
                <div className="relative">
                  <input 
                    type="datetime-local" 
                    className="input w-full"
                    value={getLocalValue(config.celebracionFecha)}
                    onChange={(e) => updateConfig('celebracionFecha', e.target.value)}
                  />
                  <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--color-texto)] tracking-widest ml-1">Ubicación de Celebración</label>
                <PlaceAutocomplete 
                  defaultValue={config.celebracionDireccion || ''}
                  onPlaceSelect={(address, url) => {
                    onChange({
                      ...config,
                      celebracionDireccion: address,
                      celebracionMapsUrl: url
                    });
                  }}
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest ml-1 text-center block">Color Texto</label>
                <div className="flex items-center gap-2 bg-[var(--color-fondo-card)] p-2 rounded-xl border border-[var(--color-borde-suave)]">
                  <input 
                    type="color" 
                    className="w-10 h-8 rounded-lg cursor-pointer bg-transparent"
                    value={config.celebracionTextColor || '#8b7355'}
                    onChange={(e) => updateConfig('celebracionTextColor', e.target.value)}
                  />
                  <span className="text-[9px] font-mono opacity-50 uppercase">{config.celebracionTextColor || '#8b7355'}</span>
                </div>
             </div>
          </div>
        );

      case 'mostrarDressCode':
        return (
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--color-texto)] tracking-widest ml-1">Descripción del Código</label>
                <input 
                  type="text" 
                  placeholder="Ej. Formal Riguroso / Guayabera"
                  className="input w-full text-xs"
                  value={config.dressCodeTexto || ''}
                  onChange={(e) => updateConfig('dressCodeTexto', e.target.value)}
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest ml-1 text-center block">Color Texto</label>
                <div className="flex items-center gap-2 bg-[var(--color-fondo-card)] p-2 rounded-xl border border-[var(--color-borde-suave)]">
                  <input 
                    type="color" 
                    className="w-10 h-8 rounded-lg cursor-pointer bg-transparent"
                    value={config.dressCodeColor || '#333333'}
                    onChange={(e) => updateConfig('dressCodeColor', e.target.value)}
                  />
                  <span className="text-[9px] font-mono opacity-50 uppercase">{config.dressCodeColor || '#333333'}</span>
                </div>
             </div>
          </div>
        );

      case 'mostrarGaleria':
        return (
          <div className="space-y-4">
             <div className="grid grid-cols-3 gap-2">
                {(config.galeriaFotos || []).map((foto: string, idx: number) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                     <img src={foto} className="w-full h-full object-cover" />
                     <button 
                       onClick={() => {
                          const newPhotos = [...config.galeriaFotos];
                          newPhotos.splice(idx, 1);
                          updateConfig('galeriaFotos', newPhotos);
                       }}
                       className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                     >
                        <Trash2 size={12} />
                     </button>
                  </div>
                ))}
                {(config.galeriaFotos || []).length < 6 && (
                  <label className="aspect-square border-2 border-dashed border-[var(--color-borde-suave)] rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[var(--color-acento)]/5 hover:border-[var(--color-acento)] transition-all">
                    <Plus size={20} className="text-[var(--color-acento)]" />
                    <span className="text-[8px] font-black uppercase opacity-40">Subir</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      multiple 
                      accept="image/*" 
                      onChange={handleGalleryUpload}
                    />
                  </label>
                )}
             </div>
             <p className="text-[9px] text-[var(--color-texto-muted)]/70 italic text-center">Puedes subir hasta 6 fotografías para tu galería lateral.</p>
          </div>
        );

      case 'mostrarAlbumQR':
        return (
          <div className="p-4 bg-[var(--color-acento)]/5 border border-[var(--color-acento)]/20 rounded-2xl text-center space-y-2">
             <QrCode size={32} className="mx-auto text-[var(--color-acento)] opacity-40" />
             <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-texto)]">Módulo en Desarrollo</p>
             <p className="text-[9px] text-[var(--color-texto-muted)] leading-relaxed">Este módulo permitirá a tus invitados subir fotos a un álbum compartido mediante un código QR. Estará disponible próximamente.</p>
          </div>
        );
        return (
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--color-texto)] tracking-widest ml-1">Fecha y Hora Evento</label>
                <div className="relative">
                  <input 
                    type="datetime-local" 
                    className="input w-full"
                    value={getLocalValue(config.fechaEventoExacta)}
                    onChange={(e) => updateConfig('fechaEventoExacta', e.target.value)}
                  />
                  <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
                </div>
                <p className="text-[9px] text-[var(--color-texto-muted)]/70 italic ml-1">Esta fecha activará el contador en el sitio.</p>
             </div>
          </div>
        );
      case 'mostrarMapa':
        return (
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[var(--color-texto)] tracking-widest ml-1">Ubicación Google Maps</label>
                <PlaceAutocomplete 
                  defaultValue={config.direccion || ''}
                  onPlaceSelect={(address, url) => {
                    onChange({
                      ...config,
                      direccion: address,
                      mapsUrl: url
                    });
                  }}
                />
                <p className="text-[9px] text-[var(--color-texto-muted)]/70 italic ml-1">Busca el lugar para mostrar el mapa interactivo.</p>
             </div>
          </div>
        );
      case 'mostrarRegalos':
        return (
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => updateConfig('regaloTipo', 'MESA')}
                  className={cn(
                    "p-3 rounded-xl border text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2",
                    config.regaloTipo === 'MESA' ? "border-[var(--color-acento)] bg-[var(--color-acento)]/5 text-[var(--color-texto)]" : "border-[var(--color-borde-suave)] text-[var(--color-texto-muted)] bg-white/50"
                  )}
                >
                  <Building2 size={14} /> Mesa de Regalos
                </button>
                <button 
                  onClick={() => updateConfig('regaloTipo', 'BANCO')}
                  className={cn(
                    "p-3 rounded-xl border text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2",
                    config.regaloTipo === 'BANCO' ? "border-[var(--color-acento)] bg-[var(--color-acento)]/5 text-[var(--color-texto)]" : "border-[var(--color-borde-suave)] text-[var(--color-texto-muted)] bg-white/50"
                  )}
                >
                  <Banknote size={14} /> Datos Bancarios
                </button>
             </div>

             {config.regaloTipo === 'MESA' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto)] tracking-widest ml-1">Link de Mesa de Regalos</label>
                  <input 
                    type="url" 
                    placeholder="https://mexico.liverpool.com.mx/mesa-de-regalos/..."
                    className="input w-full text-xs"
                    value={config.regaloMesaUrl || ''}
                    onChange={(e) => updateConfig('regaloMesaUrl', e.target.value)}
                  />
                </div>
             ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[var(--color-texto)] tracking-widest ml-1">Banco</label>
                    <input 
                      type="text" 
                      placeholder="Ej. BBVA"
                      className="input w-full text-xs"
                      value={config.regaloBanco || ''}
                      onChange={(e) => updateConfig('regaloBanco', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[var(--color-texto)] tracking-widest ml-1">CLABE</label>
                    <input 
                      type="text" 
                      placeholder="0123..."
                      className="input w-full text-xs"
                      value={config.regaloClabe || ''}
                      onChange={(e) => updateConfig('regaloClabe', e.target.value)}
                    />
                  </div>
                </div>
             )}
          </div>
        );
      case 'mostrarRSVP':
        return (
          <div className="space-y-4">
             <div className="bg-[var(--color-fondo-input)] p-4 rounded-2xl border border-[var(--color-borde-suave)] shadow-inner">
                <p className="text-[10px] text-[var(--color-texto-suave)] leading-relaxed italic">
                  Configura si los invitados deben confirmar su asistencia. Por defecto se solicita Confirmar / Rechazar.
                </p>
             </div>
             {/* Futuras opciones de RSVP como alergias, etc */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} language="es" region="MX">
      <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
        {/* Portada */}
        <div className="card-premium p-6 space-y-4 bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-[var(--radio-lg)]">
          <div className="flex items-center gap-3 mb-2">
            <Camera className="text-[var(--color-acento)]" size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-texto)]">Portada Principal</h3>
          </div>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer h-40 rounded-2xl bg-[var(--color-fondo-input)] border-2 border-dashed border-[var(--color-borde-suave)] flex flex-col items-center justify-center overflow-hidden hover:border-[var(--color-acento)]/30 transition-all"
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
            />
            {config.coverUrl ? (
              <img src={config.coverUrl} className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera size={32} className="text-[var(--color-texto-muted)]/30 group-hover:text-[var(--color-acento)] transition-colors" />
                <p className="text-[10px] font-bold uppercase text-[var(--color-texto-muted)] mt-2">Subir imagen de fondo</p>
              </>
            )}
            <input 
              type="text" 
              placeholder="URL de la imagen o Base64"
              className="absolute bottom-2 left-2 right-2 bg-black/60 px-3 py-2 rounded-xl text-[10px] text-white outline-none focus:bg-black/80"
              value={config.coverUrl || ''}
              onClick={(e) => e.stopPropagation()} 
              onChange={(e) => updateConfig('coverUrl', e.target.value)}
            />
          </div>
        </div>

        {/* Módulos Sortables */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4 ml-6">
            <Layout className="text-[var(--color-acento)]" size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-texto)]">Estructura de la Invitación</h3>
          </div>

          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={modulesOrder}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {modulesOrder.map((id: string) => {
                  const item = [
                    { id: 'mostrarContador', label: 'Cuenta Regresiva', icon: Clock },
                    { id: 'mostrarCeremonia', label: 'Ceremonia Religiosa', icon: Church },
                    { id: 'mostrarCelebracion', label: 'Celebración / Recepción', icon: GlassWater },
                    { id: 'mostrarDressCode', label: 'Código de Vestimenta', icon: Shirt },
                    { id: 'mostrarGaleria', label: 'Galería de Fotos', icon: Images },
                    { id: 'mostrarMapa', label: 'Mapa de Ubicación', icon: MapPin },
                    { id: 'mostrarRegalos', label: 'Mesa de Regalos', icon: Gift },
                    { id: 'mostrarRSVP', label: 'Formulario Asistencia', icon: Calendar },
                    { id: 'mostrarAlbumQR', label: 'Álbum QR (Pronto)', icon: QrCode },
                  ].find(m => m.id === id);
                  
                  if (!item) return null;

                  return (
                    <SortableModuleItem 
                      key={id}
                      id={id}
                      label={item.label}
                      icon={item.icon}
                      active={config[id]}
                      onToggle={() => updateConfig(id, !config[id])}
                      isExpanded={expandedModule === id}
                      onExpand={() => setExpandedModule(expandedModule === id ? null : id)}
                    >
                      {renderModuleSettings(id)}
                    </SortableModuleItem>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Temas */}
        <div className="card-premium p-6 space-y-5 bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-[var(--radio-lg)] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="text-[var(--color-acento)]" size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-texto)]">Tema Visual</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => (
              <button 
                key={theme.id}
                onClick={() => updateConfig('tema', theme.id)}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all text-left space-y-2 group",
                  config.tema === theme.id ? "border-[var(--color-acento)] bg-[var(--color-acento)]/5" : "border-[var(--color-borde-suave)] bg-[var(--color-fondo-input)] hover:border-[var(--color-borde)]"
                )}
              >
                <div className={cn("w-full h-8 rounded-lg mb-2 shadow-inner", theme.colors)} />
                <div className="flex items-center justify-between">
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", config.tema === theme.id ? "text-[var(--color-texto)]" : "text-[var(--color-texto-muted)]")}>
                    {theme.name}
                  </span>
                  {config.tema === theme.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-acento)] shadow-[0_0_8px_var(--color-acento)]" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </APIProvider>
  );
}
