import { getCurrentProfile } from '@/lib/actions/authActions';
import ClientPlanesClient from './ClientPlanesClient';
import { redirect } from 'next/navigation';

export default async function ClientPlanesPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
    return redirect('/login');
  }

  const perfil = profileRes.data;

  // Si es proveedor, lo mandamos a sus propios planes
  if (perfil.rol === 'PROVEEDOR') {
    return redirect('/proveedor/planes');
  }

  return (
    <ClientPlanesClient planActual={perfil.cliente.plan || 'FREE'} />
  );
}
