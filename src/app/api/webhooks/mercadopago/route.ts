import { NextResponse } from 'next/server';
import { mpClient } from '@/lib/mercadopago';
import { Payment } from 'mercadopago';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || searchParams.get('topic');
    const dataId = searchParams.get('data.id') || searchParams.get('id');

    console.log(`🔔 Webhook MercadoPago | Type: ${type} | ID: ${dataId}`);

    if (type === 'payment' && dataId) {
      const payment = new Payment(mpClient);
      const paymentData = await payment.get({ id: dataId });

      if (paymentData.status === 'approved') {
        const { user_id, rol, plan_id, meses } = paymentData.metadata;

        console.log(`✅ Pago aprobado para usuario ${user_id} (${rol}) | Plan: ${plan_id} | Meses: ${meses}`);

        const fechaExpira = new Date();
        fechaExpira.setMonth(fechaExpira.getMonth() + Number(meses));

        if (rol === 'CLIENTE') {
          await prisma.cliente.update({
            where: { usuarioId: user_id },
            data: {
              plan: plan_id,
              planExpira: fechaExpira
            }
          });
        } else if (rol === 'PROVEEDOR') {
          await prisma.proveedor.update({
            where: { usuarioId: user_id },
            data: {
              plan: plan_id,
              planExpira: fechaExpira
            }
          });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('🔥 Error en Webhook MercadoPago:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
