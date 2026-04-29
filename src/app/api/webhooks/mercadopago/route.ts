import { NextResponse } from 'next/server';
import { mpClient } from '@/lib/mercadopago';
import { Payment } from 'mercadopago';
import { prisma } from '@/lib/prisma';

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
        const external_reference = paymentData.external_reference;
        
        if (external_reference) {
          // Es un pago de servicio/reserva
          console.log(`✅ Pago de servicio aprobado | Reserva: ${external_reference}`);
          
          const reservaId = external_reference;
          const monto = paymentData.transaction_amount;

          // Registrar el abono usando la lógica existente (adaptada para el webhook)
          try {
            // Nota: Importamos registrarAbono o duplicamos lógica si es necesario.
            // Para asegurar consistencia, usaremos un fetch interno o llamaremos a la acción directamente si es posible.
            // Dado que registrarAbono es una 'use server', podemos intentar importarla.
            // Pero mejor implementamos la lógica aquí para evitar problemas de contexto de servidor.
            
            const reserva = await prisma.reserva.findUnique({
              where: { id: reservaId },
              include: { servicio: true }
            });

            if (reserva) {
              await prisma.$transaction(async (tx: any) => {
                // 1. Crear transacción
                const transaccionesPrevias = await tx.transaccion.count({
                  where: { reservaId, estado: 'PAGADO' }
                });

                await tx.transaccion.create({
                  data: {
                    reservaId,
                    monto,
                    tipo: transaccionesPrevias === 0 ? 'ANTICIPO' : 'ABONO',
                    metodoPago: 'TARJETA',
                    estado: 'PAGADO',
                    fechaPago: new Date(),
                    notas: `Pago procesado vía Mercado Pago (ID: ${dataId})`
                  }
                });

                // 2. Actualizar Reserva
                const todas = await tx.transaccion.findMany({
                  where: { reservaId, estado: 'PAGADO' }
                });
                const totalPagado = todas.reduce((sum: number, t: any) => sum + Number(t.monto), 0);

                let nuevoEstado = reserva.estado;
                if (totalPagado >= Number(reserva.montoTotal)) nuevoEstado = 'LIQUIDADO';
                else if (totalPagado > 0) nuevoEstado = 'APARTADO';

                await tx.reserva.update({
                  where: { id: reservaId },
                  data: { 
                    estado: nuevoEstado,
                    montoAnticipo: transaccionesPrevias === 0 ? monto : reserva.montoAnticipo
                  }
                });

                // 3. Sincronizar LineaPresupuesto
                if (reserva.eventoId && reserva.servicioId) {
                  const linea = await tx.lineaPresupuesto.findFirst({
                    where: { eventoId: reserva.eventoId, servicioId: reserva.servicioId }
                  });
                  if (linea) {
                    await tx.lineaPresupuesto.update({
                      where: { id: linea.id },
                      data: { montoPagado: { increment: monto } }
                    });
                    await tx.pago.create({
                      data: {
                        lineaId: linea.id,
                        monto,
                        estado: 'APROBADO',
                        metodoPago: 'TARJETA',
                        nota: `Abono vía Mercado Pago a ${reserva.servicio.nombre}`
                      }
                    });
                  }
                }
              });
              console.log(`✨ Reserva ${reservaId} actualizada exitosamente.`);
            }
          } catch (err: any) {
            console.error('❌ Error actualizando reserva desde webhook:', err.message);
          }
        } else if (paymentData.metadata?.user_id) {
          // Es un pago de PLAN (Lógica original)
          const { user_id, rol, plan_id, meses } = paymentData.metadata;

          console.log(`✅ Pago de plan aprobado para usuario ${user_id} (${rol}) | Plan: ${plan_id} | Meses: ${meses}`);

          const fechaExpira = new Date();
          fechaExpira.setMonth(fechaExpira.getMonth() + Number(meses || 1));

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
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('🔥 Error en Webhook MercadoPago:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
