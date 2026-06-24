import { redirect } from 'next/navigation';
import { validarVigenciaPlan } from '@/lib/utils';
import { getCurrentProfile } from '@/lib/actions/authActions';

export const dynamic = 'force-dynamic';

/**
 * El home del POS es la pantalla de Nueva Venta — ahí el proveedor
 * pasa el 90% del tiempo. Otras secciones (productos, pedidos, clientes,
 * caja, reportes) viven en sub-rutas accesibles desde el nav del top bar.
 */
export default async function PuntoVentaHomePage() {
  const profileRes = await getCurrentProfile();
  if (!profileRes.success || !profileRes.data) redirect('/login');
  const perfil = profileRes.data;

  if (perfil.proveedor && !validarVigenciaPlan(perfil.proveedor.planExpira)) {
    redirect('/proveedor/planes');
  }
  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) redirect('/cliente/dashboard');

  redirect('/proveedor/punto-venta/nueva');
}
