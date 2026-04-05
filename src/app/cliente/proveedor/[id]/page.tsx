import { getDetalleProveedor } from '@/lib/actions/providerActions';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { getEventosCliente } from '@/lib/actions/eventActions';
import ProviderDetailClient from './ProviderDetailClient';
import { notFound } from 'next/navigation';

export default async function ProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Obtener datos del proveedor
  const res = await getDetalleProveedor(resolvedParams.id);
  if (!res.success || !res.data) notFound();

  // Obtener datos del cliente actual para validar su fecha de evento
  const perfilRes = await getCurrentProfile();
  let eventoActivo = null;

  if (perfilRes.success && perfilRes.data?.cliente) {
    const eventosRes = await getEventosCliente(perfilRes.data.cliente.id);
    if (eventosRes.success && eventosRes.data.length > 0) {
      // Tomamos el evento más reciente como activo
      eventoActivo = eventosRes.data[0];
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProviderDetailClient 
        data={res.data} 
        activeEvent={eventoActivo ? JSON.parse(JSON.stringify(eventoActivo)) : null} 
      />
    </div>
  );
}
