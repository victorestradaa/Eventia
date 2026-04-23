'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentProfile } from './authActions';
import { revalidatePath } from 'next/cache';

export async function getPortfolioItems(proveedorId?: string) {
  try {
    let targetProveedorId = proveedorId;

    if (!targetProveedorId) {
      const profile = await getCurrentProfile();
      if (!profile.success || !profile.data?.proveedor) {
        return { success: false, error: 'No autorizado o perfil no encontrado' };
      }
      targetProveedorId = profile.data.proveedor.id;
    }

    const items = await prisma.portfolioItem.findMany({
      where: { proveedorId: targetProveedorId },
      orderBy: { orden: 'asc' }
    });

    return { success: true, data: items };
  } catch (error: any) {
    console.error('Error al obtener portafolio:', error);
    return { success: false, error: error.message };
  }
}

export async function addPortfolioItem(data: {
  url: string;
  tipo?: string;
  titulo?: string;
  descripcion?: string;
  categoria?: string;
}) {
  try {
    const profile = await getCurrentProfile();
    if (!profile.success || !profile.data?.proveedor) {
      return { success: false, error: 'No autorizado' };
    }

    // Obtener el último orden para ponerlo al final
    const lastItem = await prisma.portfolioItem.findFirst({
      where: { proveedorId: profile.data.proveedor.id },
      orderBy: { orden: 'desc' }
    });

    const newItem = await prisma.portfolioItem.create({
      data: {
        proveedorId: profile.data.proveedor.id,
        url: data.url,
        tipo: data.tipo || 'IMAGE',
        titulo: data.titulo,
        descripcion: data.descripcion,
        categoria: data.categoria,
        orden: (lastItem?.orden ?? -1) + 1
      }
    });

    revalidatePath('/proveedor/portafolio');
    return { success: true, data: newItem };
  } catch (error: any) {
    console.error('Error al añadir item al portafolio:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePortfolioItem(id: string) {
  try {
    const profile = await getCurrentProfile();
    if (!profile.success || !profile.data?.proveedor) {
      return { success: false, error: 'No autorizado' };
    }

    await prisma.portfolioItem.delete({
      where: { 
        id,
        proveedorId: profile.data.proveedor.id // Seguridad
      }
    });

    revalidatePath('/proveedor/portafolio');
    return { success: true };
  } catch (error: any) {
    console.error('Error al eliminar item del portafolio:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePortfolioOrder(items: { id: string, orden: number }[]) {
  try {
    const profile = await getCurrentProfile();
    if (!profile.success || !profile.data?.proveedor) {
      return { success: false, error: 'No autorizado' };
    }

    await Promise.all(
      items.map(item => 
        prisma.portfolioItem.update({
          where: { id: item.id, proveedorId: profile.data.proveedor!.id },
          data: { orden: item.orden }
        })
      )
    );

    revalidatePath('/proveedor/portafolio');
    return { success: true };
  } catch (error: any) {
    console.error('Error al actualizar orden del portafolio:', error);
    return { success: false, error: error.message };
  }
}
