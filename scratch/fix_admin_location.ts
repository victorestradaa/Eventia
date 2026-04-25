
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixAdmin() {
  const res = await prisma.proveedor.update({
    where: { id: 'cmo9fgbon0001fldo2lyigbpl' },
    data: { ciudad: 'Mazatlán' }
  });
  console.log('Fixed:', res.nombre, res.ciudad);
}

fixAdmin().finally(() => prisma.$disconnect());
