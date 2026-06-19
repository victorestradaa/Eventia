import { notFound } from 'next/navigation';
import { getPedidoPublicoPV } from '@/lib/actions/puntoVentaActions';
import PedidoPublicoView from './PedidoPublicoView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const res = await getPedidoPublicoPV(token);
  if (!res.success) {
    return { title: 'Pedido no encontrado' };
  }
  const p: any = res.data;
  return {
    title: `Pedido #${p.folio} · ${p.proveedor.nombre}`,
    description: `Seguimiento de tu pedido en ${p.proveedor.nombre}`,
  };
}

export default async function PedidoPublicoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const res = await getPedidoPublicoPV(token);
  if (!res.success || !res.data) notFound();

  return <PedidoPublicoView pedido={res.data} token={token} />;
}
