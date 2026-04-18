import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { MapPin, Search, Loader2, Crosshair, X, Check, AlertTriangle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  useGoogleMapsApi,
  DEFAULT_CENTER,
  MAP_STYLES,
  buildPinIcon,
} from '@/lib/googleMaps';

interface LocationPickerMapProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

const coordsLabel = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
const containerStyle = { width: '100%', height: '100%' };

const LocationPickerMap = ({
  onLocationSelect,
  initialLat = DEFAULT_CENTER.lat,
  initialLng = DEFAULT_CENTER.lng,
}: LocationPickerMapProps) => {
  const { isLoaded, loadError, hasKey } = useGoogleMapsApi();
  const { toast } = useToast();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    if (isLoaded && !geocoderRef.current && typeof google !== 'undefined') {
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [isLoaded]);

  const markerIcon = useMemo(() => (isLoaded ? buildPinIcon() : undefined), [isLoaded]);

  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    styles: MAP_STYLES,
    disableDefaultUI: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: 'greedy',
  }), []);

  const reverseGeocode = useCallback((lat: number, lng: number): Promise<string> => {
    const fallback = coordsLabel(lat, lng);
    return new Promise((resolve) => {
      if (!geocoderRef.current) return resolve(fallback);
      geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address || fallback);
        } else {
          resolve(fallback);
        }
      });
    });
  }, []);

  const placePin = useCallback(
    (lat: number, lng: number, precomputedAddress?: string) => {
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
    },
    [reverseGeocode]
  );

  const handlePlaceChanged = useCallback(() => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place.geometry?.location) {
      toast({
        title: 'No match found',
        description: 'Try a different address or tap the map.',
        variant: 'default',
      });
      return;
    }
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const address = place.formatted_address || place.name || coordsLabel(lat, lng);

    map?.panTo({ lat, lng });
    map?.setZoom(16);
    placePin(lat, lng, address);
    setSearchQuery(place.name || address.split(',')[0]);
  }, [autocomplete, map, placePin, toast]);

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
        map?.panTo({ lat: latitude, lng: longitude });
        map?.setZoom(17);
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
  }, [map, placePin, toast]);

  const clearSelection = useCallback(() => {
    setSelectedLat(null);
    setSelectedLng(null);
    setSelectedAddress('');
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  const hasSelection = selectedLat !== null && selectedLng !== null;
  const mapBoxClass =
    'relative w-full h-[340px] sm:h-[400px] md:h-[460px] rounded-2xl overflow-hidden border-2 border-primary/10 shadow-elegant bg-muted';

  if (loadError) {
    return (
      <div className={`${mapBoxClass} flex items-center justify-center p-6 text-center`}>
        <div>
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
          <p className="font-semibold text-foreground">Map failed to load</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check your Google Maps API key and domain restrictions.
          </p>
        </div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className={`${mapBoxClass} flex items-center justify-center p-6 text-center`}>
        <div>
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <p className="font-semibold text-foreground">Google Maps not configured</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Set <code className="bg-muted px-1.5 py-0.5 rounded text-xs">VITE_GOOGLE_MAPS_API_KEY</code>{' '}
            in your hosting platform's environment variables. Enable Maps JavaScript API, Places API,
            and Geocoding API in Google Cloud Console.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search + use-my-location */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            {isLoaded ? (
              <Autocomplete
                onLoad={setAutocomplete}
                onPlaceChanged={handlePlaceChanged}
                options={{
                  componentRestrictions: { country: 'in' },
                  fields: ['geometry', 'formatted_address', 'name'],
                }}
              >
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search an address or place…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-10 h-12 text-base rounded-xl border-2 border-primary/20 focus-visible:border-primary shadow-sm"
                  aria-label="Search location"
                />
              </Autocomplete>
            ) : (
              <Input
                placeholder="Loading map…"
                disabled
                className="pl-11 pr-10 h-12 text-base rounded-xl border-2 border-primary/20 shadow-sm"
              />
            )}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
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
            disabled={!isLoaded || isLocating}
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

      {!hasSelection && isLoaded && (
        <p className="text-xs text-muted-foreground px-1">
          Start typing above for suggestions, use{' '}
          <Crosshair className="inline w-3 h-3" /> for your current location, or tap the map to drop a pin.
          Drag the pin to fine-tune.
        </p>
      )}

      {/* Map */}
      <div className={mapBoxClass}>
        {!isLoaded ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{ lat: initialLat, lng: initialLng }}
            zoom={12}
            options={mapOptions}
            onLoad={setMap}
            onUnmount={() => setMap(null)}
            onClick={(e) => {
              if (!e.latLng) return;
              placePin(e.latLng.lat(), e.latLng.lng());
            }}
          >
            {hasSelection && markerIcon && (
              <Marker
                position={{ lat: selectedLat!, lng: selectedLng! }}
                draggable
                icon={markerIcon}
                animation={google.maps.Animation.DROP}
                onDragEnd={(e) => {
                  if (!e.latLng) return;
                  placePin(e.latLng.lat(), e.latLng.lng());
                }}
              />
            )}
          </GoogleMap>
        )}

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
              <p className="text-xs text-muted-foreground line-clamp-1">{selectedAddress}</p>
            </div>
          </div>
        )}
      </div>

      {hasSelection && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <MapPin className="w-5 h-5 text-white" />
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
