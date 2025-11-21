import { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, Navigation } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
  borderRadius: '16px'
};

const center = {
  lat: 26.1445,
  lng: 91.7362
};

// Use a constant API key to prevent loader reinitialization errors
const GOOGLE_MAPS_API_KEY = 'AIzaSyBFw0Qbyq9zTFTd-tUqqo6yBiXWefBnwB4';

const GoogleMapsCharging = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    fetchStations();
  }, []);

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

    setStations(data || []);
  };

  const handleMarkerClick = (station: any) => {
    setSelectedStation(station);
    setDialogOpen(true);
  };

  const handleNavigate = (lat: number, lng: number) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const url = isMobile 
      ? `https://maps.google.com/?q=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const getMarkerIcon = (station: any) => {
    const isDC = station.charger_type === 'DC';
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: isDC ? '#9333EA' : '#2674EC',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
      scale: 12,
    };
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-[500px] md:h-[600px] rounded-2xl bg-muted animate-pulse flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={8}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={{ lat: station.latitude, lng: station.longitude }}
            onClick={() => handleMarkerClick(station)}
            icon={getMarkerIcon(station)}
            title={station.name}
          />
        ))}
      </GoogleMap>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedStation && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${selectedStation.charger_type === 'DC' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                    <Zap className={`w-5 h-5 ${selectedStation.charger_type === 'DC' ? 'text-purple-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{selectedStation.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${selectedStation.station_type === 'Residential' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {selectedStation.station_type || 'Public'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${selectedStation.charger_type === 'DC' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
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
                    <p className="text-muted-foreground">{selectedStation.city}, {selectedStation.state}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${selectedStation.charger_type === 'DC' ? 'bg-purple-50' : 'bg-blue-50'}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1 ${selectedStation.charger_type === 'DC' ? 'text-purple-700' : 'text-blue-700'}">
                    Charger Details
                  </p>
                  <p className="text-lg font-bold text-foreground">{selectedStation.power_output}</p>
                  <p className="text-sm text-muted-foreground">{selectedStation.connector_type} Connector</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className={`w-2 h-2 rounded-full ${selectedStation.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium">
                      {selectedStation.available_chargers}/{selectedStation.total_chargers} Available
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={() => handleNavigate(selectedStation.latitude, selectedStation.longitude)}
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
