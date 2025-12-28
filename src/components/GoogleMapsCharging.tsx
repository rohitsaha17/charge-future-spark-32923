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
  const [hoveredStationId, setHoveredStationId] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
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
        console.error('Error fetching stations:', error);
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

  // Initialize map
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

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Create popup instance
    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: '280px',
      className: 'station-hover-popup',
      offset: 25
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
    };
  }, []);

  // Add GeoJSON source and layers when stations change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || stations.length === 0) return;

    const setupLayers = () => {
      // Remove existing source and layers if they exist
      if (map.getLayer('station-labels')) map.removeLayer('station-labels');
      if (map.getLayer('stations-dc')) map.removeLayer('stations-dc');
      if (map.getLayer('stations-ac')) map.removeLayer('stations-ac');
      if (map.getLayer('stations-glow')) map.removeLayer('stations-glow');
      if (map.getSource('stations')) map.removeSource('stations');

      // Create GeoJSON data
      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: stations.map(station => ({
          type: 'Feature',
          properties: {
            id: station.id,
            name: station.name,
            city: station.city,
            state: station.state,
            charger_type: station.charger_type,
            station_type: station.station_type,
            power_output: station.power_output,
            available_chargers: station.available_chargers,
            total_chargers: station.total_chargers,
            isDC: station.charger_type === 'DC'
          },
          geometry: {
            type: 'Point',
            coordinates: [station.longitude, station.latitude]
          }
        }))
      };

      // Add source
      map.addSource('stations', {
        type: 'geojson',
        data: geojsonData
      });

      // Glow layer (behind markers)
      map.addLayer({
        id: 'stations-glow',
        type: 'circle',
        source: 'stations',
        paint: {
          'circle-radius': 20,
          'circle-color': ['case', ['get', 'isDC'], '#9333EA', '#2674EC'],
          'circle-blur': 1,
          'circle-opacity': 0.3
        }
      });

      // AC Stations layer
      map.addLayer({
        id: 'stations-ac',
        type: 'circle',
        source: 'stations',
        filter: ['==', ['get', 'isDC'], false],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 8, 12, 14, 16, 18],
          'circle-color': '#2674EC',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      });

      // DC Stations layer
      map.addLayer({
        id: 'stations-dc',
        type: 'circle',
        source: 'stations',
        filter: ['==', ['get', 'isDC'], true],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 10, 12, 16, 16, 20],
          'circle-color': '#9333EA',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Add lightning bolt icon using SVG
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="0"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
      const img = new Image(24, 24);
      img.onload = () => {
        if (!map.hasImage('lightning')) {
          map.addImage('lightning', img);
          // Add symbol layer for lightning icons
          map.addLayer({
            id: 'station-labels',
            type: 'symbol',
            source: 'stations',
            layout: {
              'icon-image': 'lightning',
              'icon-size': ['interpolate', ['linear'], ['zoom'], 6, 0.4, 12, 0.6, 16, 0.8],
              'icon-allow-overlap': true,
              'icon-ignore-placement': true
            }
          });
        }
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

      // Mouse events for hover popup
      const showPopup = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
        if (!e.features || e.features.length === 0) return;
        
        const feature = e.features[0];
        const props = feature.properties;
        const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
        
        setHoveredStationId(props.id);
        map.getCanvas().style.cursor = 'pointer';

        const isDC = props.isDC || props.charger_type === 'DC';
        const isResidential = props.station_type === 'Residential';

        const popupContent = `
          <div class="station-popup">
            <div class="popup-header ${isDC ? 'dc' : 'ac'}">
              <span class="popup-badge">${isDC ? 'DC Fast' : 'AC'}</span>
              <span class="popup-type">${isResidential ? '🏠 Residential' : '🌐 Public'}</span>
            </div>
            <h3 class="popup-title">${props.name}</h3>
            <p class="popup-address">${props.city}, ${props.state}</p>
            <div class="popup-details">
              <span class="popup-power">${props.power_output}</span>
              <span class="popup-availability">
                <span class="availability-dot"></span>
                ${props.available_chargers}/${props.total_chargers} Available
              </span>
            </div>
            <p class="popup-hint">Click for directions</p>
          </div>
        `;

        popupRef.current?.setLngLat(coords).setHTML(popupContent).addTo(map);
      };

      const hidePopup = () => {
        setHoveredStationId(null);
        map.getCanvas().style.cursor = '';
        popupRef.current?.remove();
      };

      const handleClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
        if (!e.features || e.features.length === 0) return;
        
        const props = e.features[0].properties;
        const station = stations.find(s => s.id === props.id);
        if (station) {
          setSelectedStation(station);
          setDialogOpen(true);
          onStationSelect?.(station.id);
        }
      };

      // Bind events to both layers
      ['stations-ac', 'stations-dc'].forEach(layerId => {
        map.on('mouseenter', layerId, showPopup);
        map.on('mousemove', layerId, showPopup);
        map.on('mouseleave', layerId, hidePopup);
        map.on('click', layerId, handleClick);
      });
    };

    // Wait for map to be loaded
    if (map.loaded()) {
      setupLayers();
    } else {
      map.on('load', setupLayers);
    }
  }, [stations, onStationSelect]);

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

      {/* Popup styles */}
      <style>{`
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
