/**
 * scripts/fix-caja-cancelados.ts
 *
 * Repara la caja para pedidos que ya estaban en CANCELADO antes del fix
 * de cambiarEstadoPedidoPV. Para cada pedido cancelado que tenga VENTAs
 * o ABONOs registrados y que NO tenga AJUSTEs negativos asociados, crea
 * los AJUSTEs reverso correspondientes para que el corte de caja cuadre.
 *
 * Uso:
 *   npx tsx scripts/fix-caja-cancelados.ts            # dry-run
 *   npx tsx scripts/fix-caja-cancelados.ts --confirm  # ejecuta los AJUSTE
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const confirm = process.argv.includes('--confirm');

  console.log('▶︎ Buscando pedidos cancelados con movimientos sin revertir...');

  const cancelados = await prisma.pedidoPV.findMany({
    where: { estado: 'CANCELADO' },
    select: {
      id: true,
      folio: true,
      proveedorId: true,
      sesionCajaId: true,
      pagado: true,
      movimientos: {
        select: { id: true, tipo: true, metodoPago: true, monto: true, sesionId: true },
      },
    },
  });

  let totalAjustes = 0;
  let totalPedidosTocados = 0;

  for (const p of cancelados) {
    // ¿Ya tiene AJUSTEs (es decir, ya se revirtió)?
    const yaRevertido = p.movimientos.some((m) => m.tipo === 'AJUSTE');
    if (yaRevertido) {
      continue;
    }

    const positivos = p.movimientos.filter(
      (m) => m.tipo === 'VENTA' || m.tipo === 'ABONO' || m.tipo === 'INGRESO',
    );
    if (positivos.length === 0) {
      continue;
    }

    totalPedidosTocados++;
    console.log(`\n  Folio #${p.folio} (${p.id})  pagado=${p.pagado}`);
    for (const m of positivos) {
      console.log(`    ↳ revertir ${m.tipo} ${m.metodoPago} ${m.monto}  →  AJUSTE -${m.monto}`);
      totalAjustes++;
    }

    if (confirm) {
      await prisma.$transaction(async (tx) => {
        for (const m of positivos) {
          await tx.movimientoCajaPV.create({
            data: {
              proveedorId: p.proveedorId,
              sesionId: m.sesionId || p.sesionCajaId || null,
              pedidoId: p.id,
              tipo: 'AJUSTE',
              metodoPago: m.metodoPago,
              monto: -Number(m.monto),
              concepto: `Cancelación folio #${p.folio} (retroactivo)`,
            },
          });
        }
        if (Number(p.pagado) > 0) {
          await tx.pedidoPV.update({
            where: { id: p.id },
            data: { pagado: 0 },
          });
        }
      });
    }
  }

  console.log(`\n${confirm ? '✔ Aplicado:' : 'ℹ Resumen (dry-run):'}`);
  console.log(`   Pedidos cancelados sin revertir: ${totalPedidosTocados}`);
  console.log(`   AJUSTEs ${confirm ? 'creados' : 'que se crearían'}:  ${totalAjustes}`);
  if (!confirm) {
    console.log('\nVuelve a correr con --confirm para aplicar.');
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('✖ Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
