import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Inspecting Invitations ---');
  const invitaciones = await prisma.invitacion.findMany();
  
  for (const inv of invitaciones) {
    const config = inv.configWeb as any;
    if (!config) continue;

    let totalSize = JSON.stringify(config).length;
    console.log(`Invitacion ID: ${inv.id}`);
    console.log(`- Tipo: ${inv.tipoInvitacion}`);
    console.log(`- Total Config Size: ${(totalSize / 1024).toFixed(2)} KB`);

    if (config.galeriaFotos) {
      console.log(`- Fotos en Galería: ${config.galeriaFotos.length}`);
      config.galeriaFotos.forEach((f: string, i: number) => {
          if (f.startsWith('data:')) {
            console.log(`  - Foto ${i+1}: BASE64 (~${(f.length / 1024).toFixed(2)} KB)`);
          } else {
            console.log(`  - Foto ${i+1}: URL`);
          }
      });
    }

    if (config.coverUrl?.startsWith('data:')) {
      console.log(`- Cover: BASE64 (~${(config.coverUrl.length / 1024).toFixed(2)} KB)`);
    } else if (config.coverUrl) {
      console.log(`- Cover: URL`);
    }
    console.log('---');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
