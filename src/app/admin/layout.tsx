import { ReactNode } from 'react';
import { getCurrentProfile } from '@/lib/actions/authActions';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profileRes = await getCurrentProfile();
  
  if (!profileRes.success || !profileRes.data || profileRes.data.rol !== 'ADMIN') {
    return redirect('/login');
  }

  const userName = profileRes.data.nombre || 'Administrador';
  const userEmail = profileRes.data.email || 'admin@eventia.com';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <AdminLayoutClient 
      userName={userName}
      userEmail={userEmail}
      initial={initial}
    >
      {children}
    </AdminLayoutClient>
  );
}
