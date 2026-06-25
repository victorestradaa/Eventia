import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { listarProductosPV, listarClientesPV, getSesionActivaPV } from '@/lib/actions/puntoVentaActions';
import NuevaVentaPVClient from './NuevaVentaPVClient';
import { Lock, AlertCircle } from 'lucide-react';
import { formatearMoneda } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function NuevaVentaPVPage() {
  const profileRes = await getCurrentProfile();
  if (!profileRes.success || !profileRes.data) redirect('/login');
  const perfil = profileRes.data;
  if (perfil.rol !== 'PROVEEDOR' || !perfil.proveedor) redirect('/cliente/dashboard');

  const [productosRes, clientesRes, sesionRes] = await Promise.all([
    listarProductosPV(perfil.proveedor.id),
    listarClientesPV(perfil.proveedor.id),
    getSesionActivaPV(perfil.proveedor.id),
  ]);

  const productos = (productosRes.success ? (productosRes.data as any[]) : []).filter((p) => p.activo);
  const clientes = clientesRes.success ? (clientesRes.data as any[]) : [];
  const sesionActiva = sesionRes.success ? (sesionRes.data as any) : null;

  return (
    <div className="space-y-4">
      {sesionActiva ? (
        <div className="rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/20 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0 text-xs">
            <span className="relative flex items-center justify-center">
              <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500/40 animate-ping" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Caja abierta</span>
            <span className="hidden sm:inline text-[var(--color-borde-suave)]">·</span>
            <span className="hidden sm:inline text-[var(--color-texto-suave)] font-medium">
              Desde {new Date(sesionActiva.abiertaEn).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="hidden md:inline text-[var(--color-borde-suave)]">·</span>
            <span className="hidden md:inline text-[var(--color-texto-suave)] font-medium">
              Fondo: <strong className="text-[var(--color-texto)]">{formatearMoneda(Number(sesionActiva.montoApertura))}</strong>
            </span>
          </div>
          <Link
            href="/proveedor/punto-venta/caja"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-texto)] text-[var(--color-fondo)] font-black uppercase text-[10px] tracking-widest hover:opacity-90 shrink-0"
          >
            <Lock size={11} /> Cerrar caja
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <AlertCircle size={15} className="text-amber-500 shrink-0" />
          <p className="text-xs text-[var(--color-texto-suave)] flex-1 min-w-0">
            <span className="font-black text-amber-600 uppercase tracking-widest text-[10px] mr-2">Sin caja abierta</span>
            Tus movimientos no se enlazarán a ninguna sesión.{' '}
            <Link href="/proveedor/punto-venta/caja" className="font-bold text-amber-600 underline">
              Abrir caja
            </Link>
          </p>
        </div>
      )}

      <NuevaVentaPVClient
        proveedorId={perfil.proveedor.id}
        productos={productos}
        clientes={clientes}
      />
    </div>
  );
}
