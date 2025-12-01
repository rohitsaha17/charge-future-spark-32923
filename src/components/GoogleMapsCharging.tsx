import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, Navigation } from 'lucide-react';

const center = {
  lat: 26.1445,
  lng: 91.7362,
};

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

const GoogleMapsCharging = ({ onStationSelect, selectedStationId }: GoogleMapsChargingProps) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ marker: maplibregl.Marker; popup: maplibregl.Popup; stationId: string }[]>([]);

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

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
            maxzoom: 19
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm'
          }
        ]
      },
      center: [center.lng, center.lat],
      zoom: 8,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      markersRef.current.forEach(({ marker, popup }) => {
        popup.remove();
        marker.remove();
      });
      markersRef.current = [];
      mapRef.current?.remove();
    };
  }, []);

  const handleMarkerClick = useCallback((station: Station) => {
    setSelectedStation(station);
    setDialogOpen(true);
    onStationSelect?.(station.id);
  }, [onStationSelect]);

  const handleNavigate = (lat: number, lng: number) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const url = isMobile
      ? `https://maps.google.com/?q=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Add markers when stations change
  useEffect(() => {
    if (!mapRef.current || stations.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(({ marker, popup }) => {
      popup.remove();
      marker.remove();
    });
    markersRef.current = [];

    // Add markers for all stations
    stations.forEach((station) => {
      if (!mapRef.current) return;

      const isDC = station.charger_type === 'DC';
      const isResidential = station.station_type === 'Residential';

      // Create custom marker element - simple fixed-size element
      const el = document.createElement('div');
      el.className = 'charging-station-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.position = 'relative';
      el.innerHTML = `
        <div class="marker-icon-fixed ${isDC ? 'dc-charger' : 'ac-charger'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
      `;

      el.style.cursor = 'pointer';

      // Create hover popup with station details
      const popupContent = `
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

      const popup = new maplibregl.Popup({
        offset: [0, -20],
        closeButton: false,
        closeOnClick: false,
        maxWidth: '280px',
        className: 'station-hover-popup'
      }).setHTML(popupContent);

      // Create marker with center anchor for precise positioning
      const marker = new maplibregl.Marker({ 
        element: el,
        anchor: 'center'
      })
        .setLngLat([station.longitude, station.latitude])
        .addTo(mapRef.current!);

      // Show popup on hover
      el.addEventListener('mouseenter', () => {
        if (mapRef.current) {
          popup.setLngLat([station.longitude, station.latitude]).addTo(mapRef.current);
        }
      });

      el.addEventListener('mouseleave', () => {
        popup.remove();
      });

      // Handle click
      el.addEventListener('click', () => handleMarkerClick(station));

      markersRef.current.push({ marker, popup, stationId: station.id });
    });
  }, [stations, handleMarkerClick]);

  // Pan to selected station from external selection
  useEffect(() => {
    if (!selectedStationId || !mapRef.current) return;
    
    const station = stations.find(s => s.id === selectedStationId);
    if (station) {
      mapRef.current.flyTo({
        center: [station.longitude, station.latitude],
        zoom: 14,
        duration: 1000
      });
    }
  }, [selectedStationId, stations]);

  return (
    <>
      <div 
        ref={mapContainerRef} 
        className="w-full h-[500px] md:h-[600px] rounded-2xl shadow-elegant border border-border overflow-hidden"
      />

      {/* Custom marker and popup styles */}
      <style>{`
        .charging-station-marker {
          cursor: pointer;
        }
        
        .marker-icon-fixed {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s ease;
        }
        
        .marker-icon-fixed.ac-charger {
          background: linear-gradient(135deg, #2674EC, #00C6FF);
        }
        
        .marker-icon-fixed.dc-charger {
          background: linear-gradient(135deg, #9333EA, #EC4899);
        }
        
        .charging-station-marker:hover .marker-icon-fixed {
          transform: scale(1.2);
        }
        
        /* Popup Styles */
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
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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
