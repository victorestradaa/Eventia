'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const BUCKET_NAME = 'servicios';

/**
 * Obtiene el álbum de un evento o lo crea si no existe.
 */
export async function getOrCreateAlbum(eventoId: string) {
  try {
    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
      include: { album: { include: { media: { orderBy: { creadoEn: 'desc' } } } } }
    });

    if (!evento) return { success: false, error: 'Evento no encontrado' };
    if (evento.album) return { success: true, album: evento.album };

    // Crear álbum nuevo
    const slugBase = slugify(evento.nombre);
    const shortId = Math.random().toString(36).substring(7);
    const slug = `${slugBase}-${shortId}`;

    const newAlbum = await prisma.albumDigital.create({
      data: {
        eventoId,
        slug,
        activo: true,
        config: { allowVideos: true, pin: null }
      },
      include: { media: true }
    });

    return { success: true, album: newAlbum };
  } catch (error) {
    console.error('getOrCreateAlbum error:', error);
    return { success: false, error: 'Error al gestionar el álbum' };
  }
}

/**
 * Actualiza la configuración del álbum (PIN, activo, etc)
 */
export async function updateAlbumConfig(albumId: string, config: any) {
  try {
    await prisma.albumDigital.update({
      where: { id: albumId },
      data: { 
        activo: config.activo,
        config: config
      }
    });
    revalidatePath(`/cliente/evento/[id]/album`, 'page');
    return { success: true };
  } catch (error) {
    console.error('updateAlbumConfig error:', error);
    return { success: false, error: 'Error al guardar configuración' };
  }
}

/**
 * Sube una imagen o video al álbum del evento.
 */
export async function uploadAlbumMedia(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const albumId = formData.get('albumId') as string;
    const tipo = formData.get('tipo') as 'IMAGE' | 'VIDEO';

    if (!file || !albumId) return { success: false, error: 'Datos incompletos' };

    // Validar video 30s si es video (esto se hace mejor en cliente, pero aquí validamos peso)
    if (tipo === 'VIDEO' && file.size > 50 * 1024 * 1024) {
      return { success: false, error: 'Video demasiado pesado (Max 50MB)' };
    }

    const fileExt = file.name.split('.').pop() || (tipo === 'IMAGE' ? 'jpg' : 'mp4');
    const fileName = `albums/${albumId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;

    const { data: publicData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    const media = await prisma.albumMedia.create({
      data: {
        albumId,
        url: publicData.publicUrl,
        tipo,
        nombreArchivo: file.name,
        tamanio: file.size
      }
    });

    revalidatePath(`/album/${albumId}`);
    return { success: true, media };
  } catch (error) {
    console.error('uploadAlbumMedia error:', error);
    return { success: false, error: 'Error al subir archivo' };
  }
}

/**
 * Elimina una foto o video del álbum.
 */
export async function deleteAlbumMedia(mediaId: string, albumId: string) {
  try {
    const media = await prisma.albumMedia.findUnique({ where: { id: mediaId } });
    if (!media) return { success: false, error: 'Archivo no encontrado' };

    // Extraer path de la URL pública
    // Ejemplo: .../storage/v1/object/public/servicios/albums/id/file.jpg
    const urlParts = media.url.split(`${BUCKET_NAME}/`);
    const filePath = urlParts[urlParts.length - 1];

    if (filePath) {
      await supabaseAdmin.storage.from(BUCKET_NAME).remove([filePath]);
    }

    await prisma.albumMedia.delete({ where: { id: mediaId } });
    
    revalidatePath(`/cliente/evento/[id]/album`, 'page');
    return { success: true };
  } catch (error) {
    console.error('deleteAlbumMedia error:', error);
    return { success: false, error: 'Error al eliminar archivo' };
  }
}

/**
 * Obtiene un álbum por su slug o ID para la vista pública.
 */
export async function getAlbumPublic(identifier: string) {
  try {
    const album = await prisma.albumDigital.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }]
      },
      include: { 
        media: { orderBy: { creadoEn: 'desc' } },
        evento: { select: { nombre: true, fecha: true } }
      }
    });
    return { success: !!album, album };
  } catch (error) {
    return { success: false, error: 'Error al cargar el álbum' };
  }
}
