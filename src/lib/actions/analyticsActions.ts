'use server';

import { prisma } from '@/lib/prisma';
import { serializePrisma } from '@/lib/utils';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

/**
 * Obtiene analíticas de tendencia de registro de usuarios (últimos 30 días)
 */
export async function getUserTrends() {
  try {
    const end = startOfDay(new Date());
    const start = subDays(end, 29); // Útimos 30 días

    const usuarios = await prisma.usuario.findMany({
      where: { creadoEn: { gte: start } },
      select: { creadoEn: true, rol: true }
    });

    // Crear un mapa con los ultimos 30 dias a 0
    const valMap = new Map<string, { name: string, CLIENTE: number, PROVEEDOR: number }>();
    eachDayOfInterval({ start, end }).forEach(date => {
      const formattedDate = format(date, 'MMM dd');
      valMap.set(formattedDate, { name: formattedDate, CLIENTE: 0, PROVEEDOR: 0 });
    });

    // Poblar el mapa
    usuarios.forEach(u => {
      const day = format(u.creadoEn, 'MMM dd');
      if (valMap.has(day)) {
        const current = valMap.get(day)!;
        if (u.rol === 'CLIENTE') current.CLIENTE += 1;
        if (u.rol === 'PROVEEDOR') current.PROVEEDOR += 1;
      }
    });

    return { success: true, data: Array.from(valMap.values()) };
  } catch (error) {
    console.error('Error fetching user trends:', error);
    return { success: false, data: [] };
  }
}

/**
 * Obtiene analíticas de creación de eventos (últimos 30 días)
 */
export async function getEventTrends() {
  try {
    const end = startOfDay(new Date());
    const start = subDays(end, 29);

    const eventos = await prisma.evento.findMany({
      where: { creadoEn: { gte: start } },
      select: { creadoEn: true }
    });

    const valMap = new Map<string, { name: string, Eventos: number }>();
    eachDayOfInterval({ start, end }).forEach(date => {
      const formattedDate = format(date, 'MMM dd');
      valMap.set(formattedDate, { name: formattedDate, Eventos: 0 });
    });

    eventos.forEach(e => {
      const day = format(e.creadoEn, 'MMM dd');
      if (valMap.has(day)) {
        valMap.get(day)!.Eventos += 1;
      }
    });

    return { success: true, data: Array.from(valMap.values()) };
  } catch (error) {
    console.error('Error fetching event trends:', error);
    return { success: false, data: [] };
  }
}

/**
 * Obtiene la distribución de servicios por categoría
 */
export async function getServiceCategoryStats() {
  try {
    // Agrupamos proveedores por categoría y sumamos sus servicios
    const stats = await prisma.proveedor.findMany({
      select: {
        categoria: true,
        _count: {
          select: { servicios: true }
        }
      }
    });

    // Agrupar los resultados por categoría (ya que findMany trae cada proveedor)
    const categoryMap: Record<string, number> = {};
    stats.forEach(s => {
      const cat = s.categoria;
      categoryMap[cat] = (categoryMap[cat] || 0) + s._count.servicios;
    });

    const data = Object.entries(categoryMap).map(([key, value]) => ({
      name: key.replace(/_/g, ' '),
      value: value
    })).sort((a, b) => b.value - a.value);

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching service stats:', error);
    return { success: false, data: [] };
  }
}

/**
 * Obtiene la distribución de servicios por Tipo de Evento
 * Analiza el array `etiquetasEvento` en los servicios
 */
export async function getServiceEventTypeStats() {
  try {
    const servicios = await prisma.servicio.findMany({
      select: { etiquetasEvento: true }
    });

    const counts: Record<string, number> = {};
    
    // Almacenar el conteo dado que etiquetasEvento es un array de Enum (string[])
    servicios.forEach(s => {
      if (Array.isArray(s.etiquetasEvento)) {
        s.etiquetasEvento.forEach((tipo: string) => {
          counts[tipo] = (counts[tipo] || 0) + 1;
        });
      }
    });

    const data = Object.keys(counts)
      .map(key => ({
        name: key.replace(/_/g, ' '),
        value: counts[key]
      }))
      .sort((a, b) => b.value - a.value) // Sort desc
      .slice(0, 7); // Top 7

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching event type stats:', error);
    return { success: false, data: [] };
  }
}
