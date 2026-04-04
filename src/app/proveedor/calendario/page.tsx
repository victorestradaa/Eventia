import { getCurrentProfile } from '@/lib/actions/authActions';
import { getReservasCalendario, getResumenProveedor } from '@/lib/actions/providerActions';
import { redirect } from 'next/navigation';
import CalendarioClient from './CalendarioClient';

export default async function CalendarPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
    return redirect('/login');
  }

  const perfil = profileRes.data;
  
  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) {
    return redirect('/cliente/dashboard');
  }

  const [reservasRes, resumenRes] = await Promise.all([
    getReservasCalendario(perfil.proveedor.id),
    getResumenProveedor(perfil.proveedor.id)
  ]);

  const reservas = reservasRes.success ? reservasRes.data : [];
  const servicios = resumenRes.data?.servicios || [];

  return (
    <CalendarioClient 
      reservas={reservas} 
      proveedor={perfil.proveedor}
      servicios={servicios}
    />
  );
}
