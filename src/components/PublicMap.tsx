'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

interface PublicMapProps {
  lat: number;
  lng: number;
  businessName: string;
}

export default function PublicMap({ lat, lng, businessName }: PublicMapProps) {
  return (
    <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-[var(--color-borde-suave)] shadow-2xl relative z-10 group">
      <MapContainer 
        center={[lat, lng]} 
        zoom={16} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
      
      {/* Overlay informativo */}
      <div className="absolute top-4 right-4 z-[1000] bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
        Ubicación de {businessName}
      </div>
    </div>
  );
}
