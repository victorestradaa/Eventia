const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking CatalogoAsset ---');
  const assets = await prisma.catalogoAsset.findMany();
  assets.forEach(a => {
    console.log(`Asset ID: ${a.id}, Name: ${a.nombre}, Type: ${a.tipo}, URL Length: ${a.url?.length || 0}`);
  });

  console.log('\n--- Checking InvitacionDigital ---');
  const invs = await prisma.invitacionDigital.findMany();
  invs.forEach(i => {
    const configStr = i.configWeb ? JSON.stringify(i.configWeb) : '';
    console.log(`Invitacion ID: ${i.id}, Evento ID: ${i.eventoId}, ConfigWeb Length: ${configStr.length}`);
    if (configStr.length > 100000) {
      console.log('  WARNING: Very large ConfigWeb detected!');
    }
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
