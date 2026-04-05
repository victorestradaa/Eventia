'use client';

import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

interface GooglePublicMapProps {
  lat: number;
  lng: number;
  businessName: string;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function GooglePublicMap({ lat, lng, businessName }: GooglePublicMapProps) {
  if (!API_KEY) return null; // No mostramos nada si no hay clave

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-[var(--color-borde-suave)] shadow-2xl relative group">
        <Map
          center={{ lat, lng }}
          zoom={16}
          mapId="EVENTIA_PUBLIC_MAP"
          gestureHandling={'cooperative'}
          disableDefaultUI={false}
        >
          <AdvancedMarker position={{ lat, lng }}>
             <Pin background={'#7C3AED'} glyphColor={'#FFF'} borderColor={'#5B21B6'} />
          </AdvancedMarker>
        </Map>
        
        {/* Overlay informativo estilo premium */}
        <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-xl flex items-center gap-2">
          <MapPin size={14} className="text-[var(--color-primario-claro)]" />
          Ubicación de {businessName}
        </div>
      </div>
    </APIProvider>
  );
}
