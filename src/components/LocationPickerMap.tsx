import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Search } from 'lucide-react';
import { Input } from './ui/input';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');

  // Create draggable marker
  const createMarker = (lng: number, lat: number, address?: string) => {
    if (!map.current) return;
    
    // Remove existing marker if any
    if (marker.current) {
      marker.current.remove();
    }

    // Create custom marker element
    const el = document.createElement('div');
    el.className = 'location-marker-pin';
    el.style.cssText = `
      width: 40px;
      height: 50px;
      cursor: grab;
    `;
    el.innerHTML = `
      <div style="
        position: relative;
        width: 40px;
        height: 50px;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
        <div style="
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
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg);">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div style="
          width: 16px;
          height: 6px;
          background: radial-gradient(ellipse, rgba(0, 0, 0, 0.3), transparent);
          border-radius: 50%;
          position: absolute;
          bottom: 0;
        "></div>
      </div>
    `;

    setSelectedLocation({ lat, lng });
    setSelectedAddress(address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);

    // Create popup with location details
    const popupContent = `
      <div style="padding: 12px; min-width: 200px;">
        <h3 style="font-weight: 600; margin-bottom: 8px; color: #1a1a1a; font-size: 14px;">Selected Location</h3>
        <p style="font-size: 12px; color: #666; margin-bottom: 4px; line-height: 1.4;">${address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`}</p>
        <p style="font-size: 11px; color: #888; margin-bottom: 8px;">Drag the marker to adjust position</p>
      </div>
    `;

    const popup = new maplibregl.Popup({
      offset: [0, -40],
      closeButton: true,
      closeOnClick: false,
      maxWidth: '300px',
      anchor: 'bottom'
    }).setHTML(popupContent);

    // Add new draggable marker with popup - anchor at bottom for correct positioning
    marker.current = new maplibregl.Marker({ 
      element: el,
      draggable: true,
      anchor: 'bottom'
    })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map.current);

    // Handle marker drag events
    marker.current.on('dragend', async () => {
      const lngLat = marker.current!.getLngLat();
      const newLat = lngLat.lat;
      const newLng = lngLat.lng;

      setSelectedLocation({ lat: newLat, lng: newLng });

      // Get address for new location
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`
        );
        const data = await response.json();
        const newAddress = data.display_name || `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`;
        setSelectedAddress(newAddress);
        onLocationSelect(newLat, newLng, newAddress);
        
        // Update popup
        popup.setHTML(`
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="font-weight: 600; margin-bottom: 8px; color: #1a1a1a; font-size: 14px;">Selected Location</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px; line-height: 1.4;">${newAddress}</p>
            <p style="font-size: 11px; color: #888; margin-bottom: 8px;">Drag the marker to adjust position</p>
          </div>
        `);
      } catch (error) {
        onLocationSelect(newLat, newLng);
      }
    });

    // Open popup
    marker.current.togglePopup();

    // Callback to parent
    if (address) {
      onLocationSelect(lat, lng, address);
    }
  };

  // Search for addresses
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Handle search result selection
  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Fly to location
    map.current?.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: 2000
    });

    // Create marker at this location
    createMarker(lng, lat, result.display_name);
    
    setShowResults(false);
    setSearchQuery('');
  };

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

    // Add navigation controls - positioned at bottom-right to avoid search panel overlap
    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    // Add click event to map
    map.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      
      // Try to get address from reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        createMarker(lng, lat, address);
      } catch (error) {
        createMarker(lng, lat);
      }
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
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for an address..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white/95 backdrop-blur-sm shadow-elegant border-primary/20"
            />
          </div>
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-elegant border border-primary/20 max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors border-b border-border last:border-b-0"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-foreground">{result.display_name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Location Info Display */}
      <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-elegant border border-primary/20">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground mb-1">
              {selectedLocation 
                ? 'Selected Location'
                : 'Click on map or search to mark your location'}
            </p>
            {selectedAddress && (
              <p className="text-xs text-muted-foreground break-words">
                {selectedAddress}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div 
        ref={mapContainer} 
        className="w-full h-[400px] md:h-[500px] rounded-2xl shadow-elegant overflow-hidden border-2 border-content-highlight-border"
      />
      
      <style>{`
        .location-marker-pin {
          cursor: grab;
          animation: markerDrop 0.5s ease-out;
        }

        .location-marker-pin:active {
          cursor: grabbing;
        }
        
        @keyframes markerDrop {
          0% {
            transform: translateY(-100px);
            opacity: 0;
          }
          60% {
            opacity: 1;
          }
          100% {
            transform: translateY(0);
          }
        }
        
        .maplibregl-ctrl-bottom-right {
          bottom: 80px !important;
          right: 10px !important;
        }
        
        .maplibregl-ctrl-group {
          background: white !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          overflow: hidden;
        }
        
        .maplibregl-ctrl-group button {
          width: 36px !important;
          height: 36px !important;
        }
        
        .maplibregl-popup-content {
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
          padding: 0 !important;
        }
        
        .maplibregl-popup-close-button {
          font-size: 18px !important;
          padding: 4px 8px !important;
          color: #666 !important;
        }
        
        .maplibregl-popup-close-button:hover {
          color: #333 !important;
          background: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default LocationPickerMap;