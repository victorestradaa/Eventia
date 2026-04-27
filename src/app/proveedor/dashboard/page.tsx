import { getCurrentProfile } from '@/lib/actions/authActions';
import { getResumenProveedor, autoCancelExpiredReservations } from '@/lib/actions/providerActions';
import DashboardProviderClient from './DashboardProviderClient';
import { redirect } from 'next/navigation';

export default async function ProviderDashboardPage() {
  await autoCancelExpiredReservations();
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
    if (profileRes.error?.startsWith('Error Prisma:')) {
      return (
        <div className="min-h-screen bg-black text-red-500 p-10 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-bold mb-4">Error Crítico de Base de Datos</h2>
          <p className="mb-4">Se produjo el siguiente error en AWS Lambda al intentar consultar o recuperar tu perfil:</p>
          <pre className="text-xs bg-red-950/50 p-4 rounded-xl text-left max-w-4xl overflow-auto border border-red-500/20">{profileRes.error}</pre>
        </div>
      );
    }
    // Romper el bucle de middleware interceptando el fallo de autenticación de Lambda sin usar redirect() de servidor
    return (
      <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center space-y-6">
        <h2 className="text-3xl font-bold text-amber-500">Sesión Inválida</h2>
        <p className="text-gray-400 text-center max-w-md">Tu sesión de seguridad caducó o hay un conflicto en las credenciales almacenadas en este dispositivo.</p>
        <form action={async () => {
          'use server';
          const { cerrarSesion } = await import('@/lib/actions/authActions');
          await cerrarSesion();
        }}>
          <button type="submit" className="px-6 py-3 bg-red-600 rounded-lg font-bold">Cerrar Sesión Corrupta</button>
        </form>
      </div>
    );
  }

  const perfil = profileRes.data;
  
  if (perfil.rol !== 'PROVEEDOR') {
    return redirect('/cliente/dashboard');
  }

  if (!perfil.proveedor) {
    return (
      <div className="min-h-screen bg-black text-amber-500 p-10 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">Perfil Incompleto</h2>
        <p>Tu cuenta está registrada como Proveedor, pero falta la configuración inicial de tu negocio. Por favor contacta a soporte.</p>
      </div>
    );
  }

  const resumenRes = await getResumenProveedor(perfil.proveedor.id);
  const resumenSerializado = resumenRes.success 
    ? JSON.parse(JSON.stringify(resumenRes.data)) 
    : { reservas: [], servicios: [], ingresosTotales: 0, totalReservas: 0 };

  return (
    <DashboardProviderClient 
      resumen={JSON.parse(JSON.stringify(resumenSerializado))} 
      perfil={JSON.parse(JSON.stringify(perfil))} 
    />
  );
}
