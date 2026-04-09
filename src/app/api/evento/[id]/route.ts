import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
// Force build: 2026-04-09T02:30:00Z

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();

    const eventoActualizado = await prisma.evento.update({
      where: { id },
      data: {
        ...data,
        fecha: data.fecha ? new Date(data.fecha) : undefined,
      }
    });

    return NextResponse.json({ success: true, data: eventoActualizado });
  } catch (error: any) {
    console.error(`Error updating event ${id}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
