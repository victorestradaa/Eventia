import { getDetalleProveedor } from '@/lib/actions/providerActions';
import ProviderDetailClient from './ProviderDetailClient';
import { notFound } from 'next/navigation';

export default async function ProviderDetailPage({ params }: { params: { id: string } }) {
  const res = await getDetalleProveedor(params.id);

  if (!res.success || !res.data) {
    notFound(); // Redirige a 404 si el proveedor no existe
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProviderDetailClient data={res.data} />
    </div>
  );
}
