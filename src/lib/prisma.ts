// Saneamiento de URLs de conexión para AWS Lambda
// AWS Amplify puede inyectar comillas o espacios en las variables de entorno configuradas por consola
const sanitizePrismaUrl = (url?: string) => {
  if (!url || typeof url !== 'string') return url;
  // Eliminamos cualquier carácter que no sea parte de la URL (comillas, espacios, saltos de línea)
  let clean = url.trim().replace(/^['"]|['"]$/g, '').trim();
  
  // Aseguramos que empiece con postgresql o postgres
  if (clean && !clean.startsWith('postgres')) {
    // Si empieza con algo raro, intentamos buscar el inicio real
    const match = clean.match(/postgres(?:ql)?:\/\/.+/);
    if (match) clean = match[0];
  }

  // Aseguramos connection_limit=1 para el entorno Serverless de Lambda
  if (clean && !clean.includes('connection_limit=')) {
    clean += (clean.includes('?') ? '&' : '?') + 'connection_limit=1';
  }
  return clean;
};

if (typeof process !== 'undefined') {
  // 1. DATABASE_URL (Sesión principal con PgBouncer)
  if (process.env.DATABASE_URL) {
    process.env.DATABASE_URL = sanitizePrismaUrl(process.env.DATABASE_URL);
  } else {
    // Fallback directo si no existe en env (hardcoded de seguridad)
    process.env.DATABASE_URL = 'postgresql://postgres.agdqreveheewmbujzlwe:*_N0viembre%3D%4012@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&sslaccept=accept_invalid_certs&connection_limit=1';
  }

  // 2. DIRECT_URL (Puerto 5432)
  if (process.env.DIRECT_URL) {
    process.env.DIRECT_URL = sanitizePrismaUrl(process.env.DIRECT_URL);
  } else {
    // Fallback directo puerto 5432
    process.env.DIRECT_URL = 'postgresql://postgres.agdqreveheewmbujzlwe:*_N0viembre%3D%4012@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require&sslaccept=accept_invalid_certs&connection_limit=1';
  }
}



import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
