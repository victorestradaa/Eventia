import React from 'react';

export default function ConfiguracionPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <h2 className="text-2xl font-bold">Configuración de la Plataforma</h2>

      {/* General Settings */}
      <div className="card space-y-6">
        <h3 className="text-lg font-bold border-b border-[var(--color-borde-suave)] pb-4">Ajustes Generales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Nombre del Sitio</label>
            <input type="text" className="input" defaultValue="Gestor de Eventos Premium" />
          </div>
          <div>
            <label className="label">Email de Soporte</label>
            <input type="email" className="input" defaultValue="soporte@gestor.com" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Descripción de Meta SEO</label>
            <textarea className="input min-h-[100px]" defaultValue="La mejor plataforma para organizar tu boda y eventos especiales en México." />
          </div>
        </div>
        <button className="btn btn-primario">Guardar Cambios</button>
      </div>

      {/* Monetization Settings */}
      <div className="card space-y-6 border-amber-500/30">
        <h3 className="text-lg font-bold border-b border-[var(--color-borde-suave)] pb-4 flex items-center gap-2">
          <span className="text-amber-400">💰</span> Monetización y Comisiones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label">Comisión Estándar (%)</label>
            <input type="number" className="input" defaultValue="10" />
          </div>
          <div>
            <label className="label">Precio Plan Anual Client ($)</label>
            <input type="number" className="input" defaultValue="99" />
          </div>
          <div>
            <label className="label">Precio Wedding Planner ($)</label>
            <input type="number" className="input" defaultValue="299" />
          </div>
        </div>
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-200">
          <p><strong>Nota:</strong> Los cambios en las comisiones solo aplicarán a nuevas reservas realizadas después de guardar.</p>
        </div>
        <button className="btn btn-primario bg-amber-600 hover:bg-amber-500">Actualizar Tarifas</button>
      </div>
    </div>
  );
}
