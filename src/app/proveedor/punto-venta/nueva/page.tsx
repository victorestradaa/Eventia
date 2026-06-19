import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { listarProductosPV, listarClientesPV } from '@/lib/actions/puntoVentaActions';
import NuevaVentaPVClient from './NuevaVentaPVClient';

export const dynamic = 'force-dynamic';

export default async function NuevaVentaPVPage() {
  const profileRes = await getCurrentProfile();
  if (!profileRes.success || !profileRes.data) redirect('/login');
  const perfil = profileRes.data;
  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) redirect('/cliente/dashboard');

  const [productosRes, clientesRes] = await Promise.all([
    listarProductosPV(perfil.proveedor.id),
    listarClientesPV(perfil.proveedor.id),
  ]);

  const productos = (productosRes.success ? (productosRes.data as any[]) : []).filter((p) => p.activo);
  const clientes = clientesRes.success ? (clientesRes.data as any[]) : [];

  return (
    <NuevaVentaPVClient
      proveedorId={perfil.proveedor.id}
      productos={productos}
      clientes={clientes}
    />
  );
}
