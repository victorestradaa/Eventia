import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando limpieza de reservas de prueba ---');
  
  // Borrar todas las reservas que sean manuales (esManual: true)
  // El usuario pidió borrar "esos registros" que son manuales
  const deleted = await prisma.reserva.deleteMany({
    where: {
      esManual: true
    }
  });

  console.log(`✅ Se eliminaron ${deleted.count} registros de reserva manual.`);
  console.log('--- Limpieza completada ---');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la limpieza:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
