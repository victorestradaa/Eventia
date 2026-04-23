import { getPlatformStats, getAdminReportes } from '@/lib/actions/adminActions';
import { 
  getUserTrends, 
  getEventTrends, 
  getServiceCategoryStats, 
  getServiceEventTypeStats 
} from '@/lib/actions/analyticsActions';
import DashboardAdminClient from './DashboardAdminClient';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/authActions';

export default async function AdminDashboardPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data || profileRes.data.rol !== 'ADMIN') {
    return redirect('/login');
  }

  // Ejecutar en paralelo todas las consultas para optimizar carga
  const [statsRes, userTrends, eventTrends, catStats, typeStats, reportsRes] = await Promise.all([
    getPlatformStats(),
    getUserTrends(),
    getEventTrends(),
    getServiceCategoryStats(),
    getServiceEventTypeStats(),
    getAdminReportes()
  ]);

  const analyticsData = {
    userTrends: userTrends.success ? userTrends.data : [],
    eventTrends: eventTrends.success ? eventTrends.data : [],
    catStats: catStats.success ? catStats.data : [],
    typeStats: typeStats.success ? typeStats.data : [],
    reports: reportsRes.success ? reportsRes.data : null
  };

  return (
    <DashboardAdminClient 
      stats={statsRes.success ? statsRes.data : { totalUsuarios: 0, totalEventos: 0, totalProveedores: 0, totalIngresos: 0 }}
      analytics={analyticsData}
    />
  );
}
