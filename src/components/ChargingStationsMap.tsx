import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';

// Fix for default marker icons in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

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

  const customIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxMiIgZmlsbD0iaHNsKDIxNy43IDkxLjIlIDU5LjglKSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

  if (stations.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-card rounded-2xl border border-border">
        <div className="text-center">
          <p className="text-muted-foreground">Loading charging stations...</p>
        </div>
      </div>
    );
  }

  // Center on Northeast India (Assam)
  const center: [number, number] = [26.0, 92.5];

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-border shadow-elegant">
      <MapContainer
        center={center}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[Number(station.latitude), Number(station.longitude)]}
            icon={customIcon}
          >
            <Popup>
              <div style={{ padding: '8px' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{station.name}</h3>
                <p style={{ fontSize: '14px', color: '#666' }}>{station.city}, {station.state}</p>
                <p style={{ fontSize: '12px', color: '#888' }}>{station.charger_type} • {station.power_output}</p>
                <p style={{ fontSize: '12px', color: '#888' }}>Available: {station.available_chargers}/{station.total_chargers}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ChargingStationsMap;
