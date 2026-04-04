import { getCurrentProfile } from '@/lib/actions/authActions';
import { getEventosCliente } from '@/lib/actions/eventActions';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export default async function ClientDashboardPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
    if (profileRes.error?.startsWith('Error Prisma:')) {
      return (
        <div className="min-h-screen bg-black text-red-500 p-10 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-bold mb-4">Error Crítico de Base de Datos</h2>
          <p className="mb-4">Se produjo el siguiente error en AWS Lambda al intentar consultar o recuperar tu perfil:</p>
          <pre className="text-xs bg-red-950/50 p-4 rounded-xl text-left max-w-4xl overflow-auto border border-red-500/20">{profileRes.error}</pre>
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
