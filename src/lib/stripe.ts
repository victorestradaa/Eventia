import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any, // Using any to bypass strict versioning if it varies by env
  typescript: true,
})

// Porcentajes de comisión por plan
export const COMISIONES = {
  GRATIS: 0.10,      // 10%
  INTERMEDIO: 0.07,  // 7%
  PREMIUM: 0.03,     // 3%
} as const

// Precios en centavos (MXN)
export const PRECIOS_MXN = {
  PROVEEDOR_INTERMEDIO: 4900,   // $49.00
  PROVEEDOR_PREMIUM: 14900,    // $149.00
  CLIENTE_ORO: 9900,           // $99.00
  CLIENTE_PLANNER: 29900,      // $299.00
} as const

export function calcularComision(monto: number, planProveedor: keyof typeof COMISIONES): number {
  return monto * COMISIONES[planProveedor]
}
