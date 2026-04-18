import { useEffect, useState, useMemo, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, Navigation, AlertTriangle } from 'lucide-react';
import {
  useGoogleMapsApi,
  DEFAULT_CENTER,
  MAP_STYLES,
  buildMarkerIcon,
} from '@/lib/googleMaps';

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

interface GoogleMapsChargingProps {
  onStationSelect?: (stationId: string) => void;
  selectedStationId?: string | null;
}

const containerStyle = { width: '100%', height: '100%' };

const GoogleMapsCharging = ({ onStationSelect, selectedStationId }: GoogleMapsChargingProps) => {
  const { isLoaded, loadError, hasKey } = useGoogleMapsApi();
  const [stations, setStations] = useState<Station[]>([]);
  const [hoverStation, setHoverStation] = useState<Station | null>(null);
  const [dialogStation, setDialogStation] = useState<Station | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('charging_stations')
        .select('*')
        .eq('status', 'active')
        .order('name');
      if (!error && data) setStations(data as Station[]);
    })();
  }, []);

  // Auto-fit the map to all stations on first load
  useEffect(() => {
    if (!map || stations.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    stations.forEach((s) => bounds.extend({ lat: Number(s.latitude), lng: Number(s.longitude) }));
    map.fitBounds(bounds, 64);
  }, [map, stations]);

  // When the parent selects a station (from the list), pan + zoom to it
  useEffect(() => {
    if (!map || !selectedStationId) return;
    const s = stations.find((x) => x.id === selectedStationId);
    if (s) {
      map.panTo({ lat: Number(s.latitude), lng: Number(s.longitude) });
      if ((map.getZoom() || 0) < 14) map.setZoom(14);
    }
  }, [map, selectedStationId, stations]);

  const handleNavigate = useCallback((lat: number, lng: number) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const url = isMobile
      ? `https://maps.google.com/?q=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    styles: MAP_STYLES,
    disableDefaultUI: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: 'greedy',
  }), []);

  const containerClass = 'w-full h-[500px] md:h-[600px] rounded-2xl shadow-elegant border border-border overflow-hidden bg-muted';

  if (loadError) {
    return (
      <div className={`${containerClass} flex items-center justify-center p-6 text-center`}>
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
      <div className={`${containerClass} flex items-center justify-center p-6 text-center`}>
        <div>
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <p className="font-semibold text-foreground">Google Maps not configured</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Set <code className="bg-muted px-1.5 py-0.5 rounded text-xs">VITE_GOOGLE_MAPS_API_KEY</code>{' '}
            in the environment. Enable Maps JavaScript API, Places API, and Geocoding API in Google Cloud Console and restrict the key by HTTP referrer.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`${containerClass} flex items-center justify-center`}>
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className={containerClass}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={DEFAULT_CENTER}
          zoom={9}
          options={mapOptions}
          onLoad={(m) => setMap(m)}
          onUnmount={() => setMap(null)}
        >
          {stations.map((station) => {
            const isDC = station.charger_type === 'DC';
            return (
              <Marker
                key={station.id}
                position={{ lat: Number(station.latitude), lng: Number(station.longitude) }}
                icon={buildMarkerIcon(isDC ? 'dc' : 'ac')}
                onMouseOver={() => setHoverStation(station)}
                onMouseOut={() => setHoverStation((s) => (s?.id === station.id ? null : s))}
                onClick={() => {
                  setDialogStation(station);
                  onStationSelect?.(station.id);
                }}
              />
            );
          })}

          {hoverStation && (
            <InfoWindow
              position={{
                lat: Number(hoverStation.latitude),
                lng: Number(hoverStation.longitude),
              }}
              options={{ pixelOffset: new google.maps.Size(0, -46), disableAutoPan: true }}
              onCloseClick={() => setHoverStation(null)}
            >
              <div className="station-popup" style={{ minWidth: 200 }}>
                <div
                  className={hoverStation.charger_type === 'DC' ? 'popup-header dc' : 'popup-header ac'}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    background:
                      hoverStation.charger_type === 'DC'
                        ? 'linear-gradient(135deg,#9333EA,#EC4899)'
                        : 'linear-gradient(135deg,#2674EC,#00C6FF)',
                    color: 'white',
                  }}
                >
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 4 }}>
                    {hoverStation.charger_type === 'DC' ? 'DC Fast' : 'AC'}
                  </span>
                  <span>{hoverStation.station_type === 'Residential' ? '🏠 Residential' : '🌐 Public'}</span>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>
                    {hoverStation.name}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#666' }}>
                    {hoverStation.city}, {hoverStation.state}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#f8f9fa',
                    borderTop: '1px solid #eee',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>
                    {hoverStation.power_output}
                  </span>
                  <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                    {hoverStation.available_chargers}/{hoverStation.total_chargers} Available
                  </span>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      <Dialog open={!!dialogStation} onOpenChange={(open) => !open && setDialogStation(null)}>
        <DialogContent className="max-w-md">
          {dialogStation && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      dialogStation.charger_type === 'DC' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}
                  >
                    <Zap
                      className={`w-5 h-5 ${
                        dialogStation.charger_type === 'DC' ? 'text-purple-600' : 'text-blue-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{dialogStation.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          dialogStation.station_type === 'Residential'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {dialogStation.station_type || 'Public'}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          dialogStation.charger_type === 'DC'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {dialogStation.charger_type} Fast Charging
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{dialogStation.address}</p>
                    <p className="text-muted-foreground">
                      {dialogStation.city}, {dialogStation.state}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    dialogStation.charger_type === 'DC' ? 'bg-purple-50' : 'bg-blue-50'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1">Charger Details</p>
                  <p className="text-lg font-bold text-foreground">{dialogStation.power_output}</p>
                  <p className="text-sm text-muted-foreground">{dialogStation.connector_type} Connector</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        dialogStation.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {dialogStation.available_chargers}/{dialogStation.total_chargers} Available
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    handleNavigate(Number(dialogStation.latitude), Number(dialogStation.longitude))
                  }
                  className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:shadow-lg"
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
