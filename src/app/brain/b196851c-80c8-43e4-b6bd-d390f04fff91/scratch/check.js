
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=')).reduce((acc, line) => { 
  const p = line.indexOf('='); 
  acc[line.slice(0, p).trim()] = line.slice(p + 1).replace(/"|'/g, '').trim(); 
  return acc; 
}, {});

process.env.DATABASE_URL = env.DATABASE_URL;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const assets = await prisma.catalogoAsset.findMany({
    orderBy: { creadoEn: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(assets, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
