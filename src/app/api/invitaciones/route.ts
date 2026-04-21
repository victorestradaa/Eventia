import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. Inicializar cliente de Supabase para el servidor
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // En los Route Handlers, la actualización de cookies (refresh token)
            // se suele delegar al middleware. Por eso lo dejamos vacío aquí.
          },
        },
      }
    );

    // 2. Verificar que el usuario está autenticado de forma segura
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    // 3. Validar que el evento le pertenece a este usuario (Prevenir Vulnerabilidad IDOR)
    const evento = await prisma.evento.findUnique({ where: { id: data.eventoId } });
    if (!evento || evento.propietarioId !== user.id) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
    }

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
      { success: false, error: 'Error interno del servidor. Por favor, intenta de nuevo más tarde.' },
      { status: 500 }
    );
  }
}
