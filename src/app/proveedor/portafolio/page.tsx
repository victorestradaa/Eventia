import { getCurrentProfile } from '@/lib/actions/authActions';
import { getPortfolioItems } from '@/lib/actions/portfolioActions';
import { prisma } from '@/lib/prisma';
import PortafolioClient from '@/components/proveedor/portafolio/PortafolioClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Mi Portafolio | Gestor Eventos',
  description: 'Muestra tu mejor trabajo a tus clientes potenciales.',
};

export default async function PortfolioPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes?.success || !profileRes.data || profileRes.data.rol !== 'PROVEEDOR') {
    redirect('/login');
  }

  const perfil = profileRes.data;

  const proveedor = await prisma.proveedor.findUnique({
    where: { usuarioId: perfil.id }
  });

  if (!proveedor) {
    redirect('/proveedor/configuracion');
  }

  const itemsRes = await getPortfolioItems(proveedor.id);
  const items = itemsRes.success ? itemsRes.data : [];

  // Serializar para Client Component
  const itemsSerializados = JSON.parse(JSON.stringify(items));
  const proveedorSerializado = JSON.parse(JSON.stringify(proveedor));

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portafolio Profesional</h1>
          <p className="text-[var(--color-texto-suave)]">
            Captura momentos especiales y gánate la confianza de tus clientes.
          </p>
        </div>
      </div>

      <PortafolioClient 
        items={itemsSerializados} 
        proveedor={proveedorSerializado} 
      />
    </div>
  );
}
