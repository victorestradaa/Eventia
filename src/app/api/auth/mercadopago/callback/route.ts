
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentProfile } from '@/lib/actions/authActions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/proveedor/mercadopago?error=no_code', request.url));
  }

  try {
    const profile = await getCurrentProfile();
    if (!profile.success || !profile.data?.proveedor) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const proveedorId = profile.data.proveedor.id;

    // Intercambiar código por token
    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.MERCADOPAGO_APP_ID,
        client_secret: process.env.MERCADOPAGO_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/mercadopago/callback`,
      }),
    });

    const data = await response.json();

    if (data.user_id) {
      // Actualizar proveedor en la base de datos
      await prisma.proveedor.update({
        where: { id: proveedorId },
        data: {
          mpUserId: String(data.user_id),
          mpVinculado: true
        }
      });

      console.log(`✅ Proveedor ${proveedorId} vinculado exitosamente con Mercado Pago ID: ${data.user_id}`);
      return NextResponse.redirect(new URL('/proveedor/mercadopago?success=true', request.url));
    } else {
      console.error('❌ Error OAuth MP:', data);
      return NextResponse.redirect(new URL(`/proveedor/mercadopago?error=oauth_failed`, request.url));
    }
  } catch (error: any) {
    console.error('🔥 Error en callback MP:', error);
    return NextResponse.redirect(new URL('/proveedor/mercadopago?error=server_error', request.url));
  }
}
