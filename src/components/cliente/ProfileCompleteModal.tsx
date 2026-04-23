'use client';

import React, { useState } from 'react';
import { 
  User, MapPin, Phone, X, AlertCircle, 
  CheckCircle2, Loader2, ArrowRight, ChevronRight
} from 'lucide-react';
import { updateClientProfile } from '@/lib/actions/settingsActions';
import { MEXICO_LOCATIONS } from '@/lib/constants/locations';
import { useRouter } from 'next/navigation';

interface MissingField {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

interface ProfileCompleteModalProps {
  onClose: () => void;
  perfil: any; // Datos actuales del perfil para saber qué falta y prellenar
}

export default function ProfileCompleteModal({ onClose, perfil }: ProfileCompleteModalProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Estado del formulario prellenado con lo que ya existe
  const [form, setForm] = useState({
    nombre: perfil?.nombre || '',
    telefono: perfil?.telefono || '',
    estado: perfil?.cliente?.estado || '',
    ciudad: perfil?.cliente?.ciudad || '',
  });

  // Detectar qué campos faltan
  const allFields: MissingField[] = [
    { key: 'nombre',   label: 'Nombre Completo', icon: User,   color: 'text-[#d4af37]', bg: 'bg-[#d4af37]/10' },
    { key: 'telefono', label: 'Teléfono',        icon: Phone,  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { key: 'estado',   label: 'Estado',          icon: MapPin, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { key: 'ciudad',   label: 'Ciudad',          icon: MapPin, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const isMissing = (key: string) => {
    if (key === 'nombre')   return !perfil?.nombre?.trim();
    if (key === 'telefono') return !perfil?.telefono?.trim();
    if (key === 'estado')   return !perfil?.cliente?.estado?.trim();
    if (key === 'ciudad')   return !perfil?.cliente?.ciudad?.trim();
    return false;
  };

  const missingFields = allFields.filter(f => isMissing(f.key));
  const completedFields = allFields.filter(f => !isMissing(f.key));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    if (!form.telefono.trim()) { setError('El teléfono es obligatorio.'); return; }
    if (!form.estado.trim()) { setError('Selecciona un estado.'); return; }
    if (!form.ciudad.trim()) { setError('Selecciona una ciudad.'); return; }

    setSaving(true);
    const res = await updateClientProfile(perfil.id, {
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      estado: form.estado,
      ciudad: form.ciudad,
      avatarUrl: perfil?.avatarUrl || undefined,
    });
    setSaving(false);

    if (res.success) {
      setSaved(true);
      router.refresh();
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setError(res.error || 'Ocurrió un error al guardar. Intenta de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#111] border border-[#d4af37]/30 max-w-lg w-full rounded-[2.5rem] shadow-[0_0_80px_rgba(212,175,55,0.12)] relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-[#d4af37]/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-amber-500/5 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 p-8 sm:p-10">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-[var(--color-texto-muted)] transition-colors"
          >
            <X size={22} />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
              <AlertCircle size={44} className="text-amber-400 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white mb-2">
              ¡Perfil Incompleto!
            </h2>
            <p className="text-[var(--color-texto-suave)] text-sm font-medium max-w-xs leading-relaxed">
              Completa los campos faltantes para poder crear tu evento. ¡Solo toma un minuto!
            </p>
          </div>

          {/* Missing fields status */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {allFields.map((field) => {
              const missing = isMissing(field.key);
              const Icon = field.icon;
              return (
                <div
                  key={field.key}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${
                    missing
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-emerald-500/5 border-emerald-500/20'
                  }`}
                >
                  {missing ? (
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                  ) : (
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  )}
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                    missing ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {field.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Inline form for missing fields */}
          {saved ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-emerald-400" />
              </div>
              <p className="text-white font-bold text-lg">¡Perfil completado!</p>
              <p className="text-[var(--color-texto-suave)] text-sm">Ahora ya puedes crear tu evento.</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#d4af37] ml-1">
                  <User size={11} /> Nombre Completo *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Tu nombre completo"
                  className={`w-full bg-white/5 border rounded-2xl px-4 py-3 text-white text-sm outline-none transition-all placeholder:text-white/20 ${
                    !form.nombre.trim() ? 'border-red-500/50 focus:border-red-400' : 'border-white/10 focus:border-[#d4af37]'
                  }`}
                  required
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 ml-1">
                  <Phone size={11} /> Teléfono / Celular *
                </label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="Ej: 6621234567"
                  className={`w-full bg-white/5 border rounded-2xl px-4 py-3 text-white text-sm outline-none transition-all placeholder:text-white/20 ${
                    !form.telefono.trim() ? 'border-red-500/50 focus:border-red-400' : 'border-white/10 focus:border-[#d4af37]'
                  }`}
                  required
                />
              </div>

              {/* Estado y Ciudad */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-400 ml-1">
                    <MapPin size={11} /> Estado *
                  </label>
                  <select
                    value={form.estado}
                    onChange={(e) => {
                      const nuevoEstado = e.target.value;
                      setForm({
                        ...form,
                        estado: nuevoEstado,
                        ciudad: MEXICO_LOCATIONS[nuevoEstado]?.[0] || '',
                      });
                    }}
                    className={`w-full bg-white/5 border rounded-2xl px-3 py-3 text-white text-sm outline-none transition-all appearance-none ${
                      !form.estado ? 'border-red-500/50 focus:border-red-400' : 'border-white/10 focus:border-[#d4af37]'
                    }`}
                    required
                  >
                    <option value="" disabled className="bg-[#111]">Estado</option>
                    {Object.keys(MEXICO_LOCATIONS).sort().map((estado) => (
                      <option key={estado} value={estado} className="bg-[#111]">{estado}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-purple-400 ml-1">
                    <MapPin size={11} /> Ciudad *
                  </label>
                  <select
                    value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                    disabled={!form.estado}
                    className={`w-full bg-white/5 border rounded-2xl px-3 py-3 text-white text-sm outline-none transition-all appearance-none disabled:opacity-40 ${
                      !form.ciudad ? 'border-red-500/50 focus:border-red-400' : 'border-white/10 focus:border-[#d4af37]'
                    }`}
                    required
                  >
                    <option value="" disabled className="bg-[#111]">Ciudad</option>
                    {form.estado && MEXICO_LOCATIONS[form.estado]?.map((ciudad) => (
                      <option key={ciudad} value={ciudad} className="bg-[#111]">{ciudad}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/30">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-xs font-bold">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-muted)] hover:text-white transition-colors"
                  disabled={saving}
                >
                  Más tarde
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#b89547] text-black py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider shadow-xl shadow-[#d4af37]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <><Loader2 size={16} className="animate-spin" /> Guardando...</>
                  ) : (
                    <>Guardar y Continuar <ArrowRight size={16} strokeWidth={3} /></>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
