/**
 * Generador de recibos PDF para pedidos del Punto de Venta Emprendedor.
 * Usa jsPDF (ya en dependencias). Carga el logo del proveedor desde su URL
 * pública de Supabase y lo embebe como base64.
 */

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export type PedidoPDF = {
  folio: number;
  tipo: 'VENTA_DIRECTA' | 'PEDIDO';
  estado: string;
  total: number | string;
  pagado: number | string;
  subtotal: number | string;
  descuento: number | string;
  fechaEntrega?: string | null;
  creadoEn: string;
  nombreCliente?: string | null;
  telefonoCliente?: string | null;
  notas?: string | null;
  trackingToken?: string;
  metodoPago?: string | null;
  cliente?: {
    nombre?: string;
    telefono?: string | null;
    email?: string | null;
  } | null;
  lineas: Array<{
    nombre: string;
    cantidad: number;
    precioUnit: number | string;
    subtotal: number | string;
  }>;
  proveedor?: {
    nombre?: string;
    logoUrl?: string | null;
    ciudad?: string | null;
    estado?: string | null;
    direccion?: string | null;
    telefono?: string | null;
    email?: string | null;
  };
};

const GOLD: [number, number, number] = [212, 175, 55]; // #d4af37
const DARK: [number, number, number] = [31, 41, 55];   // #1F2937
const GRAY: [number, number, number] = [107, 114, 128];

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function fmt(monto: number | string) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(Number(monto));
}

export async function generarReciboPDF(pedido: PedidoPDF): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: [105, 297], orientation: 'portrait' }); // ticket-like vertical
  // Si prefieres A5, usar: new jsPDF({ unit: 'mm', format: 'a5' })
  const W = 105;
  let y = 8;

  // ─── Header con logo + datos del proveedor ─────────────────────────────
  const prov = pedido.proveedor || {};

  // Logo
  if (prov.logoUrl) {
    const dataUrl = await loadImageAsDataUrl(prov.logoUrl);
    if (dataUrl) {
      try {
        const imgProps = doc.getImageProperties(dataUrl);
        const maxW = 28;
        const maxH = 18;
        const ratio = imgProps.width / imgProps.height;
        let w = maxW;
        let h = maxW / ratio;
        if (h > maxH) { h = maxH; w = maxH * ratio; }
        const x = (W - w) / 2;
        doc.addImage(dataUrl, 'PNG', x, y, w, h);
        y += h + 2;
      } catch {}
    }
  }

  // Nombre del proveedor
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text(prov.nombre || 'Recibo', W / 2, y, { align: 'center' });
  y += 5;

  // Datos secundarios
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  if (prov.direccion) {
    doc.text(prov.direccion, W / 2, y, { align: 'center', maxWidth: W - 10 });
    y += 3.5;
  }
  if (prov.ciudad || prov.estado) {
    const loc = [prov.ciudad, prov.estado].filter(Boolean).join(', ');
    doc.text(loc, W / 2, y, { align: 'center' });
    y += 3.5;
  }
  if (prov.telefono) {
    doc.text(`Tel: ${prov.telefono}`, W / 2, y, { align: 'center' });
    y += 3.5;
  }

  y += 1;
  // Línea separadora dorada
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(8, y, W - 8, y);
  y += 5;

  // ─── Folio + Tipo ──────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text(`FOLIO #${pedido.folio}`, W / 2, y, { align: 'center' });
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  const tipoLabel = pedido.tipo === 'VENTA_DIRECTA' ? 'Venta directa' : 'Pedido (entrega futura)';
  doc.text(tipoLabel, W / 2, y, { align: 'center' });
  y += 4;

  const fechaCreacion = new Date(pedido.creadoEn).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
  doc.text(fechaCreacion, W / 2, y, { align: 'center' });
  y += 4;

  if (pedido.tipo === 'PEDIDO' && pedido.fechaEntrega) {
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    const entrega = new Date(pedido.fechaEntrega).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
    doc.text(`Entrega: ${entrega}`, W / 2, y, { align: 'center' });
    y += 4;
  }

  y += 2;

  // ─── Cliente ───────────────────────────────────────────────────────────
  const clienteNombre = pedido.cliente?.nombre || pedido.nombreCliente;
  const clienteTel = pedido.cliente?.telefono || pedido.telefonoCliente;
  if (clienteNombre || clienteTel) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY);
    doc.text('CLIENTE', 8, y);
    y += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    if (clienteNombre) { doc.text(clienteNombre, 8, y); y += 3.5; }
    if (clienteTel) { doc.text(clienteTel, 8, y); y += 3.5; }
    y += 1;
  }

  // ─── Productos ────────────────────────────────────────────────────────
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.2);
  doc.line(8, y, W - 8, y);
  y += 3;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY);
  doc.text('CANT', 8, y);
  doc.text('PRODUCTO', 22, y);
  doc.text('IMPORTE', W - 8, y, { align: 'right' });
  y += 3;
  doc.line(8, y, W - 8, y);
  y += 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  for (const l of pedido.lineas) {
    if (y > 270) { doc.addPage(); y = 10; }
    doc.text(String(l.cantidad), 8, y);
    const lines = doc.splitTextToSize(l.nombre, 50);
    doc.text(lines, 22, y);
    doc.text(fmt(l.subtotal), W - 8, y, { align: 'right' });
    y += Math.max(4, lines.length * 3.5);
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(`${l.cantidad} × ${fmt(l.precioUnit)}`, 22, y);
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    y += 3.5;
  }

  y += 1;
  doc.setDrawColor(...GRAY);
  doc.line(8, y, W - 8, y);
  y += 4;

  // ─── Totales ──────────────────────────────────────────────────────────
  const subtotalNum = Number(pedido.subtotal);
  const dscNum = Number(pedido.descuento);
  const totalNum = Number(pedido.total);
  const pagadoNum = Number(pedido.pagado);
  const pendienteNum = Math.max(0, totalNum - pagadoNum);

  const linea = (label: string, valor: string, bold = false, color: [number, number, number] = DARK, size = 9) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(label, 8, y);
    doc.text(valor, W - 8, y, { align: 'right' });
    y += size > 9 ? 5 : 4;
  };

  linea('Subtotal', fmt(subtotalNum));
  if (dscNum > 0) linea('Descuento', `- ${fmt(dscNum)}`, false, GRAY);

  // línea separadora antes del total
  doc.setDrawColor(...DARK);
  doc.setLineWidth(0.3);
  doc.line(8, y, W - 8, y);
  y += 4;

  linea('TOTAL', fmt(totalNum), true, GOLD, 12);
  linea('Pagado', fmt(pagadoNum), false, DARK);
  if (pendienteNum > 0) linea('Por pagar', fmt(pendienteNum), true, [220, 38, 38]);

  if (pedido.metodoPago) {
    y += 1;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(`Método: ${pedido.metodoPago}`, W / 2, y, { align: 'center' });
    y += 4;
  }

  // ─── Tracking URL si es pedido — bloque visual con QR clickeable ─────
  if (pedido.tipo === 'PEDIDO' && pedido.trackingToken && typeof window !== 'undefined') {
    const url = `${window.location.origin}/pedido/${pedido.trackingToken}`;
    y += 4;

    // Caja con borde dorado
    const boxX = 6;
    const boxY = y;
    const boxW = W - 12;
    const qrSize = 34; // mm
    const boxH = qrSize + 26;

    // Fondo + borde dorado
    doc.setFillColor(255, 250, 230); // crema muy suave
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.6);
    doc.roundedRect(boxX, boxY, boxW, boxH, 3, 3, 'FD');

    // Título arriba
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text('SIGUE TU PEDIDO EN VIVO', W / 2, boxY + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...GRAY);
    doc.text('Escanea el QR con tu cámara, o toca aquí', W / 2, boxY + 9, { align: 'center' });

    // QR centrado + clickeable
    let qrRendered = false;
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 1,
        color: { dark: '#1F2937', light: '#FFFFFF' },
        errorCorrectionLevel: 'M',
      });
      const qrX = (W - qrSize) / 2;
      const qrY = boxY + 11;
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      // Hacer todo el cuadro del QR clickeable
      doc.link(qrX, qrY, qrSize, qrSize, { url });
      qrRendered = true;

      // Banderín dorado debajo del QR: "TOCA PARA ABRIR"
      const tagW = 30;
      const tagH = 5;
      const tagX = (W - tagW) / 2;
      const tagY = qrY + qrSize + 2;
      doc.setFillColor(...GOLD);
      doc.roundedRect(tagX, tagY, tagW, tagH, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text('TOCA PARA ABRIR  ↗', W / 2, tagY + 3.5, { align: 'center' });
      doc.link(tagX, tagY, tagW, tagH, { url });
    } catch {
      // Fallback: si falla el QR, escribe la URL en grande clickeable
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...GOLD);
      const fallbackY = boxY + qrSize / 2 + 11;
      doc.text(url, W / 2, fallbackY, { align: 'center', maxWidth: boxW - 6 });
      doc.link(boxX + 3, fallbackY - 4, boxW - 6, 10, { url });
    }

    // Footer con la URL corta abajo del QR (también clickeable)
    if (qrRendered) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(...GRAY);
      const footerY = boxY + boxH - 3;
      doc.text(url, W / 2, footerY, { align: 'center', maxWidth: boxW - 6 });
      doc.link(boxX + 3, footerY - 3, boxW - 6, 5, { url });
    }

    y = boxY + boxH + 3;
  }

  // ─── Notas ────────────────────────────────────────────────────────────
  if (pedido.notas) {
    y += 2;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY);
    doc.text('NOTAS', 8, y);
    y += 3;
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...DARK);
    const notas = doc.splitTextToSize(pedido.notas, W - 16);
    doc.text(notas, 8, y);
    y += notas.length * 3;
  }

  // ─── Footer ──────────────────────────────────────────────────────────
  y += 4;
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.2);
  doc.line(8, y, W - 8, y);
  y += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text('¡Gracias por tu compra!', W / 2, y, { align: 'center' });

  return doc.output('blob');
}

/**
 * Genera el PDF y lo descarga directamente.
 */
export async function descargarReciboPDF(pedido: PedidoPDF) {
  const blob = await generarReciboPDF(pedido);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recibo-${pedido.folio}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Intenta compartir el PDF vía Web Share API (mobile). Si no se puede,
 * cae al fallback de WhatsApp con texto + link de tracking (si aplica).
 */
export async function compartirReciboPDF(pedido: PedidoPDF) {
  const blob = await generarReciboPDF(pedido);
  const file = new File([blob], `recibo-${pedido.folio}.pdf`, { type: 'application/pdf' });

  // 1) Web Share API con archivos (mobile)
  if (typeof navigator !== 'undefined' && (navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
    try {
      await (navigator as any).share({
        files: [file],
        title: `Recibo #${pedido.folio}`,
        text: `Recibo de tu compra en ${pedido.proveedor?.nombre || ''} · Folio #${pedido.folio}`,
      });
      return { success: true, method: 'share' as const };
    } catch (e: any) {
      if (e?.name === 'AbortError') return { success: true, method: 'share' as const };
    }
  }

  // 2) Fallback: descargar PDF y abrir WhatsApp con texto
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recibo-${pedido.folio}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  const tel = (pedido.cliente?.telefono || pedido.telefonoCliente || '').replace(/\D/g, '');
  if (tel) {
    const trackingUrl = pedido.trackingToken && typeof window !== 'undefined'
      ? `${window.location.origin}/pedido/${pedido.trackingToken}`
      : null;
    const nombreProv = pedido.proveedor?.nombre || '';
    const msg = trackingUrl
      ? `Te comparto tu recibo de ${nombreProv}, folio #${pedido.folio}. Seguimiento: ${trackingUrl}`
      : `Te comparto tu recibo de ${nombreProv}, folio #${pedido.folio}.`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank');
  }
  return { success: true, method: 'download' as const };
}
