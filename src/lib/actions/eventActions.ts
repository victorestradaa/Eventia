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
  tipoPersona?: string;
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
        // @ts-ignore
        tipoPersona: data.tipoPersona || null,
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
 * Actualiza el estado RSVP de un invitado.
 */
export async function updateInvitadoRSVP(id: string, rsvpEstado: 'CONFIRMADO' | 'PENDIENTE' | 'RECHAZADO') {
  try {
    const invitado = await prisma.invitado.update({
      where: { id },
      data: { rsvpEstado }
    });

    revalidatePath(`/cliente/evento/${invitado.eventoId}`);
    return { success: true, data: invitado };
  } catch (error) {
    console.error('Error al actualizar RSVP:', error);
    return { success: false, error: 'No se pudo actualizar el RSVP.' };
  }
}

/**
 * Actualiza la información general de un invitado.
 */
export async function updateInvitado(id: string, data: {
  nombre?: string;
  email?: string;
  telefono?: string;
  lado?: string;
  categoria?: string;
  tipoPersona?: string;
}) {
  try {
    const invitado = await prisma.invitado.update({
      where: { id },
      data: {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        lado: data.lado,
        categoria: data.categoria,
        // @ts-ignore
        tipoPersona: data.tipoPersona,
      }
    });

    revalidatePath(`/cliente/evento/${invitado.eventoId}`);
    return { success: true, data: invitado };
  } catch (error) {
    console.error('Error al actualizar invitado:', error);
    return { success: false, error: 'No se pudo actualizar la información del invitado.' };
  }
}

/**
 * Actualiza el tipo de persona/género de un invitado.
 */
export async function updateInvitadoTipo(id: string, tipoPersona: string) {
  try {
    const invitado = await prisma.invitado.update({
      where: { id },
      // @ts-ignore
      data: { tipoPersona }
    });

    revalidatePath(`/cliente/evento/${invitado.eventoId}`);
    return { success: true, data: invitado };
  } catch (error) {
    console.error('Error al actualizar tipo de persona:', error);
    return { success: false, error: 'No se pudo actualizar el tipo de persona.' };
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

/**
 * Obtiene los detalles de un invitado y su evento para la página de RSVP pública.
 */
export async function getInvitadoRSVPDetail(invitadoId: string) {
  try {
    const invitado = await prisma.invitado.findUnique({
      where: { rsvpToken: invitadoId },
      include: {
        evento: {
          include: {
            invitacion: true
          }
        }
      }
    });

    if (!invitado) {
      return { success: false, error: 'Invitado no encontrado.' };
    }

    return { 
      success: true, 
      invitado: { id: invitado.id, nombre: invitado.nombre },
      evento: { 
        id: invitado.evento.id, 
        nombre: invitado.evento.nombre, 
        fecha: invitado.evento.fecha,
        tipo: invitado.evento.tipo,
        invitacion: invitado.evento.invitacion
      }
    };
  } catch (error) {
    console.error('Error al obtener detalle de RSVP:', error);
    return { success: false, error: 'Hubo un error al cargar la invitación.' };
  }
}

/**
 * Obtiene o crea la invitación digital para un evento.
 */
export async function getOrCreateInvitacion(eventoId: string) {
  try {
    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
      include: { invitacion: true }
    });

    if (evento?.invitacion) {
      return { success: true, data: evento.invitacion };
    }

    // Si no existe, la creamos con valores por defecto basados en el tipo de evento
    let plantillaDefault = 'FIESTA';
    if (evento?.tipo === 'Boda') plantillaDefault = 'BODA';
    else if (evento?.tipo === 'XV Años') plantillaDefault = 'XV_ANOS';
    else if (evento?.tipo === 'Fiesta Infantil') plantillaDefault = 'INFANTIL';
    else if (evento?.tipo === 'Graduación') plantillaDefault = 'GRADUACION';
    else if (evento?.tipo === 'Bautizo') plantillaDefault = 'BAUTIZO';
    else plantillaDefault = 'FIESTA';

    const nuevaInvitacion = await prisma.invitacionDigital.create({
      data: {
        eventoId,
        plantilla: plantillaDefault,
        titulo: evento?.nombre || 'Invitación Especial',
      }
    });

    return { success: true, data: nuevaInvitacion };
  } catch (error) {
    console.error('Error al gestionar invitación digital:', error);
    return { success: false, error: 'No se pudo cargar la configuración de la invitación.' };
  }
}

/**
 * Actualiza la plantilla de la invitación digital.
 */
export async function updateInvitacionPlantilla(eventoId: string, plantillaRaw: string) {
  try {
    const plantilla = plantillaRaw.toUpperCase();
    
    // Verificamos si existe el evento para evitar errores de clave foránea
    const eventoExiste = await prisma.evento.findUnique({
      where: { id: eventoId },
      select: { id: true }
    });

    if (!eventoExiste) {
      return { success: false, error: `El evento con ID ${eventoId} no existe en la base de datos.` };
    }

    const invitacion = await prisma.invitacionDigital.upsert({
      where: { eventoId },
      update: { plantilla },
      create: { 
        eventoId, 
        plantilla,
        titulo: 'Invitación Especial'
      }
    });

    const resultToReturn = {
      id: invitacion.id,
      eventoId: invitacion.eventoId,
      plantilla: invitacion.plantilla,
      titulo: invitacion.titulo
    };

    try {
      revalidatePath(`/cliente/evento/${eventoId}`);
    } catch (revalidateError: any) {
      console.warn('RevalidatePath falló:', revalidateError.message);
    }

    return { success: true, data: resultToReturn };
  } catch (error: any) {
    console.error('Error crítico al actualizar plantilla:', error);
    // Retornamos el mensaje de error real para diagnosticar en producción
    return { 
      success: false, 
      error: `Error de base de datos: ${error.message || 'Desconocido'}. Por favor, contacta a soporte.`
    };
  }
}
