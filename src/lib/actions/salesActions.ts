'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verificarDisponibilidadServicio } from '@/lib/actions/providerActions';

/**
 * Obtener todas las reservas (Ventas) de un proveedor con sus transacciones y cliente.
 */
export async function getProviderSales(proveedorId: string) {
  try {
    const ventas = await prisma.reserva.findMany({
      where: { proveedorId },
      include: {
        cliente: {
          include: { usuario: true }
        },
        servicio: true,
        evento: true,
        transacciones: {
          orderBy: { creadoEn: 'desc' }
        }
      },
      orderBy: { creadoEn: 'desc' }
    });
    
    // Serializar Decimales para que Client Components no tiren error
    return { success: true, data: JSON.parse(JSON.stringify(ventas)) };
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return { success: false, error: 'No se pudieron obtener las ventas.' };
  }
}

/**
 * Registrar una nueva transacción (Abono, Anticipo o Penalidad)
 */
export async function addTransaction(data: {
  reservaId: string;
  monto: number;
  tipo: string; // 'ANTICIPO', 'ABONO', 'PENALIZACION'
  metodoPago: string; // 'EFECTIVO', 'TRANSFERENCIA', 'TARJETA', etc.
  estado: string; // 'PAGADO', 'PENDIENTE'
  fechaVencimiento?: Date | null;
  notas?: string;
}) {
  try {
    await prisma.transaccion.create({
      data: {
        reservaId: data.reservaId,
        monto: data.monto,
        tipo: data.tipo,
        metodoPago: data.metodoPago,
        estado: data.estado,
        fechaVencimiento: data.fechaVencimiento,
        fechaPago: data.estado === 'PAGADO' ? new Date() : null,
        notas: data.notas,
      }
    });

    revalidatePath('/proveedor/ventas');
    return { success: true };
  } catch (error) {
    console.error('Error al registrar transacción:', error);
    return { success: false, error: 'Ocurrió un error al guardar la transacción.' };
  }
}

/**
 * Pagar una transacción pendiente
 */
export async function payTransaction(transaccionId: string, metodoPago: string) {
  try {
    await prisma.transaccion.update({
      where: { id: transaccionId },
      data: {
        estado: 'PAGADO',
        metodoPago: metodoPago,
        fechaPago: new Date()
      }
    });

    revalidatePath('/proveedor/ventas');
    return { success: true };
  } catch (error) {
    console.error('Error al procesar pago:', error);
    return { success: false, error: 'No se pudo procesar el pago.' };
  }
}

/**
 * Cambiar el estado de la Venta (Reserva)
 */
export async function updateReservaStatus(reservaId: string, nuevoEstado: 'TEMPORAL' | 'APARTADO' | 'LIQUIDADO' | 'CANCELADO') {
  try {
    await prisma.reserva.update({
      where: { id: reservaId },
      data: { estado: nuevoEstado }
    });

    revalidatePath('/proveedor/ventas');
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return { success: false, error: 'No se pudo cambiar el estado de la venta.' };
  }
}

/**
 * Reprogramar la fecha del evento y opcionalmente crear una penalización
 */
export async function rescheduleReserva(reservaId: string, nuevaFecha: Date, penalizacionMonto?: number, penalizacionNotas?: string) {
  try {
    // Usar transacción SQL para asegurar consistencia
    await prisma.$transaction(async (tx: any) => {
      // 1. Cambiar fecha
      await tx.reserva.update({
        where: { id: reservaId },
        data: { fechaEvento: nuevaFecha }
      });

      // 2. Si hay penalidad, registrarla como "PENDIENTE" (Deuda)
      if (penalizacionMonto && penalizacionMonto > 0) {
        await tx.transaccion.create({
          data: {
            reservaId: reservaId,
            monto: penalizacionMonto,
            tipo: 'PENALIZACION',
            metodoPago: 'N/A',
            estado: 'PENDIENTE',
            notas: penalizacionNotas || 'Penalización por cambio de fecha'
          }
        });
      }
    });

    revalidatePath('/proveedor/ventas');
    return { success: true };
  } catch (error) {
    console.error('Error al reprogramar fecha:', error);
    return { success: false, error: 'No se pudo reprogramar la venta.' };
  }
}

/**
 * Crear una reserva manual (venta fuera de la app) — Exclusivo Plan ELITE.
 * Verifica que el proveedor tenga plan ELITE antes de ejecutar.
 */
export async function createManualReserva(data: {
  proveedorId: string;
  servicioId: string;
  nombreCliente: string;
  telefonoCliente?: string;
  fechaEvento: Date;
  montoTotal: number;
  notas?: string;
  anticipoMonto?: number;
  anticipoMetodo?: string;
  tipoReserva?: 'DIA_COMPLETO' | 'POR_HORAS';
  horaInicio?: string;
  horaFin?: string;
}) {
  try {
    // Verificar que el proveedor tiene plan ELITE
    const proveedor = await prisma.proveedor.findUnique({
      where: { id: data.proveedorId },
      select: { plan: true }
    });

    if (!proveedor || proveedor.plan !== 'ELITE') {
      return { success: false, error: 'Esta función es exclusiva del Plan Elite.' };
    }

    // Verificar disponibilidad antes de reservar
    const bloqueOpcional = data.tipoReserva === 'POR_HORAS' && data.horaInicio && data.horaFin 
      ? `${data.horaInicio}-${data.horaFin}` 
      : undefined;
      
    const disp = await verificarDisponibilidadServicio(data.servicioId, data.fechaEvento, bloqueOpcional);
    if (!disp.success || !disp.disponible) {
      return { success: false, error: 'La capacidad para este día o turno ya ha sido alcanzada.' };
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Crear la reserva manual
      const reserva = await tx.reserva.create({
        data: {
          proveedorId: data.proveedorId,
          servicioId: data.servicioId,
          fechaEvento: data.fechaEvento,
          tipoReserva: data.tipoReserva || 'DIA_COMPLETO',
          horaInicio: data.horaInicio || null,
          horaFin: data.horaFin || null,
          montoTotal: data.montoTotal,
          estado: data.anticipoMonto && data.anticipoMonto > 0 ? 'APARTADO' : 'TEMPORAL',
          notas: data.notas,
          esManual: true,
          nombreClienteExterno: data.nombreCliente,
          telefonoClienteExterno: data.telefonoCliente || null,
          montoAnticipo: data.anticipoMonto || 0,
          montoComision: 0, // 0% comisión para Plan Elite
        }
      });

      // 2. Si hay anticipo, registrar la transacción
      if (data.anticipoMonto && data.anticipoMonto > 0) {
        await tx.transaccion.create({
          data: {
            reservaId: reserva.id,
            monto: data.anticipoMonto,
            tipo: 'ANTICIPO',
            metodoPago: data.anticipoMetodo || 'EFECTIVO',
            estado: 'PAGADO',
            fechaPago: new Date(),
            notas: 'Anticipo registrado en venta manual',
          }
        });
      }

      return reserva;
    });

    revalidatePath('/proveedor/ventas');
    revalidatePath('/proveedor/calendario');

    // Retornar la reserva creada con datos serializados
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    console.error('Error al crear reserva manual:', error);
    return { success: false, error: 'No se pudo crear la venta manual.' };
  }
}
