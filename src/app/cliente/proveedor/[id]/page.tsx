import { getDetalleProveedor } from '@/lib/actions/providerActions';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { getEventosCliente } from '@/lib/actions/eventActions';
import ProviderDetailClient from './ProviderDetailClient';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';


export default async function ProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Obtener datos del proveedor
  const res = await getDetalleProveedor(resolvedParams.id);
  if (!res.success || !res.data) notFound();

  // Obtener datos del cliente actual para validar su fecha de evento
  const perfilRes = await getCurrentProfile();
  let eventoActivo = null;
  let canViewContact = false;

  if (perfilRes.success && perfilRes.data?.cliente) {
    const clienteId = perfilRes.data.cliente.id;
    const eventosRes = await getEventosCliente(clienteId);
    
    if (eventosRes.success && eventosRes.data && eventosRes.data.length > 0) {
      // Intentar obtener el evento activo desde la cookie de gestión
      const cookieStore = await cookies();
      const activeEventId = cookieStore.get('activeEventId')?.value;

      if (activeEventId) {
        eventoActivo = eventosRes.data.find((e: any) => e.id === activeEventId) || eventosRes.data[0];
      } else {
        eventoActivo = eventosRes.data[0];
      }
    }

    // Verificar si tiene reserva confirmada con este proveedor
    const reservaConfirmada = await prisma.reserva.findFirst({
      where: {
        clienteId: clienteId,
        proveedorId: resolvedParams.id,
        estado: { in: ['APARTADO', 'LIQUIDADO'] }
      }
    });
    canViewContact = !!reservaConfirmada;
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <ProviderDetailClient 
        data={res.data} 
        activeEvent={eventoActivo ? JSON.parse(JSON.stringify(eventoActivo)) : null} 
        canViewContact={canViewContact}
      />
    </div>
  );
}
