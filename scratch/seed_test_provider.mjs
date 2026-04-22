import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test provider...');
  
  const email = `test_provider_${Date.now()}@example.com`;
  
  const user = await prisma.usuario.create({
    data: {
      email,
      nombre: 'Salón de Fiestas Majestic',
      rol: 'PROVEEDOR',
      proveedor: {
        create: {
          nombre: 'Majestic Salón Premium',
          categoria: 'SALON',
          ciudad: 'Guadalajara',
          estado: 'Jalisco',
          plan: 'PREMIUM',
          servicios: {
            create: {
              nombre: 'Renta de Salón de Lujo',
              precio: 45000,
              capacidadMax: 300,
              capacidadMin: 50,
              imagenes: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'],
              activo: true,
            }
          }
        }
      }
    }
  });

  console.log('Test provider created:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
