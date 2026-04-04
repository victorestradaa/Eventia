// Inyectar o sanitizar las variables de entorno de AWS
if (typeof process !== 'undefined') {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://postgres.agdqreveheewmbujzlwe:*_N0viembre%3D%4012@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&sslaccept=accept_invalid_certs&connection_limit=1';
  } else {
    // Si AWS inyectó comillas dobles o simples literales en la cadena, las eliminamos
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/^['"]|['"]$/g, '');
    
    // Forzar connection_limit=1 siempre para AWS Lambda Serverless si no existe
    if (!process.env.DATABASE_URL.includes('connection_limit=')) {
      process.env.DATABASE_URL += '&connection_limit=1';
    }
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
