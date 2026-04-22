import { getCurrentProfile } from '@/lib/actions/authActions';
import { getHistorialEventos } from '@/lib/actions/eventActions';
import { redirect } from 'next/navigation';
import HistorialClient from './HistorialClient';

export default async function HistorialPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
    return redirect('/login');
  }

  const perfil = profileRes.data;
  const historialRes = perfil.cliente 
    ? await getHistorialEventos(perfil.cliente.id) 
    : { success: false, data: [] };

  return (
    <HistorialClient 
      eventos={historialRes.success ? JSON.parse(JSON.stringify(historialRes.data)) : []} 
    />
  );
}
