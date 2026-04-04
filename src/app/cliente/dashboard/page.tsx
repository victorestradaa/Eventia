import { getCurrentProfile } from '@/lib/actions/authActions';
import { getEventosCliente } from '@/lib/actions/eventActions';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export default async function ClientDashboardPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
    // Si no hay perfil, podríamos redirigir al login o al onboarding
    return redirect('/login');
  }

  const perfil = profileRes.data;
  const eventosRes = perfil.cliente 
    ? await getEventosCliente(perfil.cliente.id) 
    : { success: false, data: [] };

  return (
    <DashboardClient 
      initialEventos={eventosRes.success ? (eventosRes.data || []) : []} 
      perfil={perfil} 
    />
  );
}
