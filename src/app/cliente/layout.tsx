import { getCurrentProfile } from '@/lib/actions/authActions';
import { getEventosCliente } from '@/lib/actions/eventActions';
import ClientLayoutContent from './ClientLayoutContent';
import { redirect } from 'next/navigation';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
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
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
          <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-amber-500 uppercase tracking-tighter italic">Sesión Inválida</h2>
        <div className="text-gray-400 text-center max-w-md space-y-4">
          <p>Tu sesión de seguridad caducó o hay un conflicto en las credenciales almacenadas en este dispositivo.</p>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-left space-y-1 font-mono text-[10px]">
            <p className="text-amber-500/60 uppercase font-bold text-[9px] mb-2 tracking-widest">Depuración de Sistema</p>
            <p><span className="opacity-40">Status:</span> 500_AUTH_REJECTED</p>
            <p><span className="opacity-40">Error:</span> {profileRes.error || 'Autenticación fallida'}</p>
            <p><span className="opacity-40">Supabase:</span> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Configurado' : '✗ Faltante'}</p>
            <p><span className="opacity-40">Region:</span> {process.env.AWS_REGION || 'local'}</p>
          </div>
        </div>
        <form action={async () => {
          'use server';
          const { cerrarSesion } = await import('@/lib/actions/authActions');
          await cerrarSesion();
        }}>
          <button type="submit" className="px-8 py-3 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 rounded-full font-bold transition-all uppercase tracking-widest text-xs">
            Cerrar Sesión Corrupta
          </button>
        </form>
      </div>
    );
  }

  const perfil = profileRes.data;
  const eventosRes = perfil.cliente 
    ? await getEventosCliente(perfil.cliente.id) 
    : { success: false, data: [] };

  return (
    <ClientLayoutContent 
      initialEventos={eventosRes.success ? JSON.parse(JSON.stringify(eventosRes.data)) : []} 
      perfil={JSON.parse(JSON.stringify(perfil))}
    >
      {children}
    </ClientLayoutContent>
  );
}
