const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.usuario.findMany({
      where: {
        email: { contains: 'pamela', mode: 'insensitive' }
      }
    });
    console.log('Usuarios encontrados:', users);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
