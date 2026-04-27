import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { autoCancelExpiredReservations } from '@/lib/actions/providerActions';
import EventoDetailClient from './EventoDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  await autoCancelExpiredReservations();

  const evento = await prisma.evento.findUnique({
    where: { id },
    include: {
      invitados: {
        orderBy: { creadoEn: 'desc' },
      },
      lineasPresupuesto: {
        include: {
          servicio: {
            include: {
              proveedor: {
                include: { usuario: true }
              },
            },
          },
          pagos: true,
        },
        orderBy: { creadoEn: 'desc' },
      },
      reservas: {
        include: {
          servicio: true,
          proveedor: {
            include: { usuario: true }
          },
          transacciones: true,
        },
        orderBy: { creadoEn: 'desc' },
      },
      invitacion: true,
    },
  });

  if (!evento) {
    return redirect('/cliente/dashboard');
  }

  return (
    <EventoDetailClient 
      evento={JSON.parse(JSON.stringify(evento))} 
    />
  );
}
