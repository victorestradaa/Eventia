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
    <div className="max-w-lg mx-auto">
      {/* Hero */}
      <div className="text-center space-y-2 mb-8">
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="text-[26px] font-bold tracking-tight text-[var(--color-texto)] leading-tight">
          Cuéntanos sobre tu evento
        </h1>
        <p className="text-[14px] text-[var(--color-texto-suave)] max-w-xs mx-auto">
          Tus datos básicos para empezar a organizar tu gran día.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[var(--color-texto)] ml-1">
            Nombre del evento
          </label>
          <input
            type="text"
            required
            autoFocus
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            placeholder="Boda de Laura y David"
            disabled={loading}
            className="w-full bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl px-4 py-4 text-[15px] outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all text-[var(--color-texto)] shadow-sm"
          />
        </div>

        {/* Tipo — chips horizontales */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[var(--color-texto)] ml-1">
            ¿Qué tipo de evento es?
          </label>
          <div className="-mx-1 px-1 overflow-x-auto no-scrollbar pb-1">
            <div className="inline-flex gap-2 min-w-max">
              {EVENT_TYPES.map(tipo => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setForm({ ...form, tipo })}
                  disabled={loading}
                  className={cn(
                    'px-4 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all border active:scale-95',
                    form.tipo === tipo
                      ? 'bg-[var(--color-primario)] text-white border-[var(--color-primario)] shadow-md'
                      : 'bg-[var(--color-fondo-card)] text-[var(--color-texto)] border-[var(--color-borde)] shadow-sm'
                  )}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fecha + Invitados — grid 2 col */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-[var(--color-texto)] ml-1">
              Fecha
            </label>
            <input
              type="date"
              required
              value={form.fecha}
              onChange={e => setForm({ ...form, fecha: e.target.value })}
              disabled={loading}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl px-4 py-4 text-[14px] outline-none focus:border-[#d4af37] transition-all text-[var(--color-texto)] shadow-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-[var(--color-texto)] ml-1">
              Invitados
            </label>
            <input
              type="number"
              required
              min="1"
              value={form.invitados}
              onChange={e => setForm({ ...form, invitados: e.target.value })}
              placeholder="150"
              disabled={loading}
              className="w-full bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl px-4 py-4 text-[14px] outline-none focus:border-[#d4af37] transition-all text-[var(--color-texto)] shadow-sm"
            />
          </div>
        </div>

        {/* ─── ¿Dónde será tu evento? ─── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 ml-1">
            <MapPin size={14} className="text-[#d4af37]" />
            <span className="text-[12px] font-semibold text-[var(--color-texto)]">¿Dónde será?</span>
          </div>

          <div className="space-y-2">
            {ciudadPerfil && (
              <button
                type="button"
                onClick={() => setUsaCiudadPerfil(true)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all text-left active:scale-[0.99]',
                  usaCiudadPerfil
                    ? 'bg-[#d4af37]/10 border-[#d4af37] text-[var(--color-texto)] shadow-sm'
                    : 'border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] text-[var(--color-texto)]'
                )}
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold">En {ciudadPerfil}</p>
                  <p className="text-[11px] text-[var(--color-texto-suave)]">{estadoPerfil} · Tu ciudad de perfil</p>
                </div>
                {usaCiudadPerfil && <CheckCircle2 size={20} className="text-[#d4af37] flex-shrink-0" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => setUsaCiudadPerfil(false)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all text-left active:scale-[0.99]',
                !usaCiudadPerfil
                  ? 'bg-[#d4af37]/10 border-[#d4af37] text-[var(--color-texto)] shadow-sm'
                  : 'border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] text-[var(--color-texto)]'
              )}
            >
              <div className="min-w-0">
                <p className="text-[14px] font-semibold">Otra ciudad</p>
                <p className="text-[11px] text-[var(--color-texto-suave)]">El evento es en un lugar distinto</p>
              </div>
              {!usaCiudadPerfil && <CheckCircle2 size={20} className="text-[#d4af37] flex-shrink-0" />}
            </button>
          </div>

          {!usaCiudadPerfil && (
            <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in slide-in-from-top-1 duration-300">
              <div className="relative">
                <select
                  required={!usaCiudadPerfil}
                  value={estadoEvento}
                  onChange={e => {
                    setEstadoEvento(e.target.value);
                    setCiudadEvento('');
                  }}
                  disabled={loading}
                  className="w-full appearance-none bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl pl-4 pr-9 py-3.5 text-[14px] outline-none focus:border-[#d4af37] text-[var(--color-texto)] cursor-pointer shadow-sm"
                >
                  <option value="">Estado…</option>
                  {Object.keys(MEXICO_LOCATIONS).map(est => (
                    <option key={est} value={est}>{est}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)] pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  required={!usaCiudadPerfil}
                  value={ciudadEvento}
                  onChange={e => setCiudadEvento(e.target.value)}
                  disabled={loading || !estadoEvento}
                  className="w-full appearance-none bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-2xl pl-4 pr-9 py-3.5 text-[14px] outline-none focus:border-[#d4af37] text-[var(--color-texto)] cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <option value="">Ciudad…</option>
                  {estadoEvento && MEXICO_LOCATIONS[estadoEvento]?.map(mun => (
                    <option key={mun} value={mun}>{mun}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)] pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-medium">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold uppercase text-[14px] tracking-wider text-black bg-gradient-to-b from-[#eadeba] to-[#c79a3b] shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? <><Loader2 className="animate-spin" size={18} /> Creando…</> : <>Continuar →</>}
        </button>
      </form>
    </div>
  );
}
