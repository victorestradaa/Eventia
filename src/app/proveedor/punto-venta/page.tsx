import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { getSesionActivaPV } from '@/lib/actions/puntoVentaActions';
import MenuPV from './_components/MenuPV';

export const dynamic = 'force-dynamic';

export default async function PuntoVentaHomePage() {
  const profileRes = await getCurrentProfile();
  if (!profileRes.success || !profileRes.data) redirect('/login');
  const perfil = profileRes.data;
  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) redirect('/cliente/dashboard');

  const res = await getSesionActivaPV(perfil.proveedor.id);
  const sesionActiva = res.success ? (res.data as any) : null;

  return (
    <MenuPV
      proveedorId={perfil.proveedor.id}
      sesionActiva={sesionActiva}
    />
  );
}
