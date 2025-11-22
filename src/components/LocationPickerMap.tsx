import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';

interface LocationPickerMapProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

const LocationPickerMap = ({ onLocationSelect, initialLat = 26.1445, initialLng = 91.7362 }: LocationPickerMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with proper OSM tiles
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
            maxzoom: 19
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm'
          }
        ]
      },
      center: [initialLng, initialLat],
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add click event to map
    map.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      
      // Remove existing marker if any
      if (marker.current) {
        marker.current.remove();
      }

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'location-marker-pin';
      el.innerHTML = `
        <div class="pin-container">
          <div class="pin-head">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div class="pin-shadow"></div>
        </div>
      `;

      setSelectedLocation({ lat, lng });
      
      // Try to get address from reverse geocoding
      let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        address = data.display_name || address;
        onLocationSelect(lat, lng, data.display_name);
      } catch (error) {
        onLocationSelect(lat, lng);
      }

      // Create popup with location details and directions button
      const popupContent = `
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="font-weight: 600; margin-bottom: 8px; color: #1a1a1a; font-size: 14px;">Location Details</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 4px; line-height: 1.4;">${address}</p>
          <p style="font-size: 11px; color: #888; margin-bottom: 12px;">Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}</p>
          <button 
            onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}', '_blank')"
            style="
              width: 100%;
              background: linear-gradient(135deg, #2674EC, #00E5FF);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s;
            "
            onmouseover="this.style.transform='scale(1.02)'"
            onmouseout="this.style.transform='scale(1)'"
          >
            Get Directions
          </button>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px'
      })
        .setHTML(popupContent);

      // Add new marker with popup
      marker.current = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Open popup on hover and click
      el.addEventListener('mouseenter', () => {
        popup.addTo(map.current!);
      });
      
      marker.current.togglePopup();
    });

    // Cleanup
    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      map.current?.remove();
    };
  }, [initialLat, initialLng, onLocationSelect]);

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-elegant border border-primary/20">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">
            {selectedLocation 
              ? `Location: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
              : 'Click on map to mark your location'}
          </span>
        </div>
      </div>
      
      <div 
        ref={mapContainer} 
        className="w-full h-[400px] md:h-[500px] rounded-2xl shadow-elegant overflow-hidden border-2 border-content-highlight-border"
      />
      
      <style>{`
        .location-marker-pin {
          cursor: pointer;
          animation: drop 0.5s ease-out;
        }
        
        @keyframes drop {
          0% {
            transform: translateY(-200px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(0);
          }
        }
        
        .pin-container {
          position: relative;
          width: 40px;
          height: 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .pin-head {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #2674EC, #00E5FF);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(38, 116, 236, 0.4);
          position: relative;
          animation: bounce 2s ease-in-out infinite;
        }
        
        .pin-head svg {
          transform: rotate(45deg);
          color: white;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: rotate(-45deg) translateY(0);
          }
          50% {
            transform: rotate(-45deg) translateY(-10px);
          }
        }
        
        .pin-shadow {
          width: 24px;
          height: 8px;
          background: radial-gradient(ellipse, rgba(0, 0, 0, 0.3), transparent);
          border-radius: 50%;
          position: absolute;
          bottom: -5px;
          animation: shadow-pulse 2s ease-in-out infinite;
        }
        
        @keyframes shadow-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(0.8);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default LocationPickerMap;
