/**
 * Utilidades síncronas para el módulo Punto de Venta.
 * NO debe llevar 'use server' — se usa desde client components.
 */

export type MetPagPV = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';
export type TipoMovPV = 'VENTA' | 'ABONO' | 'RETIRO' | 'INGRESO' | 'AJUSTE';

export function calcularTotalesSesion(movimientos: Array<{
  tipo: TipoMovPV;
  metodoPago: MetPagPV;
  monto: number | string;
}>) {
  const tot = {
    porMetodo: { EFECTIVO: 0, TARJETA: 0, TRANSFERENCIA: 0, OTRO: 0 } as Record<MetPagPV, number>,
    porTipo:  { VENTA: 0, ABONO: 0, RETIRO: 0, INGRESO: 0, AJUSTE: 0 } as Record<TipoMovPV, number>,
    netoEfectivo: 0,
  };
  for (const m of movimientos) {
    const monto = Number(m.monto);
    tot.porTipo[m.tipo] += monto;
    tot.porMetodo[m.metodoPago] += (m.tipo === 'RETIRO' ? -monto : monto);
    if (m.metodoPago === 'EFECTIVO') {
      tot.netoEfectivo += (m.tipo === 'RETIRO' ? -monto : monto);
    }
  }
  return tot;
}
