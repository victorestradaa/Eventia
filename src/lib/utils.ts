import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatearMoneda(monto: number | string): string {
  const numero = typeof monto === 'string' ? parseFloat(monto) : monto
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(numero)
}

export function formatearFecha(fecha: Date | string): string {
  if (!fecha) return '';
  let d: Date;
  if (typeof fecha === 'string') {
    // Extraer componentes del string YYYY-MM-DD
    const [year, month, day] = fecha.split('T')[0].split(/[-/]/).map(Number);
    d = new Date(year, month - 1, day, 12, 0, 0);
  } else {
    // Si ya es un objeto Date (ej. de Prisma), lo movemos al mediodía local
    const date = new Date(fecha);
    d = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0);
  }
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function formatearFechaCorta(fecha: Date | string): string {
  if (!fecha) return '';
  let d: Date;
  if (typeof fecha === 'string') {
    const [year, month, day] = fecha.split('T')[0].split(/[-/]/).map(Number);
    d = new Date(year, month - 1, day, 12, 0, 0);
  } else {
    const date = new Date(fecha);
    d = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0);
  }
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export const CATEGORIAS_LABELS: Record<string, string> = {
  SALON: 'Salones',
  MUSICA: 'Música',
  COMIDA: 'Banquetes',
  ANIMACION: 'Animación',
  FOTOGRAFIA: 'Foto & Video',
  DECORACION: 'Decoración',
  RECUERDOS: 'Recuerdos',
  MOBILIARIO: 'Inmobiliario',
}

export const TIPO_EVENTO_LABELS: Record<string, string> = {
  BODA: 'Boda',
  XV_ANOS: 'XV Años',
  BAUTIZO: 'Bautizo',
  FIESTA_INFANTIL: 'Fiesta Infantil',
  FIESTA_GENERAL: 'Fiesta General',
  TODOS: 'Cualquier Evento',
}

export const PLANES_PROVEEDOR_LABELS: Record<string, string> = {
  GRATIS: 'Gratis',
  INTERMEDIO: 'Intermedio',
  PREMIUM: 'PRO',
  ELITE: 'Elite',
}

export const ESTADOS_RESERVA_LABELS: Record<string, string> = {
  TEMPORAL: 'Temporal (sin anticipo)',
  APARTADO: 'Apartado (con anticipo)',
  LIQUIDADO: 'Liquidado',
  CANCELADO: 'Cancelado',
}

export const ESTADOS_RESERVA_COLORES: Record<string, string> = {
  TEMPORAL: '#F59E0B',   // Amarillo
  APARTADO: '#F97316',   // Naranja
  LIQUIDADO: '#10B981',  // Verde
  CANCELADO: '#6B7280',  // Gris
}
