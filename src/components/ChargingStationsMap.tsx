import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '@/integrations/supabase/client';

// Minimal, token-free MapLibre map that renders markers from the database
const ChargingStationsMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [stations, setStations] = useState<any[]>([]);

  // 1) Load stations
  useEffect(() => {
    const fetchStations = async () => {
      const { data, error } = await supabase
        .from('charging_stations')
        .select('*')
        .eq('status', 'active');

      if (!error && data) setStations(data);
    };

    fetchStations();
  }, []);

  // 2) Init map ONCE
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [92.5, 26.0],
      zoom: 6.5,
      pitch: 45,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      // Cleanup markers first
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Safely remove the map (avoid destroy error if map isn't fully initialized)
      if (map.current) {
        try {
          map.current.remove();
        } catch (err) {
          console.warn('Map remove failed:', err);
        } finally {
          map.current = null;
        }
      }
    };
  }, []);

  // 3) Render/refresh markers when stations change
  useEffect(() => {
    if (!map.current) return;

    const addMarkers = () => {
      // Clear previous markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (stations.length === 0) return;

      // Fit bounds
      const bounds = new maplibregl.LngLatBounds();

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

        const lng = Number(station.longitude);
        const lat = Number(station.latitude);

        const marker = new maplibregl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current!);

        markersRef.current.push(marker);
        bounds.extend([lng, lat]);
      });

      // Adjust view to markers
      if (!bounds.isEmpty()) {
        try {
          map.current!.fitBounds(bounds, { padding: 40, maxZoom: 12, duration: 600 });
        } catch (_) {
          /* ignore fit errors */
        }
      }
    };

    if (map.current.loaded()) {
      addMarkers();
    } else {
      map.current.once('load', addMarkers);
    }
  }, [stations]);

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-border shadow-elegant">
      <div ref={mapContainer} className="w-full h-full" />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .maplibregl-popup-content {
          background-color: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          box-shadow: 0 4px 12px hsl(var(--primary) / 0.1);
        }
        .maplibregl-popup-tip { border-top-color: hsl(var(--card)); }
      `}</style>
    </div>
  );
};

export default ChargingStationsMap;
