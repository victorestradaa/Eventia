import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
const prisma = new PrismaClient();

async function main() {
  const lines = [];
  const servicios = await prisma.servicio.findMany({ include: { proveedor: true } });
  
  for (const s of servicios) {
    lines.push('SERVICIO: ' + JSON.stringify({
      servicioActivo: s.activo,
      proveedorNombre: s.proveedor?.nombre,
      proveedorActivo: s.proveedor?.activo,
      categoria: s.proveedor?.categoria,
      ciudad: s.proveedor?.ciudad,
      precio: Number(s.precio)
    }));
  }

  const reservas = await prisma.reserva.findMany({ include: { servicio: { select: { nombre: true } } } });
  for (const r of reservas) {
    lines.push('RESERVA: ' + JSON.stringify({
      id: r.id.slice(-8),
      cliente: r.nombreClienteExterno,
      clienteId: r.clienteId ? 'SI' : 'NO',
      fecha: r.fechaEvento?.toISOString().split('T')[0],
      servicio: r.servicio?.nombre,
      monto: Number(r.montoTotal),
      estado: r.estado,
      turno: r.horaInicio ? r.horaInicio+'-'+r.horaFin : 'DIA_COMPLETO'
    }));
  }
  
  fs.writeFileSync('./scripts/output.txt', lines.join('\n'), 'utf8');
  console.log('Listo: scripts/output.txt');
}

main().catch(console.error).finally(() => prisma.$disconnect());
