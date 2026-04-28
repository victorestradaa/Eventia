'use server';

import { getCurrentProfile } from './authActions';

// Definición de Precios
export const PRECIOS_MP = {
  CLIENTE: {
    ORO: { monto: 99, meses: 13, label: 'Plan Oro (13 meses)' },
    PLANNER: { monto: 299, meses: 1, label: 'Plan Planner (Mensual)' }
  },
  PROVEEDOR: {
    DESTACADO: { 
      mensual: { monto: 99, meses: 1, label: 'Plan Destacado (Mensual)' },
      anual: { monto: 990, meses: 12, label: 'Plan Destacado (Anual - 2 meses gratis)' }
    },
    PRO: {
      mensual: { monto: 399, meses: 1, label: 'Plan Pro (Mensual)' },
      anual: { monto: 3990, meses: 12, label: 'Plan Pro (Anual - 2 meses gratis)' }
    },
    ELITE: {
      mensual: { monto: 599, meses: 1, label: 'Plan Elite (Mensual)' },
      anual: { monto: 5990, meses: 12, label: 'Plan Elite (Anual - 2 meses gratis)' }
    }
  }
};

/**
 * Crea una preferencia de pago en Mercado Pago para planes.
 */
export async function createPlanPreference(planId: string, billingCycle: 'mensual' | 'anual' | 'unico') {
  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) return { success: false, error: 'No hay token' };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://main.d3qvq9kz1e0yyg.amplifyapp.com';
    
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ title: `Plan ${planId}`, unit_price: 1, quantity: 1 }],
        back_urls: {
          success: `${baseUrl}/cliente/planes?pago=exito`,
          failure: `${baseUrl}/cliente/planes?pago=error`,
          pending: `${baseUrl}/cliente/planes?pago=pendiente`
        },
        auto_return: 'approved'
      })
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: 'Error MP' };

    return { success: true, url: data.init_point };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
