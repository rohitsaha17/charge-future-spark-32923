import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, Navigation } from 'lucide-react';

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
  borderRadius: '16px',
};

const center = {
  lat: 26.1445,
  lng: 91.7362,
};

// Use a constant API key so we never reinitialize the loader with different options
// NOTE: For production, consider moving this to a configuration/secrets system.
const GOOGLE_MAPS_API_KEY = 'AIzaSyBFw0Qbyq9zTFTd-tUqqo6yBiXWefBnwB4';

type Station = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  charger_type: string;
  station_type: string | null;
  power_output: string;
  connector_type: string;
  status: string;
  available_chargers: number;
  total_chargers: number;
};

const GoogleMapsCharging = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Fetch stations once
  useEffect(() => {
    const fetchStations = async () => {
      const { data, error } = await supabase
        .from('charging_stations')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching stations:', error);
        return;
      }

      setStations((data || []) as Station[]);
    };

    fetchStations();
  }, []);

  // Load Google Maps script once and initialize map + markers whenever stations change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mapContainerRef.current) return;

    let isCancelled = false;

    const loadGoogleMapsScript = () => {
      const w = window as any;

      // If already loaded, reuse it
      if (w.google && w.google.maps) {
        return Promise.resolve();
      }

      // If loading is already in progress, reuse the same promise
      if (w.googleMapsScriptLoadingPromise) {
        return w.googleMapsScriptLoadingPromise as Promise<void>;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=maps`; // libraries kept stable
      script.async = true;
      script.defer = true;

      w.googleMapsScriptLoadingPromise = new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = (err: any) => {
          console.error('Error loading Google Maps script', err);
          reject(err);
        };
      });

      document.head.appendChild(script);

      return w.googleMapsScriptLoadingPromise as Promise<void>;
    };

    loadGoogleMapsScript()
      .then(() => {
        if (isCancelled || !mapContainerRef.current) return;

        const g = (window as any).google as typeof google;
        if (!g || !g.maps) return;

        // Initialize map once
        if (!mapRef.current) {
          mapRef.current = new g.maps.Map(mapContainerRef.current, {
            center,
            zoom: 8,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });
          setIsMapInitialized(true);
        }

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        // Add markers for all stations
        stations.forEach((station) => {
          if (!mapRef.current) return;

          const isDC = station.charger_type === 'DC';

          const marker = new g.maps.Marker({
            position: { lat: station.latitude, lng: station.longitude },
            map: mapRef.current,
            title: station.name,
            icon: {
              path: g.maps.SymbolPath.CIRCLE,
              fillColor: isDC ? '#9333EA' : '#2674EC',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
              scale: 12,
            },
          });

          marker.addListener('click', () => handleMarkerClick(station));
          markersRef.current.push(marker);
        });
      })
      .catch((err) => {
        console.error('Error initializing Google Maps:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [stations]);

  const handleMarkerClick = (station: Station) => {
    setSelectedStation(station);
    setDialogOpen(true);
  };

  const handleNavigate = (lat: number, lng: number) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const url = isMobile
      ? `https://maps.google.com/?q=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (!isMapInitialized && stations.length === 0) {
    return (
      <div className="w-full h-[500px] md:h-[600px] rounded-2xl bg-muted animate-pulse flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <>
      <div style={containerStyle} ref={mapContainerRef} className="shadow-elegant border border-border" />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedStation && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedStation.charger_type === 'DC' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}
                  >
                    <Zap
                      className={`w-5 h-5 ${
                        selectedStation.charger_type === 'DC' ? 'text-purple-600' : 'text-blue-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{selectedStation.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          selectedStation.station_type === 'Residential'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {selectedStation.station_type || 'Public'}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          selectedStation.charger_type === 'DC'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {selectedStation.charger_type} Fast Charging
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{selectedStation.address}</p>
                    <p className="text-muted-foreground">
                      {selectedStation.city}, {selectedStation.state}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    selectedStation.charger_type === 'DC' ? 'bg-purple-50' : 'bg-blue-50'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1">
                    Charger Details
                  </p>
                  <p className="text-lg font-bold text-foreground">{selectedStation.power_output}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedStation.connector_type} Connector
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        selectedStation.status === 'active'
                          ? 'bg-green-500 animate-pulse'
                          : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {selectedStation.available_chargers}/{selectedStation.total_chargers} Available
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    handleNavigate(selectedStation.latitude, selectedStation.longitude)
                  }
                  className="w-full"
                  size="lg"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoogleMapsCharging;
