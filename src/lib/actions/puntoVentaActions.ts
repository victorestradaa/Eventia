'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET_NAME = 'servicios'; // reuso el bucket existente

/* ─── Helpers ────────────────────────────────────────────────────────── */

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/* ─── PRODUCTOS — CRUD ───────────────────────────────────────────────── */

export async function listarProductosPV(proveedorId: string) {
  try {
    const productos = await prisma.productoPV.findMany({
      where: { proveedorId },
      orderBy: [{ activo: 'desc' }, { creadoEn: 'desc' }],
    });
    return { success: true, data: serialize(productos) };
  } catch (error: any) {
    console.error('Error al listar productos PV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function crearProductoPV(
  proveedorId: string,
  data: {
    nombre: string;
    descripcion?: string;
    sku?: string;
    categoria?: string;
    precio: number;
    costo?: number | null;
    stock?: number;
    controlStock?: boolean;
    imagenes?: string[];
  }
) {
  try {
    if (!data.nombre?.trim()) return { success: false, error: 'El nombre es obligatorio.' };
    if (data.precio == null || data.precio < 0) return { success: false, error: 'El precio debe ser mayor o igual a 0.' };

    const producto = await prisma.productoPV.create({
      data: {
        proveedorId,
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
        sku: data.sku?.trim() || null,
        categoria: data.categoria?.trim() || null,
        precio: data.precio,
        costo: data.costo ?? null,
        stock: data.stock ?? 0,
        controlStock: data.controlStock ?? true,
        imagenes: data.imagenes ?? [],
      },
    });
    revalidatePath('/proveedor/punto-venta/productos');
    return { success: true, data: serialize(producto) };
  } catch (error: any) {
    console.error('Error al crear producto PV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function actualizarProductoPV(
  id: string,
  proveedorId: string,
  data: Partial<{
    nombre: string;
    descripcion: string | null;
    sku: string | null;
    categoria: string | null;
    precio: number;
    costo: number | null;
    stock: number;
    controlStock: boolean;
    imagenes: string[];
    activo: boolean;
  }>
) {
  try {
    // Guardia: solo el dueño del producto
    const existe = await prisma.productoPV.findFirst({
      where: { id, proveedorId },
      select: { id: true },
    });
    if (!existe) return { success: false, error: 'Producto no encontrado.' };

    const producto = await prisma.productoPV.update({
      where: { id },
      data,
    });
    revalidatePath('/proveedor/punto-venta/productos');
    return { success: true, data: serialize(producto) };
  } catch (error: any) {
    console.error('Error al actualizar producto PV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function eliminarProductoPV(id: string, proveedorId: string) {
  try {
    const producto = await prisma.productoPV.findFirst({
      where: { id, proveedorId },
      include: { _count: { select: { lineas: true } } },
    });
    if (!producto) return { success: false, error: 'Producto no encontrado.' };

    // Si ya tiene líneas de pedido, hacemos soft delete (desactivar) para preservar histórico
    if (producto._count.lineas > 0) {
      await prisma.productoPV.update({ where: { id }, data: { activo: false } });
      revalidatePath('/proveedor/punto-venta/productos');
      return { success: true, softDelete: true };
    }

    await prisma.productoPV.delete({ where: { id } });
    revalidatePath('/proveedor/punto-venta/productos');
    return { success: true, softDelete: false };
  } catch (error: any) {
    console.error('Error al eliminar producto PV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

/* ─── CLIENTES PV — CRUD ────────────────────────────────────────────── */

export async function listarClientesPV(proveedorId: string) {
  try {
    const clientes = await prisma.clientePV.findMany({
      where: { proveedorId },
      orderBy: { nombre: 'asc' },
      include: {
        _count: { select: { pedidos: true } },
      },
    });
    return { success: true, data: serialize(clientes) };
  } catch (error: any) {
    console.error('Error al listar clientes PV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function crearClientePV(
  proveedorId: string,
  data: {
    nombre: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    notas?: string;
  }
) {
  try {
    if (!data.nombre?.trim()) return { success: false, error: 'El nombre es obligatorio.' };

    // Normalizar teléfono: solo dígitos (mantenemos el formato original si trae)
    const telefono = data.telefono?.trim() || null;
    const email = data.email?.trim().toLowerCase() || null;

    // Detección de duplicado por teléfono (mismo proveedor)
    if (telefono) {
      const limpio = telefono.replace(/\D/g, '');
      if (limpio.length >= 10) {
        const existente = await prisma.clientePV.findFirst({
          where: {
            proveedorId,
            telefono: { contains: limpio.slice(-10) },
          },
          select: { id: true, nombre: true },
        });
        if (existente) {
          return { success: false, error: `Ya tienes un cliente con ese teléfono: "${existente.nombre}".` };
        }
      }
    }

    const cliente = await prisma.clientePV.create({
      data: {
        proveedorId,
        nombre: data.nombre.trim(),
        telefono,
        email,
        direccion: data.direccion?.trim() || null,
        notas: data.notas?.trim() || null,
      },
      include: { _count: { select: { pedidos: true } } },
    });
    revalidatePath('/proveedor/punto-venta/clientes');
    return { success: true, data: serialize(cliente) };
  } catch (error: any) {
    console.error('Error al crear cliente PV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function actualizarClientePV(
  id: string,
  proveedorId: string,
  data: Partial<{
    nombre: string;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    notas: string | null;
  }>
) {
  try {
    const existe = await prisma.clientePV.findFirst({
      where: { id, proveedorId },
      select: { id: true },
    });
    if (!existe) return { success: false, error: 'Cliente no encontrado.' };

    const cliente = await prisma.clientePV.update({
      where: { id },
      data: {
        ...data,
        email: data.email ? data.email.toLowerCase() : data.email,
      },
      include: { _count: { select: { pedidos: true } } },
    });
    revalidatePath('/proveedor/punto-venta/clientes');
    return { success: true, data: serialize(cliente) };
  } catch (error: any) {
    console.error('Error al actualizar cliente PV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function eliminarClientePV(id: string, proveedorId: string) {
  try {
    const cliente = await prisma.clientePV.findFirst({
      where: { id, proveedorId },
      include: { _count: { select: { pedidos: true } } },
    });
    if (!cliente) return { success: false, error: 'Cliente no encontrado.' };

    if (cliente._count.pedidos > 0) {
      return {
        success: false,
        error: `Este cliente tiene ${cliente._count.pedidos} pedido(s). No se puede eliminar sin perder el histórico.`,
      };
    }

    await prisma.clientePV.delete({ where: { id } });
    revalidatePath('/proveedor/punto-venta/clientes');
    return { success: true };
  } catch (error: any) {
    console.error('Error al eliminar cliente PV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

/* ─── PEDIDOS — Creación (venta directa o pedido futuro) ────────────── */

export type LineaInput = {
  productoId?: string | null;
  nombre: string;
  cantidad: number;
  precioUnit: number;
  notas?: string | null;
};

export async function crearPedidoPV(
  proveedorId: string,
  data: {
    tipo: 'VENTA_DIRECTA' | 'PEDIDO';
    clienteId?: string | null;
    nombreCliente?: string | null;
    telefonoCliente?: string | null;
    lineas: LineaInput[];
    descuento?: number;
    metodoPago?: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';
    fechaEntrega?: string | null;
    notas?: string | null;
    pagado?: number;
  }
) {
  try {
    // Validaciones básicas
    if (!data.lineas || data.lineas.length === 0) {
      return { success: false, error: 'Agrega al menos un producto al pedido.' };
    }
    if (data.tipo === 'PEDIDO' && !data.fechaEntrega) {
      return { success: false, error: 'Selecciona una fecha de entrega para el pedido.' };
    }
    for (const l of data.lineas) {
      if (!l.nombre?.trim()) return { success: false, error: 'Cada línea necesita un nombre.' };
      if (l.cantidad <= 0) return { success: false, error: 'La cantidad debe ser mayor a 0.' };
      if (l.precioUnit < 0) return { success: false, error: 'El precio unitario no puede ser negativo.' };
    }

    // Calcular totales
    const subtotal = data.lineas.reduce(
      (sum, l) => sum + l.cantidad * l.precioUnit,
      0
    );
    const descuento = Math.max(0, data.descuento || 0);
    const total = Math.max(0, subtotal - descuento);
    const pagado = Math.max(0, Math.min(data.pagado ?? (data.tipo === 'VENTA_DIRECTA' ? total : 0), total));

    // Buscar sesión de caja abierta para enlazar (opcional)
    const sesionAbierta = await prisma.sesionCajaPV.findFirst({
      where: { proveedorId, estado: 'ABIERTA' },
      select: { id: true },
      orderBy: { abiertaEn: 'desc' },
    });

    // Verificar stock de productos con control
    const productosCtrl = data.lineas
      .filter((l) => l.productoId)
      .map((l) => ({ id: l.productoId!, cant: l.cantidad }));
    if (productosCtrl.length > 0) {
      const productos = await prisma.productoPV.findMany({
        where: { id: { in: productosCtrl.map((p) => p.id) }, proveedorId },
        select: { id: true, nombre: true, stock: true, controlStock: true },
      });
      for (const p of productos) {
        if (!p.controlStock) continue;
        const cantPedida = productosCtrl.find((pc) => pc.id === p.id)?.cant ?? 0;
        if (p.stock < cantPedida) {
          return {
            success: false,
            error: `Stock insuficiente para "${p.nombre}". Disponible: ${p.stock}, solicitado: ${cantPedida}.`,
          };
        }
      }
    }

    const estadoInicial: 'PENDIENTE' | 'ENTREGADO' =
      data.tipo === 'VENTA_DIRECTA' ? 'ENTREGADO' : 'PENDIENTE';

    // Transacción atómica: pedido + líneas + historial + movimiento caja + decremento stock
    const pedido = await prisma.$transaction(async (tx) => {
      // Decrementar stock
      for (const pc of productosCtrl) {
        const prod = await tx.productoPV.findUnique({
          where: { id: pc.id },
          select: { controlStock: true },
        });
        if (prod?.controlStock) {
          await tx.productoPV.update({
            where: { id: pc.id },
            data: { stock: { decrement: pc.cant } },
          });
        }
      }

      // Crear pedido
      const p = await tx.pedidoPV.create({
        data: {
          proveedorId,
          clienteId: data.clienteId || null,
          nombreCliente: data.nombreCliente?.trim() || null,
          telefonoCliente: data.telefonoCliente?.trim() || null,
          tipo: data.tipo,
          estado: estadoInicial,
          subtotal,
          descuento,
          total,
          pagado,
          metodoPago: data.metodoPago || (data.tipo === 'VENTA_DIRECTA' ? 'EFECTIVO' : null),
          fechaEntrega: data.fechaEntrega ? new Date(data.fechaEntrega) : null,
          notas: data.notas?.trim() || null,
          sesionCajaId: sesionAbierta?.id || null,
          lineas: {
            create: data.lineas.map((l) => ({
              productoId: l.productoId || null,
              nombre: l.nombre.trim(),
              cantidad: l.cantidad,
              precioUnit: l.precioUnit,
              subtotal: l.cantidad * l.precioUnit,
              notas: l.notas?.trim() || null,
            })),
          },
          historial: {
            create: {
              estado: estadoInicial,
              nota: data.tipo === 'VENTA_DIRECTA' ? 'Venta directa registrada.' : 'Pedido creado.',
            },
          },
        },
        include: {
          lineas: true,
          historial: { orderBy: { creadoEn: 'desc' } },
          cliente: true,
          // Datos del proveedor para que el PDF de recibo muestre logo,
          // nombre y dirección al descargarlo desde el modal de "pedido creado".
          proveedor: {
            select: {
              nombre: true,
              logoUrl: true,
              ciudad: true,
              estado: true,
              direccion: true,
              usuario: { select: { telefono: true, email: true } },
            },
          },
        },
      });

      // Movimiento de caja por lo pagado (si hay)
      if (pagado > 0) {
        await tx.movimientoCajaPV.create({
          data: {
            proveedorId,
            sesionId: sesionAbierta?.id || null,
            pedidoId: p.id,
            tipo: data.tipo === 'VENTA_DIRECTA' ? 'VENTA' : 'ABONO',
            metodoPago: data.metodoPago || 'EFECTIVO',
            monto: pagado,
            concepto:
              data.tipo === 'VENTA_DIRECTA'
                ? `Venta directa folio #${p.folio}`
                : `Anticipo pedido folio #${p.folio}`,
          },
        });
      }

      return p;
    });

    revalidatePath('/proveedor/punto-venta/pedidos');
    revalidatePath('/proveedor/punto-venta/productos');
    revalidatePath('/proveedor/punto-venta/caja');
    return { success: true, data: serialize(pedido) };
  } catch (error: any) {
    console.error('Error al crear pedido PV:', error);
    return { success: false, error: error.message || 'Error del servidor al crear el pedido.' };
  }
}

/* ─── PEDIDOS — Listado, detalle, transición de estados ─────────────── */

const ORDEN_ESTADOS = ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'] as const;
type EstadoPV = typeof ORDEN_ESTADOS[number];

export async function listarPedidosPV(
  proveedorId: string,
  filters?: {
    estado?: EstadoPV | 'TODOS';
    desde?: string | null;
    hasta?: string | null;
    busqueda?: string;
    take?: number;
  }
) {
  try {
    const where: any = { proveedorId };
    if (filters?.estado && filters.estado !== 'TODOS') where.estado = filters.estado;
    if (filters?.desde) where.creadoEn = { ...(where.creadoEn || {}), gte: new Date(filters.desde) };
    if (filters?.hasta) {
      const fin = new Date(filters.hasta);
      fin.setHours(23, 59, 59, 999);
      where.creadoEn = { ...(where.creadoEn || {}), lte: fin };
    }
    if (filters?.busqueda?.trim()) {
      const q = filters.busqueda.trim();
      const folioNum = parseInt(q.replace(/\D/g, ''), 10);
      where.OR = [
        ...(isNaN(folioNum) ? [] : [{ folio: folioNum }]),
        { nombreCliente: { contains: q, mode: 'insensitive' as const } },
        { cliente: { nombre: { contains: q, mode: 'insensitive' as const } } },
        { telefonoCliente: { contains: q.replace(/\D/g, '') } },
        { cliente: { telefono: { contains: q.replace(/\D/g, '') } } },
      ];
    }

    const pedidos = await prisma.pedidoPV.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      include: {
        cliente: { select: { id: true, nombre: true, telefono: true } },
        _count: { select: { lineas: true } },
      },
      take: filters?.take ?? 200,
    });
    return { success: true, data: serialize(pedidos) };
  } catch (error: any) {
    console.error('Error al listar pedidos PV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function getPedidoDetallePV(id: string, proveedorId: string) {
  try {
    const pedido = await prisma.pedidoPV.findFirst({
      where: { id, proveedorId },
      include: {
        cliente: true,
        lineas: { include: { producto: { select: { imagenes: true } } } },
        historial: { orderBy: { creadoEn: 'desc' } },
        movimientos: { orderBy: { creadoEn: 'desc' } },
        proveedor: {
          select: {
            nombre: true,
            logoUrl: true,
            ciudad: true,
            estado: true,
            direccion: true,
            usuario: { select: { telefono: true, email: true } },
          },
        },
      },
    });
    if (!pedido) return { success: false, error: 'Pedido no encontrado.' };
    return { success: true, data: serialize(pedido) };
  } catch (error: any) {
    console.error('Error al cargar detalle PV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function getPedidosPorClientePV(clienteId: string, proveedorId: string) {
  try {
    const pedidos = await prisma.pedidoPV.findMany({
      where: { clienteId, proveedorId },
      orderBy: { creadoEn: 'desc' },
      include: { _count: { select: { lineas: true } } },
      take: 50,
    });
    return { success: true, data: serialize(pedidos) };
  } catch (error: any) {
    console.error('Error al cargar pedidos del cliente:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function listarVentasRecientesPV(proveedorId: string, limite = 30) {
  try {
    const pedidos = await prisma.pedidoPV.findMany({
      where: { proveedorId, estado: { not: 'CANCELADO' } },
      orderBy: { creadoEn: 'desc' },
      take: limite,
      include: {
        cliente: { select: { id: true, nombre: true, telefono: true } },
        _count: { select: { lineas: true } },
      },
    });
    return { success: true, data: serialize(pedidos) };
  } catch (error: any) {
    console.error('Error al listar ventas recientes:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function cambiarEstadoPedidoPV(
  id: string,
  proveedorId: string,
  nuevoEstado: EstadoPV,
  nota?: string
) {
  try {
    if (!ORDEN_ESTADOS.includes(nuevoEstado)) return { success: false, error: 'Estado inválido.' };

    const pedido = await prisma.pedidoPV.findFirst({
      where: { id, proveedorId },
      select: {
        id: true,
        folio: true,
        estado: true,
        tipo: true,
        sesionCajaId: true,
        lineas: { select: { productoId: true, cantidad: true } },
      },
    });
    if (!pedido) return { success: false, error: 'Pedido no encontrado.' };
    if (pedido.estado === nuevoEstado) return { success: true };

    const esCancelacion = nuevoEstado === 'CANCELADO' && pedido.estado !== 'CANCELADO';

    // Si vamos a cancelar, traemos los movimientos positivos (VENTA/ABONO/INGRESO)
    // del pedido para revertirlos con AJUSTEs negativos. Así el corte de caja
    // no sigue contando dinero que se devolvió.
    const movimientosARevertir = esCancelacion
      ? await prisma.movimientoCajaPV.findMany({
          where: {
            pedidoId: id,
            tipo: { in: ['VENTA', 'ABONO', 'INGRESO'] },
          },
          select: { metodoPago: true, monto: true, sesionId: true },
        })
      : [];

    await prisma.$transaction(async (tx) => {
      if (esCancelacion) {
        // 1) Restituir stock
        for (const l of pedido.lineas) {
          if (!l.productoId) continue;
          const prod = await tx.productoPV.findUnique({ where: { id: l.productoId }, select: { controlStock: true } });
          if (prod?.controlStock) {
            await tx.productoPV.update({
              where: { id: l.productoId },
              data: { stock: { increment: l.cantidad } },
            });
          }
        }

        // 2) Revertir cada cobro en caja con un AJUSTE negativo
        for (const mov of movimientosARevertir) {
          await tx.movimientoCajaPV.create({
            data: {
              proveedorId,
              sesionId: mov.sesionId || pedido.sesionCajaId || null,
              pedidoId: id,
              tipo: 'AJUSTE',
              metodoPago: mov.metodoPago,
              monto: -Number(mov.monto),
              concepto: `Cancelación folio #${pedido.folio}`,
            },
          });
        }

        // 3) Resetear pagado del pedido a 0 (porque ya devolviste el dinero)
        await tx.pedidoPV.update({
          where: { id },
          data: { pagado: 0 },
        });
      }

      await tx.pedidoPV.update({
        where: { id },
        data: { estado: nuevoEstado },
      });

      await tx.historialPedidoPV.create({
        data: { pedidoId: id, estado: nuevoEstado, nota: nota?.trim() || null },
      });
    });

    revalidatePath('/proveedor/punto-venta/pedidos');
    revalidatePath('/proveedor/punto-venta/productos');
    revalidatePath('/proveedor/punto-venta/caja');
    return { success: true };
  } catch (error: any) {
    console.error('Error al cambiar estado PV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

/**
 * Edita las líneas (productos, cantidades, precios) de un pedido ya creado.
 * Ajusta el stock por diferencia, recalcula totales y deja un registro en
 * el historial. No se permite editar pedidos cancelados ni entregados.
 */
export async function editarPedidoPV(
  id: string,
  proveedorId: string,
  lineasNuevas: Array<{
    productoId?: string | null;
    nombre: string;
    cantidad: number;
    precioUnit: number;
    notas?: string | null;
  }>,
  notaCambio?: string,
) {
  try {
    if (!lineasNuevas || lineasNuevas.length === 0) {
      return { success: false, error: 'El pedido debe tener al menos un producto.' };
    }
    for (const l of lineasNuevas) {
      if (!l.nombre?.trim()) return { success: false, error: 'Cada línea necesita un nombre.' };
      if (l.cantidad <= 0) return { success: false, error: 'La cantidad debe ser mayor a 0.' };
      if (l.precioUnit < 0) return { success: false, error: 'El precio unitario no puede ser negativo.' };
    }

    const pedido = await prisma.pedidoPV.findFirst({
      where: { id, proveedorId },
      select: {
        id: true,
        folio: true,
        estado: true,
        descuento: true,
        pagado: true,
        sesionCajaId: true,
        lineas: { select: { productoId: true, cantidad: true } },
      },
    });
    if (!pedido) return { success: false, error: 'Pedido no encontrado.' };
    if (pedido.estado === 'CANCELADO') {
      return { success: false, error: 'No se puede editar un pedido cancelado.' };
    }
    if (pedido.estado === 'ENTREGADO') {
      return { success: false, error: 'No se puede editar un pedido ya entregado.' };
    }

    // Diff de stock: para cada productoId, calcular delta (cantidad nueva - cantidad vieja)
    const stockDiff = new Map<string, number>();
    for (const l of pedido.lineas) {
      if (l.productoId) {
        stockDiff.set(l.productoId, (stockDiff.get(l.productoId) || 0) - l.cantidad);
      }
    }
    for (const l of lineasNuevas) {
      if (l.productoId) {
        stockDiff.set(l.productoId, (stockDiff.get(l.productoId) || 0) + l.cantidad);
      }
    }

    // Validar stock: si el delta es positivo (necesitamos más), validar que haya
    if (stockDiff.size > 0) {
      const productos = await prisma.productoPV.findMany({
        where: { id: { in: Array.from(stockDiff.keys()) }, proveedorId },
        select: { id: true, nombre: true, stock: true, controlStock: true },
      });
      for (const p of productos) {
        if (!p.controlStock) continue;
        const delta = stockDiff.get(p.id) || 0;
        if (delta > 0 && p.stock < delta) {
          return {
            success: false,
            error: `Stock insuficiente para "${p.nombre}". Necesitas ${delta} más, disponible: ${p.stock}.`,
          };
        }
      }
    }

    // Calcular nuevos totales
    const subtotal = lineasNuevas.reduce((s, l) => s + l.cantidad * l.precioUnit, 0);
    const descuento = Number(pedido.descuento);
    const total = Math.max(0, subtotal - descuento);
    const pagadoActual = Number(pedido.pagado);
    // Si el nuevo total < pagado, hay un sobrepago que hay que devolver
    const sobrepago = Math.max(0, pagadoActual - total);

    const pedidoActualizado = await prisma.$transaction(async (tx) => {
      // 1) Ajustar stock por diff
      for (const [productoId, delta] of stockDiff.entries()) {
        if (delta === 0) continue;
        const prod = await tx.productoPV.findUnique({ where: { id: productoId }, select: { controlStock: true } });
        if (prod?.controlStock) {
          await tx.productoPV.update({
            where: { id: productoId },
            data: { stock: { decrement: delta } }, // delta positivo decrementa, negativo incrementa
          });
        }
      }

      // 2) Borrar líneas viejas y crear nuevas
      await tx.lineaPedidoPV.deleteMany({ where: { pedidoId: id } });
      await tx.lineaPedidoPV.createMany({
        data: lineasNuevas.map((l) => ({
          pedidoId: id,
          productoId: l.productoId || null,
          nombre: l.nombre.trim(),
          cantidad: l.cantidad,
          precioUnit: l.precioUnit,
          subtotal: l.cantidad * l.precioUnit,
          notas: l.notas?.trim() || null,
        })),
      });

      // 3) Actualizar pedido
      await tx.pedidoPV.update({
        where: { id },
        data: {
          subtotal,
          total,
          pagado: Math.min(pagadoActual, total),
        },
      });

      // 4) Si hubo sobrepago, registrar AJUSTE negativo en caja (devolución)
      if (sobrepago > 0) {
        await tx.movimientoCajaPV.create({
          data: {
            proveedorId,
            sesionId: pedido.sesionCajaId || null,
            pedidoId: id,
            tipo: 'AJUSTE',
            metodoPago: 'EFECTIVO', // asumimos efectivo; el proveedor sabe cuál devuelve
            monto: -sobrepago,
            concepto: `Devolución por edición folio #${pedido.folio}`,
          },
        });
      }

      // 5) Registrar la modificación en historial
      const notaBase = `Pedido editado. Subtotal: ${subtotal.toFixed(2)}. Total: ${total.toFixed(2)}.`;
      const nota = notaCambio?.trim() ? `${notaBase} ${notaCambio.trim()}` : notaBase;
      await tx.historialPedidoPV.create({
        data: { pedidoId: id, estado: pedido.estado as any, nota },
      });

      return tx.pedidoPV.findUnique({
        where: { id },
        include: {
          lineas: true,
          historial: { orderBy: { creadoEn: 'desc' } },
          cliente: true,
          proveedor: {
            select: {
              nombre: true,
              logoUrl: true,
              ciudad: true,
              estado: true,
              direccion: true,
              usuario: { select: { telefono: true, email: true } },
            },
          },
        },
      });
    });

    revalidatePath('/proveedor/punto-venta/pedidos');
    revalidatePath('/proveedor/punto-venta/productos');
    revalidatePath('/proveedor/punto-venta/caja');
    return { success: true, data: serialize(pedidoActualizado) };
  } catch (error: any) {
    console.error('Error al editar pedido PV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function registrarAbonoPedidoPV(
  id: string,
  proveedorId: string,
  monto: number,
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO',
  nota?: string
) {
  try {
    if (!monto || monto <= 0) return { success: false, error: 'Monto inválido.' };

    const pedido = await prisma.pedidoPV.findFirst({
      where: { id, proveedorId },
      select: { id: true, folio: true, total: true, pagado: true, sesionCajaId: true },
    });
    if (!pedido) return { success: false, error: 'Pedido no encontrado.' };

    const totalNum = Number(pedido.total);
    const pagadoActual = Number(pedido.pagado);
    const pendiente = totalNum - pagadoActual;
    if (pendiente <= 0) return { success: false, error: 'Este pedido ya está pagado en su totalidad.' };
    const abono = Math.min(monto, pendiente);

    // Si no hay sesión asignada al pedido, intentar enlazar con la sesión abierta actual
    let sesionId = pedido.sesionCajaId;
    if (!sesionId) {
      const ses = await prisma.sesionCajaPV.findFirst({
        where: { proveedorId, estado: 'ABIERTA' },
        select: { id: true },
        orderBy: { abiertaEn: 'desc' },
      });
      sesionId = ses?.id || null;
    }

    await prisma.$transaction([
      prisma.pedidoPV.update({
        where: { id },
        data: { pagado: pagadoActual + abono },
      }),
      prisma.movimientoCajaPV.create({
        data: {
          proveedorId,
          sesionId,
          pedidoId: id,
          tipo: 'ABONO',
          metodoPago,
          monto: abono,
          concepto: `Abono pedido folio #${pedido.folio}${nota ? ` · ${nota}` : ''}`,
        },
      }),
    ]);

    revalidatePath('/proveedor/punto-venta/pedidos');
    revalidatePath('/proveedor/punto-venta/caja');
    return { success: true, abono };
  } catch (error: any) {
    console.error('Error al registrar abono PV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

/* ─── PEDIDO público (por trackingToken) ────────────────────────────── */

export async function getPedidoPublicoPV(token: string) {
  try {
    if (!token) return { success: false, error: 'Token inválido.' };

    const pedido = await prisma.pedidoPV.findUnique({
      where: { trackingToken: token },
      include: {
        cliente: { select: { nombre: true } },
        lineas: {
          select: {
            id: true,
            nombre: true,
            cantidad: true,
            precioUnit: true,
            subtotal: true,
            notas: true,
            producto: { select: { imagenes: true } },
          },
        },
        historial: {
          select: { id: true, estado: true, nota: true, creadoEn: true },
          orderBy: { creadoEn: 'asc' },
        },
        proveedor: {
          select: {
            nombre: true,
            logoUrl: true,
            ciudad: true,
            estado: true,
            usuario: { select: { telefono: true } },
          },
        },
      },
    });

    if (!pedido) return { success: false, error: 'Pedido no encontrado.' };

    // Devolver solo lo necesario al público (sin costos, sin sesión de caja, sin notas internas)
    const sanitizado = {
      folio: pedido.folio,
      tipo: pedido.tipo,
      estado: pedido.estado,
      total: pedido.total,
      pagado: pedido.pagado,
      subtotal: pedido.subtotal,
      descuento: pedido.descuento,
      fechaEntrega: pedido.fechaEntrega,
      creadoEn: pedido.creadoEn,
      nombreCliente: pedido.cliente?.nombre || pedido.nombreCliente || null,
      lineas: pedido.lineas.map((l) => ({
        id: l.id,
        nombre: l.nombre,
        cantidad: l.cantidad,
        precioUnit: l.precioUnit,
        subtotal: l.subtotal,
        imagen: l.producto?.imagenes?.[0] || null,
      })),
      historial: pedido.historial,
      proveedor: {
        nombre: pedido.proveedor?.nombre,
        logoUrl: pedido.proveedor?.logoUrl,
        ciudad: pedido.proveedor?.ciudad,
        estado: pedido.proveedor?.estado,
        telefono: pedido.proveedor?.usuario?.telefono || null,
      },
    };

    return { success: true, data: serialize(sanitizado) };
  } catch (error: any) {
    console.error('Error en getPedidoPublicoPV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

/* ─── CAJA — sesiones y movimientos ─────────────────────────────────── */

type MetPagPV = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';
type TipoMovPV = 'VENTA' | 'ABONO' | 'RETIRO' | 'INGRESO' | 'AJUSTE';

export async function getSesionActivaPV(proveedorId: string) {
  try {
    const sesion = await prisma.sesionCajaPV.findFirst({
      where: { proveedorId, estado: 'ABIERTA' },
      include: {
        movimientos: { orderBy: { creadoEn: 'desc' } },
      },
      orderBy: { abiertaEn: 'desc' },
    });
    return { success: true, data: serialize(sesion) };
  } catch (error: any) {
    console.error('Error en getSesionActivaPV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function abrirSesionCajaPV(
  proveedorId: string,
  montoApertura: number,
  notas?: string
) {
  try {
    if (montoApertura < 0) return { success: false, error: 'Monto inválido.' };

    const yaAbierta = await prisma.sesionCajaPV.findFirst({
      where: { proveedorId, estado: 'ABIERTA' },
      select: { id: true },
    });
    if (yaAbierta) {
      return { success: false, error: 'Ya tienes una sesión de caja abierta. Ciérrala antes de abrir otra.' };
    }

    const sesion = await prisma.sesionCajaPV.create({
      data: {
        proveedorId,
        montoApertura,
        notas: notas?.trim() || null,
        estado: 'ABIERTA',
      },
    });
    revalidatePath('/proveedor/punto-venta/caja');
    return { success: true, data: serialize(sesion) };
  } catch (error: any) {
    console.error('Error al abrir sesión:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function cerrarSesionCajaPV(
  id: string,
  proveedorId: string,
  montoCierre: number,
  notas?: string
) {
  try {
    if (montoCierre < 0) return { success: false, error: 'Monto inválido.' };

    const sesion = await prisma.sesionCajaPV.findFirst({
      where: { id, proveedorId, estado: 'ABIERTA' },
      select: { id: true },
    });
    if (!sesion) return { success: false, error: 'Sesión no encontrada o ya cerrada.' };

    const cerrada = await prisma.sesionCajaPV.update({
      where: { id },
      data: {
        estado: 'CERRADA',
        montoCierre,
        notas: notas?.trim() ? notas.trim() : undefined,
        cerradaEn: new Date(),
      },
      include: {
        movimientos: { orderBy: { creadoEn: 'desc' } },
      },
    });
    revalidatePath('/proveedor/punto-venta/caja');
    return { success: true, data: serialize(cerrada) };
  } catch (error: any) {
    console.error('Error al cerrar sesión:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function registrarMovimientoCajaPV(
  proveedorId: string,
  data: {
    tipo: 'RETIRO' | 'INGRESO' | 'AJUSTE';
    metodoPago: MetPagPV;
    monto: number;
    concepto?: string;
  }
) {
  try {
    if (!data.monto || data.monto <= 0) return { success: false, error: 'Monto inválido.' };
    if (!['RETIRO', 'INGRESO', 'AJUSTE'].includes(data.tipo)) {
      return { success: false, error: 'Tipo de movimiento inválido.' };
    }

    const sesion = await prisma.sesionCajaPV.findFirst({
      where: { proveedorId, estado: 'ABIERTA' },
      select: { id: true },
    });
    if (!sesion) {
      return { success: false, error: 'Necesitas abrir una sesión de caja antes de registrar movimientos.' };
    }

    const mov = await prisma.movimientoCajaPV.create({
      data: {
        proveedorId,
        sesionId: sesion.id,
        tipo: data.tipo,
        metodoPago: data.metodoPago,
        monto: data.monto,
        concepto: data.concepto?.trim() || null,
      },
    });
    revalidatePath('/proveedor/punto-venta/caja');
    return { success: true, data: serialize(mov) };
  } catch (error: any) {
    console.error('Error al registrar movimiento:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

export async function listarSesionesCajaPV(proveedorId: string, take = 30) {
  try {
    const sesiones = await prisma.sesionCajaPV.findMany({
      where: { proveedorId },
      orderBy: { abiertaEn: 'desc' },
      take,
      include: {
        _count: { select: { movimientos: true, pedidos: true } },
      },
    });
    return { success: true, data: serialize(sesiones) };
  } catch (error: any) {
    console.error('Error al listar sesiones:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

/* ─── REPORTES — agregaciones para dashboard ────────────────────────── */

async function agregarPedidosEnRango(proveedorId: string, inicio: Date, fin: Date) {
  const pedidos = await prisma.pedidoPV.findMany({
    where: {
      proveedorId,
      creadoEn: { gte: inicio, lte: fin },
      estado: { not: 'CANCELADO' },
    },
    select: {
      id: true,
      tipo: true,
      estado: true,
      total: true,
      pagado: true,
      creadoEn: true,
      lineas: {
        select: {
          productoId: true,
          nombre: true,
          cantidad: true,
          subtotal: true,
          producto: { select: { categoria: true, costo: true } },
        },
      },
    },
  });

  const cancelados = await prisma.pedidoPV.count({
    where: { proveedorId, creadoEn: { gte: inicio, lte: fin }, estado: 'CANCELADO' },
  });

  const movs = await prisma.movimientoCajaPV.findMany({
    where: {
      proveedorId,
      creadoEn: { gte: inicio, lte: fin },
      tipo: { in: ['VENTA', 'ABONO'] },
    },
    select: { metodoPago: true, monto: true },
  });

  return { pedidos, cancelados, movs };
}

export async function getReportePV(
  proveedorId: string,
  desde?: string | null,
  hasta?: string | null
) {
  try {
    const inicio = desde ? new Date(desde) : new Date(new Date().setHours(0, 0, 0, 0));
    const fin = hasta ? new Date(hasta) : new Date();
    if (hasta) fin.setHours(23, 59, 59, 999);
    if (inicio > fin) return { success: false, error: 'El rango de fechas es inválido.' };

    // Periodo actual
    const { pedidos, cancelados, movs } = await agregarPedidosEnRango(proveedorId, inicio, fin);

    // Periodo anterior (mismo tamaño en días) para comparativa
    const duracionMs = fin.getTime() - inicio.getTime();
    const finAnt = new Date(inicio.getTime() - 1);
    const inicioAnt = new Date(finAnt.getTime() - duracionMs);
    const anterior = await agregarPedidosEnRango(proveedorId, inicioAnt, finAnt);

    /* ─── Agregaciones del periodo actual ─────────────────────────── */
    const totalVentas = pedidos.reduce((s, p) => s + Number(p.total), 0);
    const totalCobrado = pedidos.reduce((s, p) => s + Number(p.pagado), 0);
    const totalPendiente = Math.max(0, totalVentas - totalCobrado);
    const numPedidos = pedidos.length;
    const ticketPromedio = numPedidos > 0 ? totalVentas / numPedidos : 0;

    // Unidades vendidas + margen estimado (usando costo del producto)
    let unidadesVendidas = 0;
    let costoTotal = 0;
    let costoCubierto = false;
    pedidos.forEach((p) => {
      p.lineas.forEach((l) => {
        unidadesVendidas += l.cantidad;
        if (l.producto?.costo != null) {
          costoTotal += Number(l.producto.costo) * l.cantidad;
          costoCubierto = true;
        }
      });
    });
    const margenEstimado = costoCubierto ? totalVentas - costoTotal : null;

    const porTipo = {
      VENTA_DIRECTA: pedidos.filter((p) => p.tipo === 'VENTA_DIRECTA').length,
      PEDIDO: pedidos.filter((p) => p.tipo === 'PEDIDO').length,
    };

    const porEstado: Record<string, number> = {
      PENDIENTE: 0, EN_PREPARACION: 0, LISTO: 0, ENTREGADO: 0,
    };
    pedidos.forEach((p) => { porEstado[p.estado] = (porEstado[p.estado] || 0) + 1; });

    const porMetodo: Record<string, number> = {
      EFECTIVO: 0, TARJETA: 0, TRANSFERENCIA: 0, OTRO: 0,
    };
    movs.forEach((m) => { porMetodo[m.metodoPago] += Number(m.monto); });

    // Por día
    const diasMap: Record<string, { fecha: string; ventas: number; pedidos: number }> = {};
    pedidos.forEach((p) => {
      const d = new Date(p.creadoEn);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!diasMap[key]) diasMap[key] = { fecha: key, ventas: 0, pedidos: 0 };
      diasMap[key].ventas += Number(p.total);
      diasMap[key].pedidos += 1;
    });
    const porDia = Object.values(diasMap).sort((a, b) => a.fecha.localeCompare(b.fecha));

    // Mejor día
    const mejorDia = porDia.length > 0
      ? porDia.reduce((max, d) => (d.ventas > max.ventas ? d : max), porDia[0])
      : null;

    // Por hora (0-23) — útil para identificar horas pico
    const porHora: { hora: number; ventas: number; pedidos: number }[] = Array.from({ length: 24 }, (_, i) => ({ hora: i, ventas: 0, pedidos: 0 }));
    pedidos.forEach((p) => {
      const h = new Date(p.creadoEn).getHours();
      porHora[h].ventas += Number(p.total);
      porHora[h].pedidos += 1;
    });

    // Productos top
    const prodMap: Record<string, { nombre: string; cantidad: number; total: number }> = {};
    pedidos.forEach((p) => {
      p.lineas.forEach((l) => {
        const key = l.productoId || `__libre__${l.nombre}`;
        if (!prodMap[key]) prodMap[key] = { nombre: l.nombre, cantidad: 0, total: 0 };
        prodMap[key].cantidad += l.cantidad;
        prodMap[key].total += Number(l.subtotal);
      });
    });
    const productosTop = Object.values(prodMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Categorías (suma de ventas por categoría)
    const catMap: Record<string, { categoria: string; total: number; cantidad: number }> = {};
    pedidos.forEach((p) => {
      p.lineas.forEach((l) => {
        const cat = l.producto?.categoria || 'Sin categoría';
        if (!catMap[cat]) catMap[cat] = { categoria: cat, total: 0, cantidad: 0 };
        catMap[cat].total += Number(l.subtotal);
        catMap[cat].cantidad += l.cantidad;
      });
    });
    const porCategoria = Object.values(catMap).sort((a, b) => b.total - a.total).slice(0, 8);

    /* ─── Comparativa con periodo anterior ─────────────────────────── */
    const totalVentasAnt = anterior.pedidos.reduce((s, p) => s + Number(p.total), 0);
    const numPedidosAnt = anterior.pedidos.length;
    const ticketAnt = numPedidosAnt > 0 ? totalVentasAnt / numPedidosAnt : 0;

    const deltaVentas = totalVentasAnt > 0 ? ((totalVentas - totalVentasAnt) / totalVentasAnt) * 100 : null;
    const deltaPedidos = numPedidosAnt > 0 ? ((numPedidos - numPedidosAnt) / numPedidosAnt) * 100 : null;
    const deltaTicket = ticketAnt > 0 ? ((ticketPromedio - ticketAnt) / ticketAnt) * 100 : null;

    return {
      success: true,
      data: serialize({
        periodo: { inicio: inicio.toISOString(), fin: fin.toISOString() },
        periodoAnterior: { inicio: inicioAnt.toISOString(), fin: finAnt.toISOString() },
        totalVentas,
        totalCobrado,
        totalPendiente,
        numPedidos,
        ticketPromedio,
        unidadesVendidas,
        margenEstimado,
        cancelados,
        porTipo,
        porEstado,
        porMetodo,
        porDia,
        porHora,
        productosTop,
        porCategoria,
        mejorDia,
        // comparativa
        totalVentasAnt,
        numPedidosAnt,
        ticketAnt,
        deltaVentas,
        deltaPedidos,
        deltaTicket,
      }),
    };
  } catch (error: any) {
    console.error('Error en getReportePV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}

/* ─── Upload de imágenes (carpeta dedicada a productos PV) ──────────── */

export async function subirImagenProductoPV(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File;
    const proveedorId = formData.get('proveedorId') as string;
    if (!file || !proveedorId) return { success: false, error: 'Falta archivo o proveedor.' };
    if (!file.type.startsWith('image/')) return { success: false, error: 'Solo imágenes (jpg/png/webp).' };

    // Asegurar bucket
    const bk = await supabaseAdmin.storage.getBucket(BUCKET_NAME);
    if (bk.error && bk.error.message.includes('not found')) {
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'],
      });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `pv/productos/${proveedorId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, { contentType: file.type, upsert: false });
    if (error) {
      console.error('Error supabase upload PV:', error);
      return { success: false, error: 'Error al guardar la imagen.' };
    }

    const { data: pub } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return { success: true, url: pub.publicUrl };
  } catch (error: any) {
    console.error('Error subiendo imagen PV:', error);
    return { success: false, error: error.message || 'Error del servidor.' };
  }
}
