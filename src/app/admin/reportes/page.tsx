import React from 'react';

export default function ReportesPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reportes Financieros</h2>
        <div className="flex gap-2">
          <button className="btn btn-secundario btn-sm">Exportar CSV</button>
          <button className="btn btn-primario btn-sm">Ultimos 30 días</button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-[var(--color-texto-muted)] uppercase mb-2">Comisiones Totales</h3>
          <p className="text-3xl font-bold text-emerald-400">$12,450.00</p>
          <p className="text-xs text-emerald-400/60 mt-2">↑ 15% vs mes anterior</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-[var(--color-texto-muted)] uppercase mb-2">Suscripciones</h3>
          <p className="text-3xl font-bold text-blue-400">$8,200.00</p>
          <p className="text-xs text-blue-400/60 mt-2">↑ 8% vs mes anterior</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-[var(--color-texto-muted)] uppercase mb-2">Devoluciones</h3>
          <p className="text-3xl font-bold text-red-400">$450.00</p>
          <p className="text-xs text-red-400/60 mt-2">↓ 2% vs mes anterior</p>
        </div>
      </div>

      {/* Detailed Revenue Table Placeholder */}
      <div className="card">
        <h3 className="text-lg font-bold mb-6">Detalle de Ingresos por Proveedor</h3>
        <table className="tabla">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Reserva / Evento</th>
              <th>Monto Total</th>
              <th>Comisión (10%)</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td>Banquetes Elite S.A.</td>
                <td>Boda Familia Ruiz</td>
                <td>$45,000.00</td>
                <td className="font-bold text-emerald-400">$4,500.00</td>
                <td className="text-[var(--color-texto-muted)]">24/03/2026</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
