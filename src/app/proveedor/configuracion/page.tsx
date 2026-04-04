import { getCurrentProfile } from '@/lib/actions/authActions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ConfigClient from './ConfigClient';

export const metadata = {
  title: 'Configuración | Gestor Eventos',
  description: 'Gestiona la configuración de tu perfil de proveedor.',
};

export default async function ConfigPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes?.success || !profileRes.data || profileRes.data.rol !== 'PROVEEDOR') {
    redirect('/login');
  }

  const perfil = profileRes.data;

  const proveedor = await prisma.proveedor.findUnique({
    where: { usuarioId: perfil.id }
  });

  if (!proveedor) {
    redirect('/proveedor/dashboard');
  }

  const proveedorData = JSON.parse(JSON.stringify(proveedor));

  return (
    <ConfigClient 
      proveedor={proveedorData} 
      usuario={{ id: perfil.id, nombre: perfil.nombre, email: perfil.email }} 
    />
  );
}
