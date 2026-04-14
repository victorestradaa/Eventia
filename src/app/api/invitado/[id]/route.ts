import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();

    // El frontend envía rsvpStatus, Prisma espera rsvpEstado
    const { rsvpStatus, ...rest } = data;
    const updateData: any = { ...rest };
    if (rsvpStatus !== undefined) {
      updateData.rsvpEstado = rsvpStatus;
    }

    const invitadoActualizado = await prisma.invitado.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: invitadoActualizado });
  } catch (error: any) {
    console.error(`Error updating guest:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
