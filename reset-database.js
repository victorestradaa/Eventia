/* reset-database.js */
const { PrismaClient } = require('@prisma/client');

// URL de conexión ya validada en producción (PgBouncer activado)
const DATABASE_URL = 'postgresql://postgres.agdqreveheewmbujzlwe:*_N0viembre%3D%4012@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&sslaccept=accept_invalid_certs&connection_limit=1';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function reset() {
  console.log('--- INICIANDO BORRADO TOTAL DE DATOS ---');
  try {
    // Usamos TRUNCATE con CASCADE para limpiar todas las tablas relacionadas
    // Usuario es la tabla raíz, por lo que borra Proveedores, Clientes, Eventos, etc.
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Usuario" CASCADE;');
    console.log('✅ ÉXITO: La base de datos ha sido vaciada completamente.');
  } catch (error) {
    console.error('❌ ERROR durante el borrado:', error);
    console.log('Asegúrate de estar conectado a internet y que las credenciales sean correctas.');
  } finally {
    await prisma.$disconnect();
  }
}

reset();
