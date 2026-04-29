import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // Generalmente el ID del proveedor o usuario

  if (!code) {
    return NextResponse.redirect(new URL('/proveedor/configuracion?error=no_code', request.url));
  }

  try {
    // 1. Intercambiar el código por tokens
    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.MERCADOPAGO_CLIENT_ID,
        client_secret: process.env.MERCADOPAGO_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/mercadopago/callback`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error MP OAuth:', data);
      return NextResponse.redirect(new URL('/proveedor/configuracion?error=oauth_failed', request.url));
    }

    // 2. Guardar tokens en el proveedor
    // Usamos el 'state' para identificar al proveedor si no hay sesión activa, 
    // pero lo ideal es usar la sesión del usuario actual.
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
       return NextResponse.redirect(new URL('/login', request.url));
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      include: { proveedor: true }
    });

    if (!usuario?.proveedor) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    await prisma.proveedor.update({
      where: { id: usuario.proveedor.id },
      data: {
        mpAccessToken: data.access_token,
        mpRefreshToken: data.refresh_token,
        mpUserId: data.user_id,
        mpVinculado: true
      }
    });

    return NextResponse.redirect(new URL('/proveedor/configuracion?success=mp_vinculado', request.url));

  } catch (error) {
    console.error('OAuth Callback Error:', error);
    return NextResponse.redirect(new URL('/proveedor/configuracion?error=server_error', request.url));
  }
}
