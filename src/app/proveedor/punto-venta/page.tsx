import Link from 'next/link';
import { ArrowRight, Package, Users, ShoppingCart, Receipt, Plus } from 'lucide-react';

export default function PuntoVentaHomePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-dashed border-[var(--color-borde-suave)] bg-[var(--color-fondo-card)] p-8 text-center">
        <p className="text-[10px] uppercase tracking-widest font-black text-[#d4af37] mb-2">Cimientos listos</p>
        <h2 className="text-2xl font-black mb-2">Bienvenido al Punto de Venta Emprendedor</h2>
        <p className="text-sm text-[var(--color-texto-suave)] max-w-xl mx-auto">
          La estructura del módulo está lista. Conforme se vayan habilitando las fases, vas a poder gestionar productos, vender, llevar pedidos con tracking, controlar caja y ver reportes desde aquí.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Quick href="/proveedor/punto-venta/nueva"     icon={Plus}         title="Nueva venta"      body="Cobra al instante o crea un pedido para entrega posterior." accent />
        <Quick href="/proveedor/punto-venta/productos" icon={Package}      title="Productos"        body="Crea tu catálogo con fotos, precios y stock." />
        <Quick href="/proveedor/punto-venta/clientes"  icon={Users}        title="Clientes"         body="Guarda los datos de tus compradores para repetir ventas." />
        <Quick href="/proveedor/punto-venta/pedidos"   icon={ShoppingCart} title="Pedidos"          body="Ve estado de cada pedido y envía link al cliente." />
        <Quick href="/proveedor/punto-venta/caja"      icon={Receipt}      title="Corte de caja"    body="Abre y cierra sesión con totales por método de pago." />
      </div>
    </div>
  );
}

function Quick({
  href, icon: Icon, title, body, accent = false,
}: {
  href: string; icon: any; title: string; body: string; accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg group ${
        accent
          ? 'bg-gradient-to-br from-[#fdf6e1] to-[#f4e4b9] border-[#d4af37]/40 text-[#1F2937]'
          : 'bg-[var(--color-fondo-card)] border-[var(--color-borde-suave)]'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
          accent ? 'bg-black text-[#d4af37]' : 'bg-[#d4af37]/10 text-[#d4af37]'
        }`}>
          <Icon size={20} />
        </div>
        <ArrowRight size={16} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
      <p className={`font-black text-lg ${accent ? 'text-[#1F2937]' : 'text-[var(--color-texto)]'}`}>{title}</p>
      <p className={`text-xs mt-1 ${accent ? 'text-[#1F2937]/70' : 'text-[var(--color-texto-suave)]'}`}>{body}</p>
    </Link>
  );
}
