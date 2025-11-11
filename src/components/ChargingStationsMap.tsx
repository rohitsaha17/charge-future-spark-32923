import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

const ChargingStationsMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenSubmitted, setTokenSubmitted] = useState(false);
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

  useEffect(() => {
    if (!mapContainer.current || !tokenSubmitted || !mapboxToken || stations.length === 0) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [92.5, 26.0],
      zoom: 6.5,
      pitch: 45,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add markers for each charging station
    map.current.on('load', () => {
      stations.forEach((station) => {
        // Create a custom marker element
        const el = document.createElement('div');
        el.className = 'charging-station-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = 'hsl(var(--primary))';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 0 20px hsl(var(--primary) / 0.6)';
        el.style.cursor = 'pointer';
        el.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="padding: 8px;">
            <h3 style="font-weight: 600; margin-bottom: 4px; color: hsl(var(--foreground));">${station.name}</h3>
            <p style="font-size: 14px; color: hsl(var(--muted-foreground));">${station.city}, ${station.state}</p>
            <p style="font-size: 12px; color: hsl(var(--muted-foreground));">${station.charger_type} • ${station.power_output}</p>
            <p style="font-size: 12px; color: hsl(var(--muted-foreground));">Available: ${station.available_chargers}/${station.total_chargers}</p>
          </div>`
        );

        new mapboxgl.Marker(el)
          .setLngLat([station.longitude, station.latitude])
          .setPopup(popup)
          .addTo(map.current!);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [tokenSubmitted, mapboxToken, stations]);

  if (!tokenSubmitted) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-card rounded-2xl border border-border">
        <div className="max-w-md w-full p-8 space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">Setup Mapbox</h3>
            <p className="text-sm text-muted-foreground">
              Enter your Mapbox public token to display the charging stations map.
              Get your token at{' '}
              <a
                href="https://mapbox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
            <Input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
          </div>
          <button
            onClick={() => setTokenSubmitted(true)}
            disabled={!mapboxToken}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Load Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-border shadow-elegant">
      <div ref={mapContainer} className="w-full h-full" />
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        .mapboxgl-popup-content {
          background-color: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          box-shadow: 0 4px 12px hsl(var(--primary) / 0.1);
        }
        .mapboxgl-popup-tip {
          border-top-color: hsl(var(--card));
        }
      `}</style>
    </div>
  );
};

export default ChargingStationsMap;
