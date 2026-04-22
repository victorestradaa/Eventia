const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Reparando permisos de esquema public en Supabase...');
    
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;`);
    await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;`);
    await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;`);
    await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;`);
    
    // Explicitly grant permissions on Usuario table just in case
    await prisma.$executeRawUnsafe(`GRANT ALL ON "Usuario" TO service_role;`);
    await prisma.$executeRawUnsafe(`GRANT ALL ON "Usuario" TO anon;`);
    await prisma.$executeRawUnsafe(`GRANT ALL ON "Usuario" TO authenticated;`);
    
    console.log('✅ Permisos reparados exitosamente.');
  } catch (error) {
    console.error('❌ Error reparando permisos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
