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

    // Si viene con acompañantes, lo tratamos como una transacción o creamos primero el titular
    let nuevoInvitado;
    
    if (data.acompanantes && Array.isArray(data.acompanantes) && data.acompanantes.length > 0) {
      // Es un titular con acompañantes
      nuevoInvitado = await prisma.$transaction(async (tx) => {
        const titular = await tx.invitado.create({
          data: {
            eventoId: data.eventoId,
            nombre: data.nombre,
            email: data.email || null,
            telefono: data.telefono || null,
            lado: data.lado || null,
            categoria: data.categoria || null,
            tipoPersona: data.tipoPersona || null,
            esGrupoTitular: true,
          }
        });

        // Crear acompañantes atados al titular
        await Promise.all(data.acompanantes.map((acomp: any) => 
          tx.invitado.create({
            data: {
              eventoId: data.eventoId,
              nombre: acomp.nombre,
              tipoPersona: acomp.tipoPersona || 'HOMBRE',
              categoria: data.categoria || null, // Hereda categoría
              lado: data.lado || null, // Hereda lado
              grupoTitularId: titular.id,
              esGrupoTitular: false,
            }
          })
        ));

        return titular;
      });
    } else {
      // Creación normal individual o titular sin acompañantes en este momento
      nuevoInvitado = await prisma.invitado.create({
        data: {
          eventoId: data.eventoId,
          nombre: data.nombre,
          email: data.email || null,
          telefono: data.telefono || null,
          lado: data.lado || null,
          categoria: data.categoria || null,
          // @ts-ignore
          tipoPersona: data.tipoPersona || null,
          grupoTitularId: data.grupoTitularId || null,
          esGrupoTitular: data.esGrupoTitular || false,
        }
      });
    }

    return NextResponse.json({ success: true, data: nuevoInvitado });
  } catch (error: any) {
    console.error('Error in API /api/evento/invitado:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
