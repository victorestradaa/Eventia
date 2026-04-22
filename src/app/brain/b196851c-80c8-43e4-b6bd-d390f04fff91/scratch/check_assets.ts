
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');

const prisma = new PrismaClient();

async function checkAssets() {
  const assets = await prisma.catalogoAsset.findMany({
    orderBy: { creadoEn: 'desc' },
    take: 5
  });
  console.log('Últimos 5 Assets en BD:');
  assets.forEach(a => {
    console.log(`- ID: ${a.id}, Nombre: ${a.nombre}, Tipo: ${a.tipo}`);
    console.log(`  URL: ${a.url}`);
    console.log(`  Es Base64?: ${a.url.startsWith('data:')}`);
  });
}

checkAssets().catch(console.error).finally(() => prisma.$disconnect());
