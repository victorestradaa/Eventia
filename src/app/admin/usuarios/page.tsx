import React from 'react';
import { prisma } from '@/lib/prisma';
import UsuariosClient from './UsuariosClient';

export default async function UsuariosPage() {
  // Obtenemos todos los usuarios con sus perfiles de cliente y proveedor
  const users = await prisma.usuario.findMany({
    include: {
      cliente: true,
      proveedor: true
    },
    orderBy: { creadoEn: 'desc' },
  });

  // Serializamos para evitar problemas de props con Decimal o fechas
  const serializedUsers = JSON.parse(JSON.stringify(users));

  return <UsuariosClient initialUsers={serializedUsers} />;
}
