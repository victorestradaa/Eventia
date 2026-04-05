'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Actualizar el perfil público del proveedor.
 */
export async function updateProviderProfile(proveedorId: string, data: {
  nombre: string;
  descripcion?: string;
  ciudad: string;
  estado: string;
  direccion?: string;
  logoUrl?: string;
}) {
  try {
    const updated = await prisma.proveedor.update({
      where: { id: proveedorId },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        ciudad: data.ciudad,
        estado: data.estado,
        direccion: data.direccion || null,
        logoUrl: data.logoUrl || null,
      }
    });

    revalidatePath('/proveedor/configuracion');
    revalidatePath('/proveedor/dashboard');
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return { success: false, error: 'No se pudo actualizar el perfil.' };
  }
}

/**
 * Actualizar las credenciales de acceso (nombre de usuario y email).
 */
export async function updateProviderCredentials(usuarioId: string, data: {
  nombre: string;
  email: string;
}) {
  try {
    // Check if email is already taken by another user
    const existing = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== usuarioId) {
      return { success: false, error: 'Este correo electrónico ya está en uso por otra cuenta.' };
    }

    const updated = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        nombre: data.nombre,
        email: data.email,
      }
    });

    revalidatePath('/proveedor/configuracion');
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error) {
    console.error('Error al actualizar credenciales:', error);
    return { success: false, error: 'No se pudieron actualizar las credenciales.' };
  }
}

/**
 * Actualizar configuración de horarios de disponibilidad.
 */
export async function updateProviderAvailability(proveedorId: string, data: {
  permiteReservasPorHora: boolean;
  horarioApertura: string;
  horarioCierre: string;
}) {
  try {
    const updated = await prisma.proveedor.update({
      where: { id: proveedorId },
      data: {
        permiteReservasPorHora: data.permiteReservasPorHora,
        horarioApertura: data.horarioApertura,
        horarioCierre: data.horarioCierre,
      }
    });

    revalidatePath('/proveedor/configuracion');
    revalidatePath('/proveedor/calendario');
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error) {
    console.error('Error al actualizar disponibilidad:', error);
    return { success: false, error: 'No se pudo actualizar la configuración de disponibilidad.' };
  }
}
