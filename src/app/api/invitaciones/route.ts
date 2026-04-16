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

    // LOG DE SEGURIDAD PARA DEPURACIÓN
    console.log('--- INTENTO DE GUARDADO ---');
    console.log('Tamaño del Payload:', JSON.stringify(data).length / 1024, 'KB');

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
        regaloClabe: data.regaloClabe,
        isInvitacionPropia: data.isInvitacionPropia || false,
        archivoAdjunto: data.archivoAdjunto, 
        configWeb: data.configWeb || {},
        tipoInvitacion: data.tipoInvitacion || 'BASICA',
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
        regaloClabe: data.regaloClabe,
        isInvitacionPropia: data.isInvitacionPropia || false,
        archivoAdjunto: data.archivoAdjunto,
        configWeb: data.configWeb || {},
        tipoInvitacion: data.tipoInvitacion || 'BASICA',
      },
    });

    return NextResponse.json({ success: true, invitacion: JSON.parse(JSON.stringify(invitacion)) });
  } catch (error: any) {
    console.error('--- ERROR EN /API/INVITACIONES ---');
    console.error('Mensaje:', error.message);
    if (error.code) console.error('Código Prisma:', error.code);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
