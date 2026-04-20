import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Search, Loader2, Crosshair, X, Check } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { attachMapStyleFallback, SHARED_RASTER_MAP_STYLE } from '@/lib/mapStyles';

interface LocationPickerMapProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

interface SearchSuggestion {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
}

interface PhotonFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

const DEFAULT_CENTER = { lat: 26.1445, lng: 91.7362 };
const coordsLabel = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

const LocationPickerMap = ({
  onLocationSelect,
  initialLat = DEFAULT_CENTER.lat,
  initialLng = DEFAULT_CENTER.lng,
}: LocationPickerMapProps) => {
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);
  const geocodeRequestRef = useRef(0);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isDraggingMap, setIsDraggingMap] = useState(false);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  const commitLocation = useCallback((lat: number, lng: number, address: string) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setSelectedAddress(address);
    onLocationSelectRef.current(lat, lng, address);
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      return data.display_name || coordsLabel(lat, lng);
    } catch {
      return coordsLabel(lat, lng);
    }
  }, []);

  const updateLocationFromCenter = useCallback(
    async (precomputedAddress?: string) => {
      if (!map.current) return;

      const center = map.current.getCenter();
      const lat = center.lat;
      const lng = center.lng;
      const fallbackAddress = precomputedAddress || coordsLabel(lat, lng);

      commitLocation(lat, lng, fallbackAddress);

      if (precomputedAddress) return;

      const requestId = ++geocodeRequestRef.current;
      setIsGeocoding(true);
      const address = await reverseGeocode(lat, lng);

      if (geocodeRequestRef.current === requestId) {
        commitLocation(lat, lng, address);
        setIsGeocoding(false);
      }
    },
    [commitLocation, reverseGeocode]
  );

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const instance = new maplibregl.Map({
      container: mapContainer.current,
      style: SHARED_RASTER_MAP_STYLE,
      center: [initialLng, initialLat],
      zoom: 13,
    });

    const detachStyleFallback = attachMapStyleFallback(instance);

    instance.addControl(new maplibregl.NavigationControl(), 'top-right');

    instance.on('load', () => {
      setMapLoaded(true);
      updateLocationFromCenter();
    });

    instance.on('movestart', () => setIsDraggingMap(true));
    instance.on('moveend', () => {
      setIsDraggingMap(false);
      updateLocationFromCenter();
    });

    map.current = instance;

    return () => {
      detachStyleFallback();
      instance.remove();
      map.current = null;
      setMapLoaded(false);
    };
  }, [initialLat, initialLng, updateLocationFromCenter]);

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?limit=6&lang=en&q=${encodeURIComponent(searchQuery)}`
        );
        const data: PhotonResponse = await res.json();
        const nextSuggestions = (data.features || [])
          .map((feature, index) => {
            const coordinates = feature.geometry?.coordinates;
            if (!coordinates) return null;

            const [lng, lat] = coordinates;
            const props = feature.properties || {};
            const displayName = [
              props.name,
              props.street,
              props.city,
              props.state,
              props.country,
              props.postcode,
            ]
              .filter(Boolean)
              .join(', ');

            return {
              lat: String(lat),
              lon: String(lng),
              display_name: displayName || coordsLabel(lat, lng),
              place_id: Number(`${Date.now()}${index}`),
            } satisfies SearchSuggestion;
          })
          .filter((item): item is SearchSuggestion => item !== null);

        setSuggestions(nextSuggestions);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(true);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  const handleSelectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      const lat = parseFloat(suggestion.lat);
      const lng = parseFloat(suggestion.lon);

      map.current?.flyTo({ center: [lng, lat], zoom: 16, essential: true });
      commitLocation(lat, lng, suggestion.display_name);
      setSearchQuery(suggestion.display_name.split(',')[0]);
      setShowSuggestions(false);
      setSuggestions([]);
    },
    [commitLocation]
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
        commitLocation(latitude, longitude, coordsLabel(latitude, longitude));
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        toast({
          title: 'Could not get your location',
          description: err.message || 'Search for a place or drag the map manually.',
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [commitLocation, toast]);

  const clearSelection = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    map.current?.flyTo({ center: [initialLng, initialLat], zoom: 13, essential: true });
    searchInputRef.current?.focus();
  }, [initialLat, initialLng]);

  const hasSelection = selectedLat !== null && selectedLng !== null;
  const mapBoxClass =
    'relative w-full h-[340px] sm:h-[400px] md:h-[460px] rounded-2xl overflow-hidden border-2 border-primary/10 shadow-elegant bg-muted';

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 pointer-events-none">
              {isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <Search className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search a landmark, address, or area"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => window.setTimeout(() => setShowSuggestions(false), 200)}
              className="h-12 rounded-xl border-2 border-primary/20 pl-11 pr-10 text-base shadow-sm focus-visible:border-primary"
              aria-label="Search location"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  setShowSuggestions(false);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border-2 border-primary/20 bg-popover shadow-lg">
                {suggestions.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.place_id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="flex w-full items-start gap-2 border-b border-border px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-primary/5"
                      >
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="line-clamp-2 text-sm text-foreground">{suggestion.display_name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-muted-foreground">No locations found. Try a nearby landmark or area.</div>
                )}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={useMyLocation}
            disabled={isLocating}
            className="h-12 w-12 shrink-0 rounded-xl border-2 border-primary/20 shadow-sm hover:border-primary"
            title="Use my current location"
            aria-label="Use my current location"
          >
            {isLocating ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <Crosshair className="h-5 w-5 text-primary" />
            )}
          </Button>
        </div>
      </div>

      {mapLoaded && (
        <p className="px-1 text-xs text-muted-foreground">
          Search above or use <Crosshair className="inline h-3 w-3" /> for your location, then drag the map under the center pin to place your site exactly.
        </p>
      )}

      <div className={mapBoxClass}>
        <div ref={mapContainer} className="h-full w-full" />

        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-radial opacity-70" />

        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div
            className={`relative transition-transform duration-200 ${isDraggingMap ? '-translate-y-8' : '-translate-y-5'}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-background/95 shadow-elegant backdrop-blur-sm">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div className="mx-auto -mt-1 h-4 w-4 rotate-45 border-b border-r border-primary/20 bg-background/95 shadow-sm" />
            <div className="absolute left-1/2 top-[3.55rem] h-4 w-4 -translate-x-1/2 rounded-full border border-primary/20 bg-background/95 shadow-sm" />
          </div>
        </div>

        {hasSelection && (
          <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex items-center gap-2 rounded-xl border border-primary/20 bg-background px-3 py-2 shadow-lg">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold leading-tight text-foreground">
                Site location set
                {isGeocoding && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{selectedAddress}</p>
            </div>
          </div>
        )}
      </div>

      {hasSelection && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 shadow-md">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Selected site location</p>
              <p className="mt-0.5 break-words text-sm text-foreground/80">{selectedAddress}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {coordsLabel(selectedLat!, selectedLng!)}
              </p>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
              aria-label="Reset selected location"
            >
              <X className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPickerMap;
