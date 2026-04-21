const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.usuario.count();
  console.log('Usuarios totales en BD Prisma:', count);
  const usuarios = await prisma.usuario.findMany({ select: { email: true } });
  console.log(usuarios);
}

main().finally(async () => {
  await prisma.$disconnect();
});
