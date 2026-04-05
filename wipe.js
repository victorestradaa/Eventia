const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres.agdqreveheewmbujzlwe:*_N0viembre%3D%4012@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require&sslaccept=accept_invalid_certs"
        }
    }
});

async function main() {
  console.log('Iniciando borrado por puerto directo (5432)...');
  try {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Usuario" CASCADE;');
    console.log('✅ TRUNCATE EXITOSO. Todos los datos han sido borrados.');
  } catch (e) {
    console.error('Error al borrar la base de datos:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
