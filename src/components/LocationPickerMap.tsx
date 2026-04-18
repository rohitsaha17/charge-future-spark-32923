import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Search, Loader2, Crosshair } from 'lucide-react';
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

const coordsLabel = (lat: number, lng: number) =>
  `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

const buildPopupHtml = (address: string) => `
  <div style="padding: 12px; min-width: 220px;">
    <h3 style="font-weight: 600; margin: 0 0 6px; color: #1a1a1a; font-size: 13px;">Selected location</h3>
    <p style="font-size: 12px; color: #555; margin: 0 0 6px; line-height: 1.4;">${address}</p>
    <p style="font-size: 11px; color: #888; margin: 0;">Drag the pin to adjust</p>
  </div>
`;

const LocationPickerMap = ({
  onLocationSelect,
  initialLat = 26.1445,
  initialLng = 91.7362,
}: LocationPickerMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const popup = useRef<maplibregl.Popup | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  // Keep the latest callback in a ref so the map's stable click/drag handlers
  // never see a stale version (they're attached once at mount).
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  /** Reverse-geocode coords → human-readable address. Returns the coord
   *  string as a fallback so the caller always has a string to show. */
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

  /** Drop the pin at (lat, lng) immediately and update state synchronously.
   *  Reverse geocoding runs in the background — the form doesn't wait. */
  const placePin = useCallback((lat: number, lng: number, precomputedAddress?: string) => {
    if (!map.current) return;

    // Create or move the marker
    if (!marker.current) {
      // Build the marker DOM once; subsequent drops reuse it
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

      popup.current = new maplibregl.Popup({
        offset: [0, -44],
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px',
        anchor: 'bottom',
      });

      marker.current = new maplibregl.Marker({
        element: el,
        draggable: true,
        anchor: 'bottom',
      })
        .setLngLat([lng, lat])
        .setPopup(popup.current)
        .addTo(map.current);

      // Drag: snap state to new position, fire callback immediately with
      // coords fallback, then refine address asynchronously.
      marker.current.on('dragend', async () => {
        const ll = marker.current!.getLngLat();
        placePin(ll.lat, ll.lng);
      });
    } else {
      marker.current.setLngLat([lng, lat]);
      // Retrigger the bounce
      const el = marker.current.getElement();
      el.style.animation = 'none';
      // force reflow
      el.offsetHeight;
      el.style.animation = 'markerBounce 0.4s ease-out';
    }

    // Sync state + call parent NOW with whatever address we have (may be
    // the coord string; that's fine, the form just needs non-null lat/lng).
    const immediateAddress = precomputedAddress || coordsLabel(lat, lng);
    setSelectedLat(lat);
    setSelectedLng(lng);
    setSelectedAddress(immediateAddress);
    onLocationSelectRef.current(lat, lng, immediateAddress);

    // Show popup + fly-in
    popup.current?.setHTML(buildPopupHtml(immediateAddress));
    marker.current.togglePopup();

    if (!precomputedAddress) {
      // Refine address in the background
      setIsGeocoding(true);
      reverseGeocode(lat, lng)
        .then((addr) => {
          setSelectedAddress(addr);
          popup.current?.setHTML(buildPopupHtml(addr));
          onLocationSelectRef.current(lat, lng, addr);
        })
        .finally(() => setIsGeocoding(false));
    }
  }, []);

  /** Debounced address search. */
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
            `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in&addressdetails=1`,
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
            description: 'Click on the map to select your location instead.',
            variant: 'default',
          });
        } finally {
          setIsSearching(false);
        }
      }, 400);
    },
    [toast]
  );

  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    map.current?.flyTo({ center: [lng, lat], zoom: 16, duration: 1500 });
    placePin(lat, lng, result.display_name);
    setShowResults(false);
    setSearchQuery('');
  };

  /** "Use my location" — Geolocation API. */
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location unavailable',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'Locating you…', description: 'Allow the browser prompt to continue.' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.current?.flyTo({ center: [longitude, latitude], zoom: 16, duration: 1500 });
        placePin(latitude, longitude);
      },
      (err) => {
        toast({
          title: 'Could not get your location',
          description: err.message || 'Click on the map to select it manually.',
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
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
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
            maxzoom: 19,
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [initialLng, initialLat],
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    // Click anywhere on the map → drop the pin at that exact spot.
    map.current.on('click', (e) => {
      placePin(e.lngLat.lat, e.lngLat.lng);
    });

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      marker.current?.remove();
      popup.current?.remove();
      map.current?.remove();
      marker.current = null;
      popup.current = null;
      map.current = null;
    };
    // placePin is stable (empty deps) so this effect only runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLat, initialLng]);

  return (
    <div className="relative">
      {/* Search + "Use my location" */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex gap-2">
          <div className="relative flex-1">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            )}
            <Input
              type="text"
              placeholder="Search for an address…"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 bg-white/95 backdrop-blur-sm shadow-elegant border-primary/20"
            />

            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-elegant border border-primary/20 max-h-60 overflow-y-auto z-30">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors border-b border-border last:border-b-0"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm text-foreground line-clamp-2">{result.display_name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 3 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-elegant border border-primary/20 p-4 text-center z-30">
                <p className="text-sm text-muted-foreground">No results. Click the map to drop a pin.</p>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={useMyLocation}
            className="bg-white/95 backdrop-blur-sm shadow-elegant border-primary/20 h-10 w-10"
            title="Use my current location"
          >
            <Crosshair className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Location readout */}
      <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-elegant border border-primary/20">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {selectedLat !== null ? (
              <>
                <p className="font-semibold text-sm text-foreground mb-0.5 flex items-center gap-2">
                  Selected location
                  {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                </p>
                <p className="text-xs text-muted-foreground break-words">
                  {selectedAddress}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">
                  {coordsLabel(selectedLat, selectedLng!)}
                </p>
              </>
            ) : (
              <p className="font-semibold text-sm text-foreground">
                Click the map, search, or use <Crosshair className="inline w-3 h-3" /> to drop a pin
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
        @keyframes markerBounce {
          0% { transform: translateY(-80px) scale(0.8); opacity: 0; }
          50% { transform: translateY(10px) scale(1.05); opacity: 1; }
          70% { transform: translateY(-5px) scale(0.98); }
          100% { transform: translateY(0) scale(1); }
        }
        .maplibregl-ctrl-bottom-right { bottom: 90px !important; right: 12px !important; }
        .maplibregl-ctrl-group {
          background: white !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18) !important;
          overflow: hidden;
          border: 1px solid rgba(38,116,236,0.15) !important;
        }
        .maplibregl-ctrl-group button { width: 38px !important; height: 38px !important; }
        .maplibregl-ctrl-group button:hover { background: rgba(38,116,236,0.1) !important; }
        .maplibregl-popup-content {
          border-radius: 12px !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.18) !important;
          padding: 0 !important;
          border: 1px solid rgba(38,116,236,0.1) !important;
        }
        .maplibregl-popup-close-button {
          font-size: 20px !important;
          padding: 6px 10px !important;
          color: #666 !important;
        }
        .maplibregl-popup-close-button:hover { color: #333 !important; background: transparent !important; }
      `}</style>
    </div>
  );
};

export default LocationPickerMap;
