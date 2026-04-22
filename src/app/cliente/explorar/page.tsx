'use client';

import ExploreClient from '@/components/explorar/ExploreClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function ExplorarPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#d4af37]" size={48} />
      </div>
    }>
      <ExploreClient isPublic={false} />
    </Suspense>
  );
}

