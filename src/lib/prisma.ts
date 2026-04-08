// Saneamiento de URLs de conexión para AWS Lambda
const sanitizePrismaUrl = (url?: string) => {
  if (!url || typeof url !== 'string') return url;
  let clean = url.trim().replace(/^['"]|['"]$/g, '').trim();
  
  if (clean && !clean.startsWith('postgres')) {
    const match = clean.match(/postgres(?:ql)?:\/\/.+/);
    if (match) clean = match[0];
  }

  if (clean && !clean.includes('connection_limit=')) {
    clean += (clean.includes('?') ? '&' : '?') + 'connection_limit=1';
  }
  return clean;
};

// Obtenemos la URL final
const dbUrl = sanitizePrismaUrl(
  process.env.DATABASE_URL || 
  'postgresql://postgres.agdqreveheewmbujzlwe:*_N0viembre%3D%4012@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&sslaccept=accept_invalid_certs&connection_limit=1'
);

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
