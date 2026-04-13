import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.eventoId) {
      return NextResponse.json(
        { success: false, error: 'eventoId es requerido' },
        { status: 400 }
      );
    }

    // Upsert (crear o actualizar) la invitación digital
    const invitacion = await prisma.invitacionDigital.upsert({
      where: { eventoId: data.eventoId },
      update: {
        plantilla: data.plantilla,
        fondoUrl: data.fondoUrl,
        colorTexto: data.colorTexto,
        titulo: data.titulo,
        mensaje: data.mensaje,
        lugarTexto: data.lugarTexto,
        vestimenta: data.vestimenta,
        isInvitacionPropia: data.isInvitacionPropia || false,
        archivoAdjunto: data.archivoAdjunto, // Puede ser null o string (base64/url)
      },
      create: {
        eventoId: data.eventoId,
        plantilla: data.plantilla || "custom",
        fondoUrl: data.fondoUrl,
        colorTexto: data.colorTexto,
        titulo: data.titulo || "¡Estás Invitado!",
        mensaje: data.mensaje,
        lugarTexto: data.lugarTexto,
        vestimenta: data.vestimenta,
        isInvitacionPropia: data.isInvitacionPropia || false,
        archivoAdjunto: data.archivoAdjunto,
      },
    });

    return NextResponse.json({ success: true, invitacion: JSON.parse(JSON.stringify(invitacion)) });
  } catch (error: any) {
    console.error('Error en /api/invitaciones POST:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
