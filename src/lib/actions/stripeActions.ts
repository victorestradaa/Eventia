'use server';

import { stripe, PRECIOS_MXN } from '@/lib/stripe';
import { getCurrentProfile } from './authActions';
import { headers } from 'next/headers';

/**
 * Crea una sesión de Stripe Checkout para suscripciones.
 */
export async function createCheckoutSession(planId: keyof typeof PRECIOS_MXN) {
  try {
    const profileRes = await getCurrentProfile();
    const headersList = await headers();
    const origin = headersList.get('origin');

    if (!profileRes.success || !profileRes.data) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const perfil = profileRes.data;
    const precio = PRECIOS_MXN[planId];

    const session = await stripe.checkout.sessions.create({
      customer_email: perfil.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: `Plan ${planId.split('_').pop()}`,
              description: `Suscripción mensual al plataforma Gestor de Eventos`,
            },
            unit_amount: precio,
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // O 'subscription' si se configuran productos recurrentes en Stripe
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      metadata: {
        userId: perfil.id,
        planId: planId,
      },
    });

    return { success: true, url: session.url };
  } catch (error) {
    console.error('Error al crear sesión de Stripe:', error);
    return { success: false, error: 'Error al iniciar el proceso de pago.' };
  }
}
