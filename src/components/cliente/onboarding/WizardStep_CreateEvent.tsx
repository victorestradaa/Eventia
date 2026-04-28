'use client';

import { useState } from 'react';
import { Loader2, MapPin, CheckCircle2, ChevronDown } from 'lucide-react';
import { createEvento } from '@/lib/actions/eventActions';
import { MEXICO_LOCATIONS } from '@/lib/constants/locations';
import { cn } from '@/lib/utils';

const EVENT_TYPES = ['Boda', 'XV Años', 'Fiesta Infantil', 'Graduación', 'Fiesta', 'Bautizo'];

interface Props {
  perfil: any;
  onCreated: (eventoId: string, ciudadEvento: string, nombre: string, fecha: string) => void;
}

export default function WizardStep_CreateEvent({ perfil, onCreated }: Props) {
  const ciudadPerfil = perfil?.cliente?.ciudad || '';
  const estadoPerfil = perfil?.cliente?.estado || '';

  const [form, setForm] = useState({
    nombre: '',
    tipo: 'Boda',
    fecha: '',
    invitados: '',
    presupuesto: '',
  });

  // Ciudad del evento
  const [usaCiudadPerfil, setUsaCiudadPerfil] = useState(true);
  const [estadoEvento, setEstadoEvento] = useState('');
  const [ciudadEvento, setCiudadEvento] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ciudadFinal = usaCiudadPerfil ? ciudadPerfil : ciudadEvento;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.fecha || !form.invitados) return;
    if (!usaCiudadPerfil && (!estadoEvento || !ciudadEvento)) {
      setError('Por favor selecciona el estado y ciudad donde será el evento.');
      return;
    }

    setLoading(true);
    setError('');
    const res = await createEvento({
      clienteId: perfil.cliente?.id || '',
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      fecha: form.fecha,
      presupuesto: parseFloat(form.presupuesto) || 0,
      invitados: parseInt(form.invitados) || 0,
    });

    if (res.success && res.data) {
      onCreated(res.data.id, ciudadFinal, form.nombre.trim(), form.fecha);
    } else {
      setError(res.error || 'Ocurrió un error al crear el evento.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-2">🎉</div>
        <h2 className="text-2xl font-bold text-[var(--color-texto)]">
          Cuéntanos sobre tu evento
        </h2>
        <p className="text-[var(--color-texto-suave)] text-sm">
          Solo tardará un momento. Empieza aquí.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest">
            Nombre del Evento *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej: Boda de Laura y David"
            disabled={loading}
            className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#d4af37] transition-all text-[var(--color-texto)]"
          />
        </div>

        {/* Tipo */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest">
            Tipo de Evento *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {EVENT_TYPES.map(tipo => (
              <button
                key={tipo}
                type="button"
                onClick={() => setForm({ ...form, tipo })}
                disabled={loading}
                className={cn(
                  'py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all',
                  form.tipo === tipo
                    ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                    : 'border-[var(--color-borde-suave)] text-[var(--color-texto-suave)] hover:border-[#d4af37]/40'
                )}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha — OBLIGATORIA */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest flex items-center gap-1">
            Fecha del Evento *
            <span className="text-[#d4af37] text-[9px] font-bold">(Requerida)</span>
          </label>
          <input
            type="date"
            required
            value={form.fecha}
            onChange={e => setForm({ ...form, fecha: e.target.value })}
            disabled={loading}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#d4af37] transition-all text-[var(--color-texto)]"
          />
        </div>

        {/* No. Invitados */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-widest">
            Número de Invitados *
          </label>
          <input
            type="number"
            required
            min="1"
            value={form.invitados}
            onChange={e => setForm({ ...form, invitados: e.target.value })}
            placeholder="Ej: 150"
            disabled={loading}
            className="w-full bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#d4af37] transition-all text-[var(--color-texto)]"
          />
        </div>

        {/* ─── Ciudad del evento ─── */}
        <div className="space-y-3 p-4 rounded-2xl bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)]">
          <div className="flex items-center gap-2 text-[var(--color-texto-suave)]">
            <MapPin size={16} className="text-[#d4af37]" />
            <span className="text-xs font-bold">¿Dónde será tu evento?</span>
          </div>

          {/* Botón: ciudad del perfil */}
          {ciudadPerfil && (
            <button
              type="button"
              onClick={() => setUsaCiudadPerfil(true)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left',
                usaCiudadPerfil
                  ? 'bg-[#d4af37]/15 border-[#d4af37] text-[var(--color-texto)]'
                  : 'border-[var(--color-borde-suave)] hover:border-[#d4af37]/40 text-[var(--color-texto-suave)]'
              )}
            >
              <div>
                <p className="text-xs font-black">En {ciudadPerfil}, {estadoPerfil}</p>
                <p className="text-[10px] opacity-60">Ciudad registrada en tu perfil</p>
              </div>
              {usaCiudadPerfil && <CheckCircle2 size={18} className="text-[#d4af37] flex-shrink-0" />}
            </button>
          )}

          {/* Botón: otra ciudad */}
          <button
            type="button"
            onClick={() => setUsaCiudadPerfil(false)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left',
              !usaCiudadPerfil
                ? 'bg-[#d4af37]/15 border-[#d4af37] text-[var(--color-texto)]'
                : 'border-[var(--color-borde-suave)] hover:border-[#d4af37]/40 text-[var(--color-texto-suave)]'
            )}
          >
            <div>
              <p className="text-xs font-black">Elegir otra ciudad</p>
              <p className="text-[10px] opacity-60">El evento es en un lugar diferente</p>
            </div>
            {!usaCiudadPerfil && <CheckCircle2 size={18} className="text-[#d4af37] flex-shrink-0" />}
          </button>

          {/* Selectores estado/ciudad si eligió otra */}
          {!usaCiudadPerfil && (
            <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-wider">Estado</label>
                <div className="relative">
                  <select
                    required={!usaCiudadPerfil}
                    value={estadoEvento}
                    onInput={e => { 
                      setEstadoEvento((e.target as HTMLSelectElement).value); 
                      setCiudadEvento(''); 
                    }}
                    disabled={loading}
                    className="w-full appearance-none bg-[var(--color-fondo)] border border-[var(--color-borde-suave)] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#d4af37] text-[var(--color-texto)] cursor-pointer"
                  >
                    <option value="">Selecciona estado...</option>
                    {Object.keys(MEXICO_LOCATIONS).map(est => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)] pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)] tracking-wider">Ciudad</label>
                <div className="relative">
                  <select
                    required={!usaCiudadPerfil}
                    value={ciudadEvento}
                    onInput={e => setCiudadEvento((e.target as HTMLSelectElement).value)}
                    disabled={loading || !estadoEvento}
                    className="w-full appearance-none bg-[var(--color-fondo)] border border-[var(--color-borde-suave)] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#d4af37] text-[var(--color-texto)] cursor-pointer"
                  >
                    <option value="">Selecciona ciudad...</option>
                    {estadoEvento && MEXICO_LOCATIONS[estadoEvento]?.map(mun => (
                      <option key={mun} value={mun}>{mun}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)] pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black uppercase text-sm tracking-widest text-black bg-gradient-to-b from-[#eadeba] to-[#c79a3b] shadow-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="animate-spin" size={18} /> Creando evento...</> : '¡Vamos! Crear mi evento →'}
        </button>
      </form>
    </div>
  );
}
