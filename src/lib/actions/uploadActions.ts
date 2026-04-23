'use server';

import { createClient } from '@supabase/supabase-js';

// Usar Service Role Key para poder manipular Storage y crear buckets si no existen.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const BUCKET_NAME = 'servicios';

async function asegurarBucket() {
  const { data, error } = await supabaseAdmin.storage.getBucket(BUCKET_NAME);
  if (error && error.message.includes('not found')) {
    // Crear el bucket público
    await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/jpg']
    });
  }
}

/**
 * Recibe FormData con el archivo a subir y el ID del proveedor (para aislar en carpetas).
 */
export async function uploadServiceImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File;
    const proveedorId = formData.get('proveedorId') as string;

    if (!file || !proveedorId) {
      return { success: false, error: 'Falta el archivo o el ID del proveedor' };
    }

    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Solo se permiten imágenes (jpg, png, webp)' };
    }

    // Asegurarse de que el bucket exista y sea público
    await asegurarBucket();

    // Generar nombre de archivo seguro
    const fileExt = file.name.split('.').pop();
    const fileName = `${proveedorId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convertir a ArrayBuffer para subir
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Error supabase upload:', error);
      return { success: false, error: 'Error interno al guardar la imagen' };
    }

    // Obtener la URL pública permanente
    const { data: publicData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return { 
      success: true, 
      url: publicData.publicUrl 
    };

  } catch (error) {
    console.error('Upload Error:', error);
    return { success: false, error: 'Fallo catastrófico al procesar el archivo' };
  }
}

/**
 * Sube una imagen de invitación (diseño propio, portada, etc) a una carpeta específica por evento.
 */
export async function uploadInvitationAsset(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File;
    const eventoId = formData.get('eventoId') as string;

    if (!file || !eventoId) {
      return { success: false, error: 'Falta el archivo o el ID del evento' };
    }

    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Solo se permiten imágenes' };
    }

    // Asegurarse de que el bucket exista
    await asegurarBucket();

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `invitaciones/${eventoId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Error uploading invitation asset:', error);
      return { success: false, error: 'Error al subir la imagen al servidor' };
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return { 
      success: true, 
      url: publicData.publicUrl 
    };

  } catch (error) {
    console.error('Invitation upload error:', error);
    return { success: false, error: 'Fallo al procesar el activo de invitación' };
  }
}

/**
 * Sube una imagen al portafolio del proveedor.
 */
export async function uploadPortfolioImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File;
    const proveedorId = formData.get('proveedorId') as string;

    if (!file || !proveedorId) {
      return { success: false, error: 'Falta el archivo o el ID del proveedor' };
    }

    await asegurarBucket();

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `portafolio/${proveedorId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Error uploading portfolio image:', error);
      return { success: false, error: 'Error al guardar la imagen' };
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return { 
      success: true, 
      url: publicData.publicUrl 
    };

  } catch (error) {
    console.error('Portfolio upload error:', error);
    return { success: false, error: 'Fallo al procesar la imagen' };
  }
}
