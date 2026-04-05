/* full-reset.js */
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

// --- 1. CONFIGURACIÓN ---
// Sustituye con tu SERVICE_ROLE_KEY de la consola de Supabase (Project Settings -> API)
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZHFyZXZlaGVld21idWp6bHdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU3NTMyMCwiZXhwIjoyMDkwMTUxMzIwfQ.chF7ZcsoflgmoGHx1mDAAtI1n9MA0fIfihcoXwQgTwo';
const SUPABASE_URL = 'https://agdqreveheewmbujzlwe.supabase.co';

// URL de Prisma
const DATABASE_URL = 'postgresql://postgres.agdqreveheewmbujzlwe:*_N0viembre%3D%4012@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&sslaccept=accept_invalid_certs&connection_limit=1';

const prisma = new PrismaClient({
    datasources: { db: { url: DATABASE_URL } }
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    console.log('🚀 INICIANDO LIMPIEZA PROFUNDA (AUTH + DB)...');

    try {
        // A. Limpiar base de datos Prisma (Tablas)
        console.log('1/2 Vaciando tablas de la base de datos...');
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "Usuario" CASCADE;');
        console.log('✅ Tablas vaciadas.');

        // B. Limpiar Supabase Auth (Usuarios)
        console.log('2/2 Obteniendo lista de usuarios de Supabase Auth...');
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) throw listError;

        if (users.length === 0) {
            console.log('ℹ️ No hay usuarios en Supabase Auth para borrar.');
        } else {
            console.log(`Borrando ${users.length} usuarios de Autenticación...`);
            for (const user of users) {
                const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
                if (delError) {
                    console.log(`⚠️ No se pudo borrar a ${user.email}: ${delError.message}`);
                } else {
                    console.log(`✅ Borrado: ${user.email}`);
                }
            }
        }

        console.log('\n✨¡SISTEMA REINICIADO CON ÉXITO!✨');
        console.log('Ahora puedes registrarte desde cero sin conflictos.');

    } catch (err) {
        console.error('\n❌ ERROR FATAL:', err.message);
        if (err.message.includes('API key')) {
            console.log('RECUERDA: Este script requiere la "SERVICE_ROLE_KEY" de Supabase.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
