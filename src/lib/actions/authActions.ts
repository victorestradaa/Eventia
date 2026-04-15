'use server';

import { createClient } from '@/lib/supabase/servidor';
import { prisma } from '@/lib/prisma';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

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
      // IMPORTANTE: No asumimos que es CLIENTE — podría ser un PROVEEDOR cuyo registro DB falló.
      // En este caso lo creamos como CLIENTE (rol por defecto), pero el re-registro lo corregirá.
      // Este caso solo debería ocurrir si el paso 2 del registro falló por timeout.
      console.warn('⚠️ Perfil Zombie detectado para:', user.email, '— Redirigiendo a reintento de registro.');
      
      // En lugar de crear un perfil con rol incorrecto, devolvemos un error descriptivo
      // para que el middleware redirija al usuario a completar su registro.
      return { success: false, error: 'PROFILE_MISSING', zombie: true };
    }

    return { success: true, data: perfil };
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Error Prisma: ${msg}` };
  }
}

export async function cerrarSesion() {
  const supabase = await createClient();
  
  try {
    // 1. Sign out strictly from Supabase
    await supabase.auth.signOut();
    
    // 2. Manual cookie cleanup for extra safety (handles persistent sessions on some browsers)
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    
    // Supabase standard cookies
    const supabaseCookies = cookieStore.getAll().filter(c => c.name.startsWith('sb-') || c.name.includes('supabase'));
    supabaseCookies.forEach(c => {
      cookieStore.delete(c.name);
    });
  } catch (error) {
    console.error('Error in cerrarSesion:', error);
  } finally {
    // Revalidar y redireccionar siempre, pase lo que pase
    revalidatePath('/', 'layout');
    redirect('/login');
  }
}

import { CategoriaServicio } from '@prisma/client';

/**
 * Registra un nuevo usuario en la base de datos de Prisma
 */
export async function registrarUsuario(data: { 
  email: string; 
  nombre: string; 
  rol: 'CLIENTE' | 'PROVEEDOR';
  categoria?: CategoriaServicio;
}) {
  try {
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
              categoria: data.categoria || 'SALON',
              ciudad: 'Sin asignar',
              estado: 'Sin asignar'
            }
          }
        })
      }
    });

    return { success: true, data: usuario };
  } catch (error: any) {
    console.error('Error en registrarUsuario:', error);
    
    // P2002 es el error de Prisma para violaciones de campos UNIQUE
    if (error?.code === 'P2002') {
      return { success: false, error: 'El correo electrónico ya está registrado en la base de datos.' };
    }
    
    const mensajeError = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Error DB: ${mensajeError}` };
  }
}
