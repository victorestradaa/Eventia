import { getCurrentProfile } from '@/lib/actions/authActions';
import PlanesClient from './PlanesClient';
import { redirect } from 'next/navigation';

export default async function ProviderPlanesPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
    return redirect('/login');
  }

  const perfil = profileRes.data;

  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) {
    return redirect('/cliente/dashboard');
  }

  return (
    <PlanesClient 
      planActual={perfil.proveedor.plan || 'GRATIS'} 
      proveedorId={perfil.proveedor.id} 
    />
  );
}
