import { getCupones } from '@/lib/actions/cuponActions';
import CuponAdminClient from './CuponAdminClient';

export default async function AdminCuponesPage() {
  const res = await getCupones();
  const cupones = res.success ? res.data : [];

  return (
    <div className="container mx-auto py-8">
      <CuponAdminClient initialCupones={JSON.parse(JSON.stringify(cupones))} />
    </div>
  );
}
