import React from 'react';
import { getAdminReportes } from '@/lib/actions/adminActions';
import ReportsClient from '@/components/admin/ReportsClient';

export default async function ReportesPage() {
  const res = await getAdminReportes();
  
  if (!res.success || !res.data) {
    return (
      <div className="p-10 text-center text-red-400">
        Error al cargar los reportes. Revisa la consola para más detalles.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37] mb-1">Sistema de Gestión</p>
          <h2 className="text-3xl font-serif italic text-white">Reportes Administrativos</h2>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 rounded-xl border border-[var(--color-borde-suave)] text-[10px] font-black uppercase tracking-widest text-[var(--color-texto-suave)] hover:bg-white/5 transition-all">Exportar CSV</button>
          <button className="px-6 py-2.5 rounded-xl bg-[var(--color-primario)] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-acento)] transition-all shadow-lg">Ultimos 30 días</button>
        </div>
      </div>

      <ReportsClient data={res.data} />
    </div>
  );
}
