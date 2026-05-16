'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Cancela la suscripción de un proveedor. El plan sigue activo hasta planExpira.
 * Después de esa fecha, se debería revertir a GRATIS (cron o check on-access).
 */
export async function cancelarSuscripcionProveedor(proveedorId: string) {
  try {
    const proveedor = await prisma.proveedor.findUnique({
      where: { id: proveedorId },
      select: { plan: true, planExpira: true },
    });
    if (!proveedor) return { success: false, error: 'Proveedor no encontrado.' };
    if (proveedor.plan === 'GRATIS') return { success: false, error: 'No tienes una suscripción activa para cancelar.' };

    await prisma.proveedor.update({
      where: { id: proveedorId },
      data: { planCancelado: true },
    });
    revalidatePath('/proveedor/planes');
    return { success: true, planExpira: proveedor.planExpira };
  } catch (error: any) {
    console.error('Error cancelando suscripción de proveedor:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function reactivarSuscripcionProveedor(proveedorId: string) {
  try {
    await prisma.proveedor.update({
      where: { id: proveedorId },
      data: { planCancelado: false },
    });
    revalidatePath('/proveedor/planes');
    return { success: true };
  } catch (error: any) {
    console.error('Error reactivando suscripción de proveedor:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function cancelarSuscripcionCliente(clienteId: string) {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { plan: true, planExpira: true },
    });
    if (!cliente) return { success: false, error: 'Cliente no encontrado.' };
    if (cliente.plan === 'FREE') return { success: false, error: 'No tienes una suscripción activa para cancelar.' };

    await prisma.cliente.update({
      where: { id: clienteId },
      data: { planCancelado: true },
    });
    revalidatePath('/cliente/planes');
    return { success: true, planExpira: cliente.planExpira };
  } catch (error: any) {
    console.error('Error cancelando suscripción de cliente:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function reactivarSuscripcionCliente(clienteId: string) {
  try {
    await prisma.cliente.update({
      where: { id: clienteId },
      data: { planCancelado: false },
    });
    revalidatePath('/cliente/planes');
    return { success: true };
  } catch (error: any) {
    console.error('Error reactivando suscripción de cliente:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}
