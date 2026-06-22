/**
 * scripts/reset-db.ts
 *
 * Borra TODOS los datos transaccionales/de usuario de la BD, dejando únicamente
 * al admin (admin@eventia.com), la configuración de planes (PlanConfig) y los
 * assets de catálogo de plantilla (CatalogoAsset).
 *
 * Uso:
 *   npx tsx scripts/reset-db.ts            # modo "dry-run" (solo muestra conteos)
 *   npx tsx scripts/reset-db.ts --confirm  # ejecuta los DELETE
 *
 * Requiere DATABASE_URL y DIRECT_URL en el entorno (.env / .env.local).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@eventia.com';

async function main() {
  const confirm = process.argv.includes('--confirm');

  console.log('▶︎ Verificando admin...');
  const admin = await prisma.usuario.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true, email: true, rol: true, nombre: true },
  });

  if (!admin) {
    console.error(`✖ No se encontró el usuario ${ADMIN_EMAIL}. Aborto para evitar quedarse sin admin.`);
    process.exit(1);
  }
  if (admin.rol !== 'ADMIN') {
    console.error(`✖ ${ADMIN_EMAIL} no tiene rol ADMIN (es ${admin.rol}). Aborto.`);
    process.exit(1);
  }
  console.log(`   ✔ Admin encontrado: ${admin.nombre} (${admin.id})`);

  console.log('\n▶︎ Conteos actuales:');
  const counts = await contarTodo();
  imprimirConteos(counts);

  if (!confirm) {
    console.log('\nℹ︎ Modo dry-run. Vuelve a ejecutar con --confirm para BORRAR todo lo de arriba (excepto admin, PlanConfig y CatalogoAsset).');
    await prisma.$disconnect();
    return;
  }

  console.log('\n▶︎ Borrando datos en orden de FK...');

  // 1. Hojas (sin dependientes)
  await borrar('Pago', prisma.pago.deleteMany({}));
  await borrar('MovimientoCajaPV', prisma.movimientoCajaPV.deleteMany({}));
  await borrar('HistorialPedidoPV', prisma.historialPedidoPV.deleteMany({}));
  await borrar('LineaPedidoPV', prisma.lineaPedidoPV.deleteMany({}));
  await borrar('AlbumMedia', prisma.albumMedia.deleteMany({}));
  await borrar('VariacionPrecio', prisma.variacionPrecio.deleteMany({}));
  await borrar('PortfolioItem', prisma.portfolioItem.deleteMany({}));
  await borrar('CuentaBancaria', prisma.cuentaBancaria.deleteMany({}));
  await borrar('Transaccion', prisma.transaccion.deleteMany({}));
  await borrar('Resena', prisma.resena.deleteMany({}));
  await borrar('UsoCupon', prisma.usoCupon.deleteMany({}));

  // 2. Invitados — tienen self-ref (grupo familiar), borramos en dos pasos
  await borrar('Invitado (miembros)', prisma.invitado.deleteMany({ where: { grupoTitularId: { not: null } } }));
  await borrar('Invitado (titulares)', prisma.invitado.deleteMany({}));

  // 3. Intermedias del evento
  await borrar('LineaPresupuesto', prisma.lineaPresupuesto.deleteMany({}));
  await borrar('InvitacionDigital', prisma.invitacionDigital.deleteMany({}));
  await borrar('DisposicionMesa', prisma.disposicionMesa.deleteMany({}));
  await borrar('AlbumDigital', prisma.albumDigital.deleteMany({}));

  // 4. POS — primero pedidos, después caja y catálogo
  await borrar('PedidoPV', prisma.pedidoPV.deleteMany({}));
  await borrar('SesionCajaPV', prisma.sesionCajaPV.deleteMany({}));
  await borrar('ProductoPV', prisma.productoPV.deleteMany({}));
  await borrar('ClientePV', prisma.clientePV.deleteMany({}));

  // 5. Reservas (después de transacciones y antes de servicios/proveedores)
  await borrar('Reserva', prisma.reserva.deleteMany({}));

  // 6. Servicios + complementos
  await borrar('Complemento', prisma.complemento.deleteMany({}));
  await borrar('Servicio', prisma.servicio.deleteMany({}));

  // 7. Eventos (después de invitados, presupuestos, invitaciones, disposiciones, álbum, reservas)
  await borrar('Evento', prisma.evento.deleteMany({}));

  // 8. Cupones
  await borrar('Cupon', prisma.cupon.deleteMany({}));

  // 9. Cliente y Proveedor (ya sin dependientes)
  await borrar('Cliente', prisma.cliente.deleteMany({}));
  await borrar('Proveedor', prisma.proveedor.deleteMany({}));

  // 10. Usuarios (excepto admin)
  await borrar('Usuario (excepto admin)', prisma.usuario.deleteMany({ where: { email: { not: ADMIN_EMAIL } } }));

  console.log('\n▶︎ Conteos finales:');
  imprimirConteos(await contarTodo());

  console.log(`\n✔ Listo. Sólo queda ${ADMIN_EMAIL} + PlanConfig + CatalogoAsset.`);
  await prisma.$disconnect();
}

async function borrar(label: string, op: Promise<{ count: number }>) {
  const res = await op;
  console.log(`   - ${label}: ${res.count} borrado(s)`);
}

async function contarTodo() {
  return {
    Usuario: await prisma.usuario.count(),
    Cliente: await prisma.cliente.count(),
    Proveedor: await prisma.proveedor.count(),
    Servicio: await prisma.servicio.count(),
    Complemento: await prisma.complemento.count(),
    PortfolioItem: await prisma.portfolioItem.count(),
    CuentaBancaria: await prisma.cuentaBancaria.count(),
    VariacionPrecio: await prisma.variacionPrecio.count(),
    Evento: await prisma.evento.count(),
    Invitado: await prisma.invitado.count(),
    LineaPresupuesto: await prisma.lineaPresupuesto.count(),
    Pago: await prisma.pago.count(),
    Reserva: await prisma.reserva.count(),
    Transaccion: await prisma.transaccion.count(),
    Resena: await prisma.resena.count(),
    InvitacionDigital: await prisma.invitacionDigital.count(),
    DisposicionMesa: await prisma.disposicionMesa.count(),
    AlbumDigital: await prisma.albumDigital.count(),
    AlbumMedia: await prisma.albumMedia.count(),
    ProductoPV: await prisma.productoPV.count(),
    ClientePV: await prisma.clientePV.count(),
    PedidoPV: await prisma.pedidoPV.count(),
    LineaPedidoPV: await prisma.lineaPedidoPV.count(),
    HistorialPedidoPV: await prisma.historialPedidoPV.count(),
    SesionCajaPV: await prisma.sesionCajaPV.count(),
    MovimientoCajaPV: await prisma.movimientoCajaPV.count(),
    Cupon: await prisma.cupon.count(),
    UsoCupon: await prisma.usoCupon.count(),
    PlanConfig: await prisma.planConfig.count(),
    CatalogoAsset: await prisma.catalogoAsset.count(),
  };
}

function imprimirConteos(c: Record<string, number>) {
  const max = Math.max(...Object.keys(c).map((k) => k.length));
  for (const [k, v] of Object.entries(c)) {
    console.log(`   ${k.padEnd(max, ' ')}  ${v}`);
  }
}

main().catch(async (e) => {
  console.error('✖ Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
