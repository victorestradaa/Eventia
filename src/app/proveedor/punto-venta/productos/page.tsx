import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { listarProductosPV } from '@/lib/actions/puntoVentaActions';
import ProductosPVClient from './ProductosPVClient';

export const dynamic = 'force-dynamic';

export default async function ProductosPVPage() {
  const profileRes = await getCurrentProfile();
  if (!profileRes.success || !profileRes.data) redirect('/login');
  const perfil = profileRes.data;
  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) redirect('/cliente/dashboard');

  const res = await listarProductosPV(perfil.proveedor.id);
  const productos = res.success ? (res.data as any[]) : [];

  return (
    <ProductosPVClient
      proveedorId={perfil.proveedor.id}
      productosIniciales={productos}
    />
  );
}
