'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentProfile } from './authActions';
import { revalidatePath } from 'next/cache';

export async function getCuentasBancarias(proveedorId: string) {
  try {
    const cuentas = await prisma.cuentaBancaria.findMany({
      where: { proveedorId },
      orderBy: { creadoEn: 'desc' }
    });
    return { success: true, data: cuentas };
  } catch (error) {
    console.error('Error obteniendo cuentas bancarias:', error);
    return { success: false, error: 'Error al cargar los datos bancarios' };
  }
}

export async function createCuentaBancaria(data: {
  banco: string;
  tipo: string;
  numero: string;
  titular: string;
}) {
  try {
    const profileRes = await getCurrentProfile();
    if (!profileRes.success || !profileRes.data?.proveedor) {
      return { success: false, error: 'No autorizado' };
    }

    const proveedorId = profileRes.data.proveedor.id;

    // Verificar si es la primera cuenta para hacerla principal
    const count = await prisma.cuentaBancaria.count({ where: { proveedorId } });

    const cuenta = await prisma.cuentaBancaria.create({
      data: {
        proveedorId,
        banco: data.banco,
        tipo: data.tipo,
        numero: data.numero,
        titular: data.titular,
        esPrincipal: count === 0
      }
    });

    revalidatePath('/proveedor/datos-bancarios');
    return { success: true, data: cuenta };
  } catch (error) {
    console.error('Error creando cuenta bancaria:', error);
    return { success: false, error: 'No se pudo guardar la cuenta bancaria' };
  }
}

export async function deleteCuentaBancaria(id: string) {
  try {
    const profileRes = await getCurrentProfile();
    if (!profileRes.success || !profileRes.data?.proveedor) {
      return { success: false, error: 'No autorizado' };
    }

    const proveedorId = profileRes.data.proveedor.id;

    // Asegurar que la cuenta pertenezca al proveedor
    await prisma.cuentaBancaria.delete({
      where: {
        id,
        proveedorId
      }
    });

    // Si borró la principal, asignar otra si existe
    const restantes = await prisma.cuentaBancaria.findMany({
      where: { proveedorId },
      orderBy: { creadoEn: 'asc' }
    });

    if (restantes.length > 0 && !restantes.some(c => c.esPrincipal)) {
      await prisma.cuentaBancaria.update({
        where: { id: restantes[0].id },
        data: { esPrincipal: true }
      });
    }

    revalidatePath('/proveedor/datos-bancarios');
    return { success: true };
  } catch (error) {
    console.error('Error eliminando cuenta:', error);
    return { success: false, error: 'No se pudo eliminar la cuenta' };
  }
}

export async function setCuentaPrincipal(id: string) {
  try {
    const profileRes = await getCurrentProfile();
    if (!profileRes.success || !profileRes.data?.proveedor) {
      return { success: false, error: 'No autorizado' };
    }

    const proveedorId = profileRes.data.proveedor.id;

    // Remover principal de todas
    await prisma.cuentaBancaria.updateMany({
      where: { proveedorId },
      data: { esPrincipal: false }
    });

    // Setear nueva principal
    await prisma.cuentaBancaria.update({
      where: { id, proveedorId },
      data: { esPrincipal: true }
    });

    revalidatePath('/proveedor/datos-bancarios');
    return { success: true };
  } catch (error) {
    console.error('Error actualizando cuenta principal:', error);
    return { success: false, error: 'Error al cambiar cuenta principal' };
  }
}
