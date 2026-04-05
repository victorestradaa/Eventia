'use client';

import { useState } from 'react';
import { Settings, Building2, User, Shield, Gem, Crown, Star, Zap, Save, Loader2, CheckCircle, MapPin, FileText, Clock } from 'lucide-react';
import { updateProviderProfile, updateProviderCredentials, updateProviderAvailability } from '@/lib/actions/settingsActions';
import { MEXICO_LOCATIONS } from '@/lib/constants/locations';
import { uploadServiceImage } from '@/lib/actions/uploadActions';
import { CATEGORIAS_LABELS } from '@/lib/utils';
import dynamic from 'next/dynamic';

const GoogleMapPicker = dynamic(() => import('@/components/GoogleMapPicker'), { ssr: false });

const PLAN_INFO: Record<string, { label: string; color: string; icon: any }> = {
  GRATIS: { label: 'Plan Básico', color: 'text-gray-400', icon: Zap },
  INTERMEDIO: { label: 'Plan Destacado', color: 'text-blue-400', icon: Star },
  PREMIUM: { label: 'Plan PRO', color: 'text-amber-400', icon: Crown },
  ELITE: { label: 'Plan Elite', color: 'text-emerald-400', icon: Gem },
};

interface ConfigClientProps {
  proveedor: any;
  usuario: { id: string; nombre: string; email: string };
}

export default function ConfigClient({ proveedor, usuario }: ConfigClientProps) {
  // Business Profile Form
  const [business, setBusiness] = useState({
    nombre: proveedor.nombre || '',
    descripcion: proveedor.descripcion || '',
    ciudad: proveedor.ciudad || '',
    estado: proveedor.estado || '',
    direccion: proveedor.direccion || '',
    logoUrl: proveedor.logoUrl || '',
    latitud: proveedor.latitud || null,
    longitud: proveedor.longitud || null,
    categoria: proveedor.categoria || 'SALON',
  });
  const [logoLoading, setLogoLoading] = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [businessSaved, setBusinessSaved] = useState(false);

  // Credentials Form
  const [creds, setCreds] = useState({
    nombre: usuario.nombre || '',
    email: usuario.email || '',
  });
  const [savingCreds, setSavingCreds] = useState(false);
  const [credsSaved, setCredsSaved] = useState(false);

  // Availability Form
  const [availability, setAvailability] = useState({
    permiteReservasPorHora: proveedor.permiteReservasPorHora || false,
    horarioApertura: proveedor.horarioApertura || '09:00',
    horarioCierre: proveedor.horarioCierre || '23:00',
  });
  const [savingAvail, setSavingAvail] = useState(false);
  const [availSaved, setAvailSaved] = useState(false);

  const planData = PLAN_INFO[proveedor.plan] || PLAN_INFO.GRATIS;
  const PlanIcon = planData.icon;

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBusiness(true);
    setBusinessSaved(false);

    const res = await updateProviderProfile(proveedor.id, business);
    if (res.success) {
      setBusinessSaved(true);
      setTimeout(() => setBusinessSaved(false), 3000);
    } else {
      alert(res.error);
    }
    setSavingBusiness(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('proveedorId', proveedor.id);

    const res = await uploadServiceImage(formData);
    if (res.success && res.url) {
      setBusiness({ ...business, logoUrl: res.url });
    } else {
      alert(res.error || 'Error al subir el logo');
    }
    setLogoLoading(false);
  };

  const handleSaveCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCreds(true);
    setCredsSaved(false);

    const res = await updateProviderCredentials(usuario.id, creds);
    if (res.success) {
      setCredsSaved(true);
      setTimeout(() => setCredsSaved(false), 3000);
    } else {
      alert(res.error);
    }
    setSavingCreds(false);
  };

  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAvail(true);
    setAvailSaved(false);

    const res = await updateProviderAvailability(proveedor.id, availability);
    if (res.success) {
      setAvailSaved(true);
      setTimeout(() => setAvailSaved(false), 3000);
    } else {
      alert(res.error);
    }
    setSavingAvail(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black gradient-texto xl">Configuración</h1>
          <p className="text-[var(--color-texto-suave)] mt-1">Gestiona tu perfil de negocio y credenciales de acceso.</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-fondo-input)] flex items-center justify-center">
          <Settings className="w-6 h-6 text-[var(--color-primario-claro)]" />
        </div>
      </div>

      {/* Plan Info Banner */}
      <div className={`card p-5 border-2 ${
        proveedor.plan === 'ELITE' ? 'border-emerald-500/30 bg-emerald-500/5' :
        proveedor.plan === 'PREMIUM' ? 'border-amber-500/30 bg-amber-500/5' :
        proveedor.plan === 'INTERMEDIO' ? 'border-blue-500/30 bg-blue-500/5' :
        'border-[var(--color-borde-suave)]'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            proveedor.plan === 'ELITE' ? 'bg-emerald-500/20' :
            proveedor.plan === 'PREMIUM' ? 'bg-amber-500/20' :
            proveedor.plan === 'INTERMEDIO' ? 'bg-blue-500/20' :
            'bg-white/10'
          }`}>
            <PlanIcon size={24} className={planData.color} />
          </div>
          <div className="flex-1">
            <p className={`text-lg font-black ${planData.color}`}>{planData.label}</p>
            <p className="text-xs text-[var(--color-texto-muted)]">
              Categoría: {CATEGORIAS_LABELS[proveedor.categoria] || proveedor.categoria}
              {proveedor.plan === 'ELITE' && ' • 0% Comisión • Ventas Manuales Habilitadas'}
            </p>
          </div>
          <a href="/proveedor/planes" className="btn bg-[var(--color-fondo-input)] hover:bg-[var(--color-borde-fuerte)] text-[var(--color-texto-suave)] text-sm px-4 h-10">
            Cambiar Plan
          </a>
        </div>
      </div>

      {/* Business Profile Section */}
      <form onSubmit={handleSaveBusiness} className="card p-0 overflow-hidden border border-[var(--color-borde-suave)] shadow-lg">
        <div className="px-6 py-5 border-b border-[var(--color-borde-suave)] bg-[var(--color-fondo-input)]/50 flex items-center gap-3">
          <Building2 size={20} className="text-[var(--color-primario-claro)]" />
          <div>
            <h2 className="text-lg font-bold">Perfil del Negocio</h2>
            <p className="text-xs text-[var(--color-texto-muted)]">Información pública visible para los clientes.</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Logo y Nombre */}
          <div className="flex flex-col md:flex-row items-center gap-8 pb-4 border-b border-white/5">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-[var(--color-fondo-input)] border-2 border-dashed border-[var(--color-borde-suave)] overflow-hidden flex items-center justify-center relative">
                {business.logoUrl ? (
                  <img src={business.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-[var(--color-texto-muted)]" />
                )}
                {logoLoading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--color-primario)] text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                <Zap size={14} />
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
            </div>
            <div className="flex-1 space-y-2 w-full text-center md:text-left">
              <label className="text-sm font-bold text-[var(--color-texto-suave)]">Nombre del Negocio <span className="text-red-500">*</span></label>
              <input 
                required
                value={business.nombre}
                onChange={e => setBusiness({...business, nombre: e.target.value})}
                type="text"
                className="input w-full h-12"
                placeholder="Ej. Mariachi Los Reales"
              />
            </div>
          </div>

          {/* Categoría del negocio */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--color-texto-suave)]">Categoría del Negocio <span className="text-red-500">*</span></label>
            <select 
              required
              value={business.categoria}
              onChange={e => setBusiness({...business, categoria: e.target.value})}
              className="input w-full h-12"
            >
              {Object.entries(CATEGORIAS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <p className="text-[10px] text-[var(--color-texto-muted)]">Selecciona la categoría que mejor describe tu negocio. Esto determina cómo te encuentran los clientes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-texto-suave)]">Estado <span className="text-red-500">*</span></label>
              <select 
                required
                value={business.estado}
                onChange={e => {
                  const nuevoEstado = e.target.value;
                  setBusiness({
                    ...business, 
                    estado: nuevoEstado,
                    ciudad: MEXICO_LOCATIONS[nuevoEstado]?.[0] || ''
                  });
                }}
                className="input w-full h-12"
              >
                <option value="">Selecciona un estado...</option>
                {Object.keys(MEXICO_LOCATIONS).sort().map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-texto-suave)] flex items-center gap-1"><MapPin size={14} /> Ciudad <span className="text-red-500">*</span></label>
              <select 
                required
                value={business.ciudad}
                onChange={e => setBusiness({...business, ciudad: e.target.value})}
                className="input w-full h-12"
                disabled={!business.estado}
              >
                <option value="">Selecciona una ciudad...</option>
                {business.estado && MEXICO_LOCATIONS[business.estado]?.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-[var(--color-texto-suave)]">Dirección de tu Negocio <span className="text-red-500">*</span></label>
              <p className="text-[10px] text-[var(--color-texto-muted)] mb-2">Busca tu dirección y ajusta el marcador en el mapa para que tus clientes te encuentren fácilmente.</p>
              
              <GoogleMapPicker 
                initialLat={business.latitud}
                initialLng={business.longitud}
                initialAddress={business.direccion}
                onLocationSelect={(lat, lng, address) => {
                  setBusiness({
                    ...business,
                    latitud: lat,
                    longitud: lng,
                    direccion: address || business.direccion
                  });
                }}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-[var(--color-texto-suave)] flex items-center gap-1"><FileText size={14} /> Descripción del Negocio <span className="text-[10px] font-normal">(Opcional)</span></label>
              <textarea 
                value={business.descripcion}
                onChange={e => setBusiness({...business, descripcion: e.target.value})}
                className="input w-full min-h-[100px] py-3 resize-y"
                placeholder="Cuenta a los clientes sobre tu negocio, experiencia, y lo que te hace especial..."
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[var(--color-borde-suave)]">
            <button type="submit" disabled={savingBusiness} className="btn btn-primario h-11 px-6 gap-2 shadow-lg shadow-[var(--color-primario)]/20">
              {savingBusiness ? <Loader2 size={18} className="animate-spin" /> : businessSaved ? <><CheckCircle size={18} /> Guardado</> : <><Save size={18} /> Guardar Cambios</>}
            </button>
          </div>
        </div>
      </form>

      {/* Horarios y Disponibilidad Section */}
      <form onSubmit={handleSaveAvailability} className="card p-0 overflow-hidden border border-[var(--color-borde-suave)] shadow-lg">
        <div className="px-6 py-5 border-b border-[var(--color-borde-suave)] bg-[var(--color-fondo-input)]/50 flex items-center gap-3">
          <Clock size={20} className="text-[var(--color-primario-claro)]" />
          <div>
            <h2 className="text-lg font-bold">Horarios y Disponibilidad</h2>
            <p className="text-xs text-[var(--color-texto-muted)]">Configura si permites bloqueos por horas y tu horario de operación.</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <label className="flex items-start gap-4 p-4 border border-[var(--color-borde-suave)] rounded-xl hover:border-[var(--color-primario)]/30 transition-colors cursor-pointer bg-[var(--color-fondo-input)]/30">
            <input 
              type="checkbox"
              checked={availability.permiteReservasPorHora}
              onChange={e => setAvailability({...availability, permiteReservasPorHora: e.target.checked})}
              className="mt-1 w-5 h-5 accent-[var(--color-primario)]"
            />
            <div>
              <p className="font-bold">Permitir reservas por fracciones de horas</p>
              <p className="text-xs text-[var(--color-texto-muted)] leading-relaxed mt-1">
                Actívalo si ofreces servicios que duran solo unas horas (ej. mariachis por hora, salones con turnos). Así podrás tener múltiples eventos el mismo día. Si lo mantienes desactivado, tus eventos bloquearán la fecha completa.
              </p>
            </div>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-texto-suave)]">Hora de Apertura</label>
              <input 
                required
                type="time"
                value={availability.horarioApertura}
                onChange={e => setAvailability({...availability, horarioApertura: e.target.value})}
                className="input w-full h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-texto-suave)]">Hora de Cierre</label>
              <input 
                required
                type="time"
                value={availability.horarioCierre}
                onChange={e => setAvailability({...availability, horarioCierre: e.target.value})}
                className="input w-full h-12"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[var(--color-borde-suave)] text-right">
            <button type="submit" disabled={savingAvail} className="btn btn-primario h-11 px-6 gap-2 shadow-lg shadow-[var(--color-primario)]/20">
              {savingAvail ? <Loader2 size={18} className="animate-spin" /> : availSaved ? <><CheckCircle size={18} /> Guardado</> : <><Save size={18} /> Guardar Horarios</>}
            </button>
          </div>
        </div>
      </form>

      {/* Credentials Section */}
      <form onSubmit={handleSaveCreds} className="card p-0 overflow-hidden border border-[var(--color-borde-suave)] shadow-lg">
        <div className="px-6 py-5 border-b border-[var(--color-borde-suave)] bg-[var(--color-fondo-input)]/50 flex items-center gap-3">
          <Shield size={20} className="text-[var(--color-primario-claro)]" />
          <div>
            <h2 className="text-lg font-bold">Credenciales de Acceso</h2>
            <p className="text-xs text-[var(--color-texto-muted)]">Tu nombre de usuario y correo electrónico.</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-texto-suave)] flex items-center gap-1"><User size={14} /> Nombre Completo</label>
              <input 
                required
                value={creds.nombre}
                onChange={e => setCreds({...creds, nombre: e.target.value})}
                type="text"
                className="input w-full h-12"
                placeholder="Tu nombre completo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-texto-suave)]">Correo Electrónico</label>
              <input 
                required
                value={creds.email}
                onChange={e => setCreds({...creds, email: e.target.value})}
                type="email"
                className="input w-full h-12"
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[var(--color-borde-suave)]">
            <button type="submit" disabled={savingCreds} className="btn btn-primario h-11 px-6 gap-2 shadow-lg shadow-[var(--color-primario)]/20">
              {savingCreds ? <Loader2 size={18} className="animate-spin" /> : credsSaved ? <><CheckCircle size={18} /> Guardado</> : <><Save size={18} /> Actualizar Credenciales</>}
            </button>
          </div>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="card p-0 overflow-hidden border-2 border-red-500/20">
        <div className="px-6 py-4 bg-red-500/5 border-b border-red-500/20">
          <h2 className="text-lg font-bold text-red-500">Zona de Peligro</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">Desactivar Cuenta</p>
            <p className="text-xs text-[var(--color-texto-muted)]">Tu perfil dejará de aparecer en el buscador público. Puedes reactivarla en cualquier momento.</p>
          </div>
          <button className="btn bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 text-sm h-10 px-5">
            Desactivar
          </button>
        </div>
      </div>
    </div>
  );
}
