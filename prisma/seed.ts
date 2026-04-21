import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Usamos el Service Role para crear usuarios saltando restricciones
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🌱 Iniciando seedeo de base de datos...');

  const usersToCreate = [
    { email: 'admin@eventia.com', password: 'admin', role: 'ADMIN', name: 'Administrador Eventia' },
    { email: 'pamela@gmail.com', password: 'pamela', role: 'CLIENTE', name: 'Pamela' },
    { email: 'mariachi@gmail.com', password: 'pamela', role: 'PROVEEDOR', name: 'Mariachi Loco' },
  ];

  for (const u of usersToCreate) {
    console.log(`Creando/Verificando usuario: ${u.email}...`);
    const { data: authUser, error: errAuth } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { rol: u.role }
    });

    if (errAuth && !errAuth.message.includes('already registered')) {
      console.error(`Error creando ${u.email} en Auth:`, errAuth.message);
    }
  }

  // Obtener los IDs de auth
  const { data: { users }, error: errList } = await supabase.auth.admin.listUsers();
  if (errList) throw errList;

  console.log('Inyectando registros en Prisma...');

  for (const u of usersToCreate) {
    const authId = users.find(au => au.email?.toLowerCase() === u.email.toLowerCase())?.id;
    if (!authId) {
      console.warn(`⚠️ No se encontró el ID de Auth para ${u.email}. Saltando Prisma.`);
      continue;
    }

    if (u.role === 'ADMIN') {
      await prisma.usuario.upsert({
        where: { email: u.email },
        update: { id: authId, rol: 'ADMIN' },
        create: {
          id: authId,
          email: u.email,
          nombre: u.name,
          rol: 'ADMIN',
        }
      });
    } else if (u.role === 'CLIENTE') {
      await prisma.usuario.upsert({
        where: { email: u.email },
        update: { id: authId },
        create: {
          id: authId,
          email: u.email,
          nombre: u.name,
          rol: 'CLIENTE',
          cliente: {
            create: {
              plan: 'FREE'
            }
          }
        }
      });
    } else if (u.role === 'PROVEEDOR') {
      await prisma.usuario.upsert({
        where: { email: u.email },
        update: { id: authId },
        create: {
          id: authId,
          email: u.email,
          nombre: u.name,
          rol: 'PROVEEDOR',
          proveedor: {
            create: {
              nombre: u.name,
              descripcion: 'Servicio inicial de prueba.',
              categoria: 'MUSICA',
              ciudad: 'Ciudad de México',
              estado: 'CDMX',
              plan: 'GRATIS',
              servicios: {
                create: [
                  {
                    nombre: 'Servicio de Prueba',
                    precio: 1000,
                  }
                ]
              }
            }
          }
        }
      });
    }
  }

  console.log('✅ Seedeo completado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
