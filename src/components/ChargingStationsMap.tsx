import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '@/integrations/supabase/client';

const ChargingStationsMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
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
    if (!mapContainer.current) return;

    // Initialize map only once
    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [92.5, 26.0],
        zoom: 6.5,
        pitch: 45,
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    }

    // Add markers when map loads and stations are available
    if (stations.length > 0 && map.current) {
      map.current.on('load', () => {
        stations.forEach((station) => {
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

          const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 8px;">
              <h3 style="font-weight: 600; margin-bottom: 4px; color: hsl(var(--foreground));">${station.name}</h3>
              <p style="font-size: 14px; color: hsl(var(--muted-foreground));">${station.city}, ${station.state}</p>
              <p style="font-size: 12px; color: hsl(var(--muted-foreground));">${station.charger_type} • ${station.power_output}</p>
              <p style="font-size: 12px; color: hsl(var(--muted-foreground));">Available: ${station.available_chargers}/${station.total_chargers}</p>
            </div>`
          );

          new maplibregl.Marker(el)
            .setLngLat([Number(station.longitude), Number(station.latitude)])
            .setPopup(popup)
            .addTo(map.current!);
        });
      });
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [stations]);

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
        .maplibregl-popup-content {
          background-color: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          box-shadow: 0 4px 12px hsl(var(--primary) / 0.1);
        }
        .maplibregl-popup-tip {
          border-top-color: hsl(var(--card));
        }
      `}</style>
    </div>
  );
};

export default ChargingStationsMap;
