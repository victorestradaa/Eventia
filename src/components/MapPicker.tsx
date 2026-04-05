'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';

interface MapPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialAddress?: string;
}

// Componente para actualizar la vista del mapa cuando cambian las coordenadas externas
function ChangeView({ center }: { center: L.LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);
  return null;
}

// Componente para capturar clics en el mapa
function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ initialLat, initialLng, onLocationSelect, initialAddress }: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLngExpression>(
    initialLat && initialLng ? [initialLat, initialLng] : [23.6345, -102.5528] // Centro de México por defecto
  );
  const [search, setSearch] = useState(initialAddress || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Función para buscar direcciones (Nominatim OSM)
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setShowSuggestions(true);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (val.length < 3) {
      setSuggestions([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=mx&limit=5`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 600);
  };

  const selectSuggestion = (s: any) => {
    const lat = parseFloat(s.lat);
    const lon = parseFloat(s.lon);
    const newPos: L.LatLngExpression = [lat, lon];
    setPosition(newPos);
    setSearch(s.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    onLocationSelect(lat, lon, s.display_name);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
    
    // Reverse Geocoding para actualizar el texto de la dirección
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data.display_name) {
        setSearch(data.display_name);
      }
    } catch (err) {
      console.error("Reverse geocode error:", err);
    }
  };

  // Obtener ubicación actual
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        handleMapClick(latitude, longitude);
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Buscador Autocomplete */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Busca tu dirección para ubicarte en el mapa..."
            className="input w-full h-12 pl-12 pr-12 text-sm"
          />
          {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-primario-claro)]" size={18} />}
          {!searching && (
            <button 
              type="button"
              onClick={handleGetCurrentLocation}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-primario-claro)] hover:scale-110 transition-transform"
              title="Mi ubicación actual"
            >
              <Navigation size={18} />
            </button>
          )}
        </div>

        {/* Lista de Sugerencias Sugeridas */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-[1000] w-full mt-2 card p-2 bg-[var(--color-fondo-tarjeta)] border border-[var(--color-borde-suave)] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectSuggestion(s)}
                className="flex items-start gap-3 w-full p-3 text-left hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-none"
              >
                <MapPin size={16} className="mt-1 flex-shrink-0 text-[var(--color-primario-claro)]" />
                <span className="text-xs leading-tight">{s.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mapa Leaflet */}
      <div className="h-[300px] rounded-2xl overflow-hidden border border-[var(--color-borde-suave)] shadow-inner relative z-10">
        <MapContainer 
          center={position} 
          zoom={16} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker 
            position={position} 
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                handleMapClick(pos.lat, pos.lng);
              },
            }}
          />
          <ChangeView center={position} />
          <MapEvents onMapClick={handleMapClick} />
        </MapContainer>
        
        {/* Indicador visual de ayuda */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white shadow-lg pointer-events-none">
          Click en el mapa o arrastra el pin para ajustar
        </div>
      </div>
    </div>
  );
}
