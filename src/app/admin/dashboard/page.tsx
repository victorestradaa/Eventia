import { getPlatformStats } from '@/lib/actions/adminActions';
import DashboardAdminClient from './DashboardAdminClient';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/authActions';

export default async function AdminDashboardPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data || profileRes.data.rol !== 'ADMIN') {
    return redirect('/login');
  }

  const statsRes = await getPlatformStats();

  return (
    <DashboardAdminClient 
      stats={statsRes.success ? statsRes.data : { totalUsuarios: 0, totalEventos: 0, totalProveedores: 0, totalIngresos: 0 }} 
    />
  );
}
