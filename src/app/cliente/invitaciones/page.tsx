import { getCurrentProfile } from '@/lib/actions/authActions';
import { prisma } from '@/lib/prisma';
import InvitationEditorClient from './InvitationEditorClient';
import { redirect } from 'next/navigation';

export default async function InvitationsPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
    return redirect('/login');
  }

  const perfil = profileRes.data;
  
  // Obtener el primer evento del cliente para pre-poblar el editor
  const evento = await prisma.evento.findFirst({
    where: { clienteId: perfil.cliente?.id || '' },
    orderBy: { creadoEn: 'desc' },
    include: {
      invitacion: true
    }
  });

  return (
    <InvitationEditorClient 
      evento={JSON.parse(JSON.stringify(evento))} 
    />
  );
}
