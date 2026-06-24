import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentProfile } from '@/lib/actions/authActions';
import { listarProductosPV, listarClientesPV, getSesionActivaPV } from '@/lib/actions/puntoVentaActions';
import NuevaVentaPVClient from './NuevaVentaPVClient';
import { Lock, AlertCircle, Unlock, Clock } from 'lucide-react';
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
        <div className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
              <Unlock size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Caja abierta</p>
              </div>
              <p className="text-[11px] text-[var(--color-texto-suave)] mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1"><Clock size={10} /> Desde {new Date(sesionActiva.abiertaEn).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                <span>·</span>
                <span>Fondo: <strong className="text-[var(--color-texto)]">{formatearMoneda(Number(sesionActiva.montoApertura))}</strong></span>
              </p>
            </div>
          </div>
          <Link
            href="/proveedor/punto-venta/caja"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F2937] text-white font-black uppercase text-[10px] tracking-widest hover:bg-black shrink-0"
          >
            <Lock size={12} /> Cerrar caja
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-3">
          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-black text-amber-600 uppercase tracking-widest">Sin sesión de caja abierta</p>
            <p className="text-[11px] text-[var(--color-texto-suave)] mt-1">
              Puedes vender, pero tus movimientos no se enlazarán a ninguna sesión de caja.{' '}
              <Link href="/proveedor/punto-venta/caja" className="font-bold text-amber-600 underline">
                Abrir caja
              </Link>{' '}
              primero (recomendado).
            </p>
          </div>
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
