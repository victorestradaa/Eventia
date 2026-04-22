
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAssets() {
  const assets = await prisma.catalogoAsset.findMany({
    orderBy: { creadoEn: 'desc' },
    take: 5
  });
  console.log('Ultimos 5 Assets:', JSON.stringify(assets, null, 2));
}

checkAssets();
