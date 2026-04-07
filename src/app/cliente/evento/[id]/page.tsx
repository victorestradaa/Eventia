import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import EventoDetailClient from './EventoDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;

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
              proveedor: true,
            },
          },
          pagos: true,
        },
        orderBy: { creadoEn: 'desc' },
      },
      reservas: {
        include: {
          servicio: true,
          proveedor: true,
          transacciones: true,
        },
        orderBy: { creadoEn: 'desc' },
      },
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
