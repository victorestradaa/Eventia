import { Loader2 } from 'lucide-react';

export default function LoadingDashboard() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center w-24 h-24 mb-6">
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primario)] to-[#f472b6] rounded-full blur-xl opacity-40 animate-pulse" />
        <div className="relative bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] shadow-lg rounded-2xl p-4 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[var(--color-primario)] animate-spin" />
        </div>
      </div>
      <h2 className="text-2xl font-black gradient-texto mb-2">Cargando herramientas...</h2>
      <p className="text-[var(--color-texto-suave)] text-sm font-medium">Conectando con el servidor en la nube.</p>
      
      {/* Skeletons representativos para simular la interfaz que viene */}
      <div className="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 opacity-30">
        <div className="col-span-1 md:col-span-3 space-y-4">
           <div className="w-1/4 h-8 bg-[var(--color-borde-suave)] rounded-lg animate-pulse" />
           <div className="h-48 bg-[var(--color-borde-suave)] rounded-3xl animate-pulse delay-75" />
        </div>
        <div className="col-span-1 h-64 bg-[var(--color-borde-suave)] rounded-3xl animate-pulse delay-150" />
      </div>
    </div>
  );
}
