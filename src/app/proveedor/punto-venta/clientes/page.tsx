import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { listarClientesPV } from '@/lib/actions/puntoVentaActions';
import ClientesPVClient from './ClientesPVClient';

export const dynamic = 'force-dynamic';

export default async function ClientesPVPage() {
  const profileRes = await getCurrentProfile();
  if (!profileRes.success || !profileRes.data) redirect('/login');
  const perfil = profileRes.data;
  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) redirect('/cliente/dashboard');

  const res = await listarClientesPV(perfil.proveedor.id);
  const clientes = res.success ? (res.data as any[]) : [];

  return (
    <ClientesPVClient
      proveedorId={perfil.proveedor.id}
      clientesIniciales={clientes}
    />
  );
}
