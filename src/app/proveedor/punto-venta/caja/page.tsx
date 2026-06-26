import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/authActions';
import {
  getSesionActivaPV,
  listarSesionesCajaPV,
  listarCuentasPorPagarPV,
} from '@/lib/actions/puntoVentaActions';
import CajaPVClient from './CajaPVClient';

export const dynamic = 'force-dynamic';

export default async function CajaPVPage() {
  const profileRes = await getCurrentProfile();
  if (!profileRes.success || !profileRes.data) redirect('/login');
  const perfil = profileRes.data;
  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) redirect('/cliente/dashboard');

  const [activaRes, historicoRes, cuentasRes] = await Promise.all([
    getSesionActivaPV(perfil.proveedor.id),
    listarSesionesCajaPV(perfil.proveedor.id, 10),
    listarCuentasPorPagarPV(perfil.proveedor.id),
  ]);

  return (
    <CajaPVClient
      proveedorId={perfil.proveedor.id}
      sesionActivaInicial={activaRes.success ? (activaRes.data as any) : null}
      historicoInicial={historicoRes.success ? (historicoRes.data as any[]) : []}
      cuentasPorPagarInicial={cuentasRes.success ? (cuentasRes.data as any[]) : []}
    />
  );
}
