'use server';

import { MercadoPagoConfig, Preference } from 'mercadopago';
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
    console.log('🚀 Iniciando creación de preferencia:', { planId, billingCycle });

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN no encontrado en process.env');
      return { success: false, error: 'Error interno: Token de pago no configurado.' };
    }

    const client = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 5000 }
    });

    const profileRes = await getCurrentProfile();
    if (!profileRes.success || !profileRes.data) {
      console.error('❌ Error al obtener perfil:', profileRes.error);
      return { success: false, error: 'Sesión no válida o expirada.' };
    }

    const user = profileRes.data;
    const rol = user.rol;

    let item: { title: string; unit_price: number; quantity: number } | null = null;
    let meses = 0;

    if (rol === 'CLIENTE') {
      const plan = (PRECIOS_MP.CLIENTE as any)[planId];
      if (!plan) throw new Error('Plan de cliente no válido');
      item = {
        title: plan.label,
        unit_price: plan.monto,
        quantity: 1
      };
      meses = plan.meses;
    } else if (rol === 'PROVEEDOR') {
      const plan = (PRECIOS_MP.PROVEEDOR as any)[planId];
      if (!plan) throw new Error('Plan de proveedor no válido');
      
      const subPlan = plan[billingCycle === 'unico' ? 'mensual' : billingCycle];
      item = {
        title: subPlan.label,
        unit_price: subPlan.monto,
        quantity: 1
      };
      meses = subPlan.meses;
    }

    if (!item) throw new Error('No se pudo determinar el plan');

    console.log('📦 Generando preferencia para:', item.title);

    const preference = new Preference(client);
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const notificationUrl = process.env.WEBHOOK_URL || `${baseUrl}/api/webhooks/mercadopago`;

    const response = await preference.create({
      body: {
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
        notification_url: notificationUrl
      }
    });

    console.log('✅ Preferencia creada con éxito:', response.id);
    return { success: true, url: response.init_point };
  } catch (error: any) {
    console.error('🔥 Error crítico en createPlanPreference:', error);
    return { success: false, error: `Error de Mercado Pago: ${error.message || 'Desconocido'}` };
  }
}
