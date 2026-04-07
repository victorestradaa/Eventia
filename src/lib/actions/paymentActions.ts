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
      // 1. Obtener datos de la reserva
      const reserva = await tx.reserva.findUnique({
        where: { id: data.reservaId },
        include: {
          servicio: true,
          transacciones: true
        }
      });

      if (!reserva) throw new Error('Reserva no encontrada');

      const nuevoEstadoTx = data.estado || 'PAGADO';
      const esPagado = nuevoEstadoTx === 'PAGADO';

      let transaccion;

      // 2. Si transaccionId está presente, es una actualización (liquidando un pagaré)
      if (data.transaccionId) {
        transaccion = await tx.transaccion.update({
          where: { id: data.transaccionId },
          data: {
            estado: 'PAGADO',
            monto: data.monto, // Sincronizar monto en caso de que haya sido modificado en el modal
            metodoPago: data.metodoPago,
            fechaPago: new Date(),
            notas: data.notas || (data.esCliente ? 'Pagaré liquidado por el cliente' : 'Pagaré liquidado por el proveedor')
          }
        });
      } else {
        // Modo normal: Crear nueva transacción
        transaccion = await tx.transaccion.create({
          data: {
            reservaId: data.reservaId,
            monto: data.monto,
            tipo: data.tipo,
            metodoPago: data.metodoPago,
            estado: nuevoEstadoTx,
            fechaPago: esPagado ? new Date() : null, // Solo tiene fecha de pago si ya se cobró
            fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : null,
            notas: data.notas || (data.esCliente ? 'Abono realizado por el cliente' : 'Abono registrado por el proveedor')
          }
        });
      }

      // Si la transacción sigue siendo PENDIENTE (un nuevo pagaré), no actualizamos totales
      if (!esPagado && !data.transaccionId) {
         return { reserva, transaccion };
      }

      // 3. Calcular nuevo total pagado de la reserva (solo transacciones PAGADAS)
      // Nota: Volvemos a consultar o recalculamos para asegurar consistencia
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
          await tx.lineaPresupuesto.update({
            where: { id: linea.id },
            data: {
              montoPagado: { increment: data.monto }
            }
          });

          // Registrar el pago en la tabla Pago vinculada a LineaPresupuesto (para historial de presupuesto)
          await tx.pago.create({
            data: {
              lineaId: linea.id,
              monto: data.monto,
              nota: data.notas || `Abono a ${reserva.servicio.nombre}`
            }
          });
        }
      }

      return { reserva, transaccion };
    });

    // Revalidar rutas involucradas
    revalidatePath('/proveedor/ventas');
    revalidatePath('/proveedor/dashboard');
    revalidatePath('/cliente/dashboard');
    if (result.reserva.eventoId) {
      revalidatePath(`/cliente/evento/${result.reserva.eventoId}`);
    }

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    console.error('Error al registrar abono:', error);
    return { success: false, error: 'No se pudo procesar el abono.' };
  }
}
