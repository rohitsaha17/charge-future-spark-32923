import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';

// Custom marker icon
const createCustomIcon = () => {
  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="hsl(var(--primary))" stroke="white" stroke-width="3"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const ChargingStationsMap = () => {
  const [stations, setStations] = useState<any[]>([]);

  // Fetch charging stations from database
  useEffect(() => {
    const fetchStations = async () => {
      const { data, error } = await supabase
        .from('charging_stations')
        .select('*')
        .eq('status', 'active');

      if (!error && data) {
        setStations(data);
      }
    };

    fetchStations();
  }, []);

  if (stations.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-card rounded-2xl border border-border">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">No charging stations available</h3>
          <p className="text-sm text-muted-foreground">Check back later for updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-border shadow-elegant">
      <MapContainer
        center={[26.0, 92.5]}
        zoom={7}
        className="w-full h-full"
        style={{ background: 'hsl(var(--background))' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={createCustomIcon()}
          >
            <Popup>
              <div style={{ padding: '8px', minWidth: '200px' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '4px', color: 'hsl(var(--foreground))' }}>
                  {station.name}
                </h3>
                <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>
                  {station.city}, {station.state}
                </p>
                <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                  {station.charger_type} • {station.power_output}
                </p>
                <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                  Available: {station.available_chargers}/{station.total_chargers}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <style>{`
        .leaflet-popup-content-wrapper {
          background-color: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          box-shadow: 0 4px 12px hsl(var(--primary) / 0.1);
        }
        .leaflet-popup-tip {
          background-color: hsl(var(--card));
        }
      `}</style>
    </div>
  );
};

export default ChargingStationsMap;
