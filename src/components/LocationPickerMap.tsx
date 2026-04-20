import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Search, Loader2, Crosshair, X, Check } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface LocationPickerMapProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
}

const DEFAULT_CENTER = { lat: 26.1445, lng: 91.7362 }; // Guwahati
const coordsLabel = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

const LocationPickerMap = ({
  onLocationSelect,
  initialLat = DEFAULT_CENTER.lat,
  initialLng = DEFAULT_CENTER.lng,
}: LocationPickerMapProps) => {
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Init map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-positron': {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          },
        },
        layers: [{ id: 'osm-positron', type: 'raster', source: 'osm-positron' }],
      },
      center: [initialLng, initialLat],
      zoom: 12,
    });

    m.addControl(new maplibregl.NavigationControl(), 'top-right');
    m.on('load', () => setMapLoaded(true));
    m.on('click', (e) => {
      placePin(e.lngLat.lat, e.lngLat.lng);
    });

    map.current = m;

    return () => {
      marker.current?.remove();
      marker.current = null;
      m.remove();
      map.current = null;
      setMapLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      return data.display_name || coordsLabel(lat, lng);
    } catch {
      return coordsLabel(lat, lng);
    }
  }, []);

  const buildPinElement = useCallback(() => {
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="position:relative;width:36px;height:46px;cursor:grab;">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
          <defs>
            <linearGradient id="pin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#2674EC"/>
              <stop offset="100%" stop-color="#00E5FF"/>
            </linearGradient>
            <filter id="pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#2674EC" flood-opacity="0.45"/>
            </filter>
          </defs>
          <g filter="url(#pin-shadow)">
            <path d="M18 1 C9.7 1 3 7.7 3 16 C3 27 18 44 18 44 S33 27 33 16 C33 7.7 26.3 1 18 1 Z"
                  fill="url(#pin-grad)" stroke="white" stroke-width="2.5"/>
            <circle cx="18" cy="16" r="5.5" fill="white"/>
          </g>
        </svg>
      </div>
    `;
    return el;
  }, []);

  const placePin = useCallback(
    async (lat: number, lng: number, precomputedAddress?: string) => {
      if (!map.current) return;
      const immediateAddress = precomputedAddress || coordsLabel(lat, lng);
      setSelectedLat(lat);
      setSelectedLng(lng);
      setSelectedAddress(immediateAddress);
      onLocationSelectRef.current(lat, lng, immediateAddress);

      // Place / move marker
      if (!marker.current) {
        marker.current = new maplibregl.Marker({
          element: buildPinElement(),
          anchor: 'bottom',
          draggable: true,
        })
          .setLngLat([lng, lat])
          .addTo(map.current);

        marker.current.on('dragend', () => {
          const lngLat = marker.current!.getLngLat();
          placePin(lngLat.lat, lngLat.lng);
        });
      } else {
        marker.current.setLngLat([lng, lat]);
      }

      if (!precomputedAddress) {
        setIsGeocoding(true);
        const addr = await reverseGeocode(lat, lng);
        setSelectedAddress(addr);
        onLocationSelectRef.current(lat, lng, addr);
        setIsGeocoding(false);
      }
    },
    [buildPinElement, reverseGeocode]
  );

  // Debounced Nominatim search
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&limit=5&q=${encodeURIComponent(
            searchQuery
          )}`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleSelectSuggestion = useCallback(
    (s: NominatimResult) => {
      const lat = parseFloat(s.lat);
      const lng = parseFloat(s.lon);
      map.current?.flyTo({ center: [lng, lat], zoom: 16, essential: true });
      placePin(lat, lng, s.display_name);
      setSearchQuery(s.display_name.split(',')[0]);
      setShowSuggestions(false);
      setSuggestions([]);
    },
    [placePin]
  );

  const useMyLocation = useCallback(() => {
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
        map.current?.flyTo({ center: [longitude, latitude], zoom: 17, essential: true });
        placePin(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        toast({
          title: 'Could not get your location',
          description: err.message || 'Tap the map to select it manually.',
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [placePin, toast]);

  const clearSelection = useCallback(() => {
    marker.current?.remove();
    marker.current = null;
    setSelectedLat(null);
    setSelectedLng(null);
    setSelectedAddress('');
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  const hasSelection = selectedLat !== null && selectedLng !== null;
  const mapBoxClass =
    'relative w-full h-[340px] sm:h-[400px] md:h-[460px] rounded-2xl overflow-hidden border-2 border-primary/10 shadow-elegant bg-muted';

  return (
    <div className="space-y-3">
      {/* Search + use-my-location */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              {isSearching ? (
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search an address or place…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-11 pr-10 h-12 text-base rounded-xl border-2 border-primary/20 focus-visible:border-primary shadow-sm"
              aria-label="Search location"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border-2 border-primary/20 rounded-xl shadow-lg overflow-hidden z-20 max-h-64 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.place_id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-4 py-2.5 hover:bg-primary/5 border-b border-border last:border-b-0 transition-colors flex items-start gap-2"
                  >
                    <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground line-clamp-2">{s.display_name}</span>
                  </button>
                ))}
              </div>
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
      </div>

      {!hasSelection && mapLoaded && (
        <p className="text-xs text-muted-foreground px-1">
          Start typing above for suggestions, use{' '}
          <Crosshair className="inline w-3 h-3" /> for your current location, or tap the map to drop a pin.
          Drag the pin to fine-tune.
        </p>
      )}

      {/* Map */}
      <div className={mapBoxClass}>
        <div ref={mapContainer} className="w-full h-full" />

        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {hasSelection && (
          <div className="absolute top-3 left-3 right-3 z-10 bg-background rounded-xl shadow-lg border border-primary/20 px-3 py-2 flex items-center gap-2 pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground leading-tight flex items-center gap-1.5">
                Site location set
                {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">{selectedAddress}</p>
            </div>
          </div>
        )}
      </div>

      {hasSelection && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">Selected site location</p>
              <p className="text-sm text-foreground/80 mt-0.5 break-words">{selectedAddress}</p>
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
      )}
    </div>
  );
};

export default LocationPickerMap;
