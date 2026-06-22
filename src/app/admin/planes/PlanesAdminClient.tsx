'use client';

import { useState } from 'react';
import { updatePlanConfig } from '@/lib/actions/planActions';
import { Save, Sparkles, Calendar, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanConfig {
  id?: string;
  planId: string;
  nombre: string;
  precioNormal: number;
  precioPromo?: number | null;
  promoDesde?: any;
  promoHasta?: any;
  comision?: number | null;
  rol: string;
}

interface PlanesAdminClientProps {
  initialConfigs: PlanConfig[];
}

export default function PlanesAdminClient({ initialConfigs }: PlanesAdminClientProps) {
  const [configs, setConfigs] = useState(initialConfigs);
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpdate = async (planId: string) => {
    const config = configs.find(c => c.planId === planId);
    if (!config) return;

    setLoading(planId);
    const res = await updatePlanConfig({
      ...config,
      precioPromo: config.precioPromo || undefined,
      promoDesde: config.promoDesde ? new Date(config.promoDesde) : null,
      promoHasta: config.promoHasta ? new Date(config.promoHasta) : null,
      // Modelo sin comisiones: siempre 0% en cualquier plan.
      comision: 0,
      rol: config.rol as 'CLIENTE' | 'PROVEEDOR'
    });

    if (res.success) {
      alert(`Plan ${config.nombre} actualizado correctamente.`);
    } else {
      alert(`Error: ${res.error}`);
    }
    setLoading(null);
  };

  const handleChange = (planId: string, field: keyof PlanConfig, value: any) => {
    setConfigs(prev => prev.map(c => 
      c.planId === planId ? { ...c, [field]: value } : c
    ));
  };

  const renderSection = (rol: string, title: string) => {
    const filtered = configs.filter(c => c.rol === rol);
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="w-2 h-8 bg-[var(--color-primario)] rounded-full" />
          {title}
        </h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filtered.map(config => (
            <div key={config.planId} className="card p-6 border-white/5 bg-white/[0.02]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-lg font-black">{config.nombre}</h4>
                  <p className="text-xs text-[var(--color-texto-muted)] uppercase tracking-widest">{config.planId}</p>
                </div>
                <button
                  onClick={() => handleUpdate(config.planId)}
                  disabled={loading === config.planId}
                  className="btn btn-primario py-2 px-4 flex items-center gap-2 text-xs"
                >
                  {loading === config.planId ? 'Guardando...' : <><Save size={14} /> Guardar</>}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Precio Normal</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
                    <input 
                      type="number"
                      value={config.precioNormal}
                      onChange={(e) => handleChange(config.planId, 'precioNormal', parseFloat(e.target.value))}
                      className="input w-full pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Precio Promo</label>
                  <div className="relative">
                    <Sparkles size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input 
                      type="number"
                      value={config.precioPromo || ''}
                      onChange={(e) => handleChange(config.planId, 'precioPromo', e.target.value ? parseFloat(e.target.value) : null)}
                      className="input w-full pl-10 border-emerald-500/20 focus:border-emerald-500"
                      placeholder="Sin promo"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Desde (Promo)</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
                    <input 
                      type="date"
                      value={config.promoDesde ? new Date(config.promoDesde).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleChange(config.planId, 'promoDesde', e.target.value)}
                      className="input w-full pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[var(--color-texto-muted)]">Hasta (Promo)</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" />
                    <input 
                      type="date"
                      value={config.promoHasta ? new Date(config.promoHasta).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleChange(config.planId, 'promoHasta', e.target.value)}
                      className="input w-full pl-10"
                    />
                  </div>
                </div>
              </div>

              {config.precioPromo && config.precioPromo < config.precioNormal && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-center">
                    Promoción Activa: Ahorro de ${(config.precioNormal - config.precioPromo).toFixed(2)} por mes
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Gestión de Planes</h2>
          <p className="text-[var(--color-texto-suave)]">Configura precios, promociones y comisiones globales.</p>
        </div>
      </div>

      {renderSection('PROVEEDOR', 'Planes de Proveedores')}
      {renderSection('CLIENTE', 'Planes de Clientes')}

      <div className="card p-6 border-amber-500/20 bg-amber-500/5">
        <h4 className="text-sm font-bold text-amber-500 flex items-center gap-2 mb-2">
          <Sparkles size={16} /> Nota sobre Facturación Anual
        </h4>
        <p className="text-xs text-[var(--color-texto-suave)] leading-relaxed">
          El sistema aplica automáticamente la regla de <strong>10 meses de cobro por 12 meses de servicio</strong> para pagos anuales. 
          Los precios anuales se calculan multiplicando el "Precio Promo" (o el Normal si no hay promo) por 10.
        </p>
      </div>
    </div>
  );
}
