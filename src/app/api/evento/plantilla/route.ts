import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const { eventoId, plantilla: plantillaRaw } = await request.json();

    if (!eventoId || !plantillaRaw) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos.' },
        { status: 400 }
      );
    }

    const plantilla = plantillaRaw.toUpperCase();

    // Verificamos si existe el evento para evitar errores silenciosos
    const eventoExiste = await prisma.evento.findUnique({
      where: { id: eventoId },
      select: { id: true }
    });

    if (!eventoExiste) {
      return NextResponse.json(
        { success: false, error: 'El evento no existe.' },
        { status: 404 }
      );
    }

    const invitacion = await prisma.invitacionDigital.upsert({
      where: { eventoId },
      update: { plantilla },
      create: { 
        eventoId, 
        plantilla,
        titulo: 'Invitación Especial'
      }
    });

    // Forzamos revalidación
    try {
      revalidatePath(`/cliente/evento/${eventoId}`);
    } catch (re) {
      console.warn('RevalidatePath falló silenciosamente en API:', re);
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: invitacion.id,
        eventoId: invitacion.eventoId,
        plantilla: invitacion.plantilla,
        titulo: invitacion.titulo
      } 
    });

  } catch (error: any) {
    console.error('API Error crítico:', error);
    return NextResponse.json(
      { success: false, error: `Error de servidor: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}
