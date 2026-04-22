'use server';

import { prisma } from '@/lib/prisma';
import { serializePrisma } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const BUCKET_NAME = 'servicios';
const FOLDER_NAME = 'catalogo';

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
      data: serializePrisma({
        totalUsuarios,
        totalEventos,
        totalProveedores,
        totalIngresos: totalIngresos._sum.montoTotal || 0,
      })
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
    return { success: true, data: serializePrisma(eventos) };
  } catch (error) {
    console.error('Error al obtener eventos globales:', error);
    return { success: false, error: 'Error del servidor' };
  }
}

export async function getCatalogoAssets(tipo?: string, categoria?: string) {
  try {
    const where: any = {};
    if (tipo) where.tipo = tipo;
    if (categoria && categoria !== 'TODAS') where.categoria = categoria;
    
    const assets = await prisma.catalogoAsset.findMany({
      where,
      orderBy: { creadoEn: 'desc' }
    });
    return { success: true, data: assets };
  } catch (error) {
    console.error('Error fetching catalog assets', error);
    return { success: false, error: 'Error fetching catalog assets' };
  }
}

export async function createCatalogoAsset(formData: FormData) {
  try {
    const tipo = formData.get('tipo') as string;
    const categoria = formData.get('categoria') as string;
    const nombre = formData.get('nombre') as string;
    const labels = formData.get('etiquetas') as string;
    const file = formData.get('file') as File;

    if (!file || !tipo) return { success: false, error: 'Datos incompletos' };

    // 1. Subir a Supabase Storage
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${FOLDER_NAME}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    // 2. Guardar referencia en DB
    const asset = await prisma.catalogoAsset.create({
      data: {
        tipo,
        categoria,
        nombre,
        url: publicData.publicUrl,
        etiquetas: labels || ''
      }
    });

    return { success: true, data: asset };
  } catch (error) {
    console.error('Error creating asset with storage:', error);
    return { success: false, error: 'Error al subir activo al almacenamiento' };
  }
}

export async function deleteCatalogoAsset(id: string) {
  try {
    await prisma.catalogoAsset.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error deleting asset' };
  }
}

export async function updateCatalogoAsset(id: string, data: { tipo?: string; categoria?: string; nombre?: string; activo?: boolean }) {
  try {
    const asset = await prisma.catalogoAsset.update({
      where: { id },
      data: {
        tipo: data.tipo,
        categoria: data.categoria,
        nombre: data.nombre,
        activo: data.activo
      }
    });
    return { success: true, data: asset };
  } catch (error) {
    console.error('Error updating asset', error);
    return { success: false, error: 'Error updating asset' };
  }
}

/**
 * Función de emergencia para limpiar los assets que tienen Base64 en el campo URL
 * que son los que causan que la página se cuelgue al cargar.
 */
export async function limpiarActivosCorruptos() {
  try {
    const res = await prisma.catalogoAsset.deleteMany({
      where: {
        url: { startsWith: 'data:' }
      }
    });
    console.log(`[LIMPIEZA] Se eliminaron ${res.count} registros corruptos.`);
    return { success: true, eliminados: res.count };
  } catch (error) {
    console.error('Error en limpieza:', error);
    return { success: false };
  }
}
