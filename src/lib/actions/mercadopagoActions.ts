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
    console.log('🚀 [Fetch] Iniciando creación de preferencia:', { planId, billingCycle });

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      return { success: false, error: 'Token de pago no configurado en el servidor.' };
    }

    const profileRes = await getCurrentProfile();
    if (!profileRes.success || !profileRes.data) {
      return { success: false, error: 'Sesión no válida.' };
    }

    const user = profileRes.data;
    const rol = user.rol;

    let item: { title: string; unit_price: number; quantity: number } | null = null;
    let meses = 0;

    if (rol === 'CLIENTE') {
      const plan = (PRECIOS_MP.CLIENTE as any)[planId];
      if (!plan) throw new Error('Plan de cliente no válido');
      item = { title: plan.label, unit_price: plan.monto, quantity: 1 };
      meses = plan.meses;
    } else if (rol === 'PROVEEDOR') {
      const plan = (PRECIOS_MP.PROVEEDOR as any)[planId];
      if (!plan) throw new Error('Plan de proveedor no válido');
      const subPlan = plan[billingCycle === 'unico' ? 'mensual' : billingCycle];
      item = { title: subPlan.label, unit_price: subPlan.monto, quantity: 1 };
      meses = subPlan.meses;
    }

    if (!item) throw new Error('No se pudo determinar el plan');

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [item],
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
          meses: meses,
          billing_cycle: billingCycle
        },
        notification_url: process.env.WEBHOOK_URL || `${baseUrl}/api/webhooks/mercadopago`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error API Mercado Pago:', data);
      return { success: false, error: data.message || 'Error al crear preferencia' };
    }

    console.log('✅ Preferencia creada con éxito (Fetch):', data.id);
    return { success: true, url: data.init_point };
  } catch (error: any) {
    console.error('🔥 Error crítico (Fetch):', error);
    return { success: false, error: `Error de conexión: ${error.message}` };
  }
}
