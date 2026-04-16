import { getCurrentProfile } from '@/lib/actions/authActions';
import { prisma } from '@/lib/prisma';
import InvitationEditorClient from './InvitationEditorClient';
import { redirect } from 'next/navigation';

// Helper para sanitizar objetos Decimal y fechas para componentes cliente
function sanitizeForClient(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForClient);
  
  if (obj instanceof Date) return obj.toISOString();
  
  if (typeof obj === 'object') {
    // Si es un objeto Decimal de Prisma
    if (obj.constructor && obj.constructor.name === 'Decimal') {
      return Number(obj);
    }
    // Si parece un objeto Decimal structurado (d, s, e)
    if (obj.d && Array.isArray(obj.d) && obj.s !== undefined) {
      return Number(obj);
    }
    
    // Si es un objeto que ya viene como Date string o necesita ser convertido
    // (aunque el check instanceof Date arriba es el principal)
    
    // Limpieza de seguridad contra Base64 pesados que causan error 413
    if (obj.galeriaFotos && Array.isArray(obj.galeriaFotos)) {
      obj.galeriaFotos = obj.galeriaFotos.map((f: any) => 
        (typeof f === 'string' && f.startsWith('data:image')) ? '' : f
      );
    }
    if (obj.coverUrl && typeof obj.coverUrl === 'string' && obj.coverUrl.startsWith('data:image')) {
      obj.coverUrl = '';
    }

    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = sanitizeForClient(obj[key]);
    }
    return newObj;
  }
  return obj;
}

export default async function InvitationsPage() {
  const profileRes = await getCurrentProfile();

  if (!profileRes.success || !profileRes.data) {
    return redirect('/login');
  }

  const perfil = profileRes.data;
  
  // Obtener el primer evento del cliente incluyendo invitacion e invitados
  const evento = await prisma.evento.findFirst({
    where: { clienteId: perfil.cliente?.id || '' },
    orderBy: { creadoEn: 'desc' },
    include: {
      invitacion: true,
      invitados: true // Fundamental para la nueva pestaña de envío
    }
  });

  const assets = await prisma.catalogoAsset.findMany({
    where: { 
      tipo: { in: ['FONDO', 'FUENTE'] } 
    }
  });

  const fondos = assets.filter(a => a.tipo === 'FONDO');
  const fuentes = assets.filter(a => a.tipo === 'FUENTE');

  // Aplicamos sanitización profunda para evitar errores de Decimal
  return (
    <InvitationEditorClient 
      evento={sanitizeForClient(evento)} 
      fondos={sanitizeForClient(fondos)}
      fuentes={sanitizeForClient(fuentes)}
    />
  );
}
