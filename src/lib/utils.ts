import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Helper to serialize Prisma objects (converts Decimals to numbers)
 */
export function serializePrisma<T>(data: T): any {
  if (!data) return data;
  return JSON.parse(JSON.stringify(data, (key, value) => 
    typeof value === 'object' && value !== null && value.constructor && value.constructor.name === 'Decimal' 
      ? Number(value) 
      : value
  ));
}

export function formatearMoneda(monto: number | string): string {
  const numero = typeof monto === 'string' ? parseFloat(monto) : monto
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(numero)
}

/**
 * Helper to parse a date or string into a Date object at midday local time
 * to prevent day shifts due to timezone offsets.
 */
export function parseFechaLocal(fecha: Date | string): Date {
  if (!fecha) return new Date();
  if (typeof fecha === 'string') {
    // Si el string trae hora (datetime-local "YYYY-MM-DDTHH:mm" o ISO completo),
    // preservar la hora en zona local.
    const tieneHora = fecha.includes('T') && /T\d{2}:\d{2}/.test(fecha);
    if (tieneHora) {
      const sinZona = fecha.replace(/(Z|[+-]\d{2}:?\d{2})$/, '');
      const [datePart, timePart = '00:00'] = sinZona.split('T');
      const [year, month, day] = datePart.split(/[-/]/).map(Number);
      const [hour = 0, minute = 0, second = 0] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute, second);
    }
    // Fecha-solo: anclar a mediodía local para evitar shifts por timezone.
    const soloFecha = fecha.split('T')[0];
    const [year, month, day] = soloFecha.split(/[-/]/).map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  } else {
    // Si ya es un objeto Date, lo movemos al mediodía local basándonos en sus valores UTC
    const date = new Date(fecha);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0);
  }
}

export function formatearFecha(fecha: Date | string): string {
  if (!fecha) return '';
  const d = parseFechaLocal(fecha);
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function formatearFechaCorta(fecha: Date | string): string {
  if (!fecha) return '';
  const d = parseFechaLocal(fecha);
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
  MOBILIARIO: 'Mobiliario',
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

/**
 * Verifica si un plan sigue vigente, considerando los 3 días de periodo de gracia.
 */
export function validarVigenciaPlan(planExpira: Date | string | null | undefined): boolean {
  if (!planExpira) return true; // Si no tiene fecha, asumimos vigente (legacy o free)
  
  const fechaExp = new Date(planExpira);
  const hoy = new Date();
  
  // Agregar 3 días de gracia
  const fechaLimite = new Date(fechaExp);
  fechaLimite.setDate(fechaLimite.getDate() + 3);
  
  return hoy <= fechaLimite;
}
