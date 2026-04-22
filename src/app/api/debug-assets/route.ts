import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const assets = await prisma.catalogoAsset.findMany({
      orderBy: { creadoEn: 'desc' },
      take: 10
    });
    
    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
