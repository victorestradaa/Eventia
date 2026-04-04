import { getCurrentProfile } from '@/lib/actions/authActions';
import { getEventosCliente } from '@/lib/actions/eventActions';
import ClientLayoutContent from './ClientLayoutContent';
import { redirect } from 'next/navigation';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
    return redirect('/login');
  }

  const perfil = profileRes.data;
  const eventosRes = await getEventosCliente(perfil.cliente.id);

  return (
    <ClientLayoutContent 
      initialEventos={eventosRes.success ? eventosRes.data : []} 
      perfil={perfil}
    >
      {children}
    </ClientLayoutContent>
  );
}
