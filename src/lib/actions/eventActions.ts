'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Obtiene los eventos de un cliente específico.
 * En una fase posterior, esto se integrará con el usuario autenticado.
 */
export async function getEventosCliente(clienteId: string) {
  try {
    const eventos = await prisma.evento.findMany({
      where: { clienteId },
      orderBy: { creadoEn: 'desc' },
      include: {
        _count: {
          select: { invitados: true }
        },
        lineasPresupuesto: {
          include: { pagos: true }
        },
        reservas: {
          where: { estado: { not: 'CANCELADO' } },
          include: {
            servicio: true,
            proveedor: true,
            transacciones: true
          }
        }
      }
    });

    return { success: true, data: eventos };
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return { success: false, error: 'No se pudieron cargar los eventos.' };
  }
}

/**
 * Crea un nuevo evento en la base de datos.
 */
export async function createEvento(formData: {
  clienteId: string;
  nombre: string;
  tipo: string;
  fecha?: string;
  presupuesto?: number;
  invitados?: number;
}) {
  try {
    const nuevoEvento = await prisma.evento.create({
      data: {
        clienteId: formData.clienteId,
        nombre: formData.nombre,
        tipo: formData.tipo,
        fecha: formData.fecha ? new Date(formData.fecha) : null,
        presupuestoTotal: formData.presupuesto || 0,
        numInvitados: formData.invitados || 0,
      }
    });

    revalidatePath('/cliente/dashboard');
    return { success: true, data: nuevoEvento };
  } catch (error) {
    console.error('Error al crear evento:', error);
    return { success: false, error: 'Hubo un error al crear el evento.' };
  }
}

/**
 * Actualiza los datos de un evento existente.
 */
export async function updateEvento(id: string, data: any) {
  try {
    const eventoActualizado = await prisma.evento.update({
      where: { id },
      data: {
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : undefined,
      }
    });

    revalidatePath(`/cliente/dashboard`);
    revalidatePath(`/cliente/evento/${id}`);
    return { success: true, data: eventoActualizado };
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    return { success: false, error: 'No se pudo actualizar el evento.' };
  }
}
/**
 * Agrega un nuevo invitado a un evento.
 */
export async function addInvitado(data: {
  eventoId: string;
  nombre: string;
  email?: string;
  telefono?: string;
  lado?: string;
  categoria?: string;
}) {
  try {
    const nuevoInvitado = await prisma.invitado.create({
      data: {
        eventoId: data.eventoId,
        nombre: data.nombre,
        email: data.email || null,
        telefono: data.telefono || null,
        lado: data.lado || null,
        categoria: data.categoria || null,
      }
    });

    revalidatePath(`/cliente/evento/${data.eventoId}`);
    return { success: true, data: nuevoInvitado };
  } catch (error) {
    console.error('Error al agregar invitado:', error);
    return { success: false, error: 'No se pudo agregar al invitado.' };
  }
}
/**
 * Obtiene los invitados de un evento específico.
 */
export async function getInvitadosByEvento(eventoId: string) {
  try {
    const invitados = await prisma.invitado.findMany({
      where: { eventoId },
      orderBy: { nombre: 'asc' }
    });
    return { success: true, data: invitados };
  } catch (error) {
    console.error('Error al obtener invitados:', error);
    return { success: false, error: 'No se pudieron cargar los invitados.' };
  }
}

/**
 * Guarda la disposición de mesas de un evento.
 */
export async function savePlanoMesas(eventoId: string, layout: any) {
  try {
    const upserted = await prisma.disposicionMesa.upsert({
      where: { eventoId },
      update: { layout },
      create: { eventoId, layout }
    });
    revalidatePath(`/cliente/evento/${eventoId}/mesas`);
    return { success: true, data: upserted };
  } catch (error) {
    console.error('Error al guardar plano de mesas:', error);
    return { success: false, error: 'No se pudo guardar el diseño del plano.' };
  }
}

/**
 * Obtiene la disposición de mesas de un evento.
 */
export async function getPlanoMesas(eventoId: string) {
  try {
    const plano = await prisma.disposicionMesa.findUnique({
      where: { eventoId }
    });
    return { success: true, data: plano };
  } catch (error) {
    console.error('Error al obtener plano de mesas:', error);
    return { success: false, error: 'No se pudo cargar el diseño del plano.' };
  }
}
