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
  notas?: string;
  esCliente?: boolean;
}) {
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Obtener datos de la reserva para saber a qué evento pertenece
      const reserva = await tx.reserva.findUnique({
        where: { id: data.reservaId },
        include: {
          servicio: true,
          transacciones: true
        }
      });

      if (!reserva) throw new Error('Reserva no encontrada');

      // 2. Crear la transacción
      const transaccion = await tx.transaccion.create({
        data: {
          reservaId: data.reservaId,
          monto: data.monto,
          tipo: data.tipo,
          metodoPago: data.metodoPago,
          estado: 'PAGADO',
          fechaPago: new Date(),
          notas: data.notas || (data.esCliente ? 'Abono realizado por el cliente' : 'Abono registrado por el proveedor')
        }
      });

      // 3. Calcular nuevo total pagado de la reserva
      const totalPagado = reserva.transacciones
        .filter((t: any) => t.estado === 'PAGADO')
        .reduce((sum: number, t: any) => sum + Number(t.monto), 0) + Number(data.monto);

      // 4. Actualizar estado de la reserva si es necesario
      let nuevoEstado = reserva.estado;
      if (totalPagado >= Number(reserva.montoTotal)) {
        nuevoEstado = 'LIQUIDADO';
      } else if (reserva.estado === 'TEMPORAL' && totalPagado > 0) {
        nuevoEstado = 'APARTADO';
      }

      await tx.reserva.update({
        where: { id: data.reservaId },
        data: { 
          estado: nuevoEstado,
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
    if (result.reserva.eventoId) {
      revalidatePath(`/cliente/evento/${result.reserva.eventoId}`);
    }

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    console.error('Error al registrar abono:', error);
    return { success: false, error: 'No se pudo procesar el abono.' };
  }
}
