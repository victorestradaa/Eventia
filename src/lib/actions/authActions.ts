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
      return { success: false, error: `AUTH_LOST: ${authError?.message || 'No user session found'}` };
    }

    // Use case-insensitive search to prevent Auth vs Prisma email casing mismatches
    const perfil = await prisma.usuario.findFirst({
      where: { 
        email: { equals: user.email, mode: 'insensitive' }
      },
      include: {
        cliente: true,
        proveedor: true
      }
    });

    if (!perfil) {
      console.warn(`[Auto-Heal] Perfil zombie detectado para: ${user.email}. Intentando auto-reparación...`);
      
      // Attempt to self-heal the zombie account using the metadata stored in Supabase during sign_up
      const metadata = user.user_metadata || {};
      const intentRol = (metadata.rol || 'CLIENTE').toUpperCase();
      const validRol = (intentRol === 'PROVEEDOR' || intentRol === 'ADMIN') ? intentRol : 'CLIENTE';
      const fallbackName = user.email ? user.email.split('@')[0] : 'Usuario';
      
      try {
        const nuevoPerfilRes = await registrarUsuario({
          email: user.email!,
          nombre: metadata.nombre || fallbackName,
          rol: validRol as 'CLIENTE' | 'PROVEEDOR',
          categoria: metadata.categoria || undefined
        });

        if (nuevoPerfilRes.success && nuevoPerfilRes.data) {
          console.log(`[Auto-Heal] Reparación exitosa para ${user.email}`);
          // Recargar el perfil desde la base de datos para asegurar todas las relaciones
          const perfilReparado = await prisma.usuario.findFirst({
            where: { email: { equals: user.email, mode: 'insensitive' } },
            include: { cliente: true, proveedor: true }
          });
          return { success: true, data: perfilReparado };
        }
      } catch (healError) {
        console.error('[Auto-Heal] Fallo catastrófico al intentar reparar:', healError);
      }

      return { success: false, error: 'PROFILE_MISSING', zombie: true };
    }

    return { success: true, data: perfil };
  } catch (error: any) {
    console.error('Error al obtener perfil:', error);
    return { 
      success: false, 
      error: `SYSTEM_ERROR: ${error.message || 'Unknown error during profile fetch'}` 
    };
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

    return { success: false, error: 'No se pudo registrar el usuario debido a un error interno.' };
  }
}
