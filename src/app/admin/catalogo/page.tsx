'use client';

import React, { useState, useEffect } from 'react';
import { getCatalogoAssets, createCatalogoAsset, deleteCatalogoAsset } from '@/lib/actions/adminActions';

export default function CatalogoAdminPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'FONDO',
    categoria: 'TODAS',
    nombre: '',
    etiquetas: ''
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    const res = await getCatalogoAssets();
    if (res.success) {
      setAssets(res.data || []);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !formData.nombre) return alert('Sube una imagen y ponle nombre');

    setUploading(true);
    const res = await createCatalogoAsset({
      ...formData,
      url: previewUrl
    });

    if (res.success) {
      setFormData({ ...formData, nombre: '', etiquetas: '' });
      setPreviewUrl(null);
      loadAssets();
    } else {
      alert('Error: ' + res.error);
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este asset del catálogo?')) {
      await deleteCatalogoAsset(id);
      loadAssets();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Catálogo de Invitaciones Digitales</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Subida */}
        <div className="card h-fit">
          <h3 className="text-lg font-semibold mb-4">Subir Nuevo Activo</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Tipo de Activo</label>
              <select 
                className="input" 
                value={formData.tipo}
                onChange={e => setFormData({...formData, tipo: e.target.value})}
              >
                <option value="FONDO">Fondo</option>
                <option value="FUENTE">Fuente / Tipografía</option>
                <option value="ICONO">Icono / Sticker</option>
              </select>
            </div>

            <div>
              <label className="label">Categoría Sugerida</label>
              <select 
                className="input"
                value={formData.categoria}
                onChange={e => setFormData({...formData, categoria: e.target.value})}
              >
                <option value="TODAS">Elegir una / TODAS</option>
                <option value="BODA">Bodas</option>
                <option value="XV_ANOS">XV Años</option>
                <option value="BAUTIZO">Bautizo</option>
                <option value="FIESTA_INFANTIL">Fiesta Infantil</option>
              </select>
            </div>

            <div>
              <label className="label">Nombre Identificador</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Ej. Fondo Dorado Elegante"
                value={formData.nombre}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
              />
            </div>

            <div>
              <label className="label">Archivo (Imágenes o TTF en caso de fuentes)</label>
              <input 
                type="file" 
                className="input" 
                accept="image/*"
                onChange={handleFileChange}
              />
              {previewUrl && formData.tipo === 'FONDO' && (
                <div className="mt-2 h-40 w-full overflow-hidden rounded border border-[var(--color-borde-suave)]">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primario w-full"
              disabled={uploading || !formData.nombre || !previewUrl}
            >
              {uploading ? 'Subiendo...' : 'Agregar al Catálogo'}
            </button>
          </form>
        </div>

        {/* Lista de Activos */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">Tus Activos Activos</h3>
          {loading ? (
            <p>Cargando catálogo...</p>
          ) : assets.length === 0 ? (
            <div className="p-8 text-center bg-[var(--color-borde)]/30 rounded-xl">
               No hay archivos en el catálogo de invitaciones. Sube el primero.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="relative group rounded-lg overflow-hidden border border-[var(--color-borde-suave)] bg-[var(--color-borde)]/10">
                  {asset.tipo === 'FONDO' || asset.tipo === 'ICONO' ? (
                    <div className="aspect-[9/16] bg-black/20 flex items-center justify-center overflow-hidden">
                      <img src={asset.url} alt={asset.nombre} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-[9/16] flex items-center justify-center p-4 text-center">
                      Archivo: {asset.nombre}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white font-bold">{asset.nombre}</h4>
                      <div className="flex gap-2 text-xs mt-1">
                        <span className="bg-white/20 text-white px-2 py-0.5 rounded">{asset.tipo}</span>
                        <span className="bg-white/20 text-white px-2 py-0.5 rounded">{asset.categoria}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(asset.id)}
                      className="text-red-400 hover:text-red-300 bg-red-400/20 hover:bg-red-400/30 w-full py-1.5 rounded-md transition-colors"
                    >
                      Eliminar
                    </button>
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
