import { getCurrentProfile } from '@/lib/actions/authActions';
import { prisma } from '@/lib/prisma';
import InvitationEditorClient from './InvitationEditorClient';
import { redirect } from 'next/navigation';

// Helper para sanitizar objetos Decimal y fechas para componentes cliente
function sanitizeForClient(obj: any) {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    // Si es un objeto Decimal de Prisma o similar con toJSON
    if (value && typeof value === 'object' && value.d) return Number(value);
    return value;
  }));
}

export default async function InvitationsPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
    return redirect('/login');
  }

  const perfil = profileRes.data;
  
  // Obtener el primer evento del cliente incluyendo invitacion e invitados
  const evento = await prisma.evento.findFirst({
    where: { clienteId: perfil.cliente?.id || '' },
    orderBy: { creadoEn: 'desc' },
    include: {
      invitacion: true,
      invitados: true // Fundamental para la nueva pestaña de envío
    }
  });

  const assets = await prisma.catalogoAsset.findMany({
    where: { 
      tipo: { in: ['FONDO', 'FUENTE'] } 
    }
  });

  const fondos = assets.filter(a => a.tipo === 'FONDO');
  const fuentes = assets.filter(a => a.tipo === 'FUENTE');

  // Aplicamos sanitización profunda para evitar errores de Decimal
  return (
    <InvitationEditorClient 
      evento={sanitizeForClient(evento)} 
      fondos={sanitizeForClient(fondos)}
      fuentes={sanitizeForClient(fuentes)}
    />
  );
}
