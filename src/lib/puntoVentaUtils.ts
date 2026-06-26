/**
 * Utilidades síncronas para el módulo Punto de Venta.
 * NO debe llevar 'use server' — se usa desde client components.
 */

export type MetPagPV = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';
export type TipoMovPV = 'VENTA' | 'ABONO' | 'RETIRO' | 'INGRESO' | 'AJUSTE' | 'GASTO';

/**
 * Tipos que descuentan del saldo (egresos).
 * RETIRO y GASTO siempre descuentan.
 * AJUSTE puede ser positivo o negativo según el monto.
 */
function esEgreso(tipo: TipoMovPV) {
  return tipo === 'RETIRO' || tipo === 'GASTO';
}

export function calcularTotalesSesion(movimientos: Array<{
  tipo: TipoMovPV;
  metodoPago: MetPagPV;
  monto: number | string;
}>) {
  const tot = {
    porMetodo: { EFECTIVO: 0, TARJETA: 0, TRANSFERENCIA: 0, OTRO: 0 } as Record<MetPagPV, number>,
    porTipo:  { VENTA: 0, ABONO: 0, RETIRO: 0, INGRESO: 0, AJUSTE: 0, GASTO: 0 } as Record<TipoMovPV, number>,
    netoEfectivo: 0,
  };
  for (const m of movimientos) {
    const monto = Number(m.monto);
    tot.porTipo[m.tipo] += monto;
    const efecto = esEgreso(m.tipo) ? -monto : monto;
    tot.porMetodo[m.metodoPago] += efecto;
    if (m.metodoPago === 'EFECTIVO') {
      tot.netoEfectivo += efecto;
    }
  }
  return tot;
}
