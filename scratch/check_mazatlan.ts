
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkMazatlan() {
  const providers = await prisma.proveedor.findMany({
    where: { ciudad: { contains: 'Mazat' } },
    select: { id: true, nombre: true, ciudad: true }
  });

  const clients = await prisma.cliente.findMany({
    where: { ciudad: { contains: 'Mazat' } },
    select: { id: true, ciudad: true, usuario: { select: { nombre: true, email: true } } }
  });

  console.log('--- PROVEEDORES ---');
  providers.forEach(p => console.log(`ID: ${p.id} | Nombre: ${p.nombre} | Ciudad: "${p.ciudad}" (Length: ${p.ciudad.length})`));

  console.log('\n--- CLIENTES ---');
  clients.forEach(c => console.log(`ID: ${c.id} | Nombre: ${c.usuario.nombre} | Email: ${c.usuario.email} | Ciudad: "${c.ciudad}" (Length: ${c.ciudad.length})`));
}

checkMazatlan().finally(() => prisma.$disconnect());
