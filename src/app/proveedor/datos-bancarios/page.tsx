import { getCurrentProfile } from '@/lib/actions/authActions';
import { getCuentasBancarias } from '@/lib/actions/bancosActions';
import { redirect } from 'next/navigation';
import DatosBancariosClient from './DatosBancariosClient';

export const metadata = {
  title: 'Datos Bancarios | Gestor Eventos',
  description: 'Administra tus cuentas bancarias para recibir pagos.',
};

export default async function BancosPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes?.success || !profileRes.data || profileRes.data.rol !== 'PROVEEDOR') {
    redirect('/login');
  }

  const proveedor = profileRes.data.proveedor;
  if (!proveedor) {
    redirect('/proveedor/configuracion');
  }

  const cuentasRes = await getCuentasBancarias(proveedor.id);
  const cuentasSerializadas = cuentasRes.success ? JSON.parse(JSON.stringify(cuentasRes.data)) : [];

  return <DatosBancariosClient cuentasIniciales={cuentasSerializadas} />;
}
