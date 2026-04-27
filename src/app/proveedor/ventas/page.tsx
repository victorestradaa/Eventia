import { getCurrentProfile } from '@/lib/actions/authActions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { autoCancelExpiredReservations } from '@/lib/actions/providerActions';
import VentasClient from '@/components/proveedor/VentasClient';

export const metadata = {
  title: 'Registro de Ventas | Gestor Eventos',
  description: 'Historial detallado de transacciones, abonos y comisiones.',
};

export default async function SalesPage() {
  await autoCancelExpiredReservations();
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
      <div className="p-10 text-center animate-in fade-in">
        <h2 className="text-2xl font-bold text-red-500">Error: Perfil de Proveedor No Encontrado</h2>
        <p className="text-[var(--color-texto-suave)] mt-2">Termina de configurar tu cuenta para acceder a tus ventas.</p>
      </div>
    );
  }

  // Cargar ventas y servicios en paralelo
  const [rawVentas, rawServicios] = await Promise.all([
    prisma.reserva.findMany({
      where: { proveedorId: proveedor.id },
      include: {
        cliente: { include: { usuario: true } },
        servicio: true,
        evento: true,
        transacciones: { orderBy: { creadoEn: 'asc' } }
      },
      orderBy: { creadoEn: 'desc' }
    }),
    prisma.servicio.findMany({
      where: { proveedorId: proveedor.id, activo: true },
      orderBy: { nombre: 'asc' }
    })
  ]);

  const ventasSerializadas = JSON.parse(JSON.stringify(rawVentas));
  const serviciosSerializados = JSON.parse(JSON.stringify(rawServicios));

  return (
    <VentasClient 
      ventasIniciales={ventasSerializadas} 
      proveedorId={proveedor.id}
      planProveedor={proveedor.plan}
      servicios={serviciosSerializados}
    />
  );
}
