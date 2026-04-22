import ExploreClient from '@/components/explorar/ExploreClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Explorar Proveedores | Eventia',
  description: 'Descubre los mejores proveedores para tu evento en México. Salones, banquetes, música y más.',
};

export default function PublicExplorarPage() {
  return (
    <main className="min-h-screen bg-[var(--color-fondo)]">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin text-[#d4af37]" size={48} />
        </div>
      }>
        <ExploreClient isPublic={true} />
      </Suspense>
    </main>
  );
}
