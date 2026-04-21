'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { serializePrisma } from '@/lib/utils';

/**
 * Obtiene el resumen de actividad de un proveedor.
 */
export async function getResumenProveedor(proveedorId: string) {
  try {
    const [reservas, servicios, metricas, tareasPendientes] = await Promise.all([
      prisma.reserva.findMany({
        where: { proveedorId },
        orderBy: { fechaEvento: 'asc' },
        take: 5,
        include: { 
          cliente: { 
            include: { usuario: true } 
          } 
        }
      }),
      prisma.servicio.findMany({
        where: { proveedorId },
        include: {
          _count: { select: { reservas: true } }
        }
      }),
      prisma.reserva.aggregate({
        where: { proveedorId, estado: 'LIQUIDADO' },
        _sum: { montoTotal: true },
        _count: { id: true }
      }),
      prisma.reserva.count({
        where: { proveedorId, estado: 'TEMPORAL' }
      })
    ]);

    return { 
      success: true, 
      data: { 
        reservas: reservas.map((r: any) => ({
          ...r,
          montoTotal: r.montoTotal ? Number(r.montoTotal) : 0,
          presupuestoAcordado: r.presupuestoAcordado ? Number(r.presupuestoAcordado) : 0,
          montoAnticipo: r.montoAnticipo ? Number(r.montoAnticipo) : 0,
          montoComision: r.montoComision ? Number(r.montoComision) : 0
        })), 
        servicios: servicios.map((s: any) => ({
          ...s,
          precio: s.precio ? Number(s.precio) : 0
        })), 
        ingresosTotales: metricas._sum.montoTotal ? Number(metricas._sum.montoTotal) : 0,
        totalReservas: metricas._count.id,
        tareasPendientes: tareasPendientes
      } 
    };
  } catch (error) {
    console.error('Error al obtener resumen de proveedor:', error);
    return { success: false, error: 'No se pudo cargar el resumen.' };
  }
}

/**
 * Obtiene TODAS las reservas de un proveedor para mostrarlas en el calendario.
 */
export async function getReservasCalendario(proveedorId: string) {
  try {
    const reservas = await prisma.reserva.findMany({
      where: { proveedorId },
      include: {
        cliente: { include: { usuario: true } },
        servicio: { select: { nombre: true, precio: true } }
      },
      orderBy: { fechaEvento: 'asc' }
    });
    
    // Serializar Decimales
    return { 
      success: true, 
      data: reservas.map((r: any) => ({
        ...r,
        montoTotal: r.montoTotal ? Number(r.montoTotal) : 0,
        montoAnticipo: r.montoAnticipo ? Number(r.montoAnticipo) : 0,
        montoComision: r.montoComision ? Number(r.montoComision) : 0,
        servicio: r.servicio ? {
          ...r.servicio,
          precio: r.servicio.precio ? Number(r.servicio.precio) : 0,
        } : null,
      })) 
    };
  } catch (error) {
    console.error('Error al obtener reservas del calendario:', error);
    return { success: false, error: 'No se pudieron cargar las reservas del calendario.' };
  }
}

/**
 * Permite al proveedor confirmar el turno de una reserva TEMPORAL de un cliente.
 * Si confirma un turno específico (POR_HORAS), el día queda parcialmente disponible.
 */
export async function confirmarTurnoReserva(data: {
  reservaId: string;
  tipoReserva: 'DIA_COMPLETO' | 'POR_HORAS';
  horaInicio?: string;
  horaFin?: string;
}) {
  try {
    const updated = await prisma.reserva.update({
      where: { id: data.reservaId },
      data: {
        tipoReserva: data.tipoReserva,
        horaInicio: data.tipoReserva === 'POR_HORAS' ? data.horaInicio : null,
        horaFin: data.tipoReserva === 'POR_HORAS' ? data.horaFin : null,
        turnoConfirmadoEn: new Date(), // eslint-disable-line @typescript-eslint/no-explicit-any
        estado: 'APARTADO',
      } as any // Prisma client regeneration needed for new schema fields
    });

    revalidatePath('/proveedor/calendario');
    revalidatePath('/proveedor/ventas');
    revalidatePath('/proveedor/dashboard');
    return { success: true, data: serializePrisma(updated) };
  } catch (error) {
    console.error('Error al confirmar turno:', error);
    return { success: false, error: 'No se pudo confirmar el turno.' };
  }
}

/**
 * Crea un nuevo servicio para el catálogo del proveedor.
 */
export async function createServicio(formData: {
  proveedorId: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  capacidadMin?: number;
  capacidadMax?: number;
  etiquetasEvento?: string[];
  imagenes?: string[];
  diasDisponibles?: number[];
  capacidadSimultanea?: number;
  bloquesHorario?: string[];
}) {
  try {
    const nuevoServicio = await prisma.servicio.create({
      data: {
        proveedorId: formData.proveedorId,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: formData.precio,
        capacidadMin: formData.capacidadMin,
        capacidadMax: formData.capacidadMax,
        etiquetasEvento: (formData.etiquetasEvento as any) || ['TODOS'],
        imagenes: formData.imagenes || [],
        diasDisponibles: formData.diasDisponibles || [],
        capacidadSimultanea: formData.capacidadSimultanea || 1,
        bloquesHorario: formData.bloquesHorario || [],
      }
    });

    revalidatePath('/proveedor/catalogo');
    revalidatePath('/proveedor/dashboard');
    return { success: true, data: { ...nuevoServicio, precio: Number(nuevoServicio.precio) } };
  } catch (error) {
    console.error('Error al crear servicio:', error);
    return { success: false, error: 'No se pudo crear el servicio.' };
  }
}

/**
 * Actualiza un servicio existente.
 */
export async function updateServicio(id: string, formData: {
  nombre: string;
  precio: number;
  descripcion?: string;
  capacidadMin?: number;
  capacidadMax?: number;
  etiquetasEvento?: string[];
  imagenes?: string[];
  diasDisponibles?: number[];
  capacidadSimultanea?: number;
  bloquesHorario?: string[];
}) {
  try {
    const editado = await prisma.servicio.update({
      where: { id },
      data: {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: formData.precio,
        capacidadMin: formData.capacidadMin,
        capacidadMax: formData.capacidadMax,
        etiquetasEvento: (formData.etiquetasEvento as any) || ['TODOS'],
        imagenes: formData.imagenes || [],
        diasDisponibles: formData.diasDisponibles || [],
        capacidadSimultanea: formData.capacidadSimultanea || 1,
        bloquesHorario: formData.bloquesHorario || [],
      }
    });

    revalidatePath('/proveedor/catalogo');
    revalidatePath('/proveedor/dashboard');
    return { success: true, data: { ...editado, precio: Number(editado.precio) } };
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    return { success: false, error: 'No se pudo actualizar el servicio.' };
  }
}

/**
 * Elimina un servicio (borrado permanente).
 */
export async function deleteServicio(id: string) {
  try {
    await prisma.servicio.delete({
      where: { id }
    });
    revalidatePath('/proveedor/catalogo');
    revalidatePath('/proveedor/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    return { success: false, error: 'No se pudo eliminar el servicio.' };
  }
}

/**
 * Upsert variaciones de precio por mes (temporada alta).
 * Borra las variaciones anteriores y crea las nuevas en una sola transacción.
 */
export async function upsertVariaciones(servicioId: string, variaciones: { mes: number; precioOverride: number }[]) {
  try {
    await prisma.$transaction(async (tx: any) => {
      // Borrar todas las variaciones existentes del servicio
      await tx.variacionPrecio.deleteMany({ where: { servicioId } });

      // Crear solo las que tienen un precio asignado
      const validVariaciones = variaciones.filter(v => v.precioOverride > 0);
      if (validVariaciones.length > 0) {
        await tx.variacionPrecio.createMany({
          data: validVariaciones.map(v => ({
            servicioId,
            mes: v.mes,
            precioOverride: v.precioOverride,
          }))
        });
      }
    });

    revalidatePath('/proveedor/catalogo');
    return { success: true };
  } catch (error) {
    console.error('Error al guardar variaciones de precio:', error);
    return { success: false, error: 'No se pudieron guardar las variaciones de precio.' };
  }
}

// ─── Complementos (Add-ons) ───────────────────────────────────────────────────

export async function createComplemento(data: {
  proveedorId: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  servicioIds: string[]; // Servicios compatibles
}) {
  try {
    const complemento = await prisma.complemento.create({
      data: {
        proveedorId: data.proveedorId,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        precio: data.precio,
        servicios: {
          connect: data.servicioIds.map(id => ({ id }))
        },
      },
      include: { servicios: true }
    });

    revalidatePath('/proveedor/catalogo');
    return { success: true, data: serializePrisma(complemento) };
  } catch (error) {
    console.error('Error al crear complemento:', error);
    return { success: false, error: 'No se pudo crear el complemento.' };
  }
}

export async function updateComplemento(complementoId: string, data: {
  nombre: string;
  descripcion?: string;
  precio: number;
  servicioIds: string[];
  activo?: boolean;
}) {
  try {
    const updated = await prisma.complemento.update({
      where: { id: complementoId },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        precio: data.precio,
        activo: data.activo ?? true,
        servicios: {
          set: data.servicioIds.map(id => ({ id }))
        },
      },
      include: { servicios: true }
    });

    revalidatePath('/proveedor/catalogo');
    return { success: true, data: serializePrisma(updated) };
  } catch (error) {
    console.error('Error al actualizar complemento:', error);
    return { success: false, error: 'No se pudo actualizar el complemento.' };
  }
}

export async function deleteComplemento(complementoId: string) {
  try {
    await prisma.complemento.delete({ where: { id: complementoId } });
    revalidatePath('/proveedor/catalogo');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar complemento:', error);
    return { success: false, error: 'No se pudo eliminar el complemento.' };
  }
}

// ─── Calendario (Bloqueo Rápido) ──────────────────────────────────────────────

export async function createBloqueoRapido(data: {
  proveedorId: string;
  servicioId: string;
  fechaEvento: string | Date;
  tipoReserva: 'DIA_COMPLETO' | 'POR_HORAS';
  horaInicio?: string;
  horaFin?: string;
  clienteAproximado?: string;
}) {
  try {
    // Obtener datos del servicio para precio y capacidad
    const servicioInfo = await prisma.servicio.findUnique({
      where: { id: data.servicioId }
    });

    if (!servicioInfo) return { success: false, error: 'Servicio no encontrado.' };

    // Verificar disponibilidad antes de bloquear
    const bloqueOpcional = data.tipoReserva === 'POR_HORAS' && data.horaInicio && data.horaFin 
      ? `${data.horaInicio}-${data.horaFin}` 
      : undefined;
      
    const disp = await verificarDisponibilidadServicio(data.servicioId, data.fechaEvento, bloqueOpcional);
    if (!disp.success || !disp.disponible) {
      return { success: false, error: 'La capacidad para este día o turno ya ha sido alcanzada.' };
    }

    const bloqueo = await prisma.reserva.create({
      data: {
        proveedorId: data.proveedorId,
        servicioId: data.servicioId,
        fechaEvento: new Date(data.fechaEvento),
        tipoReserva: data.tipoReserva,
        horaInicio: data.horaInicio || null,
        horaFin: data.horaFin || null,
        esManual: true,
        nombreClienteExterno: data.clienteAproximado || 'Bloqueo Interno',
        estado: 'APARTADO',
        montoTotal: Number(servicioInfo.precio), // Usar precio base del servicio
        montoAnticipo: 0,
        montoComision: 0,
        notas: data.clienteAproximado === 'Mantenimiento' || data.clienteAproximado === 'Día Inhábil' 
               ? `BLOQUEO_SISTEMA: ${data.clienteAproximado}` 
               : 'Venta manual desde calendario'
      }
    });

    revalidatePath('/proveedor/calendario');
    revalidatePath('/proveedor/ventas');
    revalidatePath('/proveedor/dashboard');
    return { success: true, data: serializePrisma(bloqueo) };
  } catch (error) {
    console.error('Error al crear bloqueo rápido:', error);
    return { success: false, error: 'No se pudo bloquear la fecha.' };
  }
}

// ─── Lógica de Capacidad y Disponibilidad ─────────────────────────────────────

export async function verificarDisponibilidadServicio(
  servicioId: string, 
  fechaEvento: Date | string, 
  bloqueOpcional?: string // ej. "09:00-14:00"
) {
  try {
    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId },
      select: { capacidadSimultanea: true, bloquesHorario: true, diasDisponibles: true }
    });

    if (!servicio) return { success: false, error: 'Servicio no encontrado' };

    // 0. Verificar si el día de la semana está permitido
    const diasPermitidos = (servicio.diasDisponibles as number[]) || [];
    if (diasPermitidos.length > 0) {
      const fechaObj = new Date(fechaEvento);
      // Para evitar problemas de zona horaria al recibir solo el string YYYY-MM-DD
      let diaSemana;
      if (typeof fechaEvento === 'string' && !fechaEvento.includes('T')) {
        const [y, m, d] = fechaEvento.split('-').map(Number);
        diaSemana = new Date(y, m - 1, d).getDay();
      } else {
        diaSemana = fechaObj.getUTCDay(); // Si es ISO completo, el cliente manda la fecha exacta
        // Pero espera, si mandamos ISO completo con T00:00:00Z, getUTCDay es más seguro.
      }

      if (!diasPermitidos.includes(diaSemana)) {
        const diasNombres = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
        const nombresPermitidos = diasPermitidos.map(d => diasNombres[d]).join(', ');
        return { 
          success: false, 
          error: `Este servicio no está disponible para el día solicitado. Días permitidos: ${nombresPermitidos}` 
        };
      }
    }

    // Buscar reservas existentes para este servicio en este día
    const fechaInicioDia = new Date(fechaEvento);
    fechaInicioDia.setHours(0, 0, 0, 0);
    const fechaFinDia = new Date(fechaEvento);
    fechaFinDia.setHours(23, 59, 59, 999);

    const reservasOcupadas = await prisma.reserva.findMany({
      where: {
        servicioId,
        // Incluir TEMPORAL también para prevenir dobles reservas durante la ventana de confirmación
        estado: { in: ['TEMPORAL', 'APARTADO', 'LIQUIDADO'] },
        fechaEvento: {
          gte: fechaInicioDia,
          lte: fechaFinDia
        }
      }
    });

    // Convierte "HH:MM" a minutos desde medianoche
    const toMin = (t: string): number => {
      const parts = t.split(':');
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    };

    let overlapCount = 0;

    if (bloqueOpcional && bloqueOpcional.includes('-')) {
      // Parsear el bloque solicitado: puede ser "09:00-14:00" o "20:00-01:00" (cruza medianoche)
      const dashIndex = bloqueOpcional.lastIndexOf('-');
      const bStartStr = bloqueOpcional.substring(0, dashIndex).trim();
      const bEndStr = bloqueOpcional.substring(dashIndex + 1).trim();

      let bStart = toMin(bStartStr);
      let bEnd = toMin(bEndStr);
      // Si cruza medianoche (ej. 20:00-01:00), sumamos 24h al final
      if (bEnd <= bStart) bEnd += 24 * 60;

      overlapCount = reservasOcupadas.filter(r => {
        // Un bloqueo de día completo bloquea todos los turnos
        if (r.tipoReserva === 'DIA_COMPLETO') return true;
        
        // Si no tiene horas definidas, asumimos que ocupa el turno
        if (!r.horaInicio || !r.horaFin) return true;

        let rStart = toMin(r.horaInicio);
        let rEnd = toMin(r.horaFin);
        // Manejar turno que cruza medianoche
        if (rEnd <= rStart) rEnd += 24 * 60;

        // Traslape de rangos: A y B se traslapan cuando (A.start < B.end) && (A.end > B.start)
        return (bStart < rEnd) && (bEnd > rStart);
      }).length;
    } else {
      // Si es DIA_COMPLETO, cualquier reserva del día cuenta como conflicto
      overlapCount = reservasOcupadas.length;
    }

    const disponible = overlapCount < (servicio.capacidadSimultanea || 1);

    return { 
      success: true, 
      disponible,
      disponiblesRestantes: Math.max(0, servicio.capacidadSimultanea - overlapCount),
      capacidadTotal: servicio.capacidadSimultanea
    };
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    return { success: false, error: 'Error interno al verificar.' };
  }
}

// ─── Exploración de Catálogo (Para Clientes) ──────────────────────────────────

/**
 * Obtiene todos los servicios de proveedores activos para la sección de Explorar.
 * Permite filtrar por categorías si es necesario.
 */
export async function getExplorarServicios() {
  try {
    const servicios = await prisma.servicio.findMany({
      where: {
        activo: true,
        proveedor: { activo: true }
      },
      include: {
        proveedor: {
          include: {
            resenas: {
              select: { calificacion: true }
            }
          }
        },
        _count: {
          select: { reservas: true }
        }
      },
      orderBy: [
        { proveedor: { plan: 'desc' } }, // Premium primero
        { creadoEn: 'desc' }
      ]
    });

    // Serialización de Decimales y mapeo de datos
    const data = servicios.map((s: any) => {
      // Calcular promedio de calificación real del proveedor
      const resenas = s.proveedor.resenas || [];
      const promedio = resenas.length > 0 
        ? Math.round((resenas.reduce((acc: number, r: any) => acc + r.calificacion, 0) / resenas.length) * 10) / 10
        : 0;

      return {
        id: s.id,
        nombre: s.nombre,
        categoria: s.proveedor.categoria || 'Servicio',
        calificacion: promedio,
        reseñas: resenas.length,
        precio: Number(s.precio),
        ciudad: s.proveedor.ciudad,
        capacidad: s.capacidadMax ? `${s.capacidadMin}-${s.capacidadMax}` : 'N/A',
        premium: s.proveedor.plan === 'PREMIUM' || s.proveedor.plan === 'ELITE',
        img: s.imagenes[0] || s.proveedor.logoUrl || null,
        proveedorId: s.proveedorId
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error al explorar servicios:', error);
    return { success: false, error: 'No se pudieron cargar los servicios.' };
  }
}

export async function getDetalleProveedor(id: string) {
  try {
    const proveedor = await prisma.proveedor.findUnique({
      where: { id },
      include: {
        servicios: {
          where: { activo: true },
          orderBy: { creadoEn: 'desc' },
        },
        resenas: {
          include: { cliente: { include: { usuario: true } } },
          orderBy: { creadoEn: 'desc' },
          take: 5
        },
        _count: {
          select: { reservas: true }
        }
      }
    });

    if (!proveedor) return { success: false, error: 'Proveedor no encontrado.' };

    // Calcular promedio de calificación
    const calificacion = proveedor.resenas.length > 0 
      ? proveedor.resenas.reduce((acc, r) => acc + r.calificacion, 0) / proveedor.resenas.length
      : 5.0;

    // Serialización completa para el nuevo diseño centrado en el producto
    const data = {
      id: proveedor.id,
      nombre: proveedor.nombre,
      categoria: proveedor.categoria,
      ubicacion: `${proveedor.ciudad}, ${proveedor.estado}`,
      ciudad: proveedor.ciudad,
      estado: proveedor.estado,
      direccion: proveedor.direccion,
      latitud: proveedor.latitud,
      longitud: proveedor.longitud,
      descripcion: proveedor.descripcion,
      logoUrl: proveedor.logoUrl,
      bannerUrl: proveedor.bannerUrl,
      calificacion: Number(calificacion.toFixed(1)),
      reseñasCount: proveedor.resenas.length,
      pedidosCount: proveedor._count.reservas,
      servicios: proveedor.servicios.map((s: any) => ({
        id: s.id,
        nombre: s.nombre,
        precio: Number(s.precio),
        desc: s.descripcion || 'Sin descripción disponible.',
        imagenes: s.imagenes || [],
        diasDisponibles: s.diasDisponibles || []
      })),
      resenas: proveedor.resenas.map((r: any) => ({
        id: r.id,
        nombre: r.cliente.usuario.nombre,
        calificacion: r.calificacion,
        comentario: r.comentario,
        creadoEn: r.creadoEn
      }))
    };

    return { success: true, data };
  } catch (error) {
    console.error('Error al obtener detalle del proveedor:', error);
    return { success: false, error: 'Error al cargar el perfil.' };
  }
}


/**
 * Permite que un cliente solicite un apartado de fecha (Estado TEMPORAL).
 */
export async function solicitarReserva(data: {
  clienteId: string;
  proveedorId: string;
  servicioId: string;
  eventoId: string;
  fechaEvento: Date | string;
  montoTotal: number;
}) {
  try {
    // 1. Verificar disponibilidad real (Capacidad Simultánea)
    const disp = await verificarDisponibilidadServicio(data.servicioId, data.fechaEvento);
    if (!disp.success || !disp.disponible) {
      return { success: false, error: 'Lo sentimos, esta fecha ya no está disponible.' };
    }

    // 2. Calcular fecha de expiración (48 horas por defecto)
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 48);

    // 3. Crear la reserva y la línea de presupuesto en una transacción
    const result = await prisma.$transaction(async (tx: any) => {
      const reserva = await tx.reserva.create({
        data: {
          clienteId: data.clienteId,
          proveedorId: data.proveedorId,
          servicioId: data.servicioId,
          eventoId: data.eventoId,
          fechaEvento: new Date(data.fechaEvento),
          estado: 'TEMPORAL',
          montoTotal: data.montoTotal,
          fechaExpiracion,
          notas: 'Solicitud realizada desde el perfil de usuario.'
        },
        include: { servicio: true }
      });

      // Creamos la línea de presupuesto para que aparezca en el panel del cliente
      await tx.lineaPresupuesto.create({
        data: {
          eventoId: data.eventoId,
          servicioId: data.servicioId,
          descripcion: reserva.servicio.nombre,
          montoTotal: data.montoTotal,
          montoPagado: 0
        }
      });

      return reserva;
    });

    revalidatePath(`/cliente/proveedor/${data.proveedorId}`);
    return { success: true, data: serializePrisma(result) };
  } catch (error) {
    console.error('Error al solicitar reserva:', error);
    return { success: false, error: 'Hubo un error al procesar tu solicitud.' };
  }
}

/**
 * Obtiene solo el conteo de reservas pendientes (Estado TEMPORAL).
 * Útil para badges de notificación en el Sidebar.
 */
export async function getPendingTasksCount(proveedorId: string) {
  try {
    const count = await prisma.reserva.count({
      where: { proveedorId, estado: 'TEMPORAL' }
    });
    return { success: true, data: count };
  } catch (error) {
    return { success: false, data: 0 };
  }
}
