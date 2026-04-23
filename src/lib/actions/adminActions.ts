'use server';

import { prisma } from '@/lib/prisma';
import { serializePrisma } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const BUCKET_NAME = 'servicios';
const FOLDER_NAME = 'invitaciones/catalogo';

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

export async function createCatalogoAsset(data: { base64: string; tipo: string; categoria: string; nombre: string; etiquetas?: string; ext?: string }) {
  try {
    const { tipo, categoria, nombre, base64, etiquetas, ext = 'png' } = data;

    if (!base64 || !tipo) return { success: false, error: 'Datos incompletos' };

    // 1. Asegurar Bucket público (Fix para cuadros blancos)
    await supabaseAdmin.storage.updateBucket(BUCKET_NAME, { public: true });

    // 2. Extraer el buffer desde el Base64
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Configurar mime type asumiendo el base64 o la extension
    let contentType = 'image/png';
    if (base64.startsWith('data:image/jpeg') || ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    if (base64.startsWith('data:image/webp') || ext === 'webp') contentType = 'image/webp';

    const fileName = `${FOLDER_NAME}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    // 3. Subir a Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    // 4. Guardar referencia en DB
    const asset = await prisma.catalogoAsset.create({
      data: {
        tipo,
        categoria,
        nombre,
        url: publicData.publicUrl,
        etiquetas: etiquetas || ''
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

/**
 * Obtiene datos reales para los reportes administrativos detallados.
 */
export async function getAdminReportes() {
  try {
    const [servicios, reservas, proveedores] = await Promise.all([
      prisma.servicio.findMany({ select: { creadoEn: true, proveedor: { select: { categoria: true } } } }),
      prisma.reserva.findMany({ select: { creadoEn: true, estado: true, montoTotal: true, fechaEvento: true, proveedor: { select: { nombre: true, categoria: true } } } }),
      prisma.proveedor.findMany({ select: { ciudad: true, categoria: true } })
    ]);

    // 1. Servicios por tiempo (Line Chart)
    const serviciosPorTiempo = processTimeData(servicios);

    // 2. Servicios por Categoría (Pie Chart)
    const catLabels: any = {
      SALON: 'Salones', MUSICA: 'Música', COMIDA: 'Banquetes', ANIMACION: 'Animación',
      FOTOGRAFIA: 'Foto & Video', DECORACION: 'Decoración', RECUERDOS: 'Recuerdos',
      MOBILIARIO: 'Mobiliario', PAQUETES_COMPLETOS: 'Paquetes'
    };

    const serviciosPorCategoria = Object.values(
      servicios.reduce((acc: any, s: any) => {
        const cat = catLabels[s.proveedor?.categoria] || 'Otros';
        if (!acc[cat]) acc[cat] = { name: cat, value: 0 };
        acc[cat].value++;
        return acc;
      }, {})
    );

    // 3. Reservas por tiempo
    const reservasPorTiempo = processTimeData(reservas);

    // 4. Reservas por Estado
    const reservasPorEstado = Object.values(
      reservas.reduce((acc: any, r: any) => {
        if (!acc[r.estado]) acc[r.estado] = { name: r.estado, value: 0 };
        acc[r.estado].value++;
        return acc;
      }, {})
    );

    // 5. Ubicación de Proveedores
    const ubicacionProveedores = Object.values(
      proveedores.reduce((acc: any, p: any) => {
        const city = p.ciudad || 'Sin asignar';
        if (!acc[city]) acc[city] = { name: city, count: 0 };
        acc[city].count++;
        return acc;
      }, {})
    ).sort((a: any, b: any) => b.count - a.count).slice(0, 10);

    // 6. Reservas por Estado y Tiempo (Line Chart Comparativo)
    const reservasPorEstadoTiempo = processReservasStatusTiempo(reservas);

    // 7. Ingresos Totales y Detalle Recent
    const ingresosTotales = reservas
      .filter(r => r.estado === 'LIQUIDADO' || r.estado === 'APARTADO')
      .reduce((acc, r) => acc + Number(r.montoTotal), 0);

    const comisionesTotales = ingresosTotales * 0.1;

    const detalleIngresos = reservas
      .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime())
      .slice(0, 10)
      .map(r => ({
        proveedor: r.proveedor?.nombre || 'Proveedor',
        evento: r.proveedor?.categoria || 'Evento',
        total: Number(r.montoTotal),
        comision: Number(r.montoTotal) * 0.1,
        fecha: r.fechaEvento.toLocaleDateString('es-MX')
      }));

    return {
      success: true,
      data: {
        serviciosPorTiempo,
        serviciosPorCategoria,
        reservasPorTiempo,
        reservasPorEstado,
        reservasPorEstadoTiempo,
        ubicacionProveedores,
        metricas: {
          comisionesTotales,
          ingresosTotales,
          devoluciones: 0 // Default to 0 until refund model is implemented
        },
        detalleIngresos
      }
    };
  } catch (error) {
    console.error('Error al generar reportes:', error);
    return { success: false, error: 'Error al generar reportes' };
  }
}

function processTimeData(items: any[]) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const grouped = items.reduce((acc: any, item: any) => {
    const date = new Date(item.creadoEn);
    const label = `${months[date.getMonth()]} ${date.getFullYear()}`;
    if (!acc[label]) acc[label] = { name: label, total: 0 };
    acc[label].total++;
    return acc;
  }, {});

  return Object.values(grouped).sort((a: any, b: any) => {
    const [mA, yA] = a.name.split(' ');
    const [mB, yB] = b.name.split(' ');
    return Number(yA) - Number(yB) || months.indexOf(mA) - months.indexOf(mB);
  });
}

function processReservasStatusTiempo(reservas: any[]) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const grouped = reservas.reduce((acc: any, r: any) => {
    const date = new Date(r.creadoEn);
    const label = `${months[date.getMonth()]} ${date.getFullYear()}`;
    if (!acc[label]) {
      acc[label] = { name: label, confirmadas: 0, pendientes: 0 };
    }
    
    // Apartado o Liquidado = Confirmado
    if (r.estado === 'APARTADO' || r.estado === 'LIQUIDADO') {
      acc[label].confirmadas++;
    } else if (r.estado === 'TEMPORAL') {
      acc[label].pendientes++;
    }
    
    return acc;
  }, {});

  return Object.values(grouped).sort((a: any, b: any) => {
    const [mA, yA] = a.name.split(' ');
    const [mB, yB] = b.name.split(' ');
    return Number(yA) - Number(yB) || months.indexOf(mA) - months.indexOf(mB);
  });
}

/**
 * Actualiza los datos de un usuario desde el panel de administración.
 */
export async function updateUserAdmin(id: string, data: {
  nombre?: string;
  email?: string;
  rol?: any;
  password?: string;
  plan?: string;
  estado?: string;
  ciudad?: string;
  categoria?: any;
}) {
  try {
    const originalUser = await prisma.usuario.findUnique({
      where: { id },
      include: { cliente: true, proveedor: true }
    });

    if (!originalUser) return { success: false, error: 'Usuario no encontrado' };

    // 1. Actualización básica en Usuario
    const updated = await prisma.usuario.update({
      where: { id },
      data: {
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
      }
    });

    // 2. Actualización de Plan y Ubicación
    if (originalUser.rol === 'PROVEEDOR' && originalUser.proveedor) {
      await prisma.proveedor.update({
        where: { id: originalUser.proveedor.id },
        data: {
          plan: data.plan as any,
          estado: data.estado || originalUser.proveedor.estado,
          ciudad: data.ciudad || originalUser.proveedor.ciudad,
          categoria: data.categoria || originalUser.proveedor.categoria
        }
      });
    } else if (originalUser.rol === 'CLIENTE' && originalUser.cliente) {
      await prisma.cliente.update({
        where: { id: originalUser.cliente.id },
        data: {
          plan: data.plan as any,
          estado: data.estado || originalUser.cliente.estado,
          ciudad: data.ciudad || originalUser.cliente.ciudad
        }
      });
    }

    revalidatePath('/admin/usuarios');
    return { success: true, data: serializePrisma(updated) };
  } catch (error) {
    console.error('Error al actualizar usuario como admin:', error);
    return { success: false, error: 'No se pudo actualizar el usuario.' };
  }
}

/**
 * Alterna el estado de activación de un proveedor.
 */
export async function toggleUserStatus(id: string, currentStatus: boolean) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id },
      include: { proveedor: true }
    });

    if (user?.proveedor) {
      await prisma.proveedor.update({
        where: { id: user.proveedor.id },
        data: { activo: !currentStatus }
      });
    }
    
    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (error) {
    console.error('Error toggling user status:', error);
    return { success: false, error: 'Error al cambiar estado' };
  }
}

/**
 * Elimina un usuario permanentemente de la DB y de Auth (Supabase).
 */
export async function deleteUserAdmin(id: string) {
  try {
    // 1. Obtener el usuario de Prisma para saber su email
    const usuario = await prisma.usuario.findUnique({
      where: { id }
    });

    if (!usuario) return { success: false, error: 'Usuario no encontrado en la base de datos' };

    // 2. Buscar al usuario en Supabase Auth por email
    const { data: authData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) console.error('Error listando usuarios en Auth:', listError);
    
    const supabaseUser = authData?.users.find(u => u.email?.toLowerCase() === usuario.email.toLowerCase());

    if (supabaseUser) {
      // 3. Eliminar de Supabase Auth usando su UUID real
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(supabaseUser.id);
      if (authError) {
        console.error('Error eliminando de Auth:', authError);
      }
    } else {
      console.warn(`No se encontró el usuario ${usuario.email} en Supabase Auth, se procederá solo con el borrado en DB.`);
    }

    // 4. Eliminar de Prisma (OnDelete Cascade debería limpiar Cliente/Proveedor)
    await prisma.usuario.delete({
      where: { id }
    });

    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error);
    return { success: false, error: error.message || 'Error al eliminar usuario' };
  }
}

/**
 * Actualiza la contraseña de un usuario en Supabase Auth desde el panel admin.
 */
export async function updateUserPasswordAdmin(id: string, newPassword: string) {
  try {
    // 1. Obtener email de Prisma
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) return { success: false, error: 'Usuario no encontrado' };

    // 2. Buscar UUID en Supabase
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    const supabaseUser = authData?.users.find(u => u.email?.toLowerCase() === usuario.email.toLowerCase());

    if (!supabaseUser) return { success: false, error: 'No se encontró el usuario en el sistema de autenticación.' };

    // 3. Actualizar contraseña usando el UUID real
    const { error } = await supabaseAdmin.auth.admin.updateUserById(supabaseUser.id, {
      password: newPassword
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error al actualizar contraseña:', error);
    return { success: false, error: error.message || 'Error al actualizar contraseña' };
  }
}

