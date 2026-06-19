import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { listarPedidosPV } from '@/lib/actions/puntoVentaActions';
import PedidosPVClient from './PedidosPVClient';

export const dynamic = 'force-dynamic';

export default async function PedidosPVPage() {
  const profileRes = await getCurrentProfile();
  if (!profileRes.success || !profileRes.data) redirect('/login');
  const perfil = profileRes.data;
  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) redirect('/cliente/dashboard');

  const res = await listarPedidosPV(perfil.proveedor.id, { estado: 'TODOS' });
  const pedidos = res.success ? (res.data as any[]) : [];

  return (
    <PedidosPVClient
      proveedorId={perfil.proveedor.id}
      pedidosIniciales={pedidos}
    />
  );
}
