import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Cleanup (Removal of Base64 Photos) ---');
  
  const invitaciones = await prisma.invitacionDigital.findMany();
  let cleanedCount = 0;

  for (const inv of invitaciones) {
    let config = inv.configWeb as any;
    if (!config) continue;

    let modified = false;

    // Limpiar Galería
    if (config.galeriaFotos && Array.isArray(config.galeriaFotos)) {
      const originalCount = config.galeriaFotos.length;
      config.galeriaFotos = config.galeriaFotos.filter((f: string) => !f.startsWith('data:image'));
      if (config.galeriaFotos.length !== originalCount) {
        console.log(`Invitación ${inv.id}: Eliminadas ${originalCount - config.galeriaFotos.length} fotos en Base64.`);
        modified = true;
      }
    }

    // Limpiar Portada
    if (config.coverUrl && config.coverUrl.startsWith('data:image')) {
      console.log(`Invitación ${inv.id}: Eliminada foto de portada en Base64.`);
      config.coverUrl = '';
      modified = true;
    }

    if (modified) {
      await prisma.invitacionDigital.update({
        where: { id: inv.id },
        data: { configWeb: config }
      });
      cleanedCount++;
    }
  }

  console.log(`--- Cleaned ${cleanedCount} records successfully. ---`);
}

main()
  .catch(e => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
