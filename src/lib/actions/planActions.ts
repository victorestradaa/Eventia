'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getPlanConfigs() {
  try {
    if (!(prisma as any).planConfig) {
      throw new Error('El modelo PlanConfig no existe en el cliente de Prisma. Por favor, ejecuta "npx prisma generate" y reinicia el servidor.');
    }
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
    if (!(prisma as any).planConfig) {
      throw new Error('El modelo PlanConfig no existe en el cliente de Prisma.');
    }
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
  if (!(prisma as any).planConfig) {
    throw new Error('El modelo PlanConfig no existe en el cliente de Prisma.');
  }
  const planes = [
    // Proveedores — 3 planes activos, todos 0% comisión
    { planId: 'EMPRENDEDOR', nombre: 'Plan Emprendedor', precioNormal: 0, precioPromo: null, comision: 0, rol: 'PROVEEDOR' },
    { planId: 'DESTACADO',   nombre: 'Plan Destacado',   precioNormal: 299, precioPromo: 99, comision: 0, rol: 'PROVEEDOR' },
    { planId: 'ELITE',       nombre: 'Plan Elite',       precioNormal: 1499, precioPromo: 999, comision: 0, rol: 'PROVEEDOR' },
    // Clientes
    { planId: 'ORO',     nombre: 'Plan Oro',     precioNormal: 99,  precioPromo: 99,  rol: 'CLIENTE' },
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

/**
 * Asegura que el plan Emprendedor existe en el PlanConfig.
 * Se llama al cargar la página de admin para que aparezca en instalaciones
 * que se sembraron antes de añadirlo al seed.
 */
export async function ensurePlanesActuales() {
  if (!(prisma as any).planConfig) return;
  try {
    await prisma.planConfig.upsert({
      where: { planId: 'EMPRENDEDOR' },
      update: {},
      create: {
        planId: 'EMPRENDEDOR',
        nombre: 'Plan Emprendedor',
        precioNormal: 0,
        precioPromo: null,
        comision: 0,
        rol: 'PROVEEDOR' as any,
      },
    });
  } catch (error: any) {
    console.error('Error asegurando Plan Emprendedor:', error);
  }
}
