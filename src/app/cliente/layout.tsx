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
  const eventosRes = perfil.cliente 
    ? await getEventosCliente(perfil.cliente.id) 
    : { success: false, data: [] };

  return (
    <ClientLayoutContent 
      initialEventos={eventosRes.success ? JSON.parse(JSON.stringify(eventosRes.data)) : []} 
      perfil={JSON.parse(JSON.stringify(perfil))}
    >
      {children}
    </ClientLayoutContent>
  );
}
