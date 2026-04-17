import { getCurrentProfile } from '@/lib/actions/authActions';
import { prisma } from '@/lib/prisma';
import InvitationEditorClient from './InvitationEditorClient';
import { redirect } from 'next/navigation';

// Helper para sanitizar objetos Decimal y fechas para componentes cliente
// Helper para sanitizar objetos Decimal y fechas para componentes cliente
// Previene el Error 413 limitando el tamaño de strings Base64/DataURIs
function sanitizeForClient(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  // Manejo de Arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForClient(item));
  }
  
  // Manejo de Fechas
  if (obj instanceof Date) return obj.toISOString();
  
  // Manejo de Strings (Validación de tamaño crítico para evitar Error 413)
  if (typeof obj === 'string') {
    // Si es un Base64/DataURI muy pesado (> 200KB), lo bloqueamos
    if (obj.length > 204800 && (obj.startsWith('data:') || obj.startsWith('base64'))) {
      console.warn(`[Sanitizer] Bloqueando asset pesado (${Math.round(obj.length/1024)}KB)`);
      return '';
    }
    return obj;
  }

  // Manejo de Objetos
  if (typeof obj === 'object') {
    // Si es un objeto Decimal de Prisma
    if (obj.constructor && obj.constructor.name === 'Decimal') {
      return Number(obj);
    }
    // Si parece un objeto Decimal structurado (d, s, e) de Prisma Client
    if (obj.d && Array.isArray(obj.d) && obj.s !== undefined) {
      return Number(obj);
    }

    const newObj: any = {};
    for (const key in obj) {
      // Evitar recursión infinita o propiedades de sistema si las hubiera
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = sanitizeForClient(obj[key]);
      }
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
      invitados: true, // Fundamental para la nueva pestaña de envío
      album: true
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
