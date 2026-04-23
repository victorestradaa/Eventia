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
      <ReportsClient data={res.data} />
    </div>
  );
}
