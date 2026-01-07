import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, Navigation } from 'lucide-react';

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

const center = { lat: 26.1445, lng: 91.7362 };

const GoogleMapsCharging = ({ onStationSelect, selectedStationId }: GoogleMapsChargingProps) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Fetch stations once
  useEffect(() => {
    const fetchStations = async () => {
      const { data, error } = await supabase
        .from('charging_stations')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching stations:', error);
        }
        return;
      }

      setStations((data || []) as Station[]);
    };

    fetchStations();
  }, []);

  const handleNavigate = (lat: number, lng: number) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const url = isMobile
      ? `https://maps.google.com/?q=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Initialize map (once)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
            maxzoom: 19,
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [center.lng, center.lat],
      zoom: 8,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Create reusable popup
    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: '280px',
      className: 'station-hover-popup',
      offset: 25,
    });

    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      popupRef.current?.remove();
      map.remove();
    };
  }, []);

  // Add markers when stations change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || stations.length === 0) return;

    const addMarkers = () => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      stations.forEach((station) => {
        const isDC = station.charger_type === 'DC';
        const isResidential = station.station_type === 'Residential';

        // Create custom marker element with proper styling
        const el = document.createElement('div');
        el.className = 'station-marker';
        el.style.width = '44px';
        el.style.height = '52px';
        el.style.cursor = 'pointer';
        el.innerHTML = `
          <div class="marker-container ${isDC ? 'dc' : 'ac'}" style="position: relative; width: 100%; height: 100%; display: flex; align-items: flex-end; justify-content: center;">
            <div class="marker-pulse" style="position: absolute; bottom: 6px; width: 40px; height: 40px; border-radius: 50%; background: ${isDC ? 'rgba(147, 51, 234, 0.3)' : 'rgba(38, 116, 236, 0.3)'}; animation: markerPulse 2s infinite;"></div>
            <div class="marker-pin" style="position: relative; width: 36px; height: 44px; background: ${isDC ? 'linear-gradient(135deg, #9333EA, #EC4899)' : 'linear-gradient(135deg, #2674EC, #00C6FF)'}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.2s ease, box-shadow 0.2s ease;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg);">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
          </div>
        `;

        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'bottom',
        })
          .setLngLat([station.longitude, station.latitude])
          .addTo(map);

        // Hover events
        el.addEventListener('mouseenter', () => {
          const html = `
            <div class="station-popup">
              <div class="popup-header ${isDC ? 'dc' : 'ac'}">
                <span class="popup-badge">${isDC ? 'DC Fast' : 'AC'}</span>
                <span class="popup-type">${isResidential ? '🏠 Residential' : '🌐 Public'}</span>
              </div>
              <h3 class="popup-title">${station.name}</h3>
              <p class="popup-address">${station.city}, ${station.state}</p>
              <div class="popup-details">
                <span class="popup-power">${station.power_output}</span>
                <span class="popup-availability">
                  <span class="availability-dot"></span>
                  ${station.available_chargers}/${station.total_chargers} Available
                </span>
              </div>
              <p class="popup-hint">Click for directions</p>
            </div>
          `;
          popupRef.current
            ?.setLngLat([station.longitude, station.latitude])
            .setHTML(html)
            .addTo(map);
        });

        el.addEventListener('mouseleave', () => {
          popupRef.current?.remove();
        });

        // Click event
        el.addEventListener('click', () => {
          setSelectedStation(station);
          setDialogOpen(true);
          onStationSelect?.(station.id);
        });

        markersRef.current.push(marker);
      });
    };

    if (map.loaded()) {
      addMarkers();
    } else {
      map.once('load', addMarkers);
    }
  }, [stations, onStationSelect]);

  // Pan to selected station from external selection
  useEffect(() => {
    if (!selectedStationId || !mapRef.current) return;

    const station = stations.find((s) => s.id === selectedStationId);
    if (station) {
      mapRef.current.flyTo({
        center: [station.longitude, station.latitude],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [selectedStationId, stations]);

  return (
    <>
      <div
        ref={mapContainerRef}
        className="w-full h-[500px] md:h-[600px] rounded-2xl shadow-elegant border border-border overflow-hidden"
      />

      {/* Marker and Popup styles */}
      <style>{`
        .station-marker {
          cursor: pointer;
        }

        .marker-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .marker-pin {
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .marker-pin svg {
          transform: rotate(45deg);
        }

        .marker-container.ac .marker-pin {
          background: linear-gradient(135deg, #2674EC, #00C6FF);
        }

        .marker-container.dc .marker-pin {
          background: linear-gradient(135deg, #9333EA, #EC4899);
        }

        .marker-pulse {
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(38, 116, 236, 0.3);
          animation: markerPulse 2s infinite;
          pointer-events: none;
        }

        .marker-container.dc .marker-pulse {
          background: rgba(147, 51, 234, 0.3);
        }

        .station-marker:hover .marker-pin {
          transform: rotate(-45deg) scale(1.15);
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        }

        @keyframes markerPulse {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .station-hover-popup .maplibregl-popup-content {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .station-popup {
          min-width: 200px;
        }

        .popup-header {
          padding: 8px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          font-weight: 600;
        }

        .popup-header.ac {
          background: linear-gradient(135deg, #2674EC, #00C6FF);
          color: white;
        }

        .popup-header.dc {
          background: linear-gradient(135deg, #9333EA, #EC4899);
          color: white;
        }

        .popup-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .popup-type {
          opacity: 0.9;
        }

        .popup-title {
          font-weight: 700;
          font-size: 14px;
          padding: 10px 12px 4px;
          color: #1a1a1a;
          margin: 0;
        }

        .popup-address {
          font-size: 12px;
          color: #666;
          padding: 0 12px;
          margin: 0;
        }

        .popup-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          margin-top: 8px;
          background: #f8f9fa;
          border-top: 1px solid #eee;
        }

        .popup-power {
          font-weight: 600;
          font-size: 12px;
          color: #333;
        }

        .popup-availability {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #10b981;
          font-weight: 600;
        }

        .availability-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .popup-hint {
          font-size: 10px;
          color: #999;
          text-align: center;
          padding: 6px 12px 10px;
          margin: 0;
        }

        .maplibregl-popup-tip {
          border-top-color: #f8f9fa !important;
        }
      `}</style>

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
                        selectedStation.charger_type === 'DC'
                          ? 'text-purple-600'
                          : 'text-blue-600'
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
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1">Charger Details</p>
                  <p className="text-lg font-bold text-foreground">{selectedStation.power_output}</p>
                  <p className="text-sm text-muted-foreground">{selectedStation.connector_type} Connector</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        selectedStation.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {selectedStation.available_chargers}/{selectedStation.total_chargers} Available
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleNavigate(selectedStation.latitude, selectedStation.longitude)}
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
