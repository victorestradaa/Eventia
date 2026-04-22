const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing create user...');
    const result = await prisma.usuario.create({
      data: {
        email: 'test_autoheal_12345@test.com',
        nombre: 'Test Autoheal',
        rol: 'CLIENTE',
        cliente: { create: {} }
      }
    });
    console.log('Success:', result);
    
    // Clean up
    await prisma.usuario.delete({ where: { email: 'test_autoheal_12345@test.com' } });
  } catch (err) {
    console.error('Failed to create user:', err.message);
    if (err.code) console.error('Code:', err.code);
    if (err.meta) console.error('Meta:', err.meta);
  } finally {
    await prisma.$disconnect();
  }
}

main();
