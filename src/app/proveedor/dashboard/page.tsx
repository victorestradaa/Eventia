import { getCurrentProfile } from '@/lib/actions/authActions';
import { getResumenProveedor } from '@/lib/actions/providerActions';
import DashboardProviderClient from './DashboardProviderClient';
import { redirect } from 'next/navigation';

export default async function ProviderDashboardPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
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
      resumen={resumenSerializado} 
      perfil={perfil} 
    />
  );
}
