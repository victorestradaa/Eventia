'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Camera, X, Loader2, UploadCloud, Star, Trash, CalendarDays, Package, CheckCircle2, Users } from 'lucide-react';
import { ProfileCompleteModal } from './ProfileCompleteModal';
import { CATEGORIAS_LABELS, TIPO_EVENTO_LABELS, formatearMoneda } from '@/lib/utils';
import { createServicio, updateServicio, deleteServicio, upsertVariaciones, createComplemento, updateComplemento, deleteComplemento } from '@/lib/actions/providerActions';
import { uploadServiceImage } from '@/lib/actions/uploadActions';

const DIAS_SEMANA = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

interface CatalogoClientProps {
  servicios: any[];
  proveedor: any;
  complementos?: any[];
  perfilCompleto?: boolean;
}

export default function CatalogoClient({ servicios: initialServicios, proveedor, complementos: initialComplementos = [], perfilCompleto = true }: CatalogoClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [servicios, setServicios] = useState(initialServicios);
  const [complementos, setComplementos] = useState(initialComplementos);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    capacidadMin: '',
    capacidadMax: '',
    etiquetasEvento: [] as string[],
    imagenes: [] as string[],
    diasDisponibles: [] as number[],
    variaciones: Array(12).fill('') as string[], // index 0=Ene(mes1)...11=Dic(mes12)
    modalidad: 'DIA_COMPLETO' as 'DIA_COMPLETO' | 'POR_CANTIDAD' | 'POR_TURNOS',
    capacidadSimultanea: '1',
    bloquesHorario: [] as string[],
  });

  const filteredServicios = servicios.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.descripcion && s.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openNewModal = () => {
    if (!perfilCompleto) {
      setProfileModalOpen(true);
      return;
    }
    setEditingId(null);
    setFormData({ 
      nombre: '', descripcion: '', precio: '', capacidadMin: '', capacidadMax: '', 
      etiquetasEvento: ['TODOS'], imagenes: [], diasDisponibles: [], variaciones: Array(12).fill(''),
      modalidad: 'DIA_COMPLETO', capacidadSimultanea: '1', bloquesHorario: []
    });
    setModalOpen(true);
  };

  const openEditModal = (servicio: any) => {
    setEditingId(servicio.id);
    // Build variaciones array from existing data
    const varArr = Array(12).fill('');
    if (servicio.variaciones) {
      servicio.variaciones.forEach((v: any) => {
        varArr[v.mes - 1] = Number(v.precioOverride).toString();
      });
    }
    
    // Determinar modalidad basada en estado actual
    let modalidad: 'DIA_COMPLETO' | 'POR_CANTIDAD' | 'POR_TURNOS' = 'DIA_COMPLETO';
    const tieneTurnos = servicio.bloquesHorario && servicio.bloquesHorario.length > 0;
    const esMultiple = servicio.capacidadSimultanea > 1;
    
    if (tieneTurnos) {
      modalidad = 'POR_TURNOS';
    } else if (esMultiple) {
      modalidad = 'POR_CANTIDAD';
    }

    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      precio: servicio.precio.toString(),
      capacidadMin: servicio.capacidadMin?.toString() || '',
      capacidadMax: servicio.capacidadMax?.toString() || '',
      etiquetasEvento: servicio.etiquetasEvento || ['TODOS'],
      imagenes: servicio.imagenes || [],
      diasDisponibles: servicio.diasDisponibles || [],
      variaciones: varArr,
      modalidad,
      capacidadSimultanea: servicio.capacidadSimultanea?.toString() || '1',
      bloquesHorario: servicio.bloquesHorario || [],
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio? Las reservas existentes se mantendrán.')) return;
    
    // UI Optimista
    const prev = [...servicios];
    setServicios(s => s.filter(x => x.id !== id));
    
    const res = await deleteServicio(id);
    if (!res.success) {
      alert(res.error);
      setServicios(prev);
    }
  };

  const handleToggleDia = (dia: number) => {
    setFormData(prev => {
      const current = [...prev.diasDisponibles];
      const idx = current.indexOf(dia);
      if (idx >= 0) current.splice(idx, 1);
      else current.push(dia);
      return { ...prev, diasDisponibles: current };
    });
  };

  const handleToggleEtiqueta = (tag: string) => {
    setFormData(prev => {
      if (tag === 'TODOS') return { ...prev, etiquetasEvento: ['TODOS'] };
      let nuevasEtiquetas = prev.etiquetasEvento.filter(t => t !== 'TODOS');
      
      if (nuevasEtiquetas.includes(tag)) nuevasEtiquetas = nuevasEtiquetas.filter(t => t !== tag);
      else nuevasEtiquetas.push(tag);

      if (nuevasEtiquetas.length === 0) nuevasEtiquetas = ['TODOS'];
      return { ...prev, etiquetasEvento: nuevasEtiquetas };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    const nuevasUrl: string[] = [];

    // Subir cada archivo paralelamente
    const uploadPromises = Array.from(files).map(async (file) => {
      const payload = new FormData();
      payload.append('file', file);
      payload.append('proveedorId', proveedor.id);

      const res = await uploadServiceImage(payload);
      if (res.success && res.url) {
        nuevasUrl.push(res.url);
      }
    });

    await Promise.all(uploadPromises);

    if (nuevasUrl.length > 0) {
      setFormData(prev => ({
        ...prev,
        imagenes: [...prev.imagenes, ...nuevasUrl]
      }));
    } else {
      alert('Hubo un error al subir algunas imágenes. Asegúrate de que pesen menos de 10MB y sean válidas.');
    }

    setIsUploadingImages(false);
  };

  const makeImagePrincipal = (index: number) => {
    setFormData(prev => {
      const nuevasImagenes = [...prev.imagenes];
      const elegida = nuevasImagenes.splice(index, 1)[0];
      nuevasImagenes.unshift(elegida); // Poner al inicio de la lista
      return { ...prev, imagenes: nuevasImagenes };
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const nuevasImagenes = [...prev.imagenes];
      nuevasImagenes.splice(index, 1);
      return { ...prev, imagenes: nuevasImagenes };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      proveedorId: proveedor.id,
      nombre: formData.nombre,
      descripcion: formData.descripcion || undefined,
      precio: parseFloat(formData.precio),
      capacidadMin: formData.capacidadMin ? parseInt(formData.capacidadMin) : undefined,
      capacidadMax: formData.capacidadMax ? parseInt(formData.capacidadMax) : undefined,
      etiquetasEvento: formData.etiquetasEvento,
      imagenes: formData.imagenes,
      diasDisponibles: formData.diasDisponibles,
      // Interpretar según modalidad
      capacidadSimultanea: formData.modalidad === 'POR_CANTIDAD' ? (parseInt(formData.capacidadSimultanea) || 1) : 1,
      bloquesHorario: formData.modalidad === 'POR_TURNOS' ? formData.bloquesHorario.filter(b => b.trim() !== '' && b !== '-') : [],
    };

    let savedId = editingId;

    if (editingId) {
      const res = await updateServicio(editingId, payload);
      if (res.success && res.data) {
        setServicios(s => s.map(x => x.id === editingId ? { ...res.data, variaciones: [] } : x));
      } else {
        alert(res.error);
        setIsSubmitting(false);
        return;
      }
    } else {
      const res = await createServicio(payload);
      if (res.success && res.data) {
        savedId = res.data.id;
        setServicios([...servicios, { ...res.data, variaciones: [] }]);
      } else {
        alert(res.error);
        setIsSubmitting(false);
        return;
      }
    }

    // Guardar variaciones de precio de temporada
    if (savedId) {
      const variacionesPayload = formData.variaciones
        .map((precio, index) => ({ mes: index + 1, precioOverride: parseFloat(precio) || 0 }))
        .filter(v => v.precioOverride > 0);
      
      if (variacionesPayload.length > 0) {
        await upsertVariaciones(savedId, variacionesPayload);
      }
    }

    setModalOpen(false);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black gradient-texto xl">Catálogo de Servicios</h1>
          <p className="text-[var(--color-texto-suave)] mt-1">Gestiona tus paquetes, fotos y configuraciones.</p>
        </div>
        <button onClick={openNewModal} className="btn btn-primario flex items-center justify-center gap-2 px-6 shadow-xl shadow-[var(--color-primario)]/20 hover:-translate-y-1 transition-transform">
          <Plus strokeWidth={3} size={18} />
          Nuevo Servicio
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)] group-focus-within:text-[var(--color-primario)] transition-colors" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-12 h-14 w-full shadow-sm text-lg" 
            placeholder="Buscar por nombre o descripción..." 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServicios.map((servicio) => (
          <div key={servicio.id} className="card p-0 flex flex-col group overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-[var(--color-borde-suave)]">
            <div className="relative aspect-[4/3] bg-[var(--color-fondo-input)]">
              {servicio.imagenes && servicio.imagenes.length > 0 ? (
                <img 
                  src={servicio.imagenes[0]} 
                  alt={servicio.nombre}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-texto-muted)]">
                  <Camera size={48} strokeWidth={1} className="mb-3 opacity-50" />
                  <span className="text-xs uppercase tracking-widest font-bold opacity-70">Sin Imagen</span>
                </div>
              )}
              
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                <span className="badge badge-premium text-xs shadow-lg backdrop-blur-md bg-opacity-90 max-w-fit">
                  Tipo: {CATEGORIAS_LABELS[proveedor.categoria as keyof typeof CATEGORIAS_LABELS]}
                </span>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {(servicio.etiquetasEvento || ['TODOS']).map((etiqueta: string) => (
                    <span key={etiqueta} className="badge bg-purple-500/20 text-purple-700 border border-purple-500/30 text-[10px] shadow-lg backdrop-blur-md">
                      {TIPO_EVENTO_LABELS[etiqueta as keyof typeof TIPO_EVENTO_LABELS]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col bg-[var(--color-fondo-card)]">
              <div className="flex justify-between items-start mb-3 gap-4">
                <h3 className="font-bold text-xl leading-snug line-clamp-2">{servicio.nombre}</h3>
                <span className="font-black text-xl text-[var(--color-primario-claro)] shrink-0">
                  {formatearMoneda(servicio.precio)}
                </span>
              </div>
              
              <p className="text-sm text-[var(--color-texto-suave)] line-clamp-3 mb-4 flex-1">
                {servicio.descripcion || 'Sin descripción disponible.'}
              </p>

              {/* Días disponibles badge */}
              {servicio.diasDisponibles && servicio.diasDisponibles.length > 0 && (
                <div className="flex gap-1 mb-4 flex-wrap">
                  <span className="text-[10px] font-bold text-[var(--color-texto-muted)] uppercase tracking-wider mr-1 self-center">Días:</span>
                  {DIAS_SEMANA.filter(d => servicio.diasDisponibles.includes(d.value)).map(d => (
                    <span key={d.value} className="px-2 py-0.5 rounded-md bg-[var(--color-primario)]/15 text-[var(--color-primario-claro)] text-[10px] font-bold">
                      {d.label}
                    </span>
                  ))}
                </div>
              )}

              {(servicio.capacidadMin || servicio.capacidadMax) && (
                 <div className="flex gap-2 text-xs font-bold text-[var(--color-texto-muted)] uppercase tracking-wider mb-6 bg-[var(--color-fondo-input)] p-3 rounded-xl justify-center">
                    {servicio.capacidadMin && <span>Min: {servicio.capacidadMin}</span>}
                    {servicio.capacidadMin && servicio.capacidadMax && <span>—</span>}
                    {servicio.capacidadMax && <span>Max: {servicio.capacidadMax} personas</span>}
                 </div>
              )}

              <div className="flex border-t border-[var(--color-borde-suave)] pt-5 gap-3">
                <button onClick={() => openEditModal(servicio)} className="btn bg-[var(--color-fondo-input)] hover:bg-[var(--color-primario)]/10 hover:text-[var(--color-primario)] text-[var(--color-texto-suave)] flex-1 h-11 transition-colors">
                  <Edit2 size={16} className="mr-2" />
                  Editar
                </button>
                <button onClick={() => handleDelete(servicio.id)} className="btn bg-[var(--color-fondo-input)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-[var(--color-texto-suave)] w-11 p-0 transition-colors flex items-center justify-center">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button onClick={openNewModal} className="card border-2 border-dashed border-[var(--color-borde-fuerte)] flex flex-col items-center justify-center gap-6 min-h-[400px] text-[var(--color-texto-muted)] hover:border-[var(--color-primario)] hover:text-[var(--color-primario-claro)] hover:bg-[var(--color-primario)]/5 transition-all group">
          <div className="w-20 h-20 rounded-full bg-[var(--color-fondo-input)] flex items-center justify-center group-hover:scale-110 group-hover:bg-[var(--color-primario)]/20 transition-all">
            <Plus size={40} className="group-hover:text-[var(--color-primario)]" />
          </div>
          <p className="font-bold flex flex-col items-center gap-1">
            <span className="text-lg">Crear Nuevo Servicio</span>
            <span className="text-xs font-normal uppercase tracking-widest text-[var(--color-texto-suave)]">Amplía tu Portafolio</span>
          </p>
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-fondo-card)] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-[var(--color-borde-suave)] animate-in zoom-in-95 duration-200 relative">
            <div className="sticky top-0 z-10 px-6 py-5 border-b border-[var(--color-borde-suave)] flex justify-between items-center bg-[var(--color-fondo-app)]/90 backdrop-blur">
              <h2 className="text-xl font-bold">{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
              <button disabled={isSubmitting || isUploadingImages} onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-[var(--color-fondo-input)] text-[var(--color-texto-suave)] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* SECCIÓN DE FOTOGRAFÍAS */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-lg font-bold">Fotografías del Servicio</h3>
                    <p className="text-sm text-[var(--color-texto-muted)]">Sube las mejores fotos y elige la Principal (aparecerá como portada).</p>
                  </div>
                  <label className={`btn bg-[var(--color-fondo-input)] hover:bg-[var(--color-borde-fuerte)] flex items-center gap-2 cursor-pointer ${isUploadingImages ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploadingImages ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                    {isUploadingImages ? 'Subiendo...' : 'Subir Fotos'}
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                {formData.imagenes.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[var(--color-fondo-input)] p-4 rounded-2xl border border-[var(--color-borde-suave)]">
                    {formData.imagenes.map((imgUrl, index) => (
                      <div key={imgUrl} className="relative aspect-square rounded-xl overflow-hidden group bg-black/5 border border-[var(--color-borde-suave)] shadow-sm">
                        <img src={imgUrl} className={`w-full h-full object-cover ${index === 0 ? '' : 'group-hover:opacity-70'} transition-all`} />
                        
                        {/* Indicador Principal */}
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                            <Star size={12} fill="currentColor" /> Portada
                          </div>
                        )}

                        {/* Controles Ocultos que aparecen en Hover */}
                        <div className="absolute inset-x-0 bottom-0 p-2 flex gap-1 justify-center translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/80 to-transparent pt-6">
                          {index !== 0 && (
                            <button type="button" onClick={() => makeImagePrincipal(index)} className="bg-white/90 text-black hover:bg-white text-xs px-2 py-1.5 rounded-md font-bold flex-1 shadow flex items-center justify-center gap-1 transition-colors">
                              <Star size={12} /> Principal
                            </button>
                          )}
                          <button type="button" onClick={() => removeImage(index)} className="bg-red-500/90 text-white hover:bg-red-500 p-1.5 rounded-md shadow transition-colors w-full flex justify-center">
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-[var(--color-borde-fuerte)] rounded-2xl p-10 flex flex-col items-center justify-center text-[var(--color-texto-muted)] hover:border-[var(--color-primario)] hover:text-[var(--color-primario)] hover:bg-[var(--color-primario)]/5 transition-all cursor-pointer">
                    <Camera size={40} className="mb-3 opacity-50" />
                    <span className="font-bold text-lg">Haz clic para buscar fotos</span>
                    <span className="text-xs">JPG, PNG, WEBP (Max 10MB)</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              <hr className="border-[var(--color-borde-suave)]" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-[var(--color-texto-suave)]">Nombre del Servicio <span className="text-red-500">*</span></label>
                  <input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} type="text" className="input w-full h-12" placeholder="Ej. Paquete Diamante" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-[var(--color-texto-suave)]">Precio Base (MXN) <span className="text-red-500">*</span></label>
                  <input required value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} type="number" step="0.01" min="0" className="input w-full h-12" placeholder="Ej. 15000" />
                </div>

                {/* DÍAS DISPONIBLES */}
                <div className="space-y-3 md:col-span-2 bg-[var(--color-fondo-input)] p-4 rounded-2xl border border-[var(--color-borde-suave)]">
                  <label className="text-sm font-bold text-[var(--color-texto-suave)] flex justify-between items-center">
                    <span className="flex items-center gap-2"><CalendarDays size={16} /> Días Disponibles</span>
                    <span className="text-[10px] text-[var(--color-texto-muted)]">{formData.diasDisponibles.length === 0 ? 'Todos los días' : `${formData.diasDisponibles.length} día(s)`}</span>
                  </label>
                  <p className="text-xs text-[var(--color-texto-muted)]">
                    Si no seleccionas ninguno, el servicio aplica todos los días. Selecciona solo los días en que ofreces este paquete.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {DIAS_SEMANA.map(dia => {
                      const isActive = formData.diasDisponibles.includes(dia.value);
                      return (
                        <button
                          key={dia.value}
                          type="button"
                          onClick={() => handleToggleDia(dia.value)}
                          className={`w-12 h-12 rounded-xl text-xs font-black border-2 transition-all ${
                            isActive
                              ? 'bg-[var(--color-primario)] text-white border-[var(--color-primario)] shadow-lg shadow-[var(--color-primario)]/30 scale-105'
                              : 'bg-transparent text-[var(--color-texto-suave)] border-[var(--color-borde-fuerte)] hover:border-[var(--color-primario-claro)]'
                          }`}
                        >
                          {dia.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PRECIOS DE TEMPORADA ALTA */}
                <div className="space-y-3 md:col-span-2 bg-[var(--color-fondo-input)] p-4 rounded-2xl border border-[var(--color-borde-suave)]">
                  <label className="text-sm font-bold text-[var(--color-texto-suave)] flex justify-between items-center">
                    <span>🔥 Precios de Temporada Alta (por Mes)</span>
                    <span className="text-[10px] bg-orange-500/20 text-orange-600 px-2 py-1 rounded">Opcional</span>
                  </label>
                  <p className="text-xs text-[var(--color-texto-muted)]">
                    Si un campo queda vacío, se usará el Precio Base ({formData.precio ? formatearMoneda(parseFloat(formData.precio)) : '$0'}). Escribe un precio diferente para los meses de temporada alta.
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {MESES.map((mes, index) => {
                      const hasOverride = formData.variaciones[index] !== '' && formData.variaciones[index] !== '0';
                      return (
                        <div key={mes} className={`relative rounded-xl border-2 p-2 transition-all ${hasOverride ? 'border-orange-500/50 bg-orange-500/5' : 'border-[var(--color-borde-suave)]'}`}>
                          <label className={`text-[10px] font-black uppercase tracking-widest block text-center mb-1 ${hasOverride ? 'text-orange-600' : 'text-[var(--color-texto-muted)]'}`}>{mes}</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.variaciones[index]}
                            onChange={e => {
                              const newVar = [...formData.variaciones];
                              newVar[index] = e.target.value;
                              setFormData({...formData, variaciones: newVar});
                            }}
                            className="input w-full h-8 text-xs text-center p-1"
                            placeholder={formData.precio ? `$${formData.precio}` : '—'}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 md:col-span-2 bg-[var(--color-fondo-input)] p-4 rounded-2xl border border-[var(--color-borde-suave)]">
                  <label className="text-sm font-bold text-[var(--color-texto-suave)] flex justify-between">
                    <span>Etiquetas de Evento (Multiselección)</span>
                    <span className="text-[10px] bg-[var(--color-primario-claro)]/20 text-[var(--color-primario-claro)] px-2 py-1 rounded">Recomendado</span>
                  </label>
                  <p className="text-xs text-[var(--color-texto-muted)] mb-2">
                    Selecciona en qué eventos aplica.
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TIPO_EVENTO_LABELS).map(([key, label]) => {
                      const isSelected = formData.etiquetasEvento.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleToggleEtiqueta(key)}
                          className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                            isSelected 
                              ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                              : 'bg-transparent text-[var(--color-texto-suave)] border-[var(--color-borde-fuerte)] hover:border-purple-400'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-texto-suave)]">Capacidad Min. <span className="text-[10px] font-normal">(Opcional)</span></label>
                  <input value={formData.capacidadMin} onChange={e => setFormData({...formData, capacidadMin: e.target.value})} type="number" min="0" className="input w-full h-12" placeholder="Ej. 50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-texto-suave)]">Capacidad Máx. <span className="text-[10px] font-normal">(Opcional)</span></label>
                  <input value={formData.capacidadMax} onChange={e => setFormData({...formData, capacidadMax: e.target.value})} type="number" min="0" className="input w-full h-12" placeholder="Ej. 200" />
                </div>
              </div>

              {/* GESTIÓN DE MODALIDAD DE RESERVAS */}
              <div className="p-5 rounded-2xl border border-[var(--color-primario)]/20 bg-[var(--color-fondo-input)]/50 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-texto-suave)] flex items-center gap-2 mb-1">
                    <CalendarDays size={18} className="text-[var(--color-primario-claro)]" />
                    Modalidad de Reserva para el Servicio
                  </h3>
                  <p className="text-xs text-[var(--color-texto-muted)]">
                    Determina cómo controlas la disponibilidad máxima en cada fecha.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Opción 1: Único por día */}
                  <label className={`relative cursor-pointer border-2 rounded-2xl p-4 transition-all hover:bg-black/5 ${formData.modalidad === 'DIA_COMPLETO' ? 'border-[var(--color-primario)] bg-[var(--color-primario)]/5 shadow-md' : 'border-[var(--color-borde-fuerte)]'}`}>
                    <input 
                      type="radio" 
                      name="modalidad" 
                      className="sr-only" 
                      checked={formData.modalidad === 'DIA_COMPLETO'} 
                      onChange={() => setFormData({...formData, modalidad: 'DIA_COMPLETO'})}
                    />
                    <div className="flex flex-col items-center text-center gap-2">
                       <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors ${formData.modalidad === 'DIA_COMPLETO' ? 'bg-[var(--color-primario)] text-white' : 'bg-black/5 text-[var(--color-texto-muted)]'}`}>
                          📆
                       </span>
                       <span className={`font-bold text-sm ${formData.modalidad === 'DIA_COMPLETO' ? 'text-[var(--color-primario-claro)]' : 'text-[var(--color-texto-suave)]'}`}>
                         Día Completo
                       </span>
                       <p className="text-[10px] text-[var(--color-texto-muted)] leading-tight">Solo brindo este servicio UNA vez por día (exclusividad total).</p>
                    </div>
                    {formData.modalidad === 'DIA_COMPLETO' && (
                      <div className="absolute top-2 right-2 text-[var(--color-primario)]"><CheckCircle2 size={16} /></div>
                    )}
                  </label>

                  {/* Opción 2: Por cantidad */}
                  <label className={`relative cursor-pointer border-2 rounded-2xl p-4 transition-all hover:bg-black/5 ${formData.modalidad === 'POR_CANTIDAD' ? 'border-orange-500 bg-orange-500/5 shadow-md' : 'border-[var(--color-borde-fuerte)]'}`}>
                    <input 
                      type="radio" 
                      name="modalidad" 
                      className="sr-only" 
                      checked={formData.modalidad === 'POR_CANTIDAD'} 
                      onChange={() => setFormData({...formData, modalidad: 'POR_CANTIDAD'})}
                    />
                    <div className="flex flex-col items-center text-center gap-2">
                       <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors ${formData.modalidad === 'POR_CANTIDAD' ? 'bg-orange-500 text-white' : 'bg-black/5 text-[var(--color-texto-muted)]'}`}>
                          👥
                       </span>
                       <span className={`font-bold text-sm ${formData.modalidad === 'POR_CANTIDAD' ? 'text-orange-500' : 'text-[var(--color-texto-suave)]'}`}>
                         Capacidad / Cupos
                       </span>
                       <p className="text-[10px] text-[var(--color-texto-muted)] leading-tight">Múltiples eventos al día pero sin turnos específicos. (Ej. 3 bodas al día).</p>
                    </div>
                    {formData.modalidad === 'POR_CANTIDAD' && (
                      <div className="absolute top-2 right-2 text-orange-500"><CheckCircle2 size={16} /></div>
                    )}
                  </label>

                  {/* Opción 3: Por Turnos fijos */}
                  <label className={`relative cursor-pointer border-2 rounded-2xl p-4 transition-all hover:bg-black/5 ${formData.modalidad === 'POR_TURNOS' ? 'border-blue-500 bg-blue-500/5 shadow-md' : 'border-[var(--color-borde-fuerte)]'}`}>
                    <input 
                      type="radio" 
                      name="modalidad" 
                      className="sr-only" 
                      checked={formData.modalidad === 'POR_TURNOS'} 
                      onChange={() => {
                        const initTurnos = formData.bloquesHorario.length === 0 ? ['09:00-14:00'] : formData.bloquesHorario;
                        setFormData({...formData, modalidad: 'POR_TURNOS', bloquesHorario: initTurnos});
                      }}
                    />
                    <div className="flex flex-col items-center text-center gap-2">
                       <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors ${formData.modalidad === 'POR_TURNOS' ? 'bg-blue-500 text-white' : 'bg-black/5 text-[var(--color-texto-muted)]'}`}>
                          🕒
                       </span>
                       <span className={`font-bold text-sm ${formData.modalidad === 'POR_TURNOS' ? 'text-blue-500' : 'text-[var(--color-texto-suave)]'}`}>
                         Turnos Específicos
                       </span>
                       <p className="text-[10px] text-[var(--color-texto-muted)] leading-tight">Horarios fijos donde los clientes pueden apartar su turno.</p>
                    </div>
                    {formData.modalidad === 'POR_TURNOS' && (
                      <div className="absolute top-2 right-2 text-blue-500"><CheckCircle2 size={16} /></div>
                    )}
                  </label>
                </div>

                {/* Sub-configuración según Modalidad */}
                {formData.modalidad === 'POR_CANTIDAD' && (
                  <div className="space-y-2 pt-4 border-t border-orange-500/20 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-bold text-orange-600 flex justify-between items-center">
                      <span>¿Cuántos puedes realizar al mismo tiempo o bajo qué límite diario?</span>
                    </label>
                    <div className="flex bg-[var(--color-fondo-app)] border border-[var(--color-borde-fuerte)] rounded-xl overflow-hidden focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 h-14 items-center px-4 w-full md:w-1/2">
                      <Users size={18} className="text-[var(--color-texto-muted)] mr-3" />
                      <input 
                        type="number" 
                        min="2" 
                        required
                        value={formData.capacidadSimultanea} 
                        onChange={e => setFormData({...formData, capacidadSimultanea: e.target.value})} 
                        className="bg-transparent border-none outline-none focus:outline-none w-full text-lg font-bold text-[var(--color-texto-suave)]" 
                        placeholder="Ej. 2, 3..."
                      />
                    </div>
                  </div>
                )}

                {formData.modalidad === 'POR_TURNOS' && (
                  <div className="space-y-4 pt-4 border-t border-blue-500/20 animate-in slide-in-from-top-2 duration-300">
                    <h4 className="text-sm font-bold text-blue-600">Configuración de Tiempos</h4>
                    {formData.bloquesHorario.map((bloque, index) => {
                      const [inicio = '', fin = ''] = bloque.split('-');
                      return (
                        <div key={index} className="flex gap-2 items-center flex-wrap">
                          <div className="flex bg-[var(--color-fondo-app)] border border-[var(--color-borde-fuerte)] rounded-xl overflow-hidden flex-1 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 h-12">
                            <div className="flex flex-1 items-center px-3 border-r border-[var(--color-borde-suave)]">
                              <span className="text-xs text-[var(--color-texto-muted)] font-black mr-2 w-10">INICIO:</span>
                              <input
                                type="time"
                                value={inicio}
                                onChange={(e) => {
                                  const newInicio = e.target.value;
                                  const newBloques = [...formData.bloquesHorario];
                                  newBloques[index] = `${newInicio}-${fin}`;
                                  setFormData({...formData, bloquesHorario: newBloques});
                                }}
                                className="bg-transparent border-none outline-none focus:outline-none w-full h-full text-sm font-bold text-[var(--color-texto-suave)]"
                                required
                              />
                            </div>
                            <div className="flex flex-1 items-center px-3">
                              <span className="text-xs text-[var(--color-texto-muted)] font-black mr-2 w-10">FIN:</span>
                              <input
                                type="time"
                                value={fin}
                                onChange={(e) => {
                                  const newFin = e.target.value;
                                  const newBloques = [...formData.bloquesHorario];
                                  newBloques[index] = `${inicio}-${newFin}`;
                                  setFormData({...formData, bloquesHorario: newBloques});
                                }}
                                className="bg-transparent border-none outline-none focus:outline-none w-full h-full text-sm font-bold text-[var(--color-texto-suave)]"
                                required
                              />
                            </div>
                          </div>
                          
                          <button 
                            type="button" 
                            onClick={() => {
                              const newBloques = [...formData.bloquesHorario];
                              newBloques.splice(index, 1);
                              setFormData({...formData, bloquesHorario: newBloques});
                            }}
                            className="btn bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 h-12 w-12 flex items-center justify-center border-none shrink-0 rounded-xl"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      );
                    })}
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, bloquesHorario: [...formData.bloquesHorario, '-']})}
                      className="btn w-full btn-fantasma h-12 text-sm font-bold gap-2 border border-dashed border-blue-500/30 text-blue-500 hover:bg-blue-500/10 bg-transparent rounded-xl"
                    >
                      <Plus size={16} /> Agregar un Turno de Servicio
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--color-texto-suave)]">Descripción del Servicio <span className="text-[10px] font-normal">(Opcional)</span></label>
                <textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="input w-full min-h-[120px] py-3 resize-y" placeholder="Describe qué incluye tu servicio para atraer más clientes..."></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-borde-suave)] sticky bottom-0 bg-[var(--color-fondo-app)]/90 backdrop-blur py-4 mt-8">
                <button type="button" onClick={() => setModalOpen(false)} disabled={isSubmitting || isUploadingImages} className="btn bg-[var(--color-fondo-input)] hover:bg-[var(--color-borde-fuerte)] h-12 px-6">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting || isUploadingImages} className="btn btn-primario h-12 px-8">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? 'Guardar Cambios' : 'Crear Servicio')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ Complementos Section ═══════════ */}
      <ComplementosSection
        complementos={complementos}
        setComplementos={setComplementos}
        servicios={servicios}
        proveedorId={proveedor.id}
      />

      <ProfileCompleteModal 
        isOpen={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
      />
    </div>
  );
}

// ─── Complementos Sub-Component ────────────────────────────────────────────────
function ComplementosSection({ complementos, setComplementos, servicios, proveedorId }: {
  complementos: any[];
  setComplementos: React.Dispatch<React.SetStateAction<any[]>>;
  servicios: any[];
  proveedorId: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    servicioIds: [] as string[],
  });

  const resetForm = () => {
    setForm({ nombre: '', descripcion: '', precio: '', servicioIds: [] });
    setEditingId(null);
  };

  const openCreate = () => {
    if (!perfilCompleto) {
      setProfileModalOpen(true);
      return;
    }
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (comp: any) => {
    setForm({
      nombre: comp.nombre,
      descripcion: comp.descripcion || '',
      precio: Number(comp.precio).toString(),
      servicioIds: comp.servicios?.map((s: any) => s.id) || [],
    });
    setEditingId(comp.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.precio) return;
    if (form.servicioIds.length === 0) {
      alert('Selecciona al menos un servicio compatible.');
      return;
    }

    setIsSubmitting(true);

    if (editingId) {
      const res = await updateComplemento(editingId, {
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        precio: parseFloat(form.precio),
        servicioIds: form.servicioIds,
      });
      if (res.success && res.data) {
        setComplementos(prev => prev.map(c => c.id === editingId ? res.data : c));
      } else {
        alert(res.error);
      }
    } else {
      const res = await createComplemento({
        proveedorId,
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        precio: parseFloat(form.precio),
        servicioIds: form.servicioIds,
      });
      if (res.success && res.data) {
        setComplementos(prev => [res.data, ...prev]);
      } else {
        alert(res.error);
      }
    }

    setIsSubmitting(false);
    setModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este complemento?')) return;
    const res = await deleteComplemento(id);
    if (res.success) {
      setComplementos(prev => prev.filter(c => c.id !== id));
    } else {
      alert(res.error);
    }
  };

  const toggleServicio = (sid: string) => {
    setForm(prev => ({
      ...prev,
      servicioIds: prev.servicioIds.includes(sid)
        ? prev.servicioIds.filter(id => id !== sid)
        : [...prev.servicioIds, sid]
    }));
  };

  return (
    <>
      {/* Section Header */}
      <div className="mt-12 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Package size={20} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Complementos</h2>
            <p className="text-xs text-[var(--color-texto-muted)]">Extras opcionales que puedes ofrecer según el paquete contratado.</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn bg-orange-500 hover:bg-orange-400 text-white gap-2 shadow-lg shadow-orange-500/20 text-sm h-10 px-5">
          <Plus size={16} /> Nuevo Complemento
        </button>
      </div>

      {/* Complementos Grid */}
      {complementos.length === 0 ? (
        <div className="card p-8 text-center border-2 border-dashed border-[var(--color-borde-suave)]">
          <Package size={40} className="mx-auto text-[var(--color-texto-muted)] mb-3 opacity-50" />
          <p className="text-[var(--color-texto-muted)] text-sm">No tienes complementos creados aún.</p>
          <p className="text-[var(--color-texto-muted)] text-xs mt-1">Los complementos son extras que los clientes pueden agregar a su paquete contratado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complementos.map((comp) => (
            <div key={comp.id} className="card p-5 border border-[var(--color-borde-suave)] hover:border-orange-500/30 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-base">{comp.nombre}</h4>
                  {comp.descripcion && <p className="text-xs text-[var(--color-texto-muted)] mt-1 line-clamp-2">{comp.descripcion}</p>}
                </div>
                <span className="font-black text-orange-400 text-lg shrink-0">{formatearMoneda(comp.precio)}</span>
              </div>

              {/* Servicios compatibles */}
              <div className="mb-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-texto-muted)] mb-2">Compatible con:</p>
                <div className="flex flex-wrap gap-1">
                  {comp.servicios?.length > 0 ? comp.servicios.map((s: any) => (
                    <span key={s.id} className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 text-[10px] font-bold">
                      {s.nombre}
                    </span>
                  )) : (
                    <span className="text-[10px] text-[var(--color-texto-muted)]">Ningún servicio asignado</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[var(--color-borde-suave)]">
                <button onClick={() => openEdit(comp)} className="btn flex-1 bg-[var(--color-fondo-input)] hover:bg-[var(--color-borde-fuerte)] text-sm h-9 gap-1">
                  <Edit2 size={14} /> Editar
                </button>
                <button onClick={() => handleDelete(comp.id)} className="btn bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm h-9 w-9 p-0 flex items-center justify-center">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar Complemento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-fondo-card)] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-orange-500/20 animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 z-10 px-6 py-5 border-b border-[var(--color-borde-suave)] flex justify-between items-center bg-[var(--color-fondo-app)]/90 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Package size={20} className="text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{editingId ? 'Editar Complemento' : 'Nuevo Complemento'}</h2>
                  <p className="text-xs text-[var(--color-texto-muted)]">Extra opcional vinculado a paquetes específicos</p>
                </div>
              </div>
              <button onClick={() => { setModalOpen(false); resetForm(); }} disabled={isSubmitting} className="p-2 rounded-full hover:bg-[var(--color-fondo-input)] text-[var(--color-texto-suave)]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--color-texto-suave)]">Nombre del Complemento <span className="text-red-500">*</span></label>
                <input 
                  required
                  value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  type="text" className="input w-full h-12" 
                  placeholder="Ej. Hora extra, Cantante, Taquiza de 50, etc." 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--color-texto-suave)]">Precio (MXN) <span className="text-red-500">*</span></label>
                <input 
                  required
                  value={form.precio}
                  onChange={e => setForm({...form, precio: e.target.value})}
                  type="number" step="0.01" min="0" className="input w-full h-12 text-lg font-bold" 
                  placeholder="Ej. 2500" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--color-texto-suave)]">Descripción <span className="text-[10px] font-normal">(Opcional)</span></label>
                <textarea 
                  value={form.descripcion}
                  onChange={e => setForm({...form, descripcion: e.target.value})}
                  className="input w-full min-h-[80px] py-3 resize-y" 
                  placeholder="¿Qué incluye este complemento?" 
                />
              </div>

              {/* Servicios Compatibles (multi-select) */}
              <div className="space-y-3 bg-orange-500/5 border border-orange-500/20 rounded-2xl p-5">
                <label className="text-sm font-bold text-orange-400">¿Para cuáles servicios aplica? <span className="text-red-500">*</span></label>
                <p className="text-[10px] text-[var(--color-texto-muted)] -mt-1">Selecciona los paquetes con los que es compatible este complemento.</p>
                
                {servicios.length === 0 ? (
                  <p className="text-xs text-[var(--color-texto-muted)] italic">No tienes servicios creados. Crea un servicio primero.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {servicios.map((s: any) => (
                      <label key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] cursor-pointer hover:border-orange-500/40 transition-all select-none">
                        <input 
                          type="checkbox" 
                          checked={form.servicioIds.includes(s.id)}
                          onChange={() => toggleServicio(s.id)}
                          className="w-4 h-4 rounded accent-orange-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{s.nombre}</p>
                          <p className="text-[10px] text-[var(--color-texto-muted)]">{formatearMoneda(s.precio)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-borde-suave)]">
                <button type="button" onClick={() => { setModalOpen(false); resetForm(); }} disabled={isSubmitting} className="btn bg-[var(--color-fondo-input)] hover:bg-[var(--color-borde-fuerte)] h-11 px-6">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="btn bg-orange-500 hover:bg-orange-400 text-white h-11 px-8 shadow-lg shadow-orange-500/20">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? 'Guardar Cambios' : 'Crear Complemento')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
