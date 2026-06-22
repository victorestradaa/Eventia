import { getPlanConfigs, seedPlanConfigs, ensurePlanesActuales } from '@/lib/actions/planActions';
import PlanesAdminClient from './PlanesAdminClient';

export default async function AdminPlanesPage() {
  let res = await getPlanConfigs();
  let configs = res.data || [];

  if (configs.length === 0) {
    await seedPlanConfigs();
    res = await getPlanConfigs();
    configs = res.data || [];
  }

  // Asegura que el Plan Emprendedor exista en instalaciones previas al cambio
  // de 4 → 3 planes (Emprendedor / Destacado / Elite).
  const tieneEmprendedor = configs.some((c: any) => c.planId === 'EMPRENDEDOR');
  if (!tieneEmprendedor) {
    await ensurePlanesActuales();
    res = await getPlanConfigs();
    configs = res.data || [];
  }

  // Oculta planes legacy del proveedor que ya no son parte del modelo (PRO).
  const HIDDEN_PROVEEDOR = new Set(['PRO']);
  configs = configs.filter((c: any) => !(c.rol === 'PROVEEDOR' && HIDDEN_PROVEEDOR.has(c.planId)));

  // Orden visual: Emprendedor → Destacado → Elite (Proveedor) y Oro → Planner (Cliente).
  const ORDER_PROVEEDOR: Record<string, number> = { EMPRENDEDOR: 0, DESTACADO: 1, ELITE: 2 };
  const ORDER_CLIENTE: Record<string, number> = { ORO: 0, PLANNER: 1 };
  configs = configs.sort((a: any, b: any) => {
    if (a.rol !== b.rol) return a.rol === 'PROVEEDOR' ? -1 : 1;
    const order = a.rol === 'PROVEEDOR' ? ORDER_PROVEEDOR : ORDER_CLIENTE;
    return (order[a.planId] ?? 99) - (order[b.planId] ?? 99);
  });

  return (
    <div className="container mx-auto py-8">
      <PlanesAdminClient initialConfigs={JSON.parse(JSON.stringify(configs))} />
    </div>
  );
}
