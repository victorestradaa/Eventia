// Saneamiento de URLs de conexión para AWS Lambda
// AWS Amplify puede inyectar comillas o espacios en las variables de entorno configuradas por consola
const sanitizePrismaUrl = (url?: string) => {
  if (!url) return undefined;
  // Eliminamos comillas dobles, simples y espacios al inicio/final
  let clean = url.trim().replace(/^['"]|['"]$/g, '').trim();
  // Aseguramos connection_limit=1 para el entorno Serverless de Lambda
  if (clean && !clean.includes('connection_limit=')) {
    clean += (clean.includes('?') ? '&' : '?') + 'connection_limit=1';
  }
  return clean;
};

if (typeof process !== 'undefined') {
  // 1. DATABASE_URL (Sesión principal)
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
    process.env.DATABASE_URL = sanitizePrismaUrl('postgresql://postgres.agdqreveheewmbujzlwe:*_N0viembre%3D%4012@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&sslaccept=accept_invalid_certs');
  } else {
    process.env.DATABASE_URL = sanitizePrismaUrl(process.env.DATABASE_URL);
  }

  // 2. DIRECT_URL (Para migraciones e introspección)
  if (process.env.DIRECT_URL) {
    process.env.DIRECT_URL = sanitizePrismaUrl(process.env.DIRECT_URL);
  } else {
    process.env.DIRECT_URL = sanitizePrismaUrl('postgresql://postgres.agdqreveheewmbujzlwe:*_N0viembre%3D%4012@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require&sslaccept=accept_invalid_certs');
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
