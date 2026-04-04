'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <div className="min-h-screen bg-black text-red-500 p-10 flex flex-col items-center justify-center space-y-6">
      <h2 className="text-4xl font-bold">¡Uy! Algo se rompió gravemente.</h2>
      <div className="bg-red-950 p-6 rounded-xl border border-red-500 max-w-4xl w-full">
        <p className="font-mono text-sm break-all">{error.message || 'Error Desconocido'}</p>
        {error.digest && <p className="font-mono text-xs opacity-50 mt-4">Digest: {error.digest}</p>}
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
