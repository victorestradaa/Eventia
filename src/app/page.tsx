import { createClient } from '@/lib/supabase/servidor';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import HomeClient from './HomeClient';

export default async function Page() {
  // Verificar sesión en el servidor
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Si hay usuario, redirigir según su rol real en la base de datos
  if (user) {
    try {
      const dbUser = await prisma.usuario.findUnique({
        where: { email: user.email },
        select: { rol: true }
      });

      const rol = dbUser?.rol || 'CLIENTE';

      if (rol === 'ADMIN') {
        redirect('/admin/dashboard');
      } else if (rol === 'PROVEEDOR') {
        redirect('/proveedor/dashboard');
      } else {
        redirect('/cliente/dashboard');
      }
    } catch (e) {
      console.error("Error redirecting at root:", e);
      // Si hay error en base de datos, dejamos que vea la home o intentamos cliente
      redirect('/cliente/dashboard');
    }
  }

  // Si no hay usuario, mostrar la landing page (HomeClient)
  return <HomeClient />;
}
