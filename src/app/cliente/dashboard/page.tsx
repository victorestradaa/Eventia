import { getCurrentProfile } from '@/lib/actions/authActions';
import { getEventosCliente } from '@/lib/actions/eventActions';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export default async function ClientDashboardPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
    if (profileRes.error === 'Error del servidor') {
      return (
        <div className="min-h-screen bg-black text-red-500 p-10 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold mb-4">Error 500: Falla de Base de Datos</h2>
          <p>La conexión a Supabase Prisma fue rechazada o superó el tiempo límite. AWS Lambda abortó la conexión.</p>
        </div>
      );
    }
    return redirect('/login');
  }

  const perfil = profileRes.data;
  const eventosRes = perfil.cliente 
    ? await getEventosCliente(perfil.cliente.id) 
    : { success: false, data: [] };

  return (
    <DashboardClient 
      initialEventos={eventosRes.success ? JSON.parse(JSON.stringify(eventosRes.data)) : []} 
      perfil={JSON.parse(JSON.stringify(perfil))} 
    />
  );
}
