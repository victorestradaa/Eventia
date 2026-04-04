'use server';

import { prisma } from '@/lib/prisma';

/**
 * Obtiene las métricas globales de la plataforma para el administrador.
 */
export async function getPlatformStats() {
  try {
    const [totalUsuarios, totalEventos, totalProveedores, totalIngresos] = await Promise.all([
      prisma.usuario.count(),
      prisma.evento.count(),
      prisma.proveedor.count(),
      prisma.reserva.aggregate({
        where: { estado: 'LIQUIDADO' },
        _sum: { montoTotal: true }
      })
    ]);

    // Calcular crecimiento (simulado o basado en fechas si tuviéramos histórico mensual)
    return {
      success: true,
      data: {
        totalUsuarios,
        totalEventos,
        totalProveedores,
        totalIngresos: totalIngresos._sum.montoTotal || 0,
      }
    };
  } catch (error) {
    console.error('Error al obtener stats de plataforma:', error);
    return { success: false, error: 'No se pudieron cargar las métricas.' };
  }
}

/**
 * Obtiene la lista global de eventos para monitoreo.
 */
export async function getGlobalEventos() {
  try {
    const eventos = await prisma.evento.findMany({
      include: {
        cliente: { include: { usuario: true } },
        _count: { select: { invitados: true } }
      },
      orderBy: { creadoEn: 'desc' },
      take: 50
    });
    return { success: true, data: eventos };
  } catch (error) {
    console.error('Error al obtener eventos globales:', error);
    return { success: false, error: 'Error del servidor' };
  }
}
