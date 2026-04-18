import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Search, Loader2, Crosshair, X, Check } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

// Suppress MapLibre worker errors in production (known issue with minified builds)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message?.includes('At is not defined')) {
      event.preventDefault();
      return true;
    }
  });
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('At is not defined')) {
      event.preventDefault();
    }
  });
}

interface LocationPickerMapProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const coordsLabel = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

const LocationPickerMap = ({
  onLocationSelect,
  initialLat = 26.1445,
  initialLng = 91.7362,
}: LocationPickerMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    const fallback = coordsLabel(lat, lng);
    try {
      const res = await fetch(
        `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { Accept: 'application/json' } }
      );
      if (!res.ok) return fallback;
      const data = await res.json();
      return data.display_name || fallback;
    } catch {
      return fallback;
    }
  };

  const placePin = useCallback((lat: number, lng: number, precomputedAddress?: string) => {
    if (!map.current) return;

    if (!marker.current) {
      const el = document.createElement('div');
      el.style.cssText = 'width:44px;height:54px;cursor:grab;position:relative;';
      el.innerHTML = `
        <div style="position:relative;width:44px;height:54px;display:flex;flex-direction:column;align-items:center;">
          <div style="width:44px;height:44px;background:linear-gradient(135deg,#2674EC,#00E5FF);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(38,116,236,0.5);border:3px solid white;">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(45deg);">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div style="width:20px;height:8px;background:radial-gradient(ellipse,rgba(0,0,0,0.35),transparent);border-radius:50%;position:absolute;bottom:0;"></div>
        </div>
      `;
      el.style.animation = 'markerBounce 0.5s ease-out';

      marker.current = new maplibregl.Marker({
        element: el,
        draggable: true,
        anchor: 'bottom',
      })
        .setLngLat([lng, lat])
        .addTo(map.current);

      marker.current.on('dragend', () => {
        const ll = marker.current!.getLngLat();
        placePin(ll.lat, ll.lng);
      });
    } else {
      marker.current.setLngLat([lng, lat]);
      const el = marker.current.getElement();
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = 'markerBounce 0.4s ease-out';
    }

    const immediateAddress = precomputedAddress || coordsLabel(lat, lng);
    setSelectedLat(lat);
    setSelectedLng(lng);
    setSelectedAddress(immediateAddress);
    onLocationSelectRef.current(lat, lng, immediateAddress);

    if (!precomputedAddress) {
      setIsGeocoding(true);
      reverseGeocode(lat, lng)
        .then((addr) => {
          setSelectedAddress(addr);
          onLocationSelectRef.current(lat, lng, addr);
        })
        .finally(() => setIsGeocoding(false));
    }
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      if (query.length < 3) {
        setSearchResults([]);
        setShowResults(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=6&countrycodes=in&addressdetails=1`,
            { headers: { Accept: 'application/json' } }
          );
          if (!res.ok) throw new Error('Search failed');
          const data = await res.json();
          setSearchResults(data);
          setShowResults(true);
        } catch {
          setSearchResults([]);
          toast({
            title: 'Search unavailable',
            description: 'Click on the map instead to drop a pin.',
            variant: 'default',
          });
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [toast]
  );

  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    map.current?.flyTo({ center: [lng, lat], zoom: 16, duration: 1200, essential: true });
    placePin(lat, lng, result.display_name);
    setShowResults(false);
    setSearchQuery(result.display_name.split(',')[0]);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location unavailable',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.current?.flyTo({ center: [longitude, latitude], zoom: 17, duration: 1200, essential: true });
        placePin(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        toast({
          title: 'Could not get your location',
          description: err.message || 'Click on the map to select it manually.',
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const clearSelection = () => {
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
    setSelectedLat(null);
    setSelectedLng(null);
    setSelectedAddress('');
    setSearchQuery('');
    setShowResults(false);
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            // Modern OSM tile URL (single host). MapLibre also requires
            // the crossOrigin attribute on tiles for WebGL to draw them.
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap',
            maxzoom: 19,
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [initialLng, initialLat],
      zoom: 12,
      attributionControl: true,
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.current.on('click', (e) => {
      placePin(e.lngLat.lat, e.lngLat.lng);
    });

    // Ensure the map resizes once its container has a real size (the form
    // card's width resolves after first paint inside grid layouts).
    const resizeObserver = new ResizeObserver(() => {
      map.current?.resize();
    });
    resizeObserver.observe(mapContainer.current);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      resizeObserver.disconnect();
      marker.current?.remove();
      map.current?.remove();
      marker.current = null;
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasSelection = selectedLat !== null && selectedLng !== null;

  return (
    <div className="space-y-3">
      {/* Search bar — Uber-style, always visible, never overlaps the map */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {isSearching ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search an address or place…"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => {
                if (searchResults.length) setShowResults(true);
              }}
              onBlur={() => {
                // delay so click on a result registers first
                setTimeout(() => setShowResults(false), 150);
              }}
              className="pl-11 pr-10 h-12 text-base rounded-xl border-2 border-primary/20 focus-visible:border-primary shadow-sm"
              aria-label="Search location"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowResults(false);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={useMyLocation}
            disabled={isLocating}
            className="h-12 w-12 rounded-xl border-2 border-primary/20 hover:border-primary shadow-sm shrink-0"
            title="Use my current location"
            aria-label="Use my current location"
          >
            {isLocating ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <Crosshair className="w-5 h-5 text-primary" />
            )}
          </Button>
        </div>

        {/* Search results dropdown */}
        {showResults && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-primary/20 overflow-hidden z-30 max-h-80 overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <button
                  key={`${result.place_id || index}`}
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  onMouseDown={(e) => e.preventDefault()} // keep focus in input
                  className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-border last:border-b-0 flex items-start gap-3 group"
                >
                  <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {result.display_name.split(',')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {result.display_name}
                    </p>
                  </div>
                </button>
              ))
            ) : !isSearching && searchQuery.length >= 3 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No results. Try another search or click the map below.
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Helper text */}
      {!hasSelection && (
        <p className="text-xs text-muted-foreground px-1">
          Search for your site, use <Crosshair className="inline w-3 h-3" /> for your current location, or tap the map to drop a pin. You can drag the pin to fine-tune.
        </p>
      )}

      {/* Map */}
      <div className="relative">
        <div
          ref={mapContainer}
          className="w-full h-[340px] sm:h-[400px] md:h-[460px] rounded-2xl overflow-hidden border-2 border-primary/10 shadow-elegant bg-muted"
        />

        {/* Floating "confirmed" chip when a pin is dropped */}
        {hasSelection && (
          <div className="absolute top-3 left-3 right-3 z-10 bg-white rounded-xl shadow-lg border border-primary/20 px-3 py-2 flex items-center gap-2 pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground leading-tight flex items-center gap-1.5">
                Site location set
                {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {selectedAddress}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Below-map readout — the full picture */}
      {hasSelection ? (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">Selected site location</p>
              <p className="text-sm text-foreground/80 mt-0.5 break-words">
                {selectedAddress}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                {coordsLabel(selectedLat!, selectedLng!)}
              </p>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
              aria-label="Clear selected location"
            >
              <X className="w-3 h-3" />
              Change
            </button>
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes markerBounce {
          0% { transform: translateY(-80px) scale(0.8); opacity: 0; }
          50% { transform: translateY(10px) scale(1.05); opacity: 1; }
          70% { transform: translateY(-5px) scale(0.98); }
          100% { transform: translateY(0) scale(1); }
        }
        .maplibregl-ctrl-bottom-right { bottom: 12px !important; right: 12px !important; }
        .maplibregl-ctrl-group {
          background: white !important;
          border-radius: 10px !important;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15) !important;
          overflow: hidden;
          border: 1px solid rgba(38,116,236,0.15) !important;
        }
        .maplibregl-ctrl-group button { width: 36px !important; height: 36px !important; }
        .maplibregl-ctrl-group button:hover { background: rgba(38,116,236,0.1) !important; }
        .maplibregl-ctrl-attrib {
          background: rgba(255,255,255,0.85) !important;
          font-size: 10px !important;
          padding: 2px 6px !important;
        }
      `}</style>
    </div>
  );
};

export default LocationPickerMap;
