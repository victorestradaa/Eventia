import { getCurrentProfile } from '@/lib/actions/authActions';
import { getResumenProveedor } from '@/lib/actions/providerActions';
import DashboardProviderClient from './DashboardProviderClient';
import { redirect } from 'next/navigation';

export default async function ProviderDashboardPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
    if (profileRes.error === 'Error del servidor') {
      return (
        <div className="min-h-screen bg-black text-red-500 p-10 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold mb-4">Error 500: Falla de Base de Datos</h2>
          <p>La conexión a Supabase Prisma fue rechazada o superó las conexiones PgBouncer en AWS Lambda.</p>
        </div>
      );
    }
    return redirect('/login');
  }

  const perfil = profileRes.data;
  
  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) {
    return redirect('/cliente/dashboard');
  }

  const resumenRes = await getResumenProveedor(perfil.proveedor.id);
  const resumenSerializado = resumenRes.success 
    ? JSON.parse(JSON.stringify(resumenRes.data)) 
    : { reservas: [], servicios: [], ingresosTotales: 0, totalReservas: 0 };

  return (
    <DashboardProviderClient 
      resumen={JSON.parse(JSON.stringify(resumenSerializado))} 
      perfil={JSON.parse(JSON.stringify(perfil))} 
    />
  );
}
