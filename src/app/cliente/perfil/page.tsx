import { getCurrentProfile } from '@/lib/actions/authActions';
import { prisma } from '@/lib/prisma';
import PerfilClient from './PerfilClient';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
    return redirect('/login');
  }

  const perfil = profileRes.data;

  // Obtener conteo real de eventos
  const conteoEventos = await prisma.evento.count({
    where: { clienteId: perfil.cliente?.id || '' }
  });

  return (
    <PerfilClient 
      perfil={JSON.parse(JSON.stringify(perfil))} 
      conteoEventos={conteoEventos}
    />
  );
}
