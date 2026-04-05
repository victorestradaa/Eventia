'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
  ControlPosition,
  MapControl
} from '@vis.gl/react-google-maps';
import { Search, Loader2, Navigation, MapPin } from 'lucide-react';

interface GoogleMapPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialAddress?: string;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Componente para el buscador de Google Places
const PlaceAutocompleteClassic = ({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void }) => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const places = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'formatted_address'],
      componentRestrictions: { country: 'mx' }
    };

    const autocomplete = new places.Autocomplete(inputRef.current, options);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      setInputValue(place.formatted_address || '');
      onPlaceSelect(place);
    });
  }, [places, onPlaceSelect]);

  return (
    <div className="relative w-full mb-4">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-texto-muted)]" size={18} />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Busca tu dirección o negocio en Google Maps..."
        className="input w-full h-12 pl-12 pr-12 text-sm shadow-xl"
      />
      {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-primario-claro)]" size={18} />}
    </div>
  );
};

export default function GoogleMapPicker({ initialLat, initialLng, onLocationSelect, initialAddress }: GoogleMapPickerProps) {
  const [center, setCenter] = useState<google.maps.LatLngLiteral>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : { lat: 23.6345, lng: -102.5528 }
  );
  const [markerPos, setMarkerPos] = useState<google.maps.LatLngLiteral>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : { lat: 23.6345, lng: -102.5528 }
  );

  const handlePlaceSelect = (place: google.maps.places.PlaceResult | null) => {
    if (place?.geometry?.location) {
      const newPos = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      setCenter(newPos);
      setMarkerPos(newPos);
      onLocationSelect(newPos.lat, newPos.lng, place.formatted_address);
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPos(newPos);
      
      // Geocodificación inversa para obtener la dirección del nuevo punto
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: newPos }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          onLocationSelect(newPos.lat, newPos.lng, results[0].formatted_address);
        } else {
          onLocationSelect(newPos.lat, newPos.lng);
        }
      });
    }
  };

  if (!API_KEY) {
    return (
      <div className="p-8 border-2 border-dashed border-red-500/20 rounded-3xl bg-red-500/5 text-center space-y-4">
        <MapPin size={48} className="mx-auto text-red-400 opacity-50" />
        <div className="space-y-2">
          <p className="font-bold text-red-400">Falta la API Key de Google Maps</p>
          <p className="text-xs text-[var(--color-texto-suave)] px-10">
            Para ver el mapa, necesitas agregar <code className="bg-black/40 px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> a tu archivo .env
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} language="es" region="MX">
      <div className="space-y-4">
        <PlaceAutocompleteClassic onPlaceSelect={handlePlaceSelect} />
        
        <div className="h-[400px] rounded-3xl overflow-hidden border border-[var(--color-borde-suave)] shadow-2xl relative">
          <Map
            center={center}
            zoom={16}
            mapId="EVENTIA_MAP_ID" // Puedes personalizar el estilo en Google Cloud
            gestureHandling={'greedy'}
            disableDefaultUI={false}
          >
            <AdvancedMarker
              position={markerPos}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
            >
              <Pin background={'#7C3AED'} glyphColor={'#FFF'} borderColor={'#5B21B6'} />
            </AdvancedMarker>
          </Map>

          <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-bold text-white shadow-xl pointer-events-none">
            Google Maps: Arrastra el pin para un ajuste preciso
          </div>
        </div>
      </div>
    </APIProvider>
  );
}
