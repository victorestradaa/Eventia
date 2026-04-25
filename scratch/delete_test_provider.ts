import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'test_provider_1776850007661@example.com'
  
  console.log(`Buscando usuario con email: ${email}...`)
  
  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { proveedor: true }
  })

  if (!usuario) {
    console.log('No se encontró el usuario.')
    return
  }

  console.log(`Usuario encontrado: ${usuario.nombre} (ID: ${usuario.id})`)
  
  if (usuario.proveedor) {
    console.log(`Borrando proveedor: ${usuario.proveedor.nombre} (ID: ${usuario.id})...`)
    // El cascado borrará servicios, complementos, portafolio, etc.
  }

  const deleted = await prisma.usuario.delete({
    where: { id: usuario.id }
  })

  console.log(`Usuario y todos sus datos relacionados (proveedor, servicios, etc.) borrados con éxito.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
