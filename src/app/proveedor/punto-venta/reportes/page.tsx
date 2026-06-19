import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { getReportePV } from '@/lib/actions/puntoVentaActions';
import ReportesPVClient from './ReportesPVClient';

export const dynamic = 'force-dynamic';

export default async function ReportesPVPage() {
  const profileRes = await getCurrentProfile();
  if (!profileRes.success || !profileRes.data) redirect('/login');
  const perfil = profileRes.data;
  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) redirect('/cliente/dashboard');

  // Default: últimos 7 días
  const fin = new Date();
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 6);
  inicio.setHours(0, 0, 0, 0);

  const res = await getReportePV(
    perfil.proveedor.id,
    inicio.toISOString().slice(0, 10),
    fin.toISOString().slice(0, 10)
  );

  return (
    <ReportesPVClient
      proveedorId={perfil.proveedor.id}
      reporteInicial={res.success ? (res.data as any) : null}
    />
  );
}
