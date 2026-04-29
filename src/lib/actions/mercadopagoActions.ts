'use server';

import { getCurrentProfile } from './authActions';
import { prisma } from '@/lib/prisma';

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

/**
 * Crea una preferencia de pago para un SERVICIO (Split Payment / Marketplace)
 */
export async function createServicePreference(reservaId: string) {
  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) return { success: false, error: 'No hay token de aplicación' };

    // 1. Obtener la reserva y datos del proveedor
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { 
        servicio: {
          include: { 
            proveedor: true 
          }
        }
      }
    });

    if (!reserva || !reserva.servicio.proveedor) {
      return { success: false, error: 'Reserva o proveedor no encontrado' };
    }

    const proveedor = reserva.servicio.proveedor;

    // 2. Validar que el proveedor esté vinculado
    if (!proveedor.mpUserId || !proveedor.mpVinculado) {
      return { success: false, error: 'El proveedor no ha vinculado su cuenta de Mercado Pago.' };
    }

    // 3. Obtener la comisión según el plan del proveedor
    // Usamos el PlanConfig de la BD si existe, o un fallback
    const config = await prisma.planConfig.findUnique({
      where: { planId: proveedor.plan }
    });
    
    const commissionPercent = config?.comision ? config.comision / 100 : 0.10; // Default 10%
    const marketplaceFee = Number(reserva.montoTotal) * commissionPercent;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    // 4. Crear la preferencia de Marketplace
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            id: reserva.id,
            title: `Anticipo: ${reserva.servicio.nombre}`,
            unit_price: Number(reserva.montoAnticipo), // Solo se cobra el anticipo por MP
            quantity: 1,
            currency_id: 'MXN'
          }
        ],
        marketplace_fee: marketplaceFee,
        // El collector_id es el ID del proveedor en MP (Connect)
        // NOTA: Para Marketplace se suele usar el access_token de la APP
        // y el marketplace_fee se descuenta automáticamente.
        payer: {
          email: reserva.emailCliente // Si lo tenemos en la reserva
        },
        back_urls: {
          success: `${baseUrl}/pago/exito?reserva=${reserva.id}`,
          failure: `${baseUrl}/pago/error?reserva=${reserva.id}`,
        },
        auto_return: 'approved',
        external_reference: reserva.id,
        // Importante: Indicar que es para el proveedor vinculado
        marketplace: 'MP-MARKETPLACE' // Opcional dependiendo de la versión de la API
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Error al crear preferencia Split:', data);
      return { success: false, error: 'Error al generar el pago dividido.' };
    }

    return { success: true, url: data.init_point };

  } catch (error: any) {
    console.error('Split Payment Error:', error);
    return { success: false, error: error.message };
  }
}
