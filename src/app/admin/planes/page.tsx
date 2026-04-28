import { getPlanConfigs, seedPlanConfigs } from '@/lib/actions/planActions';
import PlanesAdminClient from './PlanesAdminClient';

export default async function AdminPlanesPage() {
  const res = await getPlanConfigs();
  
  let configs = res.data || [];
  
  if (configs.length === 0) {
    await seedPlanConfigs();
    const secondRes = await getPlanConfigs();
    configs = secondRes.data || [];
  }

  return (
    <div className="container mx-auto py-8">
      <PlanesAdminClient initialConfigs={JSON.parse(JSON.stringify(configs))} />
    </div>
  );
}
