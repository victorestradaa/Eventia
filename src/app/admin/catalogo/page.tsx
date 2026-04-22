'use client';

import React, { useState, useEffect } from 'react';
import { 
  getCatalogoAssets, 
  createCatalogoAsset, 
  deleteCatalogoAsset, 
  updateCatalogoAsset,
  limpiarActivosCorruptos
} from '@/lib/actions/adminActions';
import { 
  Upload, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Image as ImageIcon, 
  Type as FontIcon, 
  Smile,
  AlertCircle,
  Loader2,
  FolderOpen
} from 'lucide-react';

export default function CatalogoAdminPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    tipo: 'FONDO',
    categoria: 'TODAS',
  });

  const CATEGORIAS = [
    { value: 'TODAS', label: 'Todas / General' },
    { value: 'BODA', label: 'Bodas' },
    { value: 'XV_ANOS', label: 'XV Años' },
    { value: 'BAUTIZO', label: 'Bautizo' },
    { value: 'FIESTA_INFANTIL', label: 'Fiesta Infantil' },
    { value: 'FIESTA_GENERAL', label: 'Fiesta General' },
  ];

  const TIPOS = [
    { value: 'FONDO', label: 'Fondo', icon: ImageIcon },
    { value: 'FUENTE', label: 'Tipografía', icon: FontIcon },
    { value: 'ICONO', label: 'Icono / Sticker', icon: Smile },
  ];

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async (silent = false) => {
    if (!silent) setLoading(true);
    const res = await getCatalogoAssets();
    if (res.success) {
      setAssets(res.data || []);
    }
    if (!silent) setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(files);
    
    // Generar previews para imágenes
    const newPreviews: string[] = [];
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.filter(f => f.type.startsWith('image/')).length) {
            setPreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return alert('Selecciona al menos un archivo');

    setUploading(true);
    setUploadProgress({ current: 0, total: selectedFiles.length });
    let successCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress({ current: i + 1, total: selectedFiles.length });
        
        try {
          const reader = new FileReader();
          const base64: string = await new Promise((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
          });

          const ext = file.name.split('.').pop() || 'png';
          const nombre = file.name.split('.')[0] || `Activo_${Date.now()}_${i}`;

          const res = await createCatalogoAsset({
              base64,
              ext,
              tipo: formData.tipo,
              categoria: formData.categoria,
              nombre
          });

          if (res.success) successCount++;
        } catch (err) {
          console.error(`Error subiendo archivo ${i}:`, err);
        }
    }

    if (successCount > 0) {
      setSelectedFiles([]);
      setPreviews([]);
      loadAssets(true); // Silent reload after upload
      alert(`¡Éxito! Se procesaron ${successCount} de ${selectedFiles.length} archivos.`);
    }
    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este asset del catálogo?')) {
      await deleteCatalogoAsset(id);
      loadAssets();
    }
  };

  const handleUpdate = async (id: string, updatedData: any) => {
    // Optimistic update locally to prevent jumpy UI
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updatedData } : a));
    
    const res = await updateCatalogoAsset(id, updatedData);
    if (res.success) {
      // No cerramos el editingId inmediatamente si fue un cambio de select para permitir fluidez, 
      // pero el usuario pidió que no se actualizara la página de golpe.
      // Si el cambio fue el nombre (onBlur), sí podemos cerrar.
      if (updatedData.nombre) setEditingId(null);
      loadAssets(true);
    }
  };

  const handleCleanup = async () => {
    if (confirm('¿Deseas limpiar los archivos corruptos (Base64) que están bloqueando el catálogo? Esto borrará tus cargas fallidas actuales para desbloquear la página.')) {
      setLoading(true);
      const res = await limpiarActivosCorruptos();
      if (res.success) {
        alert(`Limpieza exitosa. Se eliminaron ${res.eliminados} registros corruptos.`);
        loadAssets();
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black italic tracking-tighter uppercase">Gestión de Catálogo</h2>
           <p className="text-[var(--color-texto-suave)] text-sm">Control central de recursos para invitaciones premium.</p>
        </div>
        <button 
          onClick={handleCleanup}
          className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 bg-red-400/5 hover:bg-red-400/10 px-4 py-2 rounded-xl transition-all border border-red-400/20"
        >
          Limpieza de Emergencia
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Formulario de Carga Masiva */}
        <div className="xl:col-span-1">
          <div className="card sticky top-8 border-t-4 border-[var(--color-primario)]">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-[var(--color-primario)]/10 text-[var(--color-primario-claro)]">
                   <Upload size={20} />
                </div>
                <h3 className="text-xl font-bold">Subida Masiva</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-2 block">Destino del Activo</label>
                   <div className="grid grid-cols-3 gap-2">
                      {TIPOS.map(t => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setFormData({...formData, tipo: t.value})}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            formData.tipo === t.value 
                            ? 'border-[var(--color-primario)] bg-[var(--color-primario)]/10 text-white' 
                            : 'border-white/5 bg-white/5 text-[var(--color-texto-muted)] hover:border-white/10'
                          }`}
                        >
                          <t.icon size={18} />
                          <span className="text-[9px] font-bold uppercase">{t.label}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-2 block">Categoría Global</label>
                   <select 
                    className="input w-full bg-[#18181b] border-white/5"
                    value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value})}
                  >
                    {CATEGORIAS.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] mb-2 block tracking-widest">Seleccionar Archivos</label>
                  <label className="group block w-full aspect-video rounded-2xl border-2 border-dashed border-white/5 hover:border-[var(--color-primario)]/50 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer relative overflow-hidden">
                     <input 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept={formData.tipo === 'FUENTE' ? '.ttf,.otf,.woff' : 'image/*'}
                        onChange={handleFileChange}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                         <FolderOpen className="text-[var(--color-texto-muted)] group-hover:text-[var(--color-primario-claro)] mb-2 transition-colors" size={32} />
                         <span className="text-xs font-bold text-[var(--color-texto-muted)]">Click para buscar archivos</span>
                         {selectedFiles.length > 0 && (
                            <span className="mt-2 text-[10px] bg-[var(--color-primario)] px-2 py-0.5 rounded-full text-white font-black uppercase">
                                {selectedFiles.length} seleccionados
                            </span>
                         )}
                      </div>
                  </label>
                </div>
              </div>

              {previews.length > 0 && (
                 <div className="grid grid-cols-4 gap-2 pt-2">
                    {previews.slice(0, 8).map((p, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden border border-white/5">
                            <img src={p} className="w-full h-full object-cover" />
                        </div>
                    ))}
                    {previews.length > 8 && (
                        <div className="aspect-square rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold">
                            +{previews.length - 8}
                        </div>
                    )}
                 </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primario w-full py-4 text-sm font-black uppercase tracking-widest flex flex-col items-center justify-center gap-1 group"
                disabled={uploading || selectedFiles.length === 0}
              >
                <div className="flex items-center gap-2">
                  {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />}
                  {uploading ? 'Procesando...' : 'Iniciar Carga'}
                </div>
                {uploading && uploadProgress.total > 0 && (
                  <span className="text-[10px] opacity-60">
                    {uploadProgress.current} de {uploadProgress.total} archivos
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Galería Interactiva con Edición */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-bold flex items-center gap-2">
                <ImageIcon size={20} className="text-[var(--color-primario)]" />
                Explorador de Activos
             </h3>
             <div className="flex gap-2">
                {/* Filtros rápidos? */}
             </div>
          </div>

          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center gap-4 text-[var(--color-texto-muted)]">
                <Loader2 className="animate-spin text-[var(--color-primario)]" size={40} />
                <p className="text-sm font-bold uppercase tracking-widest">Sincronizando catálogo...</p>
             </div>
          ) : assets.length === 0 ? (
            <div className="p-20 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-3xl">
               <AlertCircle size={48} className="mx-auto text-[var(--color-texto-muted)] mb-4" />
               <p className="text-lg font-bold text-white mb-1">Catálogo Vacío</p>
               <p className="text-sm text-[var(--color-texto-muted)]">Usa el panel lateral para subir tus primeros archivos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xxl:grid-cols-5 gap-6">
              {assets.map((asset) => (
                <div key={asset.id} className="group relative rounded-2xl overflow-hidden bg-[#18181b] border border-white/5 hover:border-[var(--color-primario)]/30 transition-all">
                  
                  {/* Visual Preview */}
                  <div className="aspect-[3/4] bg-neutral-900 overflow-hidden relative">
                    {asset.tipo === 'FONDO' || asset.tipo === 'ICONO' ? (
                       <img 
                         src={asset.url} 
                         alt={asset.nombre} 
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                         onError={(e) => {
                           console.error('Error cargando imagen:', asset.url);
                           e.currentTarget.src = "https://via.placeholder.com/300x400/ff0000/ffffff?text=ERROR+DE+RED";
                         }}
                       />
                    ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-3">
                          <FontIcon size={40} className="text-[var(--color-primario-claro)]" />
                          <span className="text-[10px] font-black uppercase tracking-tighter line-clamp-2">{asset.nombre}</span>
                       </div>
                    )}
                    
                    {/* Badge de Categoría */}
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-black uppercase text-white border border-white/10">
                        {asset.categoria}
                    </div>
                  </div>

                  {/* Info & Meta */}
                  <div className="p-4 bg-gradient-to-t from-black to-[#18181b]">
                     {editingId === asset.id ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                           <input 
                              autoFocus
                              className="input text-xs py-1.5 px-3 bg-white/5 border-white/10"
                              defaultValue={asset.nombre}
                              onBlur={(e) => handleUpdate(asset.id, { nombre: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleUpdate(asset.id, { nombre: (e.target as any).value })}
                           />
                           <select 
                             className="input text-[10px] py-1.5 px-3 bg-white/5 border-white/10"
                             defaultValue={asset.categoria}
                             onChange={(e) => handleUpdate(asset.id, { categoria: e.target.value })}
                           >
                              {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                           </select>
                           <button 
                             onClick={() => setEditingId(null)}
                             className="w-full py-1 text-[9px] font-black uppercase bg-white/5 hover:bg-white/10 transition-colors rounded"
                           >
                             Cancelar
                           </button>
                        </div>
                     ) : (
                        <>
                           <h4 className="text-xs font-bold text-white truncate mb-4">{asset.nombre}</h4>
                           <div className="flex gap-2">
                              <button 
                                onClick={() => setEditingId(asset.id)}
                                className="flex-1 flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-[var(--color-primario)]/20 text-[var(--color-texto-muted)] hover:text-[var(--color-primario-claro)] transition-all"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDelete(asset.id)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-[var(--color-texto-muted)] hover:text-red-400 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                           </div>
                        </>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
