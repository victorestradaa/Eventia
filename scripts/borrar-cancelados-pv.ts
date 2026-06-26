/**
 * scripts/borrar-cancelados-pv.ts
 *
 * Borra todos los pedidos del POS que están en estado CANCELADO,
 * junto con sus líneas, historial y movimientos de caja relacionados.
 *
 * Uso:
 *   npx tsx scripts/borrar-cancelados-pv.ts            # dry-run
 *   npx tsx scripts/borrar-cancelados-pv.ts --confirm  # ejecuta
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const confirm = process.argv.includes('--confirm');

  const cancelados = await prisma.pedidoPV.findMany({
    where: { estado: 'CANCELADO' },
    select: {
      id: true,
      folio: true,
      total: true,
      _count: { select: { lineas: true, historial: true, movimientos: true } },
    },
    orderBy: { folio: 'asc' },
  });

  if (cancelados.length === 0) {
    console.log('No hay pedidos cancelados que borrar.');
    await prisma.$disconnect();
    return;
  }

  console.log(`▶︎ Pedidos cancelados encontrados (${cancelados.length}):\n`);
  for (const p of cancelados) {
    console.log(`   #${p.folio}  total $${p.total}  · lineas:${p._count.lineas} historial:${p._count.historial} movimientos:${p._count.movimientos}`);
  }

  if (!confirm) {
    console.log('\nℹ︎ Modo dry-run. Vuelve a ejecutar con --confirm para BORRAR.');
    await prisma.$disconnect();
    return;
  }

  console.log('\n▶︎ Borrando...');
  const ids = cancelados.map((p) => p.id);

  // 1. Borrar movimientos de caja relacionados (no cascadean automáticamente)
  const movsDeleted = await prisma.movimientoCajaPV.deleteMany({
    where: { pedidoId: { in: ids } },
  });
  console.log(`   - Movimientos de caja borrados: ${movsDeleted.count}`);

  // 2. Borrar pedidos (lineas e historial cascadean por schema)
  const pedDeleted = await prisma.pedidoPV.deleteMany({
    where: { id: { in: ids } },
  });
  console.log(`   - Pedidos borrados: ${pedDeleted.count}`);

  console.log('\n✔ Listo.');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('✖ Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
