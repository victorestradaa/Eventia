import { MercadoPagoConfig } from 'mercadopago';

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.warn('⚠️ MERCADOPAGO_ACCESS_TOKEN is missing in environment variables');
}

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  options: { timeout: 5000 }
});
