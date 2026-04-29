
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/authActions';
import MercadoPagoClient from './MercadoPagoClient';

export default async function MercadoPagoPage() {
  const profile = await getCurrentProfile();
  
  if (!profile.success || !profile.data?.proveedor) {
    redirect('/auth/login');
  }

  const proveedor = profile.data.proveedor;
  
  // Generar URL de Autorización de Mercado Pago
  const appId = process.env.MERCADOPAGO_APP_ID || '';
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/mercadopago/callback`;
  const authUrl = `https://auth.mercadopago.com.mx/authorization?client_id=${appId}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return (
    <div className="p-4 md:p-8">
      <MercadoPagoClient proveedor={proveedor} authUrl={authUrl} />
    </div>
  );
}
