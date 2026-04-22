
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const assets = await prisma.catalogoAsset.findMany({
    orderBy: { creadoEn: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(assets, null, 2));
}

run().finally(() => prisma.$disconnect());
