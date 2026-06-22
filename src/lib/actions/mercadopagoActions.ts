'use server';

import { getCurrentProfile } from './authActions';
import { prisma } from '@/lib/prisma';

// Definición de Precios
const PRECIOS_MP = {
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

    // 3. Comisión Eventium: SIEMPRE 0% para todos los planes.
    // El modelo de negocio se basa solo en suscripciones (no comisiones por transacción).
    const commissionPercent = 0;
    
    // 4. Calcular el monto a cobrar (Anticipo si es el primero)
    // Buscamos si ya tiene transacciones pagadas
    const transaccionesPagadas = await prisma.transaccion.count({
      where: { reservaId: reserva.id, estado: 'PAGADO' }
    });

    let montoACobrar = Number(reserva.montoTotal);
    let isAnticipo = false;

    if (transaccionesPagadas === 0) {
      // Es el primer pago, cobramos el anticipo según el porcentaje del servicio
      const porcentaje = reserva.servicio.porcentajeAnticipo || 30;
      montoACobrar = (Number(reserva.montoTotal) * porcentaje) / 100;
      isAnticipo = true;
    } else {
      // Si ya hubo pagos, cobramos el saldo restante o lo que el usuario pida (aquí asumimos liquidación o abono)
      // Para simplificar esta acción inicial, usaremos el montoTotal - montoPagado
      const pagado = await prisma.transaccion.aggregate({
        where: { reservaId: reserva.id, estado: 'PAGADO' },
        _sum: { monto: true }
      });
      montoACobrar = Number(reserva.montoTotal) - Number(pagado._sum.monto || 0);
    }

    if (montoACobrar <= 0) return { success: false, error: 'La reserva ya está liquidada.' };

    const marketplaceFee = montoACobrar * commissionPercent;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 5. Crear la preferencia de Marketplace
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
            title: `${isAnticipo ? 'Anticipo' : 'Abono'}: ${reserva.servicio.nombre}`,
            unit_price: Math.round(montoACobrar * 100) / 100,
            quantity: 1,
            currency_id: 'MXN'
          }
        ],
        marketplace_fee: Math.round(marketplaceFee * 100) / 100,
        back_urls: {
          success: `${baseUrl}/cliente/pago/exito?reservaId=${reserva.id}`,
          failure: `${baseUrl}/cliente/pago/error?reservaId=${reserva.id}`,
          pending: `${baseUrl}/cliente/pago/pendiente?reservaId=${reserva.id}`,
        },
        auto_return: 'approved',
        external_reference: reserva.id,
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Error al crear preferencia Split:', data);
      return { success: false, error: 'Error al generar el pago en Mercado Pago.' };
    }

    return { success: true, url: data.init_point };

  } catch (error: any) {
    console.error('Split Payment Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Desvincula la cuenta de Mercado Pago del proveedor.
 */
export async function desvincularMercadoPago() {
  try {
    const profile = await getCurrentProfile();
    if (!profile.success || !profile.data?.proveedor) {
      return { success: false, error: 'No autorizado.' };
    }

    await prisma.proveedor.update({
      where: { id: profile.data.proveedor.id },
      data: {
        mpUserId: null,
        mpVinculado: false
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error desvinculando MP:', error);
    return { success: false, error: 'Error interno del servidor.' };
  }
}
