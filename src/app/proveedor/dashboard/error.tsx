'use client';

import { useEffect } from 'react';

export default function ProveedorDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('SERVER CRAHS:', error);
  }, [error]);

  return (
    <div className="w-full bg-red-950 text-red-500 p-10 flex flex-col items-center justify-center space-y-6 rounded-3xl border border-red-500 shadow-2xl">
      <h2 className="text-4xl font-bold">Error en Proveedor</h2>
      <div className="bg-black/50 p-6 rounded-xl max-w-4xl w-full">
        <p className="font-mono text-sm break-all">{error.message || 'Error Desconocido'}</p>
        <p className="font-mono text-xs opacity-50 mt-4">Pila: {error.stack}</p>
      </div>
      <button
        className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
        onClick={() => reset()}
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
