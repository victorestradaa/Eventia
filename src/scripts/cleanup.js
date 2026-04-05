/**
 * Script de Limpieza de Reservas Manuales (Prueba)
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando limpieza de reservas de prueba (Manuales) ---');
  
  try {
    const deleted = await prisma.reserva.deleteMany({
      where: {
        esManual: true
      }
    });
    console.log(`✅ Éxito: Se eliminaron ${deleted.count} registros de prueba.`);
  } catch (error) {
    console.error('❌ Error durante la eliminación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
