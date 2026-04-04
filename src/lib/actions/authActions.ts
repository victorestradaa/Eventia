'use server';

import { createClient } from '@/lib/supabase/servidor';
import { prisma } from '@/lib/prisma';

/**
 * Obtiene el perfil completo del usuario actual desde la base de datos (Prisma).
 * Útil para obtener el clienteId o proveedorId necesario en otras acciones.
 */
export async function getCurrentProfile() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'No autenticado' };
    }

    const perfil = await prisma.usuario.findUnique({
      where: { email: user.email },
      include: {
        cliente: true,
        proveedor: true
      }
    });

    if (!perfil) {
      // Recuperación Zombie: El usuario existe en Supabase pero no en Prisma (ocurre si falla la DB en el registro)
      console.warn('⚠️ Perfil Zombie recuperado y creado automáticamente para:', user.email);
      const emailName = user.email ? user.email.split('@')[0] : 'Usuario';
      
      const usuarioRecuperado = await prisma.usuario.create({
        data: {
          email: user.email!,
          nombre: emailName,
          rol: 'CLIENTE',
          cliente: { create: {} }
        },
        include: {
          cliente: true,
          proveedor: true
        }
      });
      
      return { success: true, data: usuarioRecuperado };
    }

    return { success: true, data: perfil };
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return { success: false, error: 'Error del servidor' };
  }
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  // Usamos dynamic import para no romper la ejecución de la función
  const { redirect } = await import('next/navigation');
  redirect('/login');
}

/**
 * Registra un nuevo usuario en la base de datos de Prisma
 */
export async function registrarUsuario(data: { email: string; nombre: string; rol: 'CLIENTE' | 'PROVEEDOR' }) {
  try {
    const existe = await prisma.usuario.findUnique({
      where: { email: data.email }
    });

    if (existe) {
      return { success: false, error: 'El correo electrónico ya está registrado.' };
    }

    const usuario = await prisma.usuario.create({
      data: {
        email: data.email,
        nombre: data.nombre,
        rol: data.rol,
        ...(data.rol === 'CLIENTE' ? {
          cliente: { create: {} }
        } : {
          proveedor: {
            create: {
              nombre: data.nombre,
              categoria: 'SALON',
              ciudad: 'Sin asignar',
              estado: 'Sin asignar'
            }
          }
        })
      }
    });

    return { success: true, data: usuario };
  } catch (error) {
    console.error('Error en registrarUsuario:', error);
    const mensajeError = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Error DB: ${mensajeError}` };
  }
}
