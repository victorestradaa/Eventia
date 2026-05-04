'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { addMonths } from 'date-fns';

/**
 * Acciones para el Administrador
 */

export async function getCupones() {
  try {
    const cupones = await prisma.cupon.findMany({
      orderBy: { creadoEn: 'desc' },
      include: { _count: { select: { usos: true } } }
    });
    return { success: true, data: cupones };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function crearCupon(data: {
  codigo: string;
  mesesGratis: number;
  maxUsos?: number;
  fechaExpira?: Date | null;
}) {
  try {
    const cupon = await prisma.cupon.create({
      data: {
        codigo: data.codigo.toUpperCase(),
        mesesGratis: data.mesesGratis,
        maxUsos: data.maxUsos,
        fechaExpira: data.fechaExpira,
        activo: true
      }
    });
    revalidatePath('/admin/cupones');
    return { success: true, data: cupon };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Ya existe un cupón con este código.' };
    }
    return { success: false, error: error.message };
  }
}

export async function eliminarCupon(id: string) {
  try {
    await prisma.cupon.delete({ where: { id } });
    revalidatePath('/admin/cupones');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function actualizarCupon(id: string, data: {
  codigo: string;
  mesesGratis: number;
  maxUsos?: number | null;
  fechaExpira?: Date | null;
  activo?: boolean;
}) {
  try {
    const cupon = await prisma.cupon.update({
      where: { id },
      data: {
        codigo: data.codigo.toUpperCase(),
        mesesGratis: data.mesesGratis,
        maxUsos: data.maxUsos ?? null,
        fechaExpira: data.fechaExpira ?? null,
        ...(data.activo !== undefined ? { activo: data.activo } : {}),
      },
    });
    revalidatePath('/admin/cupones');
    return { success: true, data: cupon };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Ya existe un cupón con este código.' };
    }
    return { success: false, error: error.message };
  }
}

/**
 * Acciones para el Proveedor
 */

export async function aplicarCupon(codigo: string, proveedorId: string) {
  try {
    // 1. Validar existencia y estado del cupón
    const cupon = await prisma.cupon.findUnique({
      where: { codigo: codigo.toUpperCase() },
      include: { usos: { where: { proveedorId } } }
    });

    if (!cupon) return { success: false, error: 'Cupón no válido.' };
    if (!cupon.activo) return { success: false, error: 'Este cupón ya no está activo.' };
    
    // 2. Validar fecha de expiración
    if (cupon.fechaExpira && new Date() > cupon.fechaExpira) {
      return { success: false, error: 'El cupón ha expirado.' };
    }

    // 3. Validar límite de usos totales
    if (cupon.maxUsos && cupon.usosActuales >= cupon.maxUsos) {
      return { success: false, error: 'Este cupón ha agotado sus usos disponibles.' };
    }

    // 4. Validar si el proveedor ya lo usó
    if (cupon.usos.length > 0) {
      return { success: false, error: 'Ya has utilizado este cupón anteriormente.' };
    }

    // 5. Aplicar beneficio al proveedor
    const proveedor = await prisma.proveedor.findUnique({
      where: { id: proveedorId }
    });

    if (!proveedor) return { success: false, error: 'Proveedor no encontrado.' };

    // Calcular nueva fecha de expiración
    let nuevaFecha: Date;
    const fechaBase = (proveedor.planExpira && new Date(proveedor.planExpira) > new Date()) 
      ? new Date(proveedor.planExpira) 
      : new Date();
    
    nuevaFecha = addMonths(fechaBase, cupon.mesesGratis);

    // Ejecutar en transacción para asegurar consistencia
    await prisma.$transaction([
      // Registrar uso
      prisma.usoCupon.create({
        data: {
          cuponId: cupon.id,
          proveedorId: proveedor.id
        }
      }),
      // Incrementar contador del cupón
      prisma.cupon.update({
        where: { id: cupon.id },
        data: { usosActuales: { increment: 1 } }
      }),
      // Actualizar proveedor
      prisma.proveedor.update({
        where: { id: proveedor.id },
        data: { planExpira: nuevaFecha }
      })
    ]);

    revalidatePath('/proveedor/planes');
    return { 
      success: true, 
      message: `¡Éxito! Se han añadido ${cupon.mesesGratis} meses gratis a tu plan.`,
      nuevaFecha 
    };

  } catch (error: any) {
    return { success: false, error: 'Ocurrió un error al aplicar el cupón: ' + error.message };
  }
}
