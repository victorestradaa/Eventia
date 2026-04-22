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
    const servicios = await prisma.servicio.groupBy({
      by: ['categoria'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    const data = servicios.map(s => ({
      name: s.categoria.replace(/_/g, ' '),
      value: s._count.id
    }));

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching service stats:', error);
    return { success: false, data: [] };
  }
}

/**
 * Obtiene la distribución de servicios por Tipo de Evento
 * Analiza el array `tiposEventos` en los servicios
 */
export async function getServiceEventTypeStats() {
  try {
    const servicios = await prisma.servicio.findMany({
      select: { tiposEventos: true }
    });

    const counts: Record<string, number> = {};
    
    // Almacenar el conteo dado que tiposEventos es un array escalar (string[])
    servicios.forEach(s => {
      if (Array.isArray(s.tiposEventos)) {
        s.tiposEventos.forEach((tipo: string) => {
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
