import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/actions/authActions';

export async function POST(request: Request) {
  try {
    const { planId, billingCycle } = await request.json();
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token no configurado' }, { status: 500 });
    }

    const profileRes = await getCurrentProfile();
    if (!profileRes.success || !profileRes.data) {
      return NextResponse.json({ success: false, error: 'Sesión no válida' }, { status: 401 });
    }

    const user = profileRes.data;
    const rol = user.rol;

    // Precios básicos para la prueba
    const PRECIOS: any = {
      ORO: 99,
      PLANNER: billingCycle === 'anual' ? 2990 : 299,
      INTERMEDIO: billingCycle === 'anual' ? 990 : 99,
      PREMIUM: billingCycle === 'anual' ? 3990 : 399,
      ELITE: billingCycle === 'anual' ? 5990 : 599
    };

    const price = PRECIOS[planId] || 1;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{
          title: `Plan ${planId} (${billingCycle})`,
          unit_price: price,
          quantity: 1,
          currency_id: 'MXN'
        }],
        payer: {
          email: user.email,
          name: user.nombre
        },
        back_urls: {
          success: `${baseUrl}/${rol.toLowerCase()}/planes?pago=exito`,
          failure: `${baseUrl}/${rol.toLowerCase()}/planes?pago=error`,
          pending: `${baseUrl}/${rol.toLowerCase()}/planes?pago=pendiente`
        },
        auto_return: 'approved',
        external_reference: `${user.id}_${planId}_${billingCycle}_${Date.now()}`,
        metadata: {
          user_id: user.id,
          rol: rol,
          plan_id: planId,
          billing_cycle: billingCycle
        },
        notification_url: process.env.WEBHOOK_URL || `${baseUrl}/api/webhooks/mercadopago`
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ success: false, error: data.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, url: data.init_point });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
