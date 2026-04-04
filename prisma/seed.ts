import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Usamos el Service Role para crear usuarios saltando restricciones
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🌱 Iniciando seedeo de base de datos...');

  // 1. Crear Cliente (Pamela)
  console.log('Creando cliente: pamela@gmail.com...');
  const { data: authCliente, error: errCliente } = await supabase.auth.admin.createUser({
    email: 'pamela@gmail.com',
    password: 'pamela',
    email_confirm: true,
  });

  if (errCliente) {
    if (errCliente.message.includes('already registered')) {
      console.log('El usuario pamela ya existe en Supabase Auth.');
    } else {
      console.error('Error creando Pamela en Auth:', errCliente);
    }
  }

  // 2. Crear Proveedor (Mariachi)
  console.log('Creando proveedor: mariachi@gmail.com...');
  const { data: authProv, error: errProv } = await supabase.auth.admin.createUser({
    email: 'mariachi@gmail.com',
    password: 'pamela',
    email_confirm: true,
  });

  if (errProv && !errProv.message.includes('already registered')) {
    console.error('Error creando Mariachi en Auth:', errProv);
  }

  // Obtener los IDs de auth recién creados (o existentes)
  const { data: { users } } = await supabase.auth.admin.listUsers();
  
  const pamelaId = users.find(u => u.email === 'pamela@gmail.com')?.id;
  const mariachiId = users.find(u => u.email === 'mariachi@gmail.com')?.id;

  if (!pamelaId || !mariachiId) {
    throw new Error('No se pudieron encontrar los IDs de usuario en Auth');
  }

  console.log('Inyectando registros en Prisma...');

  // 3. Crear registros Prisma para Pamela
  await prisma.usuario.upsert({
    where: { email: 'pamela@gmail.com' },
    update: {},
    create: {
      id: pamelaId,
      email: 'pamela@gmail.com',
      nombre: 'Pamela',
      rol: 'CLIENTE',
      cliente: {
        create: {
          plan: 'FREE'
        }
      }
    }
  });

  // 4. Crear registros Prisma para Mariachi
  await prisma.usuario.upsert({
    where: { email: 'mariachi@gmail.com' },
    update: {},
    create: {
      id: mariachiId,
      email: 'mariachi@gmail.com',
      nombre: 'Mariachi Loco',
      rol: 'PROVEEDOR',
      proveedor: {
        create: {
          nombre: 'Mariachi Loco',
          descripcion: 'El mejor mariachi para tus eventos.',
          categoria: 'MUSICA',
          ciudad: 'Ciudad de México',
          estado: 'CDMX',
          plan: 'GRATIS',
          servicios: {
            create: [
              {
                nombre: '1 Hora de Mariachi',
                precio: 2500,
              }
            ]
          }
        }
      }
    }
  });

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
