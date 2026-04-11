'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Registra un abono a una reserva y sincroniza con el presupuesto del evento.
 */
export async function registrarAbono(data: {
  reservaId: string;
  monto: number;
  metodoPago: string;
  tipo: 'ANTICIPO' | 'ABONO' | 'PENALIZACION';
  estado?: 'PAGADO' | 'PENDIENTE'; // Nuevo: Soporte para compromisos de pago
  fechaVencimiento?: string;      // Nuevo: Fecha programada para el pagaré
  transaccionId?: string;         // Nuevo: ID de la transacción en caso de estar liquidando un pagaré
  notas?: string;
  esCliente?: boolean;
}) {
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      console.log(`[registrarAbono] Iniciando transacción para reserva: ${data.reservaId}`);
      
      // 1. Obtener datos de la reserva
      const reserva = await tx.reserva.findUnique({
        where: { id: data.reservaId },
        include: {
          servicio: true,
          transacciones: true
        }
      });

      if (!reserva) {
        console.error(`[registrarAbono] Reserva no encontrada: ${data.reservaId}`);
        throw new Error('Reserva no encontrada');
      }

      const nuevoEstadoTx = data.estado || 'PAGADO';
      const esPagado = nuevoEstadoTx === 'PAGADO';

      let transaccion;

      // 2. Si transaccionId está presente, es una actualización (liquidando un pagaré)
      if (data.transaccionId) {
        console.log(`[registrarAbono] Liquidando pagaré: ${data.transaccionId}`);
        transaccion = await tx.transaccion.update({
          where: { id: data.transaccionId },
          data: {
            estado: 'PAGADO',
            monto: data.monto,
            metodoPago: data.metodoPago,
            fechaPago: new Date(),
            notas: data.notas || (data.esCliente ? 'Pagaré liquidado por el cliente' : 'Pagaré liquidado por el proveedor')
          }
        });
      } else {
        // Modo normal: Crear nueva transacción
        console.log(`[registrarAbono] Creando nueva transacción de tipo: ${data.tipo}`);
        transaccion = await tx.transaccion.create({
          data: {
            reservaId: data.reservaId,
            monto: data.monto,
            tipo: data.tipo,
            metodoPago: data.metodoPago,
            estado: nuevoEstadoTx,
            fechaPago: esPagado ? new Date() : null,
            fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : null,
            notas: data.notas || (data.esCliente ? 'Abono realizado por el cliente' : 'Abono registrado por el proveedor')
          }
        });
      }

      // Si la transacción sigue siendo PENDIENTE (un nuevo pagaré), no actualizamos totales aún
      if (!esPagado && !data.transaccionId) {
         return JSON.parse(JSON.stringify({ reserva, transaccion }));
      }

      // 3. Calcular nuevo total pagado de la reserva (solo transacciones PAGADAS)
      const todasLasTransacciones = await tx.transaccion.findMany({
        where: { reservaId: data.reservaId, estado: 'PAGADO' }
      });
      const totalPagado = todasLasTransacciones.reduce((sum: number, t: any) => sum + Number(t.monto), 0);

      // 4. Actualizar estado de la reserva
      let nuevoEstadoReserva = reserva.estado;
      if (totalPagado >= Number(reserva.montoTotal)) {
        nuevoEstadoReserva = 'LIQUIDADO';
      } else if (reserva.estado === 'TEMPORAL' && totalPagado > 0) {
        nuevoEstadoReserva = 'APARTADO';
      }

      console.log(`[registrarAbono] Actualizando reserva ${data.reservaId} a estado: ${nuevoEstadoReserva}`);
      await tx.reserva.update({
        where: { id: data.reservaId },
        data: { 
          estado: nuevoEstadoReserva,
          montoAnticipo: data.tipo === 'ANTICIPO' ? (Number(reserva.montoAnticipo) + Number(data.monto)) : reserva.montoAnticipo
        }
      });

      // 5. Sincronizar con LineaPresupuesto del Evento
      if (reserva.eventoId && reserva.servicioId) {
        const linea = await tx.lineaPresupuesto.findFirst({
          where: {
            eventoId: reserva.eventoId,
            servicioId: reserva.servicioId
          }
        });

        if (linea) {
          console.log(`[registrarAbono] Sincronizando presupuesto para línea: ${linea.id}`);
          await tx.lineaPresupuesto.update({
            where: { id: linea.id },
            data: {
              montoPagado: { increment: data.monto }
            }
          });

          await tx.pago.create({
            data: {
              lineaId: linea.id,
              monto: data.monto,
              nota: data.notas || `Abono a ${reserva.servicio.nombre}`
            }
          });
        }
      }

      return JSON.parse(JSON.stringify({ reserva, transaccion }));
    });

    console.log(`[registrarAbono] Éxito para reserva: ${data.reservaId}`);

    // Omitimos revalidatePath temporalmente para aislar un fallo de diseño interno
    // de Next.js donde los Server Actions tiran 500 si algún Client Component
    // falla en el re-render en segundo plano. La revalidación visual la hará
    // router.refresh() desde el entorno aislado del navegador.

    // Retornar explícitamente a través de JSON puro
    const responsePayload = {
      success: true,
      data: {
        reservaId: result.reserva.id,
        transaccionId: result.transaccion?.id || null,
        nuevoEstado: result.reserva.estado,
        montoAnticipo: result.reserva.montoAnticipo ? Number(result.reserva.montoAnticipo) : 0,
        reserva: result.reserva,
        transaccion: result.transaccion
      }
    };

    console.log(`[registrarAbono] Enviando respuesta exitosa:`, responsePayload);
    return JSON.parse(JSON.stringify(responsePayload));

  } catch (error: any) {
    console.error('[registrarAbono] ERROR:', error);
    // Asegurar que el error también sea un objeto plano simple
    return JSON.parse(JSON.stringify({ 
      success: false, 
      error: error?.message || 'Error interno al procesar el abono.' 
    }));
  }
}
