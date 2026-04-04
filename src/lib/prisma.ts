// Inyectamos las variables de entorno de AWS si Amplify no las mapeó
if (typeof process !== 'undefined') {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://postgres.agdqreveheewmbujzlwe:*_N0viembre%3D%4012@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&sslaccept=accept_invalid_certs';
  }
  if (!process.env.DIRECT_URL) {
    process.env.DIRECT_URL = 'postgresql://postgres.agdqreveheewmbujzlwe:*_N0viembre%3D%4012@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require&sslaccept=accept_invalid_certs';
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
