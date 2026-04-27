'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { serializePrisma } from '@/lib/utils';

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
  comprobanteUrl?: string;
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
            comprobanteUrl: data.comprobanteUrl || null,
            notas: data.notas || (data.esCliente ? 'Abono realizado por el cliente' : 'Abono registrado por el proveedor')
          }
        });
      }

      // Si la transacción sigue siendo PENDIENTE (un nuevo pagaré o abono por confirmar), no actualizamos totales aún
      if (!esPagado) {
         // Si es una línea de presupuesto, registrar el Pago PENDIENTE
         if (reserva.eventoId && reserva.servicioId) {
            const linea = await tx.lineaPresupuesto.findFirst({
              where: { eventoId: reserva.eventoId, servicioId: reserva.servicioId }
            });
            if (linea) {
              await tx.pago.create({
                data: {
                  lineaId: linea.id,
                  monto: data.monto,
                  estado: 'PENDIENTE',
                  metodoPago: data.metodoPago,
                  comprobanteUrl: data.comprobanteUrl || null,
                  nota: data.notas || `Abono pendiente a ${reserva.servicio.nombre}`
                }
              });
            }
         }
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
              estado: 'APROBADO',
              metodoPago: data.metodoPago,
              comprobanteUrl: data.comprobanteUrl || null,
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
    return serializePrisma(responsePayload);

  } catch (error: any) {
    console.error('[registrarAbono] ERROR:', error);
    // Asegurar que el error también sea un objeto plano simple
    return serializePrisma({ 
      success: false, 
      error: error?.message || 'Error interno al procesar el abono.' 
    });
  }
}

/**
 * Aprueba un pago pendiente realizado por transferencia.
 */
export async function aprobarPago(pagoId: string) {
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const pago = await tx.pago.findUnique({
        where: { id: pagoId },
        include: { 
          linea: true
        }
      });

      if (!pago || pago.estado !== 'PENDIENTE') {
        throw new Error('Pago no encontrado o ya procesado');
      }

      // 1. Marcar pago como APROBADO
      await tx.pago.update({
        where: { id: pagoId },
        data: { estado: 'APROBADO' }
      });

      // 2. Incrementar montoPagado en LineaPresupuesto
      await tx.lineaPresupuesto.update({
        where: { id: pago.lineaId },
        data: {
          montoPagado: { increment: pago.monto }
        }
      });

      // 3. Buscar la transacción correspondiente y aprobarla
      const linea = pago.linea;
      if (linea.servicioId) {
        const reserva = await tx.reserva.findFirst({
           where: { 
             eventoId: linea.eventoId, 
             servicioId: linea.servicioId,
             estado: { not: 'CANCELADO' }
           }
        });

        if (reserva) {
          // Buscar transacción PENDIENTE con mismo monto
          const transaccion = await tx.transaccion.findFirst({
            where: { 
              reservaId: reserva.id, 
              estado: 'PENDIENTE', 
              monto: pago.monto 
            },
            orderBy: { creadoEn: 'desc' }
          });

          if (transaccion) {
            await tx.transaccion.update({
              where: { id: transaccion.id },
              data: { estado: 'PAGADO', fechaPago: new Date() }
            });
          }

          // Recalcular estado de la reserva
          const todasLasTransacciones = await tx.transaccion.findMany({
            where: { reservaId: reserva.id, estado: 'PAGADO' }
          });
          const totalPagado = todasLasTransacciones.reduce((sum: number, t: any) => sum + Number(t.monto), 0);

          let nuevoEstadoReserva = reserva.estado;
          if (totalPagado >= Number(reserva.montoTotal)) {
            nuevoEstadoReserva = 'LIQUIDADO';
          } else if (reserva.estado === 'TEMPORAL' && totalPagado > 0) {
            nuevoEstadoReserva = 'APARTADO';
          }

          await tx.reserva.update({
            where: { id: reserva.id },
            data: { 
              estado: nuevoEstadoReserva,
              montoAnticipo: totalPagado > 0 ? totalPagado : reserva.montoAnticipo
            }
          });
        }
      }

      return pago;
    });

    revalidatePath('/proveedor/ventas');
    return { success: true, data: serializePrisma(result) };
  } catch (error: any) {
    console.error('Error aprobando pago:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Rechaza un pago pendiente.
 */
export async function rechazarPago(pagoId: string, motivo: string) {
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const pago = await tx.pago.findUnique({
        where: { id: pagoId },
        include: { linea: true }
      });

      if (!pago || pago.estado !== 'PENDIENTE') {
        throw new Error('Pago no encontrado o ya procesado');
      }

      await tx.pago.update({
        where: { id: pagoId },
        data: { 
          estado: 'RECHAZADO',
          nota: `${pago.nota || ''} - RECHAZADO: ${motivo}`.trim()
        }
      });

      // También rechazar la transacción vinculada
      if (pago.linea.servicioId) {
        const reserva = await tx.reserva.findFirst({
           where: { eventoId: pago.linea.eventoId, servicioId: pago.linea.servicioId }
        });

        if (reserva) {
          const transaccion = await tx.transaccion.findFirst({
            where: { reservaId: reserva.id, estado: 'PENDIENTE', monto: pago.monto },
            orderBy: { creadoEn: 'desc' }
          });

          if (transaccion) {
            await tx.transaccion.update({
              where: { id: transaccion.id },
              data: { 
                estado: 'RECHAZADO',
                notas: `${transaccion.notas || ''} - RECHAZADO: ${motivo}`.trim()
              }
            });
          }
        }
      }

      return true;
    });

    revalidatePath('/proveedor/ventas');
    return { success: true };
  } catch (error: any) {
    console.error('Error rechazando pago:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Aprueba una transacción pendiente (visto desde el proveedor).
 */
export async function aprobarTransaccion(transaccionId: string) {
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const transaccion = await tx.transaccion.findUnique({
        where: { id: transaccionId },
        include: { reserva: true }
      });

      if (!transaccion || transaccion.estado !== 'PENDIENTE') {
        throw new Error('Transacción no encontrada o ya procesada');
      }

      // 1. Aprobar transacción
      const updatedTx = await tx.transaccion.update({
        where: { id: transaccionId },
        data: { estado: 'PAGADO', fechaPago: new Date() }
      });

      // 2. Buscar el Pago vinculado y aprobarlo
      const reserva = transaccion.reserva;
      if (reserva.eventoId && reserva.servicioId) {
        const linea = await tx.lineaPresupuesto.findFirst({
           where: { eventoId: reserva.eventoId, servicioId: reserva.servicioId }
        });

        if (linea) {
          const pago = await tx.pago.findFirst({
             where: { lineaId: linea.id, estado: 'PENDIENTE', monto: transaccion.monto },
             orderBy: { fecha: 'desc' }
          });

          if (pago) {
            await tx.pago.update({
              where: { id: pago.id },
              data: { estado: 'APROBADO' }
            });

            await tx.lineaPresupuesto.update({
              where: { id: linea.id },
              data: { montoPagado: { increment: transaccion.monto } }
            });
          }
        }
      }

      // 3. Recalcular estado de la reserva
      const todasLasTransacciones = await tx.transaccion.findMany({
        where: { reservaId: transaccion.reservaId, estado: 'PAGADO' }
      });
      const totalPagado = todasLasTransacciones.reduce((sum: number, t: any) => sum + Number(t.monto), 0);

      let nuevoEstadoReserva = reserva.estado;
      if (totalPagado >= Number(reserva.montoTotal)) {
        nuevoEstadoReserva = 'LIQUIDADO';
      } else if (reserva.estado === 'TEMPORAL' && totalPagado > 0) {
        nuevoEstadoReserva = 'APARTADO';
      }

      const updatedReserva = await tx.reserva.update({
        where: { id: reserva.id },
        data: { 
          estado: nuevoEstadoReserva,
          montoAnticipo: totalPagado > 0 ? totalPagado : reserva.montoAnticipo
        },
        include: { transacciones: { orderBy: { creadoEn: 'asc' } }, cliente: { include: { usuario: true } }, servicio: true, evento: true }
      });

      return updatedReserva;
    });

    revalidatePath('/proveedor/ventas');
    return { success: true, data: serializePrisma(result) };
  } catch (error: any) {
    console.error('Error aprobando transacción:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Rechaza una transacción pendiente.
 */
export async function rechazarTransaccion(transaccionId: string, motivo: string) {
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const transaccion = await tx.transaccion.findUnique({
        where: { id: transaccionId },
        include: { reserva: true }
      });

      if (!transaccion || transaccion.estado !== 'PENDIENTE') {
        throw new Error('Transacción no encontrada o ya procesada');
      }

      await tx.transaccion.update({
        where: { id: transaccionId },
        data: { 
          estado: 'RECHAZADO',
          notas: `${transaccion.notas || ''} - RECHAZADO: ${motivo}`.trim()
        }
      });

      // También rechazar el Pago vinculado
      const reserva = transaccion.reserva;
      if (reserva.eventoId && reserva.servicioId) {
        const linea = await tx.lineaPresupuesto.findFirst({
           where: { eventoId: reserva.eventoId, servicioId: reserva.servicioId }
        });

        if (linea) {
          const pago = await tx.pago.findFirst({
             where: { lineaId: linea.id, estado: 'PENDIENTE', monto: transaccion.monto },
             orderBy: { fecha: 'desc' }
          });

          if (pago) {
            await tx.pago.update({
              where: { id: pago.id },
              data: { 
                estado: 'RECHAZADO',
                nota: `${pago.nota || ''} - RECHAZADO: ${motivo}`.trim()
              }
            });
          }
        }
      }

      const updatedReserva = await tx.reserva.findUnique({
        where: { id: transaccion.reservaId },
        include: { transacciones: { orderBy: { creadoEn: 'asc' } }, cliente: { include: { usuario: true } }, servicio: true, evento: true }
      });

      return updatedReserva;
    });

    revalidatePath('/proveedor/ventas');
    return { success: true, data: serializePrisma(result) };
  } catch (error: any) {
    console.error('Error rechazando transacción:', error);
    return { success: false, error: error.message };
  }
}

