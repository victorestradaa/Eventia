import { getCurrentProfile } from '@/lib/actions/authActions';
import { prisma } from '@/lib/prisma';
import CatalogoClient from '@/components/proveedor/CatalogoClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Catálogo de Servicios | Gestor Eventos',
  description: 'Administra los servicios, paquetes y productos que ofreces.',
};

export default async function CatalogPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes?.success || !profileRes.data || profileRes.data.rol !== 'PROVEEDOR') {
    redirect('/login');
  }

  const perfil = profileRes.data;

  const proveedor = await prisma.proveedor.findUnique({
    where: { usuarioId: perfil.id }
  });

  if (!proveedor) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold text-red-500">Error: Perfil de Proveedor No Encontrado</h2>
        <p className="text-[var(--color-texto-suave)] mt-2">Termina de configurar tu cuenta para acceder al catálogo.</p>
      </div>
    );
  }

  // Cargar servicios y complementos en paralelo
  const [rawServicios, rawComplementos] = await Promise.all([
    prisma.servicio.findMany({
      where: { proveedorId: proveedor.id },
      include: { variaciones: true },
      orderBy: { creadoEn: 'desc' }
    }),
    prisma.complemento.findMany({
      where: { proveedorId: proveedor.id },
      include: { servicios: { select: { id: true, nombre: true } } },
      orderBy: { creadoEn: 'desc' }
    })
  ]);

  const serviciosSerializados = rawServicios.map(s => ({
    ...s,
    precio: Number(s.precio),
    variaciones: s.variaciones.map(v => ({ ...v, precioOverride: Number(v.precioOverride) })),
    creadoEn: s.creadoEn.toISOString(),
    actualizadoEn: s.actualizadoEn.toISOString(),
  }));

  const complementosSerializados = JSON.parse(JSON.stringify(rawComplementos));
  const proveedorSerializado = JSON.parse(JSON.stringify(proveedor));

  const isProfileComplete = !!(
    proveedor.nombre && 
    proveedor.categoria && 
    proveedor.estado && 
    proveedor.ciudad && 
    proveedor.direccion
  );

  return (
    <CatalogoClient 
      servicios={serviciosSerializados} 
      proveedor={proveedorSerializado}
      complementos={complementosSerializados}
      perfilCompleto={isProfileComplete}
    />
  );
}

