'use client';

import React, { useState } from 'react';
import { Shield, Lock, Save, Loader2, CheckCircle } from 'lucide-react';
import { actualizarPassword } from '@/lib/actions/authActions';

export default function ConfiguracionPage() {
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    const res = await actualizarPassword(passwordData.newPassword);
    if (res.success) {
      setSaved(true);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <h2 className="text-2xl font-bold">Configuración de la Plataforma</h2>

      {/* General Settings */}
      <div className="card space-y-6">
        <h3 className="text-lg font-bold border-b border-[var(--color-borde-suave)] pb-4">Ajustes Generales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Nombre del Sitio</label>
            <input type="text" className="input" defaultValue="Eventium" />
          </div>
          <div>
            <label className="label">Email de Soporte</label>
            <input type="email" className="input" defaultValue="contacto@eventium.mx" />
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

      {/* Security Section */}
      <div className="card space-y-6">
        <h3 className="text-lg font-bold border-b border-[var(--color-borde-suave)] pb-4 flex items-center gap-2">
          <Shield size={20} className="text-[var(--color-primario-claro)]" /> Seguridad
        </h3>
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label flex items-center gap-2"><Lock size={14} /> Nueva Contraseña</label>
              <input 
                type="password" 
                className="input" 
                placeholder="Mínimo 6 caracteres"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="label flex items-center gap-2"><Lock size={14} /> Confirmar Contraseña</label>
              <input 
                type="password" 
                className="input" 
                placeholder="Repite la contraseña"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primario flex items-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : saved ? <><CheckCircle size={18} /> Contraseña Actualizada</> : <><Save size={18} /> Cambiar Contraseña</>}
          </button>
        </form>
      </div>
    </div>
  );
}
