import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    if (!data.eventoId || !data.nombre) {
      return NextResponse.json(
        { success: false, error: 'EventoId y Nombre son obligatorios' },
        { status: 400 }
      );
    }

    const nuevoInvitado = await prisma.invitado.create({
      data: {
        eventoId: data.eventoId,
        nombre: data.nombre,
        email: data.email || null,
        telefono: data.telefono || null,
        lado: data.lado || null,
        categoria: data.categoria || null,
        // @ts-ignore - Prisma enum may cause issues if not exact
        tipoPersona: data.tipoPersona || null,
      }
    });

    return NextResponse.json({ success: true, data: nuevoInvitado });
  } catch (error: any) {
    console.error('Error in API /api/evento/invitado:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
