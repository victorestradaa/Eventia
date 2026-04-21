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

    // ── Modo Grupo Familiar ──────────────────────────────────────────────────
    // Si viene confirmadosIds[], es una confirmación grupal.
    // El titular selecciona quiénes asisten; los demás se marcan RECHAZADO.
    if (data.confirmadosIds !== undefined) {
      const { confirmadosIds } = data;

      // Obtener el titular (por su id real) y sus miembros
      const titular = await prisma.invitado.findUnique({
        where: { id },
        include: { grupoMiembros: true }
      });

      if (!titular) {
        return NextResponse.json({ success: false, error: 'Invitado no encontrado' }, { status: 404 });
      }

      // Todos los IDs del grupo (titular + miembros)
      const todosIds = [id, ...(titular as any).grupoMiembros.map((m: any) => m.id)];

      // Actualizar a cada miembro según si está en la lista de confirmados
      await Promise.all(todosIds.map((miembroId: string) =>
        prisma.invitado.update({
          where: { id: miembroId },
          data: { rsvpEstado: confirmadosIds.includes(miembroId) ? 'CONFIRMADO' : 'RECHAZADO' }
        })
      ));

      return NextResponse.json({ success: true });
    }

    // ── Modo Individual (comportamiento original) ─────────────────────────────
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
