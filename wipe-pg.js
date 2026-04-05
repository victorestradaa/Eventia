const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.agdqreveheewmbujzlwe:*_N0viembre%3D%4012@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
  });

  try {
    console.log('Conectando a pg...');
    await client.connect();
    console.log('Conectado. Ejecutando TRUNCATE...');
    await client.query('TRUNCATE TABLE "Usuario" CASCADE;');
    console.log('✅ TRUNCATE completado.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
