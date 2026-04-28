'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getPlanConfigs() {
  try {
    const configs = await prisma.planConfig.findMany({
      orderBy: { rol: 'asc' }
    });
    return { success: true, data: configs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePlanConfig(data: {
  planId: string;
  nombre: string;
  precioNormal: number;
  precioPromo?: number;
  promoDesde?: Date | null;
  promoHasta?: Date | null;
  comision?: number;
  rol: 'CLIENTE' | 'PROVEEDOR';
}) {
  try {
    const config = await prisma.planConfig.upsert({
      where: { planId: data.planId },
      update: {
        nombre: data.nombre,
        precioNormal: data.precioNormal,
        precioPromo: data.precioPromo,
        promoDesde: data.promoDesde,
        promoHasta: data.promoHasta,
        comision: data.comision,
        rol: data.rol
      },
      create: {
        planId: data.planId,
        nombre: data.nombre,
        precioNormal: data.precioNormal,
        precioPromo: data.precioPromo,
        promoDesde: data.promoDesde,
        promoHasta: data.promoHasta,
        comision: data.comision,
        rol: data.rol
      }
    });

    revalidatePath('/admin/planes');
    return { success: true, data: config };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Inicializa los planes con los valores actuales si no existen
 */
export async function seedPlanConfigs() {
  const planes = [
    // Proveedores
    { planId: 'DESTACADO', nombre: 'Plan Destacado', precioNormal: 299, precioPromo: 99, comision: 7, rol: 'PROVEEDOR' },
    { planId: 'PRO', nombre: 'Plan PRO', precioNormal: 799, precioPromo: 399, comision: 4, rol: 'PROVEEDOR' },
    { planId: 'ELITE', nombre: 'Plan Elite', precioNormal: 1499, precioPromo: 999, comision: 0, rol: 'PROVEEDOR' },
    // Clientes
    { planId: 'ORO', nombre: 'Plan Oro', precioNormal: 99, precioPromo: 99, rol: 'CLIENTE' },
    { planId: 'PLANNER', nombre: 'Plan Planner', precioNormal: 299, precioPromo: 299, rol: 'CLIENTE' },
  ];

  for (const p of planes) {
    await prisma.planConfig.upsert({
      where: { planId: p.planId },
      update: {},
      create: {
        planId: p.planId,
        nombre: p.nombre,
        precioNormal: p.precioNormal,
        precioPromo: p.precioPromo,
        comision: (p as any).comision,
        rol: p.rol as any
      }
    });
  }
}
